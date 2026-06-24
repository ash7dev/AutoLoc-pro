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
  VEHICLE_CLOUDINARY_DELETE_JOB,
} from './queue.config';
import { getCheckoutAutoCloseDelayMs } from '../../domain/reservation/reservation-checkin.constants';

const DEFAULT_PAYMENT_EXPIRY_MS = process.env.PAYMENT_EXPIRY_MS
  ? parseInt(process.env.PAYMENT_EXPIRY_MS, 10)
  : 3 * 60 * 1000;
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

  // Rappels check-in — trois jobs distincts :
  //   1. veille  : 9h UTC le jour J-1 (skippé si déjà passé)
  //   2. jourJ   : 9h UTC le jour J (ou T-2h si début avant 11h UTC)
  //   3. urgent  : T+2h si pas de check-in (message "retard", type différent)
  // La décision veille/jourJ est basée sur le jour calendaire UTC, pas sur 24h glissants.
  async scheduleCheckinReminder(
    reservationId: string,
    dateDebut: Date,
  ): Promise<void> {
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const now = Date.now();
    const timeToStart = dateDebut.getTime() - now;

    if (timeToStart > 0) {
      // Comparer les jours calendaires UTC pour décider veille vs jourJ-immédiat
      const nowDate = new Date(now);
      const startDay = dateDebut.getUTCFullYear() * 10000 + (dateDebut.getUTCMonth() + 1) * 100 + dateDebut.getUTCDate();
      const todayDay = nowDate.getUTCFullYear() * 10000 + (nowDate.getUTCMonth() + 1) * 100 + nowDate.getUTCDate();
      const isSameDay = startDay === todayDay;

      if (isSameDay) {
        // Démarre aujourd'hui : rappel jour J immédiat
        await this.reservationQueue.add(
          RESERVATION_CHECKIN_REMINDER_JOB,
          { reservationId, forcedType: 'jour' as const },
          { delay: 0 },
        );
      } else {
        // Démarre un autre jour (demain ou plus tard)

        // 1. Rappel veille : 9h UTC le jour J-1 (skippé si ce créneau est déjà passé)
        const veille = new Date(dateDebut);
        veille.setUTCDate(veille.getUTCDate() - 1);
        veille.setUTCHours(9, 0, 0, 0);
        const delayVeille = veille.getTime() - now;
        if (delayVeille > 0) {
          await this.reservationQueue.add(
            RESERVATION_CHECKIN_REMINDER_JOB,
            { reservationId },
            { delay: delayVeille },
          );
        }

        // 2. Rappel matin jour J : 9h UTC (ou T-2h si début avant 11h, min 7h)
        //    Si le créneau calculé dépasse l'heure de début (ex: début 03h15 → créneau 07h00 > 03h15),
        //    on ne fait RIEN ici : le rappel veille (J-1 9h) + urgent (T+2h) couvrent ce cas.
        //    IMPORTANT : ne jamais envoyer en immédiat (delay:0) depuis la branche "autre jour",
        //    car cela enverrait le message "la location commence aujourd'hui" des jours à l'avance.
        const jourJ = new Date(dateDebut);
        const startHour = dateDebut.getUTCHours();
        jourJ.setUTCHours(startHour < 11 ? Math.max(7, startHour - 2) : 9, 0, 0, 0);
        const delayJourJ = jourJ.getTime() - now;
        if (delayJourJ > 0 && jourJ.getTime() <= dateDebut.getTime()) {
          // Créneau futur et avant le début → scheduling normal
          await this.reservationQueue.add(
            RESERVATION_CHECKIN_REMINDER_JOB,
            { reservationId, forcedType: 'jour' as const },
            { delay: delayJourJ },
          );
        }
        // else: créneau après le début (début trop tôt le matin) → on skip,
        // le rappel veille + urgent T+2h sont suffisants.
      }
    }

    // 3. Rappel urgent T+2h : si pas de check-in (message "retard", type reminder_urgent)
    const delayUrgent = timeToStart + twoHoursMs;
    if (delayUrgent > 0) {
      await this.reservationQueue.add(
        RESERVATION_CHECKIN_REMINDER_JOB,
        { reservationId, forcedType: 'urgent' as const },
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
    const twelveHours  = 12 * 60 * 60 * 1000;
    const twentyTwoHours = 22 * 60 * 60 * 1000;
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
    // Dernière chance 2h avant la validation tacite (H+22 sur une fenêtre de 24h)
    await this.reservationQueue.add(
      RESERVATION_TACIT_CHECKIN_REMINDER_JOB,
      { reservationId, phase: 'last' as const },
      { delay: twentyTwoHours },
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

  // Supprime les images Cloudinary d'un véhicule après un délai (expiration cache CDN).
  async scheduleCloudinaryDelete(
    vehicleId: string,
    delayMs: number = 24 * 60 * 60 * 1000,
  ): Promise<string> {
    const job = await this.vehicleQueue.add(
      VEHICLE_CLOUDINARY_DELETE_JOB,
      { vehicleId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  async onModuleDestroy(): Promise<void> {
    await this.reservationQueue.close();
  }
}
