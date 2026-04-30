import { Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationService } from '../../notifications/notification.service';
import { NotificationType } from '../../notifications/email-templates';
import { ExpireReservationUseCase } from '../../../domain/reservation/use-cases/expire-reservation.use-case';
import {
  RESERVATION_QUEUE_NAME,
  RESERVATION_PAYMENT_EXPIRY_JOB,
  RESERVATION_SIGNATURE_EXPIRY_JOB,
  RESERVATION_SIGNATURE_REMINDER_JOB,
  RESERVATION_CHECKIN_REMINDER_JOB,
  RESERVATION_CHECKOUT_REMINDER_JOB,
  RESERVATION_AVIS_REQUEST_JOB,
  RESERVATION_AUTOCLOSE_JOB,
  RESERVATION_POST_CHECKOUT_JOB,
  RESERVATION_TACIT_CHECKIN_REMINDER_JOB,
  RESERVATION_CONTRACT_GENERATION_JOB,
} from '../queue.config';
import { StatutReservation, StatutPaiement } from '@prisma/client';
import { QueueService } from '../queue.service';
import { isPastCheckoutInspectionWindow } from '../../../domain/reservation/reservation-checkin.constants';
import { ContractGenerationService } from '../../../domain/reservation/contract-generation.service';

const SYSTEM_SIGNATURE_REMINDER = 'SYSTEM_SIGNATURE_REMINDER';
const SYSTEM_TACIT_REMINDER_IMMEDIATE = 'SYSTEM_TACIT_REMINDER_IMMEDIATE';
const SYSTEM_TACIT_REMINDER_MID = 'SYSTEM_TACIT_REMINDER_MID';

@Processor(RESERVATION_QUEUE_NAME)
export class ReservationExpiryProcessor {
  private readonly logger = new Logger(ReservationExpiryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly expireUseCase: ExpireReservationUseCase,
    private readonly queue: QueueService,
    private readonly contractGeneration: ContractGenerationService,
  ) { }

  @Process(RESERVATION_CONTRACT_GENERATION_JOB)
  async handleContractGeneration(
    job: Job<{ reservationId: string, options: any }>,
  ): Promise<void> {
    try {
      await this.contractGeneration.generateAndStore(job.data.reservationId, job.data.options);
    } catch (err) {
      console.error(`[Queue] Contract generation failed for ${job.data.reservationId}:`, err);
      throw err; // Permet à Bull de réessayer selon la config
    }
  }

