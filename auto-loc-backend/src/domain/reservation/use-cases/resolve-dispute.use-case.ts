import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ModePaiementReservation, StatutReservation, StatutLitige, StatutPaiement, SensTransaction, TypeTransactionWallet } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestUser } from '../../../common/types/auth.types';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';
import { TelegramService } from '../../../infrastructure/telegram/telegram.service';
import { RevalidateService } from '../../../infrastructure/revalidate/revalidate.service';
import { NotificationService } from '../../../infrastructure/notifications/notification.service';

export interface ResolveDisputeInput {
  decision: 'FONDE' | 'NON_FONDE';
  montantCompensation?: number;
}

@Injectable()
export class ResolveDisputeUseCase {
  private readonly logger = new Logger(ResolveDisputeUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
    private readonly revalidate: RevalidateService,
    private readonly notification: NotificationService,
  ) { }

  async execute(user: RequestUser, litigeId: string, input: ResolveDisputeInput) {
    const litige = await this.prisma.litige.findUnique({
      where: { id: litigeId },
      include: {
        reservation: {
          include: {
            paiement: true,
            locataire: { select: { id: true, email: true, prenom: true, telephone: true } },
            proprietaire: { select: { id: true, email: true, prenom: true, telephone: true } },
          },
        },
      },
    });

    if (!litige) {
      throw new NotFoundException('Litige introuvable');
    }

    if (litige.statut !== StatutLitige.EN_ATTENTE) {
      throw new BusinessRuleException('Ce litige a déjà été résolu.', 'LITIGE_ALREADY_RESOLVED');
    }

    const { reservation } = litige;
    const now = new Date();
    const compensation = input.montantCompensation ? Number(input.montantCompensation) : null;

    await this.prisma.$transaction(async (tx) => {
      // 1. Mise à jour du litige avec l'admin modérateur et le montant compensatoire éventuel
      await tx.litige.update({
        where: { id: litigeId },
        data: {
          statut: input.decision === 'FONDE' ? StatutLitige.FONDE : StatutLitige.NON_FONDE,
          resoluLe: now,
          resoluParAdminId: user.sub,
          ...(compensation !== null ? { montantCompensation: compensation } : {}),
        },
      });

      // 2. Mise à jour de la réservation
      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          statut: StatutReservation.ANNULEE,
          annuleLe: now,
          annuleParId: user.sub,
          raisonAnnulation: `Résolution Litige (Décision: ${input.decision}${compensation ? ` - Compensation: ${compensation} FCFA` : ''})`,
        },
      });

      // Trace Historique
      await tx.reservationHistorique.create({
        data: {
          reservationId: reservation.id,
          ancienStatut: reservation.statut,
          nouveauStatut: StatutReservation.ANNULEE,
          modifiePar: user.sub,
        },
      });

      // 3. Logique Financière & Arbitrage Partiel
      if (reservation.paiement && reservation.paiement.statut === StatutPaiement.CONFIRME) {
        const totalPaiement = Number(reservation.paiement.montant);

        if (input.decision === 'FONDE') {
          if (compensation && compensation > 0 && compensation < totalPaiement) {
            // Arbitrage partiel : Le locataire récupère (totalPaiement - compensation) et le propriétaire reçoit compensation
            const montantRembourseLocataire = totalPaiement - compensation;
            await tx.paiement.update({
              where: { id: reservation.paiement.id },
              data: {
                statut: StatutPaiement.REMBOURSE,
                rembourseLe: now,
                montantRembourse: montantRembourseLocataire,
              },
            });

            // Crédit wallet propriétaire de la compensation retenue
            const wallet = await tx.wallet.findUnique({
              where: { utilisateurId: reservation.proprietaireId },
            });
            if (wallet) {
              const newSolde = wallet.soldeDisponible.add(compensation);
              await tx.wallet.update({
                where: { id: wallet.id },
                data: { soldeDisponible: newSolde },
              });
              await tx.transactionWallet.create({
                data: {
                  walletId: wallet.id,
                  reservationId: reservation.id,
                  type: TypeTransactionWallet.CREDIT_COMPENSATION_LITIGE,
                  montant: compensation,
                  sens: SensTransaction.CREDIT,
                  soldeApres: newSolde,
                  fournisseur: reservation.paiement?.fournisseur,
                },
              });
            }
          } else {
            // Remboursement 100% locataire
            await tx.paiement.update({
              where: { id: reservation.paiement.id },
              data: {
                statut: StatutPaiement.REMBOURSE,
                rembourseLe: now,
                montantRembourse: totalPaiement,
              },
            });
          }
        } else {
          // Décision NON_FONDE : Gain propriétaire
          const wallet = await tx.wallet.findUnique({
            where: { utilisateurId: reservation.proprietaireId },
          });

          if (wallet) {
            const montantProprietaire = compensation ?? (
              reservation.modePaiement === ModePaiementReservation.ACOMPTE_SOLDE_CHECKIN
                ? Number(reservation.montantProprietaireEnLigne)
                : Number(reservation.netProprietaire)
            );

            const newSolde = wallet.soldeDisponible.add(montantProprietaire);
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { soldeDisponible: newSolde },
            });

            await tx.transactionWallet.create({
              data: {
                walletId: wallet.id,
                reservationId: reservation.id,
                type: TypeTransactionWallet.CREDIT_LOCATION,
                montant: montantProprietaire,
                sens: SensTransaction.CREDIT,
                soldeApres: newSolde,
                fournisseur: reservation.paiement?.fournisseur,
              },
            });
          }
        }
      }
    });

    // Notifications & Cache
    const decisionText = input.decision === 'FONDE'
      ? `Remboursement Locataire ${compensation ? `(Compensation Hôte: ${compensation} FCFA)` : '(100%)'}`
      : `Pénalité Locataire (Gain Propriétaire ${compensation ? `${compensation} FCFA` : ''})`;

    this.logger.log(`Litige ${litige.id} arbitré : ${decisionText}`);

    // Alert Telegram
    await this.telegram.sendAdminAlert(
      `⚖️ <b>ARBITRAGE LITIGE :</b>\nRéservation: ${reservation.id}\nDécision: ${decisionText}\nPar Admin: ${user.sub}`
    ).catch(() => {});

    // Notifications aux parties (SMS / Email)
    if (reservation.locataireId) {
      this.notification.send({
        userId: reservation.locataireId,
        type: 'litige.resolu',
        data: {
          reservationId: reservation.id,
          decision: input.decision,
          isOwner: false,
        },
      }).catch(() => {});
    }
    if (reservation.proprietaireId) {
      this.notification.send({
        userId: reservation.proprietaireId,
        type: 'litige.resolu',
        data: {
          reservationId: reservation.id,
          decision: input.decision,
          isOwner: true,
        },
      }).catch(() => {});
    }

    this.revalidate.revalidatePath(`/admin/disputes`).catch(() => {});
    this.revalidate.revalidatePath(`/admin/disputes/${litige.id}`).catch(() => {});

    return { success: true, decision: input.decision, montantCompensation: compensation };
  }
}
