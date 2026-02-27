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
            },
        });

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

                const nouveauSolde = wallet.soldeDisponible.add(montant);

                // Créer la transaction wallet (protection double par @@unique)
                await tx.transactionWallet.create({
                    data: {
                        walletId: wallet.id,
                        reservationId,
                        type: TypeTransactionWallet.CREDIT_LOCATION,
                        montant,
                        sens: SensTransaction.CREDIT,
                        soldeApres: nouveauSolde,
                    },
                });

                // Mettre à jour le solde
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { soldeDisponible: nouveauSolde },
                });

                return {
                    walletId: wallet.id,
                    montantCredite: montant,
                    nouveauSolde,
                    alreadyCredited: false,
                };
            });

            this.logger.log(
                `Wallet credited: ${montant} FCFA for reservation ${reservationId} → wallet ${result.walletId}`,
            );

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
