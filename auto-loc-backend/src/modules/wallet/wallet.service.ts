import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SensTransaction, StatutReservation, StatutRetrait, TypeTransactionWallet } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { RequestUser } from '../../common/types/auth.types';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
    private readonly notifications: NotificationService,
  ) { }

  async getWallet(user: RequestUser) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new NotFoundException('Profil incomplet');

    let wallet = await this.prisma.wallet.findUnique({
      where: { utilisateurId: utilisateur.id },
      select: { id: true, soldeDisponible: true },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { utilisateurId: utilisateur.id },
        select: { id: true, soldeDisponible: true },
      });
    }

    const pendingStatuses = [
      StatutReservation.PAYEE,
      StatutReservation.CONFIRMEE,
      StatutReservation.EN_COURS,
    ];

    const earnedStatuses = [
      StatutReservation.PAYEE,
      StatutReservation.CONFIRMEE,
      StatutReservation.EN_COURS,
      StatutReservation.TERMINEE,
    ];

    const [pendingAgg, earnedAgg, transactions] = await Promise.all([
      this.prisma.reservation.aggregate({
        where: { proprietaireId: utilisateur.id, statut: { in: pendingStatuses } },
        _sum: { netProprietaire: true },
      }),
      this.prisma.reservation.aggregate({
        where: { proprietaireId: utilisateur.id, statut: { in: earnedStatuses } },
        _sum: { netProprietaire: true },
      }),
      this.prisma.transactionWallet.findMany({
        where: { walletId: wallet.id },
        orderBy: { creeLe: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          sens: true,
          montant: true,
          soldeApres: true,
          creeLe: true,
          reservationId: true,
        },
      }),
    ]);

    return {
      balance: {
        soldeDisponible: wallet.soldeDisponible.toString(),
        enAttente: pendingAgg._sum.netProprietaire?.toString() ?? '0',
        totalGagne: earnedAgg._sum.netProprietaire?.toString() ?? '0',
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        sens: t.sens,
        montant: t.montant.toString(),
        soldeApres: t.soldeApres.toString(),
        creeLe: t.creeLe,
        reservationId: t.reservationId ?? undefined,
      })),
    };
  }

  async adminListWithdrawals() {
    const retraits = await this.prisma.retrait.findMany({
      orderBy: { demandeeLe: 'desc' },
      select: {
        id: true,
        montant: true,
        methode: true,
        destinataire: true,
        statut: true,
        raisonRejet: true,
        demandeeLe: true,
        traiteLe: true,
        wallet: {
          select: {
            utilisateur: {
              select: { prenom: true, nom: true },
            },
          },
        },
      },
    });

    return retraits.map((r) => ({
      id: r.id,
      ownerName: [r.wallet.utilisateur?.prenom, r.wallet.utilisateur?.nom].filter(Boolean).join(' ') || '—',
      amount: Number(r.montant),
      method: r.methode,
      numeroDestinataire: r.destinataire,
      statut: r.statut,
      raisonRejet: r.raisonRejet ?? null,
      demandeeLe: r.demandeeLe,
      traiteLe: r.traiteLe ?? null,
    }));
  }

  /**
   * GET /wallet/penalites
   * Retourne les pénalités en attente pour le propriétaire.
   */
  async getPendingPenalties(user: RequestUser) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const penalites = await this.prisma.penaliteProprietaire.findMany({
      where: {
        utilisateurId: utilisateur.id,
        preleveleLe: null, // Seulement celles pas encore prélevées
      },
      select: {
        id: true,
        montant: true,
        raison: true,
        creeLe: true,
        reservation: {
          select: {
            id: true,
            dateDebut: true,
            vehicule: {
              select: {
                marque: true,
                modele: true,
              },
            },
          },
        },
      },
      orderBy: { creeLe: 'asc' },
    });

    const totalDette = penalites.reduce(
      (sum, p) => sum + Number(p.montant),
      0,
    );

    return {
      penalites: penalites.map((p) => ({
        id: p.id,
        montant: Number(p.montant),
        raison: p.raison,
        creeLe: p.creeLe,
        reservationId: p.reservation.id,
        vehicule: `${p.reservation.vehicule.marque} ${p.reservation.vehicule.modele}`,
        dateLocation: p.reservation.dateDebut,
      })),
      totalDette,
      count: penalites.length,
    };
  }

  async requestWithdrawal(user: RequestUser, montant: number, methode: 'WAVE' | 'ORANGE_MONEY', numeroDestinataire: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true, prenom: true, nom: true },
    });
    if (!utilisateur) throw new NotFoundException('Profil incomplet');

    const wallet = await this.prisma.wallet.findUnique({
      where: { utilisateurId: utilisateur.id },
      select: { id: true, soldeDisponible: true },
    });
    if (!wallet) throw new NotFoundException('Portefeuille introuvable');

    const amount = new Prisma.Decimal(montant);
    if (amount.lte(0)) throw new BadRequestException('Montant invalide');
    if (amount.gt(wallet.soldeDisponible)) throw new BadRequestException('Solde insuffisant');

    await this.prisma.$transaction(async (tx) => {
      const newSolde = wallet.soldeDisponible.sub(amount);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { soldeDisponible: newSolde },
      });
      await tx.transactionWallet.create({
        data: {
          walletId: wallet.id,
          montant: amount,
          soldeApres: newSolde,
          sens: SensTransaction.DEBIT,
          type: TypeTransactionWallet.DEBIT_RETRAIT,
        },
      });
      await tx.retrait.create({
        data: {
          walletId: wallet.id,
          montant: amount,
          methode,
          destinataire: numeroDestinataire,
        },
      });
    });

    const methodeLabel = methode === 'WAVE' ? '🌊 Wave' : '🟠 Orange Money';
    const ownerName = [utilisateur.prenom, utilisateur.nom].filter(Boolean).join(' ') || 'Propriétaire';

    // Send Telegram alert
    this.telegram.sendAdminAlert(
      `💸 <b>Demande de retrait</b>\n` +
      `Méthode : ${methodeLabel}\n` +
      `Numéro : <code>${numeroDestinataire}</code>\n` +
      `Montant : <b>${montant.toLocaleString('fr-FR')} FCFA</b>\n` +
      `<a href="https://autoloc.sn/dashboard/admin/withdrawals">Traiter →</a>`,
    ).catch(() => { });

    // Send admin emails to nstanislas03@gmail.com and jinicopi@gmail.com
    const adminEmails = ['nstanislas03@gmail.com', 'jinicopi@gmail.com'];
    for (const adminEmail of adminEmails) {
      this.notifications.send({
        email: adminEmail,
        type: 'admin.withdrawal.requested',
        data: {
          ownerName,
          montant: montant.toString(),
          methode,
          numeroDestinataire,
          requestedAt: new Date().toLocaleDateString('fr-FR'),
        },
      }).catch(() => { });
    }
  }

  async adminApproveWithdrawal(retraitId: string) {
    const retrait = await this.prisma.retrait.findUnique({
      where: { id: retraitId },
      select: { id: true, statut: true },
    });
    if (!retrait) throw new NotFoundException('Demande de retrait introuvable');
    if (retrait.statut !== StatutRetrait.EN_ATTENTE) {
      throw new ConflictException('Cette demande a déjà été traitée');
    }

    await this.prisma.retrait.update({
      where: { id: retraitId },
      data: { statut: StatutRetrait.EFFECTUE, traiteLe: new Date() },
    });

    return { success: true };
  }

  async adminRejectWithdrawal(retraitId: string, raison: string) {
    const retrait = await this.prisma.retrait.findUnique({
      where: { id: retraitId },
      select: { id: true, statut: true, walletId: true, montant: true },
    });
    if (!retrait) throw new NotFoundException('Demande de retrait introuvable');
    if (retrait.statut !== StatutRetrait.EN_ATTENTE) {
      throw new ConflictException('Cette demande a déjà été traitée');
    }

    // Rembourser le solde + mettre à jour le statut en une transaction
    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: retrait.walletId },
        data: { soldeDisponible: { increment: retrait.montant } },
      }),
      this.prisma.retrait.update({
        where: { id: retraitId },
        data: { statut: StatutRetrait.REJETE, raisonRejet: raison, traiteLe: new Date() },
      }),
    ]);

    return { success: true };
  }

  // ── ADMIN - Gestion des pénalités ──────────────────────────────────────────────

  /**
   * GET /admin/penalties
   * Récupère toutes les pénalités avec filtrage par statut
   */
  async adminGetAllPenalties(statut?: string) {
    const where: any = {};

    // Filtrage par statut basé sur le champ preleveleLe
    if (statut === 'EN_ATTENTE') {
      where.preleveleLe = null;
    } else if (statut === 'DEDUIT') {
      where.preleveleLe = { not: null };
    }
    // Note: ANNULE n'existe pas dans le modèle actuel, on garde les pénalités avec raison contenant "ANNULÉE"

    const penalites = await this.prisma.penaliteProprietaire.findMany({
      where,
      orderBy: { creeLe: 'desc' },
      include: {
        utilisateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        reservation: {
          select: {
            id: true,
            dateDebut: true,
            vehicule: {
              select: { marque: true, modele: true },
            },
          },
        },
      },
    });

    return penalites.map(p => ({
      id: p.id,
      montant: Number(p.montant),
      raison: p.raison,
      statut: p.preleveleLe ? 'DEDUIT' : (p.raison.includes('[ANNULÉE PAR ADMIN') ? 'ANNULE' : 'EN_ATTENTE'),
      creeLe: p.creeLe.toISOString(),
      deduitLe: p.preleveleLe?.toISOString() || null,
      reservationId: p.reservationId,
      proprietaireId: p.utilisateurId,
      proprietaire: {
        prenom: p.utilisateur.prenom || '',
        nom: p.utilisateur.nom || '',
        email: p.utilisateur.email || '',
      },
      reservation: {
        dateDebut: p.reservation.dateDebut.toISOString(),
        vehicule: {
          marque: p.reservation.vehicule.marque,
          modele: p.reservation.vehicule.modele,
        },
      },
    }));
  }

  /**
   * PATCH /admin/penalties/:id/cancel
   * Annuler manuellement une pénalité
   */
  async adminCancelPenalty(penaliteId: string, raison: string) {
    const penalite = await this.prisma.penaliteProprietaire.findUnique({
      where: { id: penaliteId },
    });

    if (!penalite) {
      throw new NotFoundException('Pénalité introuvable');
    }

    if (penalite.preleveleLe) {
      throw new BadRequestException('Impossible d\'annuler une pénalité déjà déduite');
    }

    if (penalite.raison.includes('[ANNULÉE PAR ADMIN')) {
      throw new BadRequestException('Cette pénalité est déjà annulée');
    }

    // On marque comme "annulée" en mettant à jour la raison
    await this.prisma.penaliteProprietaire.update({
      where: { id: penaliteId },
      data: {
        raison: `${penalite.raison} [ANNULÉE PAR ADMIN: ${raison}]`,
      },
    });

    return { success: true, message: 'Pénalité annulée avec succès' };
  }
}
