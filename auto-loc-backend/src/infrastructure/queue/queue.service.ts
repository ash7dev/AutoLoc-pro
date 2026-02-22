import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  RESERVATION_QUEUE_NAME,
  RESERVATION_PAYMENT_EXPIRY_JOB,
  RESERVATION_SIGNATURE_EXPIRY_JOB,
  RESERVATION_SIGNATURE_REMINDER_JOB,
  RESERVATION_CHECKIN_REMINDER_JOB,
  RESERVATION_AUTOCLOSE_JOB,
} from './queue.config';

const DEFAULT_PAYMENT_EXPIRY_MS = 15 * 60 * 1000;
const DEFAULT_SIGNATURE_EXPIRY_MS = 48 * 60 * 60 * 1000;
const DEFAULT_SIGNATURE_REMINDER_MS = 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectQueue(RESERVATION_QUEUE_NAME)
    private readonly reservationQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    this.reservationQueue
      .isReady()
      .then(() => {
        process.stdout.write(`✅ Bull queue ready (${RESERVATION_QUEUE_NAME})\n`);
      })
      .catch((err: Error) => {
        process.stdout.write(`[Bull] queue connection error: ${err.message}\n`);
      });
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

  // Rappel check-in la veille de la date de début.
  async scheduleCheckinReminder(
    reservationId: string,
    dateDebut: Date,
  ): Promise<string | null> {
    const delayMs = dateDebut.getTime() - Date.now() - ONE_DAY_MS;
    if (delayMs <= 0) return null;
    const job = await this.reservationQueue.add(
      RESERVATION_CHECKIN_REMINDER_JOB,
      { reservationId },
      { delay: delayMs },
    );
    return String(job.id);
  }

  // Auto-clôture 24h après la date de fin si pas de check-out.
  async scheduleAutoClose(
    reservationId: string,
    dateFin: Date,
  ): Promise<string> {
    const delayMs = dateFin.getTime() - Date.now() + ONE_DAY_MS;
    const job = await this.reservationQueue.add(
      RESERVATION_AUTOCLOSE_JOB,
      { reservationId },
      { delay: Math.max(delayMs, 0) },
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
