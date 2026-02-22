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
export const RESERVATION_AUTOCLOSE_JOB = 'reservation-autoclose';

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
  };
}
