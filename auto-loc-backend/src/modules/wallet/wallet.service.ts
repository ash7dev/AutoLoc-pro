import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SensTransaction, StatutReservation, TypeTransactionWallet } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';
import { RequestUser } from '../../common/types/auth.types';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
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
        statut: true,
        raisonRejet: true,
        demandeeLe: true,
        traiteLe: true,
        wallet: {
          select: {
            utilisateur: {
              select: { prenom: true, nom: true, telephone: true },
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
      bankInfo: r.wallet.utilisateur?.telephone ?? '—',
      statut: r.statut,
      raisonRejet: r.raisonRejet ?? null,
      demandeeLe: r.demandeeLe,
      traiteLe: r.traiteLe ?? null,
    }));
  }

  async requestWithdrawal(user: RequestUser, montant: number) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
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
          methode: 'VIREMENT',
          destinataire: utilisateur.id,
        },
      });
    });

    // Alerte admin Telegram — fire-and-forget
    this.telegram.sendAdminAlert(
      `💸 <b>Demande de retrait</b>\n` +
      `Montant : ${montant.toLocaleString('fr-FR')} FCFA\n` +
      `<a href="https://autoloc.sn/dashboard/admin/withdrawals">Traiter →</a>`,
    ).catch(() => { });
  }
}
