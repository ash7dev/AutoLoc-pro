import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, SensTransaction, StatutReservation, StatutRetrait, TypeTransactionWallet } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { RequestUser } from '../../common/types/auth.types';
import { PaymentProviderFactory } from '../../infrastructure/payment/payment-provider.factory';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
    private readonly notifications: NotificationService,
    private readonly providerFactory: PaymentProviderFactory,
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

    // Récupérer les IDs des réservations déjà créditées (CREDIT_LOCATION)
    const creditedReservations = await this.prisma.transactionWallet.findMany({
      where: {
        walletId: wallet.id,
        type: TypeTransactionWallet.CREDIT_LOCATION,
      },
      select: { reservationId: true },
    });
    const creditedReservationIds = new Set(creditedReservations.map(t => t.reservationId).filter(Boolean));

    // Calculer les soldes séparés par fournisseur
    const allTransactions = await this.prisma.transactionWallet.findMany({
      where: { walletId: wallet.id },
      select: {
        montant: true,
        sens: true,
        fournisseur: true,
      },
    });

    let soldeWave = new Prisma.Decimal(0);
    let soldeOrangeMoney = new Prisma.Decimal(0);

    for (const tx of allTransactions) {
      const montant = tx.montant;
      const multiplier = tx.sens === SensTransaction.CREDIT ? 1 : -1;
      const amount = montant.mul(multiplier);

      if (tx.fournisseur === 'WAVE') {
        soldeWave = soldeWave.add(amount);
      } else if (tx.fournisseur === 'ORANGE_MONEY') {
        soldeOrangeMoney = soldeOrangeMoney.add(amount);
      }
    }

    const [pendingAgg, earnedAgg, transactions] = await Promise.all([
      this.prisma.reservation.aggregate({
        where: {
          proprietaireId: utilisateur.id,
          statut: { in: pendingStatuses },
          id: { notIn: Array.from(creditedReservationIds).filter((id): id is string => id !== null) }, // Exclure les réservations déjà créditées
        },
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
          fournisseur: true,
        },
      }),
    ]);

    return {
      balance: {
        soldeDisponible: wallet.soldeDisponible.toString(),
        soldeWave: soldeWave.toString(),
        soldeOrangeMoney: soldeOrangeMoney.toString(),
        enAttente: pendingAgg._sum?.netProprietaire?.toString() ?? '0',
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
        fournisseur: t.fournisseur ?? undefined,
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

    // Calculer le solde disponible pour le fournisseur sélectionné
    const allTransactions = await this.prisma.transactionWallet.findMany({
      where: { walletId: wallet.id },
      select: {
        montant: true,
        sens: true,
        fournisseur: true,
      },
    });

    let soldeProvider = new Prisma.Decimal(0);
    const targetProvider = methode === 'WAVE' ? 'WAVE' : 'ORANGE_MONEY';

    for (const tx of allTransactions) {
      const multiplier = tx.sens === SensTransaction.CREDIT ? 1 : -1;
      const txAmount = tx.montant.mul(multiplier);

      if (tx.fournisseur === targetProvider) {
        soldeProvider = soldeProvider.add(txAmount);
      }
    }

    // Vérifier que le solde du fournisseur est suffisant
    if (amount.gt(soldeProvider)) {
      const methodeLabel = methode === 'WAVE' ? 'Wave' : 'Orange Money';
      throw new BadRequestException(
        `Solde ${methodeLabel} insuffisant. Disponible : ${soldeProvider.toString()} FCFA`,
      );
    }

    // Créer la demande de retrait et débiter le wallet
    const { retrait, transactionWalletId } = await this.prisma.$transaction(async (tx) => {
      const newSolde = wallet.soldeDisponible.sub(amount);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { soldeDisponible: newSolde },
      });
      const txWallet = await tx.transactionWallet.create({
        data: {
          walletId: wallet.id,
          montant: amount,
          soldeApres: newSolde,
          sens: SensTransaction.DEBIT,
          type: TypeTransactionWallet.DEBIT_RETRAIT,
          fournisseur: targetProvider,
        },
      });
      const retraitResult = await tx.retrait.create({
        data: {
          walletId: wallet.id,
          montant: amount,
          methode,
          destinataire: numeroDestinataire,
        },
      });
      return { retrait: retraitResult, transactionWalletId: txWallet.id };
    });

    const retraitId = retrait.id;

    const methodeLabel = methode === 'WAVE' ? '🌊 Wave' : '🟠 Orange Money';
    const ownerName = [utilisateur.prenom, utilisateur.nom].filter(Boolean).join(' ') || 'Propriétaire';

    // 🚀 AUTOMATISATION : Si Wave, déclencher le payout automatiquement
    if (methode === 'WAVE') {
      try {
        const waveProvider = this.providerFactory.get('WAVE');

        if (!waveProvider.initiatePayout) {
          throw new Error('Wave payout not supported by provider');
        }

        this.logger.log(
          `🌊 Initiating automatic Wave payout: ${montant} FCFA → ${numeroDestinataire}`,
        );

        const payoutResult = await waveProvider.initiatePayout({
          amount: montant,
          recipientPhone: numeroDestinataire,
          referenceId: retraitId,
          recipientName: ownerName,
        });

        this.logger.log(
          `✅ Wave payout initiated: ${payoutResult.transactionId} (status: ${payoutResult.status})`,
        );

        if (payoutResult.status === 'FAILED') {
          throw new Error('Transaction rejetée par Wave');
        }

        // Mettre à jour le retrait avec l'ID de transaction Wave
        await this.prisma.retrait.update({
          where: { id: retraitId },
          data: {
            idTransactionFournisseur: payoutResult.transactionId,
            statut: payoutResult.status === 'COMPLETED' ? StatutRetrait.EFFECTUE : StatutRetrait.EN_ATTENTE,
            ...(payoutResult.status === 'COMPLETED' ? { traiteLe: new Date() } : {}),
          },
        });

        // Notification succès
        this.telegram.sendAdminAlert(
          `✅ <b>Retrait Wave automatique</b>\n` +
          `Propriétaire : ${ownerName}\n` +
          `Montant : <b>${montant.toLocaleString('fr-FR')} FCFA</b>\n` +
          `Numéro : <code>${numeroDestinataire}</code>\n` +
          `ID Transaction : <code>${payoutResult.transactionId}</code>\n` +
          `Statut : ${payoutResult.status}`,
        ).catch(() => { });

        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `❌ Wave payout failed: ${errorMessage}`,
        );

        // 🔄 Restituer les fonds et annuler la transaction de débit en base de données
        try {
          await this.prisma.$transaction([
            this.prisma.wallet.update({
              where: { id: wallet.id },
              data: { soldeDisponible: { increment: amount } },
            }),
            this.prisma.retrait.update({
              where: { id: retraitId },
              data: {
                statut: StatutRetrait.REJETE,
                raisonRejet: `Échec du virement automatique Wave : ${errorMessage}`,
                traiteLe: new Date(),
              },
            }),
            this.prisma.transactionWallet.delete({
              where: { id: transactionWalletId },
            }),
          ]);
          this.logger.log(
            `🔄 Wallet restored and debit transaction deleted for failed withdrawal ${retraitId}`,
          );
        } catch (dbError) {
          const dbErrMsg = dbError instanceof Error ? dbError.message : 'Unknown DB error';
          this.logger.error(
            `❌ Failed to restore wallet for failed withdrawal ${retraitId}: ${dbErrMsg}`,
          );
        }

        // En cas d'erreur, notifier les admins pour information
        this.telegram.sendAdminAlert(
          `⚠️ <b>Retrait Wave échoué - Remboursé automatiquement</b>\n` +
          `Propriétaire : ${ownerName}\n` +
          `Montant : <b>${montant.toLocaleString('fr-FR')} FCFA</b>\n` +
          `Numéro : <code>${numeroDestinataire}</code>\n` +
          `Erreur : ${errorMessage}\n` +
          `Statut : REJETE (les fonds ont été restitués au portefeuille)`,
        ).catch(() => { });

        throw new BadRequestException(`Échec du virement Wave : ${errorMessage}`);
      }
    }

    // 🟠 ORANGE MONEY : Traitement manuel (notification aux admins)
    if (methode === 'ORANGE_MONEY') {
      this.telegram.sendAdminAlert(
        `💸 <b>Demande de retrait Orange Money</b>\n` +
        `Méthode : ${methodeLabel}\n` +
        `Numéro : <code>${numeroDestinataire}</code>\n` +
        `Montant : <b>${montant.toLocaleString('fr-FR')} FCFA</b>\n` +
        `⚠️ Traitement manuel requis\n` +
        `<a href="https://autoloc.sn/dashboard/admin/withdrawals">Traiter →</a>`,
      ).catch(() => { });

      // Send admin emails
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

  // ── ADMIN - Gestion des remboursements ────────────────────────────────────────

  /**
   * GET /admin/refunds
   * Récupère tous les remboursements en attente suite aux annulations
   */
  async adminListRefunds() {
    const refunds = await this.prisma.paiement.findMany({
      where: {
        statut: 'EN_ATTENTE_REMBOURSEMENT',
      },
      orderBy: { creeLe: 'asc' }, // Plus anciens en premier
      include: {
        reservation: {
          select: {
            id: true,
            dateDebut: true,
            dateFin: true,
            annuleLe: true,
            raisonAnnulation: true,
            locataire: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
                telephone: true,
              },
            },
            vehicule: {
              select: {
                marque: true,
                modele: true,
                immatriculation: true,
              },
            },
          },
        },
      },
    });

    return refunds.map(p => ({
      id: p.id,
      reservationId: p.reservationId,
      montant: Number(p.montant),
      montantRembourse: p.montantRembourse ? Number(p.montantRembourse) : 0,
      devise: p.devise,
      fournisseur: p.fournisseur,
      statut: p.statut,
      creeLe: p.creeLe.toISOString(),
      annuleLe: p.reservation.annuleLe?.toISOString() || null,
      raisonAnnulation: p.reservation.raisonAnnulation || '',
      locataire: {
        id: p.reservation.locataire.id,
        prenom: p.reservation.locataire.prenom || '',
        nom: p.reservation.locataire.nom || '',
        email: p.reservation.locataire.email || '',
        telephone: p.reservation.locataire.telephone || '',
      },
      vehicule: {
        marque: p.reservation.vehicule.marque,
        modele: p.reservation.vehicule.modele,
        immatriculation: p.reservation.vehicule.immatriculation || '',
      },
      dateDebut: p.reservation.dateDebut.toISOString(),
      dateFin: p.reservation.dateFin.toISOString(),
    }));
  }

  /**
   * PATCH /admin/refunds/:id/process
   * Marque un remboursement comme effectué après virement InTouch manuel
   */
  async adminProcessRefund(paiementId: string) {
    const paiement = await this.prisma.paiement.findUnique({
      where: { id: paiementId },
      select: {
        id: true,
        statut: true,
        montantRembourse: true,
        montant: true,
        fournisseur: true,
        reservation: {
          select: {
            id: true,
            dateDebut: true,
            dateFin: true,
            raisonAnnulation: true,
            locataire: {
              select: {
                prenom: true,
                nom: true,
                email: true,
                telephone: true,
              },
            },
            vehicule: {
              select: {
                marque: true,
                modele: true,
              },
            },
          },
        },
      },
    });

    if (!paiement) {
      throw new NotFoundException('Paiement introuvable');
    }

    if (paiement.statut !== 'EN_ATTENTE_REMBOURSEMENT') {
      throw new ConflictException('Ce remboursement a déjà été traité ou n\'est pas en attente');
    }

    const now = new Date();

    await this.prisma.paiement.update({
      where: { id: paiementId },
      data: {
        statut: 'REMBOURSE',
        rembourseLe: now,
      },
    });

    // Notification aux admins
    const adminEmails = ['nstanislas03@gmail.com', 'jinicopi@gmail.com'];
    const locataire = paiement.reservation?.locataire;
    const vehicule = paiement.reservation?.vehicule;
    const montantRembourse = Number(paiement.montantRembourse || 0);

    for (const adminEmail of adminEmails) {
      this.notifications.send({
        email: adminEmail,
        type: 'admin.refund.processed',
        data: {
          locataireNom: locataire ? `${locataire.prenom} ${locataire.nom}` : 'Inconnu',
          locataireEmail: locataire?.email || '',
          montant: montantRembourse.toLocaleString('fr-FR'),
          fournisseur: paiement.fournisseur,
          vehicule: vehicule ? `${vehicule.marque} ${vehicule.modele}` : 'Véhicule inconnu',
          reservationId: paiement.reservation?.id.slice(0, 8).toUpperCase() || '',
          processedAt: now.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      }).catch(() => { });
    }

    return { success: true, message: 'Remboursement marqué comme effectué' };
  }
}
