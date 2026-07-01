import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TypeTransactionWallet, SensTransaction } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreditWalletResult {
    walletId: string;
    montantCredite: Prisma.Decimal;
    nouveauSolde: Prisma.Decimal;
    /** true si le crédit avait déjà été effectué (idempotence via @@unique) */
    alreadyCredited: boolean;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CreditWalletUseCase {
    private readonly logger = new Logger(CreditWalletUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crédite le wallet du propriétaire après un check-in finalisé.
     * Montant = netProprietaire (total - commission 15%).
     *
     * IMPORTANT : Avant de créditer, prélève automatiquement les pénalités en attente.
     *
     * Protection double crédit : @@unique([reservationId, type]) sur TransactionWallet
     * empêche un second crédit pour la même réservation.
     */
    async execute(reservationId: string): Promise<CreditWalletResult> {
        // ── 1. Fetch reservation data ──────────────────────────────────────
        const reservation = await this.prisma.reservation.findUniqueOrThrow({
            where: { id: reservationId },
            select: {
                id: true,
                proprietaireId: true,
                netProprietaire: true,
                walletCredite: true,
                paiement: {
                    select: {
                        fournisseur: true,
                    },
                },
            },
        });

        // ── 1b. Check if already credited via flag (early return) ──────────
        if (reservation.walletCredite) {
            this.logger.warn(
                `ALREADY_CREDITED (flag): Wallet already credited for reservation ${reservationId}`,
            );

            const wallet = await this.prisma.wallet.findUniqueOrThrow({
                where: { utilisateurId: reservation.proprietaireId },
                select: { id: true, soldeDisponible: true },
            });

            return {
                walletId: wallet.id,
                montantCredite: reservation.netProprietaire,
                nouveauSolde: wallet.soldeDisponible,
                alreadyCredited: true,
            };
        }

        const montant = reservation.netProprietaire;

        // ── 2. Transaction atomique : upsert wallet + créer transaction ────
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // Upsert wallet (crée si inexistant)
                const wallet = await tx.wallet.upsert({
                    where: { utilisateurId: reservation.proprietaireId },
                    create: {
                        utilisateurId: reservation.proprietaireId,
                        soldeDisponible: 0,
                    },
                    update: {},
                    select: { id: true, soldeDisponible: true },
                });

                // ── 2a. Récupérer les pénalités en attente ────────────────────
                const penalites = await tx.penaliteProprietaire.findMany({
                    where: {
                        utilisateurId: reservation.proprietaireId,
                        preleveleLe: null, // Pas encore prélevées
                    },
                    orderBy: { creeLe: 'asc' }, // FIFO
                });

                const totalPenalites = penalites.reduce(
                    (sum, p) => sum.add(p.montant),
                    new Prisma.Decimal(0),
                );

                // ── 2b. Calculer le montant net après déduction pénalités ──────
                const montantNet = montant.sub(totalPenalites).toDecimalPlaces(2);
                const nouveauSolde = wallet.soldeDisponible.add(montantNet).toDecimalPlaces(2);

                // ── 2c. Créer la transaction CREDIT_LOCATION (montant brut) ────
                await tx.transactionWallet.create({
                    data: {
                        walletId: wallet.id,
                        reservationId,
                        type: TypeTransactionWallet.CREDIT_LOCATION,
                        montant,
                        sens: SensTransaction.CREDIT,
                        soldeApres: nouveauSolde, // Solde final après déduction pénalités
                        fournisseur: reservation.paiement?.fournisseur,
                    },
                });

                // ── 2d. Créer les transactions DEBIT_PENALITE et marquer prélevées ──
                for (const penalite of penalites) {
                    await tx.transactionWallet.create({
                        data: {
                            walletId: wallet.id,
                            reservationId: penalite.reservationId,
                            type: TypeTransactionWallet.DEBIT_PENALITE,
                            montant: penalite.montant,
                            sens: SensTransaction.DEBIT,
                            soldeApres: nouveauSolde, // Même solde final
                        },
                    });

                    await tx.penaliteProprietaire.update({
                        where: { id: penalite.id },
                        data: { preleveleLe: new Date() },
                    });
                }

                // ── 2e. Mettre à jour le solde wallet ──────────────────────────
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { soldeDisponible: nouveauSolde },
                });

                // ── 2f. Marquer la réservation comme wallet crédité ────────────
                await tx.reservation.update({
                    where: { id: reservationId },
                    data: { walletCredite: true },
                });

                return {
                    walletId: wallet.id,
                    montantCredite: montantNet, // Montant net après pénalités
                    nouveauSolde,
                    alreadyCredited: false,
                };
            });

            if (result.montantCredite.lt(montant)) {
                this.logger.log(
                    `Wallet credited with penalty deduction: ${montant} - penalties = ${result.montantCredite} FCFA for reservation ${reservationId}`,
                );
            } else {
                this.logger.log(
                    `Wallet credited: ${montant} FCFA for reservation ${reservationId} → wallet ${result.walletId}`,
                );
            }

            return result;
        } catch (err) {
            // Prisma P2002 = unique constraint violation → already credited
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002'
            ) {
                this.logger.warn(
                    `ALREADY_CREDITED: Wallet already credited for reservation ${reservationId}`,
                );

                const wallet = await this.prisma.wallet.findUniqueOrThrow({
                    where: { utilisateurId: reservation.proprietaireId },
                    select: { id: true, soldeDisponible: true },
                });

                return {
                    walletId: wallet.id,
                    montantCredite: montant,
                    nouveauSolde: wallet.soldeDisponible,
                    alreadyCredited: true,
                };
            }
            throw err;
        }
    }
}
