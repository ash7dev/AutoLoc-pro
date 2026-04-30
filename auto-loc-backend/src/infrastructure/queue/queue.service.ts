import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
  NOTIFICATION_QUEUE_NAME,
  NOTIFICATION_JOB_NAME,
  VEHICLE_QUEUE_NAME,
  VEHICLE_ARCHIVE_CLEANUP_JOB,
} from './queue.config';
import { getCheckoutAutoCloseDelayMs } from '../../domain/reservation/reservation-checkin.constants';

const DEFAULT_PAYMENT_EXPIRY_MS = 15 * 60 * 1000;
const DEFAULT_SIGNATURE_EXPIRY_MS = 48 * 60 * 60 * 1000;
const DEFAULT_SIGNATURE_REMINDER_MS = 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface NotificationPayload {
  type: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectQueue(RESERVATION_QUEUE_NAME)
    private readonly reservationQueue: Queue,
    @InjectQueue(NOTIFICATION_QUEUE_NAME)
    private readonly notificationQueue: Queue,
    @InjectQueue(VEHICLE_QUEUE_NAME)
    private readonly vehicleQueue: Queue,
  ) { }

  async onModuleInit(): Promise<void> {
    this.reservationQueue
      .isReady()
      .then(() => {
        process.stdout.write(`✅ Bull queue ready (${RESERVATION_QUEUE_NAME})\n`);
      })
      .catch((err: Error) => {
        process.stdout.write(`[Bull] queue connection error: ${err.message}\n`);
      });

    // Schedule daily vehicle archive cleanup job
    await this.scheduleVehicleArchiveCleanup();
  }

  async areQueuesReady(): Promise<void> {
    await this.reservationQueue.isReady();
    await this.notificationQueue.isReady();
    await this.vehicleQueue.isReady();
  }

  // Schedule daily vehicle archive cleanup at 2 AM UTC
  async scheduleVehicleArchiveCleanup(): Promise<void> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(2, 0, 0, 0);

    const delayMs = tomorrow.getTime() - now.getTime();

    await this.vehicleQueue.add(
      VEHICLE_ARCHIVE_CLEANUP_JOB,
      {},
      {
        delay: delayMs,
        repeat: {
          every: ONE_DAY_MS,
        },
      },
    );
  }

  // Annule si paiement non reçu après 15 minutes.
  async schedulePaymentExpiry(
    reservationId: string,
    delayMs: number = DEFAULT_PAYMENT_EXPIRY_MS,
  ): Promise<string> {
    const job = await this.reservationQueue.add(
      RESERVATION_PAYMENT_EXPIRY_JOB,
      { reservationId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  // Annule si contrat non signé après 48h.
  async scheduleSignatureExpiry(
    reservationId: string,
    delayMs: number = DEFAULT_SIGNATURE_EXPIRY_MS,
  ): Promise<string> {
    const job = await this.reservationQueue.add(
      RESERVATION_SIGNATURE_EXPIRY_JOB,
      { reservationId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  // Rappel signature à T+24h si non signée.
  async scheduleSignatureReminder(
    reservationId: string,
    delayMs: number = DEFAULT_SIGNATURE_REMINDER_MS,
  ): Promise<string> {
    const job = await this.reservationQueue.add(
      RESERVATION_SIGNATURE_REMINDER_JOB,
      { reservationId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  // Rappels check-in : veille (24h avant) ou jour-J immédiat + urgent (2h après début)
  async scheduleCheckinReminder(
    reservationId: string,
    dateDebut: Date,
  ): Promise<void> {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const now = Date.now();
    const timeToStart = dateDebut.getTime() - now;

    if (timeToStart > oneDayMs) {
      // Démarre dans > 24h : rappel veille à T-24h
      await this.reservationQueue.add(
        RESERVATION_CHECKIN_REMINDER_JOB,
        { reservationId },
        { delay: timeToStart - oneDayMs },
      );
    } else if (timeToStart > 0) {
      // Démarre aujourd'hui (< 24h) : rappel jour-J immédiat
      // forcedType évite que le processor envoie un "veille" basé sur diffHours
      await this.reservationQueue.add(
        RESERVATION_CHECKIN_REMINDER_JOB,
        { reservationId, forcedType: 'jour' as const },
        { delay: 0 },
      );
    }
    // Si dateDebut est déjà passée : pas de rappel veille/jour

    // Rappel urgent 2h après le début prévu (no-show warning)
    const delayUrgent = timeToStart + twoHoursMs;
    if (delayUrgent > 0) {
      await this.reservationQueue.add(
        RESERVATION_CHECKIN_REMINDER_JOB,
        { reservationId },
        { delay: delayUrgent },
      );
    }
  }

  // Rappel check-out 2h avant la date de fin.
  async scheduleCheckoutReminder(
    reservationId: string,
    dateFin: Date,
  ): Promise<string | null> {
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const delayMs = dateFin.getTime() - Date.now() - twoHoursMs;
    if (delayMs <= 0) return null;
    const job = await this.reservationQueue.add(
      RESERVATION_CHECKOUT_REMINDER_JOB,
      { reservationId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  // Demande d'avis 2 minutes après la clôture.
  async scheduleAvisRequest(
    reservationId: string,
  ): Promise<string> {
    const twoMinutesMs = 2 * 60 * 1000;
    const job = await this.reservationQueue.add(
      RESERVATION_AVIS_REQUEST_JOB,
      { reservationId },
      { delay: twoMinutesMs },
    );
    return String(job.id);
  }

  // Auto-clôture 48h après la fin du dernier jour de location (fenêtre inspection proprio).
  async scheduleAutoClose(
    reservationId: string,
    dateFin: Date,
  ): Promise<string> {
    const delayMs = getCheckoutAutoCloseDelayMs(dateFin);
    const job = await this.reservationQueue.add(
      RESERVATION_AUTOCLOSE_JOB,
      { reservationId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  /** Rappels locataire H+0 et H+12 après check-in proprio (validation tacite annoncée). */
  async scheduleTacitCheckinReminders(reservationId: string): Promise<void> {
    const twelveHours = 12 * 60 * 60 * 1000;
    await this.reservationQueue.add(
      RESERVATION_TACIT_CHECKIN_REMINDER_JOB,
      { reservationId, phase: 'immediate' as const },
      { delay: 0 },
    );
    await this.reservationQueue.add(
      RESERVATION_TACIT_CHECKIN_REMINDER_JOB,
      { reservationId, phase: 'mid' as const },
      { delay: twelveHours },
    );
  }

  async scheduleNotification(
    payload: NotificationPayload,
  ): Promise<string> {
    const job = await this.notificationQueue.add(
      NOTIFICATION_JOB_NAME,
      payload,
    );
    return String(job.id);
  }

  async schedulePostCheckout(
    reservationId: string,
  ): Promise<string> {
    const job = await this.reservationQueue.add(
      RESERVATION_POST_CHECKOUT_JOB,
      { reservationId },
    );
    return String(job.id);
  }

  async scheduleContractGeneration(
    reservationId: string,
    options: { statutContrat: 'ACTIF' | 'ANNULE' | 'TERMINE' | 'EN_COURS' }
  ): Promise<string> {
    const job = await this.reservationQueue.add(
      RESERVATION_CONTRACT_GENERATION_JOB,
      { reservationId, options },
      { priority: 1 } // Haute priorité car l'utilisateur attend de voir son contrat mis à jour
    );
    return String(job.id);
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = await this.reservationQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.reservationQueue.close();
  }
}
