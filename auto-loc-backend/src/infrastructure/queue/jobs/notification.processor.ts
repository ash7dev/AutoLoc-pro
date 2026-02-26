import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  NOTIFICATION_QUEUE_NAME,
  NOTIFICATION_JOB_NAME,
} from '../queue.config';
import type { NotificationPayload } from '../queue.service';
import { NotificationService } from '../../notifications/notification.service';
import type { NotificationType } from '../../notifications/email-templates';

@Processor(NOTIFICATION_QUEUE_NAME)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) { }

  @Process(NOTIFICATION_JOB_NAME)
  async handleNotification(job: Job<NotificationPayload>): Promise<void> {
    const { type, data } = job.data;

    this.logger.log(`Processing notification: type=${type}, jobId=${job.id}`);

    const result = await this.notificationService.send({
      type: type as NotificationType,
      data: data as Record<string, unknown>,
      userId: (data as Record<string, unknown>)?.userId as string | undefined,
      email: (data as Record<string, unknown>)?.email as string | undefined,
    });

    if (!result.success) {
      this.logger.warn(
        `Notification failed: type=${type} error=${result.error}`,
      );
      // BullMQ will retry based on queue config
      throw new Error(`Notification failed: ${result.error}`);
    }

    this.logger.log(
      `Notification sent: type=${type} channel=${result.channel} messageId=${result.messageId ?? 'n/a'}`,
    );
  }
}
