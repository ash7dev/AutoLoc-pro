import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { RESERVATION_QUEUE_NAME, RESERVATION_EXPIRY_JOB_NAME } from '../queue.config';

@Processor(RESERVATION_QUEUE_NAME)
export class ReservationExpiryProcessor {
  @Process(RESERVATION_EXPIRY_JOB_NAME)
  async handleExpiry(
    job: Job<{ reservationId: string }>,
  ): Promise<void> {
    const { reservationId } = job.data;
    // TODO: implémenter annulation réservation si paiement non reçu (ticket ultérieur)
    void reservationId;
  }
}
