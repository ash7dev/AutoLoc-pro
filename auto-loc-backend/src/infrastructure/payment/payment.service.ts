import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FournisseurPaiement, Prisma } from '@prisma/client';
import { PaymentProviderFactory } from './payment-provider.factory';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly appBaseUrl: string;

  constructor(
    private readonly factory: PaymentProviderFactory,
    private readonly config: ConfigService,
  ) {
    this.appBaseUrl = this.config.get<string>(
      'APP_BASE_URL',
      'http://localhost:3000',
    );
  }

  /**
   * Initie un paiement via le fournisseur approprié.
   * @returns URL de redirection pour l'utilisateur
   */
  async initiatePayment(
    fournisseur: FournisseurPaiement,
    montant: Prisma.Decimal,
    reservationRef: string,
  ): Promise<string> {
    const provider = this.factory.get(fournisseur);

    // Construire le callbackUrl pour le webhook
    const routeName = fournisseur === 'WAVE' ? 'wave' : 'orange-money';
    const callbackUrl = `${this.appBaseUrl}/payments/webhook/${routeName}`;

    const result = await provider.initiatePayment({
      amount: Number(montant),
      referenceId: reservationRef,
      callbackUrl,
      description: `AutoLoc — Réservation ${reservationRef}`,
    });

    this.logger.log(
      `Payment initiated via ${fournisseur}: txId=${result.transactionId}, url=${result.paymentUrl}`,
    );

    return result.paymentUrl;
  }

  /**
   * Rembourse un paiement.
   */
  async refundPayment(
    fournisseur: FournisseurPaiement,
    transactionId: string,
    amount?: number,
  ): Promise<void> {
    const provider = this.factory.get(fournisseur);
    await provider.refundPayment(transactionId, amount);
    this.logger.log(`Refund completed via ${fournisseur}: txId=${transactionId}`);
  }
}
