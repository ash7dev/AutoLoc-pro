import {
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { StatutReservation, StatutLitige, StatutPaiement, SensTransaction, TypeTransactionWallet } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestUser } from '../../../common/types/auth.types';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';
import { TelegramService } from '../../../infrastructure/telegram/telegram.service';
import { RevalidateService } from '../../../infrastructure/revalidate/revalidate.service';

export interface ResolveDisputeInput {
    decision: 'FONDE' | 'NON_FONDE';
}

@Injectable()
export class ResolveDisputeUseCase {
    private readonly logger = new Logger(ResolveDisputeUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly telegram: TelegramService,
        private readonly revalidate: RevalidateService,
    ) { }

    async execute(user: RequestUser, litigeId: string, input: ResolveDisputeInput) {
        // Le contrôle du rôle ADMIN est fait via les decorators @Roles(RoleProfile.ADMIN) sur le controlleur.

        const litige = await this.prisma.litige.findUnique({
            where: { id: litigeId },
            include: {
                reservation: {
                    include: {
                        paiement: true,
                        locataire: { select: { email: true, prenom: true } },
                        proprietaire: { select: { id: true, email: true, prenom: true } },
                    }
                }
            }
        });

        if (!litige) {
            throw new NotFoundException('Litige introuvable');
        }

        if (litige.statut !== StatutLitige.EN_ATTENTE) {
            throw new BusinessRuleException('Ce litige a déjà été résolu.', 'LITIGE_ALREADY_RESOLVED');
        }

        const { reservation } = litige;
        const now = new Date();

        await this.prisma.$transaction(async (tx) => {
            // 1. Mise à jour du litige
            await tx.litige.update({
                where: { id: litigeId },
                data: {
                    statut: input.decision === 'FONDE' ? StatutLitige.FONDE : StatutLitige.NON_FONDE,
                    resoluLe: now,
                }
            });

            // 2. Mise à jour de la réservation
            await tx.reservation.update({
                where: { id: reservation.id },
                data: {
                    statut: StatutReservation.ANNULEE,
                    annuleLe: now,
                    annuleParId: user.sub, // L'admin trace
                    raisonAnnulation: `Résolution Litige (Décision: ${input.decision})`,
                }
            });

            // Trace Historique
            await tx.reservationHistorique.create({
                data: {
                    reservationId: reservation.id,
                    ancienStatut: reservation.statut,
                    nouveauStatut: StatutReservation.ANNULEE,
                    modifiePar: user.sub,
                }
            });

            // 3. Logique Financière en fonction de l'arbitrage
            if (input.decision === 'FONDE') {
                // Locataire gagne : Remboursement 100% (faute du proprio = pas de commission AutoLoc)
                if (reservation.paiement && reservation.paiement.statut === StatutPaiement.CONFIRME) {
                    await tx.paiement.update({
                        where: { id: reservation.paiement.id },
                        data: {
                            statut: StatutPaiement.REMBOURSE,
                            rembourseLe: now,
                            montantRembourse: reservation.totalLocataire,
                        }
                    });
                }
                // Pas de gain pour le proprio.
            } else {
                // Propriétaire gagne : Locataire caprice (ou autre), pénalité stricte locataire.
                // L'argent est libéré au propriétaire comme s'il avait effectué la location complète.
                if (reservation.paiement && reservation.paiement.statut === StatutPaiement.CONFIRME) {
                    const wallet = await tx.wallet.findUnique({
                        where: { utilisateurId: reservation.proprietaireId },
                    });

                    if (wallet) {
                        const newSolde = wallet.soldeDisponible.add(reservation.netProprietaire);
                        await tx.wallet.update({
                            where: { id: wallet.id },
                            data: { soldeDisponible: newSolde },
                        });

                        await tx.transactionWallet.create({
                            data: {
                                walletId: wallet.id,
                                reservationId: reservation.id,
                                type: TypeTransactionWallet.CREDIT_LOCATION,
                                montant: reservation.netProprietaire,
                                sens: SensTransaction.CREDIT,
                                soldeApres: newSolde,
                            }
                        });
                    }
                }
            }
        });

        // Notifications & Cache
        const decisionText = input.decision === 'FONDE' ? 'Remboursement Locataire' : 'Pénalité Locataire (Gain Propriétaire)';
        this.logger.log(`Litige ${litige.id} arbitré : ${decisionText}`);
        
        await this.telegram.sendAdminAlert(`⚖️ <b>ARBITRAGE LITIGE :</b>\nRéservation: ${reservation.id}\nDécision: ${decisionText}\nPar: Admin`);
        this.revalidate.revalidatePath(`/dashboard/admin/disputes`).catch(() => {});
        this.revalidate.revalidatePath(`/dashboard/admin/disputes/${litige.id}`).catch(() => {});

        return { success: true, decision: input.decision };
    }
}
