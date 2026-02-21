import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  RESERVATION_QUEUE_NAME,
  NOTIFICATION_QUEUE_NAME,
  RESERVATION_EXPIRY_JOB_NAME,
  NOTIFICATION_JOB_NAME,
} from './queue.config';

export interface NotificationPayload {
  type: string;
  userId?: string;
  email?: string;
  phone?: string;
  subject?: string;
  body?: string;
  [key: string]: unknown;
}

const DEFAULT_RESERVATION_EXPIRY_DELAY_MS = 15 * 60 * 1000;

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectQueue(RESERVATION_QUEUE_NAME) private readonly reservationQueue: Queue,
    @InjectQueue(NOTIFICATION_QUEUE_NAME) private readonly notificationQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    Promise.all([
      this.reservationQueue.isReady(),
      this.notificationQueue.isReady(),
    ])
      .then(() => {
        process.stdout.write(
          `✅ Bull queues ready (${RESERVATION_QUEUE_NAME}, ${NOTIFICATION_QUEUE_NAME})\n`,
        );
      })
      .catch((err: Error) => {
        process.stdout.write(`[Bull] queues connection error: ${err.message}\n`);
      });
  }

  /**
   * Planifie l'expiration d'une réservation (annulation si paiement non reçu).
   * @returns Job id à passer à cancelJob si le paiement arrive avant.
   */
  async scheduleReservationExpiry(
    reservationId: string,
    delayMs: number = DEFAULT_RESERVATION_EXPIRY_DELAY_MS,
  ): Promise<string> {
    const job = await this.reservationQueue.add(
      RESERVATION_EXPIRY_JOB_NAME,
      { reservationId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  /**
   * Envoie une notification (email/SMS/push) via la queue.
   */
  async sendNotification(payload: NotificationPayload): Promise<string> {
    const job = await this.notificationQueue.add(NOTIFICATION_JOB_NAME, payload);
    return String(job.id);
  }

  /**
   * Annule un job planifié (ex: annuler l'expiration si paiement reçu).
   * Cible la queue reservation-jobs.
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.reservationQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  async areQueuesReady(): Promise<boolean> {
    await Promise.all([
      this.reservationQueue.isReady(),
      this.notificationQueue.isReady(),
    ]);
    return true;
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.reservationQueue.close(),
      this.notificationQueue.close(),
    ]);
  }
}