  @Process(RESERVATION_PAYMENT_EXPIRY_JOB)
  async handlePaymentExpiry(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    await this.expireUseCase.execute(job.data.reservationId);
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
        locataireId: true,
        proprietaireId: true,
        locataire: { select: { telephone: true } },
        proprietaire: { select: { telephone: true } },
      },
    });
    if (!reservation) return;
    if (reservation.statut !== StatutReservation.PAYEE) return;
    if (await this.wasReminderSent(reservation.id, SYSTEM_SIGNATURE_REMINDER)) {
      return;
    }

    const promises = [
      this.notification.send({
        type: 'reservation.paid',
        userId: reservation.locataireId,
        phone: reservation.locataire?.telephone ?? undefined,
        data: { reservationId: reservation.id, isOwner: false },
      }),
      this.notification.send({
        type: 'reservation.paid.owner',
        userId: reservation.proprietaireId,
        phone: reservation.proprietaire?.telephone ?? undefined,
        data: { reservationId: reservation.id, isOwner: true },
      }),
    ];

    await Promise.all(promises).catch(err => this.logger.error(`Error sending signature reminders for ${reservation.id}: ${err}`));

    await this.markReminderSent(
      reservation.id,
      reservation.statut,
      SYSTEM_SIGNATURE_REMINDER,
    );
  }

  @Process(RESERVATION_CHECKIN_REMINDER_JOB)
  async handleCheckinReminder(
    job: Job<{ reservationId: string; forcedType?: 'jour' }>,
  ): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
      select: {
        id: true,
        statut: true,
        dateDebut: true,
        dateFin: true,
        locataireId: true,
        proprietaireId: true,
        locataire: { select: { email: true, telephone: true } },
        proprietaire: { select: { email: true, telephone: true } },
        vehicule: { select: { marque: true, modele: true } },
      },
    });

    if (!reservation) return;

    const startDate = new Date(reservation.dateDebut);
    let notifType: NotificationType;
    let systemTag: string;

    if (job.data.forcedType === 'jour') {
      // Réservation qui commence aujourd'hui — confirmée le jour même
      if (reservation.statut !== StatutReservation.CONFIRMEE) return;
      notifType = 'reservation.checkin.reminder_jour';
      systemTag = 'SYSTEM_CHECKIN_JOUR_IMMEDIAT';
    } else {
      // Déterminer si c'est le rappel J-1 ou l'alerte urgente J+2h
      const diffHours = (Date.now() - startDate.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 2) {
        // Plus de 2h de retard sur le début prévu
        if (reservation.statut !== StatutReservation.CONFIRMEE) return;
        notifType = 'reservation.checkin.reminder_jour';
        systemTag = 'SYSTEM_CHECKIN_URGENT';
      } else {
        // Rappel normal la veille
        if (reservation.statut !== StatutReservation.CONFIRMEE && reservation.statut !== StatutReservation.PAYEE) return;
        notifType = 'reservation.checkin.reminder_veille';
        systemTag = 'SYSTEM_CHECKIN_VEILLE';
      }
    }

    if (await this.wasReminderSent(reservation.id, systemTag)) return;

    const vehicule = reservation.vehicule ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}` : 'véhicule';

    const formatDateHeure = (d: Date) => {
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      return d.getUTCHours() === 0 && d.getUTCMinutes() === 0 ? label : `${label} à ${h}h${m}`;
    };

    const dateHeure = formatDateHeure(startDate);
    const dateFinHeure = formatDateHeure(new Date(reservation.dateFin));

    // Envoi aux deux parties via le service central
    const promises = [
      this.notification.send({
        type: notifType,
        userId: reservation.locataireId,
        email: reservation.locataire.email,
        phone: reservation.locataire.telephone ?? undefined,
        data: {
          reservationId: reservation.id,
          dateDebut: dateHeure,
          dateFin: dateFinHeure,
          isOwner: false,
          vehicule,
          otherPartyPhone: reservation.proprietaire?.telephone ?? undefined,
        },
      }),
      this.notification.send({
        type: notifType,
        userId: reservation.proprietaireId,
        email: reservation.proprietaire.email,
        phone: reservation.proprietaire.telephone ?? undefined,
        data: {
          reservationId: reservation.id,
          dateDebut: dateHeure,
          dateFin: dateFinHeure,
          isOwner: true,
          vehicule,
          otherPartyPhone: reservation.locataire?.telephone ?? undefined,
        },
      }),
    ];

    await Promise.all(promises).catch(err => this.logger.error(`Error sending reminders for ${reservation.id}: ${err}`));

    await this.markReminderSent(reservation.id, reservation.statut, systemTag);
  }

  @Process(RESERVATION_CHECKOUT_REMINDER_JOB)
  async handleCheckoutReminder(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
      select: {
        id: true,
        statut: true,
        locataireId: true,
        proprietaireId: true,
        locataire: { select: { email: true, telephone: true } },
        proprietaire: { select: { email: true, telephone: true } },
      },
    });

    if (!reservation || reservation.statut !== StatutReservation.EN_COURS) return;

    const promises = [
      this.notification.send({
        type: 'reservation.checkout.reminder',
        userId: reservation.locataireId,
        email: reservation.locataire.email,
        phone: reservation.locataire.telephone ?? undefined,
        data: { reservationId: reservation.id, isOwner: false },
      }),
      this.notification.send({
        type: 'reservation.checkout.reminder',
        userId: reservation.proprietaireId,
        email: reservation.proprietaire.email,
        phone: reservation.proprietaire.telephone ?? undefined,
        data: { reservationId: reservation.id, isOwner: true },
      }),
    ];

    await Promise.all(promises).catch(err => this.logger.error(`Error sending checkout reminders for ${reservation.id}: ${err}`));
  }

  @Process(RESERVATION_AVIS_REQUEST_JOB)
  async handleAvisRequest(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
      select: {
        id: true,
        statut: true,
        locataireId: true,
        locataire: { select: { email: true, telephone: true } },
      },
    });

    if (!reservation || reservation.statut !== StatutReservation.TERMINEE) return;

    await this.notification.send({
      type: 'avis.request',
      userId: reservation.locataireId,
      email: reservation.locataire.email,
      phone: reservation.locataire.telephone ?? undefined,
      data: { reservationId: reservation.id },
    });
  }

  @Process(RESERVATION_TACIT_CHECKIN_REMINDER_JOB)
  async handleTacitCheckinReminder(
    job: Job<{ reservationId: string; phase: 'immediate' | 'mid' }>,
  ): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
      select: {
        id: true,
        statut: true,
        locataireId: true,
        checkinLocataireLe: true,
        tacitCheckinDeadlineLe: true,
        locataire: { select: { telephone: true, prenom: true } },
      },
    });
    if (!reservation) return;
    if (
      reservation.statut !== StatutReservation.CONFIRMEE ||
      reservation.checkinLocataireLe ||
      !reservation.tacitCheckinDeadlineLe
    ) {
      return;
    }

    const tag =
      job.data.phase === 'immediate'
        ? SYSTEM_TACIT_REMINDER_IMMEDIATE
        : SYSTEM_TACIT_REMINDER_MID;
    if (await this.wasReminderSent(job.data.reservationId, tag)) {
      return;
    }

    const phone = reservation.locataire?.telephone;
    if (phone) {
      await this.notification.send({
        type: 'reservation.checkin.tacit_window',
        userId: reservation.locataireId,
        phone: phone ?? undefined,
        data: { reservationId: job.data.reservationId },
      });
    }

    await this.markReminderSent(
      job.data.reservationId,
      StatutReservation.CONFIRMEE,
      tag,
    );
  }

  @Process(RESERVATION_AUTOCLOSE_JOB)
  async handleAutoClose(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    const now = new Date();

    const outcome = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: job.data.reservationId },
        select: {
          id: true,
          statut: true,
          dateFin: true,
          checkoutLe: true,
        },
      });
      if (!reservation) return { closed: false as const };

      if (reservation.statut !== StatutReservation.EN_COURS || reservation.checkoutLe) {
        return { closed: false as const };
      }

      if (!isPastCheckoutInspectionWindow(reservation.dateFin, now)) {
        return { closed: false as const };
      }

      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          statut: StatutReservation.TERMINEE,
          checkoutLe: now,
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
      return { closed: true as const };
    });

    if (outcome.closed) {
      await this.queue.schedulePostCheckout(job.data.reservationId).catch(() => { });
    }
  }

  @Process(RESERVATION_POST_CHECKOUT_JOB)
  async handlePostCheckout(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: job.data.reservationId },
      select: { vehiculeId: true, statut: true },
    });
    if (!reservation) return;
    if (reservation.statut !== 'TERMINEE') return;

    await this.prisma.vehicule.update({
      where: { id: reservation.vehiculeId },
      data: { totalLocations: { increment: 1 } },
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
