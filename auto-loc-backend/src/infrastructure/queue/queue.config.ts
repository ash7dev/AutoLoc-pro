import { BullModuleOptions } from '@nestjs/bull';

const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 1000,
};

export const RESERVATION_QUEUE_NAME = 'reservation-jobs';
export const RESERVATION_PAYMENT_EXPIRY_JOB = 'reservation-payment-expiry';
export const RESERVATION_SIGNATURE_EXPIRY_JOB = 'reservation-signature-expiry';
export const RESERVATION_SIGNATURE_REMINDER_JOB = 'reservation-signature-reminder';
export const RESERVATION_CHECKIN_REMINDER_JOB = 'reservation-checkin-reminder';
export const RESERVATION_CHECKOUT_REMINDER_JOB = 'reservation-checkout-reminder';
export const RESERVATION_AVIS_REQUEST_JOB = 'reservation-avis-request';
export const RESERVATION_AUTOCLOSE_JOB = 'reservation-autoclose';
export const RESERVATION_POST_CHECKOUT_JOB = 'reservation-post-checkout';
export const RESERVATION_TACIT_CHECKIN_REMINDER_JOB = 'reservation-tacit-checkin-reminder';
export const RESERVATION_CONTRACT_GENERATION_JOB = 'reservation-contract-generation';

// Aliases pour compatibilité avec les processors existants
export const RESERVATION_EXPIRY_JOB_NAME = RESERVATION_PAYMENT_EXPIRY_JOB;

export const NOTIFICATION_QUEUE_NAME = 'notification-jobs';
export const NOTIFICATION_JOB_NAME = 'notification-dispatch';

export const VEHICLE_QUEUE_NAME = 'vehicle-jobs';
export const VEHICLE_ARCHIVE_CLEANUP_JOB = 'vehicle-archive-cleanup';
export const VEHICLE_CLOUDINARY_DELETE_JOB = 'vehicle-cloudinary-delete';

export function getBullModuleOptions(redisUrl: string): BullModuleOptions {
  const url = redisUrl.trim();
  if (!url) {
    throw new Error('REDIS_URL is required for Bull queues');
  }
  const parsed = new URL(url);
  const port = parsed.port ? parseInt(parsed.port, 10) : 6379;
  const password = parsed.password ? decodeURIComponent(parsed.password) : undefined;

  return {
    redis: {
      host: parsed.hostname,
      port,
      ...(password ? { password } : {}),
      ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
      maxRetriesPerRequest: null,
    },
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
    settings: {
      guardInterval: 30_000,     // delayed jobs : poll toutes les 30s (défaut 5s)
      stalledInterval: 120_000,  // stalled jobs : check toutes les 2min (défaut 30s)
      drainDelay: 2_000,         // queue vide : attendre 2s avant le prochain poll (défaut 5ms)
      lockDuration: 60_000,      // durée du lock job → moins de renouvellements Redis (défaut 30s)
      lockRenewTime: 20_000,     // renouvellement à 1/3 du lock (défaut lockDuration/2)
    },
  };
}
