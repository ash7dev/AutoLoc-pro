import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SensTransaction, StatutReservation, TypeTransactionWallet } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) { }

  async getWallet(user: RequestUser) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new NotFoundException('Profile not completed');

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

  async requestWithdrawal(user: RequestUser, montant: number) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new NotFoundException('Profile not completed');

    const wallet = await this.prisma.wallet.findUnique({
      where: { utilisateurId: utilisateur.id },
      select: { id: true, soldeDisponible: true },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const amount = new Prisma.Decimal(montant);
    if (amount.lte(0)) throw new BadRequestException('Invalid amount');
    if (amount.gt(wallet.soldeDisponible)) throw new BadRequestException('Insufficient balance');

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
  }
}
