import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import {
  NOTIFICATION_QUEUE_NAME,
  NOTIFICATION_JOB_NAME,
} from '../queue.config';
import type { NotificationPayload } from '../queue.service';

@Processor(NOTIFICATION_QUEUE_NAME)
export class NotificationProcessor {
  @Process(NOTIFICATION_JOB_NAME)
  async handleNotification(job: Job<NotificationPayload>): Promise<void> {
    const payload = job.data;
    // TODO: implémenter envoi email/SMS/push (ticket ultérieur)
    void payload;
  }
}
