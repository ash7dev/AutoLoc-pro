import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationService } from '../../notifications/notification.service';
import {
  RESERVATION_QUEUE_NAME,
  RESERVATION_PAYMENT_EXPIRY_JOB,
  RESERVATION_SIGNATURE_EXPIRY_JOB,
  RESERVATION_SIGNATURE_REMINDER_JOB,
  RESERVATION_CHECKIN_REMINDER_JOB,
  RESERVATION_AUTOCLOSE_JOB,
} from '../queue.config';
import { StatutReservation, StatutPaiement } from '@prisma/client';

const DEFAULT_COUNTRY_CODE = '+221';
const SYSTEM_SIGNATURE_REMINDER = 'SYSTEM_SIGNATURE_REMINDER';
const SYSTEM_CHECKIN_REMINDER = 'SYSTEM_CHECKIN_REMINDER';

@Processor(RESERVATION_QUEUE_NAME)
export class ReservationExpiryProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  @Process(RESERVATION_PAYMENT_EXPIRY_JOB)
  async handlePaymentExpiry(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    await this.cancelIfStillPending(
      job.data.reservationId,
      StatutReservation.EN_ATTENTE_PAIEMENT,
      'Paiement non reçu (15 min)',
      'SYSTEM_PAYMENT_EXPIRY',
    );
  }

  @Process(RESERVATION_SIGNATURE_EXPIRY_JOB)
  async handleSignatureExpiry(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    await this.cancelIfStillPending(
      job.data.reservationId,
      StatutReservation.PAYEE,
      'Signature non reçue (48h)',
      'SYSTEM_SIGNATURE_EXPIRY',
      true,
    );
  }

  @Process(RESERVATION_SIGNATURE_REMINDER_JOB)
  async handleSignatureReminder(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    // Rappel uniquement si toujours PAYEE (pas encore signée).
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
      select: {
        id: true,
        statut: true,
        locataire: { select: { telephone: true } },
        proprietaire: { select: { telephone: true } },
      },
    });
    if (!reservation) return;
    if (reservation.statut !== StatutReservation.PAYEE) return;
    if (await this.wasReminderSent(reservation.id, SYSTEM_SIGNATURE_REMINDER)) {
      return;
    }

    const phones = [
      reservation.locataire?.telephone,
      reservation.proprietaire?.telephone,
    ].filter((p): p is string => Boolean(p));

    for (const phone of phones) {
      await this.notification.sendWhatsApp({
        to: this.normalizeWhatsAppNumber(phone),
        body: `Rappel: merci de signer le contrat pour la réservation ${reservation.id}.`,
      });
    }

    await this.markReminderSent(
      reservation.id,
      reservation.statut,
      SYSTEM_SIGNATURE_REMINDER,
    );
  }

  @Process(RESERVATION_CHECKIN_REMINDER_JOB)
  async handleCheckinReminder(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
      select: {
        id: true,
        statut: true,
        locataire: { select: { telephone: true } },
        proprietaire: { select: { telephone: true } },
      },
    });
    if (!reservation) return;
    if (
      reservation.statut !== StatutReservation.PAYEE &&
      reservation.statut !== StatutReservation.CONFIRMEE
    ) {
      return;
    }
    if (await this.wasReminderSent(reservation.id, SYSTEM_CHECKIN_REMINDER)) {
      return;
    }

    const phones = [
      reservation.locataire?.telephone,
      reservation.proprietaire?.telephone,
    ].filter((p): p is string => Boolean(p));

    for (const phone of phones) {
      await this.notification.sendWhatsApp({
        to: this.normalizeWhatsAppNumber(phone),
        body: `Rappel: votre location commence demain (réservation ${reservation.id}).`,
      });
    }

    await this.markReminderSent(
      reservation.id,
      reservation.statut,
      SYSTEM_CHECKIN_REMINDER,
    );
  }

  @Process(RESERVATION_AUTOCLOSE_JOB)
  async handleAutoClose(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: job.data.reservationId },
        select: { id: true, statut: true },
      });
      if (!reservation) return;

      if (reservation.statut !== StatutReservation.EN_COURS) return;

      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          statut: StatutReservation.TERMINEE,
          closeLe: new Date(),
          updatedBySystem: true,
        },
      });

      await tx.reservationHistorique.create({
        data: {
          reservationId: reservation.id,
          ancienStatut: StatutReservation.EN_COURS,
          nouveauStatut: StatutReservation.TERMINEE,
          modifiePar: 'SYSTEM_AUTOCLOSE',
        },
      });
    });
  }

  private async cancelIfStillPending(
    reservationId: string,
    expectedStatus: StatutReservation,
    reason: string,
    systemTag: string,
    markRefund?: boolean,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        select: { id: true, statut: true, paiement: true },
      });
      if (!reservation) return;

      if (reservation.statut !== expectedStatus) return;

      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          statut: StatutReservation.ANNULEE,
          annuleLe: new Date(),
          raisonAnnulation: reason,
          updatedBySystem: true,
        },
      });

      await tx.reservationHistorique.create({
        data: {
          reservationId,
          ancienStatut: expectedStatus,
          nouveauStatut: StatutReservation.ANNULEE,
          modifiePar: systemTag,
        },
      });

      if (markRefund && reservation.paiement) {
        // TODO: déclencher un remboursement réel via le provider.
        await tx.paiement.update({
          where: { id: reservation.paiement.id },
          data: {
            statut: StatutPaiement.REMBOURSE,
            rembourseLe: new Date(),
            montantRembourse: reservation.paiement.montant,
          },
        });
      }
    });
  }

  private normalizeWhatsAppNumber(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.startsWith('whatsapp:')) return trimmed;

    const cleaned = trimmed.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+')) return `whatsapp:${cleaned}`;
    if (cleaned.startsWith('221')) return `whatsapp:+${cleaned}`;
    return `whatsapp:${DEFAULT_COUNTRY_CODE}${cleaned}`;
  }

  private async wasReminderSent(
    reservationId: string,
    tag: string,
  ): Promise<boolean> {
    const count = await this.prisma.reservationHistorique.count({
      where: { reservationId, modifiePar: tag },
    });
    return count > 0;
  }

  private async markReminderSent(
    reservationId: string,
    statut: StatutReservation,
    tag: string,
  ): Promise<void> {
    await this.prisma.reservationHistorique.create({
      data: {
        reservationId,
        ancienStatut: statut,
        nouveauStatut: statut,
        modifiePar: tag,
      },
    });
  }
}
