import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FournisseurPaiement, Prisma } from '@prisma/client';
import { PaymentProviderFactory } from './payment-provider.factory';
import { IntouchWidgetConfig } from './payment-provider.interface';

export interface PaymentInitResult {
    /** URL de redirection (Wave direct, Orange Money direct) */
    paymentUrl: string | null;
    /** Config widget TouchPay — présent uniquement pour INTOUCH */
    widgetConfig?: IntouchWidgetConfig;
}

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly appBaseUrl: string;

    constructor(
        private readonly factory: PaymentProviderFactory,
        private readonly config: ConfigService,
    ) {
        this.appBaseUrl = this.config.get<string>('APP_BASE_URL', 'http://localhost:3000');
    }

    /**
     * Initie un paiement via le fournisseur approprié.
     * - Providers redirect (Wave, OM) : retourne paymentUrl
     * - InTouch widget               : retourne widgetConfig
     */
    async initiatePayment(
        fournisseur: FournisseurPaiement,
        montant: Prisma.Decimal,
        reservationRef: string,
        options?: {
            targetPayment?: string;
            reservationId?: string;
            payerPhone?: string;
            payerEmail?: string;
            payerFirstName?: string;
            payerLastName?: string;
        },
    ): Promise<PaymentInitResult> {
        const provider = this.factory.get(fournisseur);

        const routeMap: Partial<Record<FournisseurPaiement, string>> = {
            WAVE:         'wave',
            ORANGE_MONEY: 'orange-money',
            INTOUCH:      'intouch',
        };
        const routeName  = routeMap[fournisseur] ?? fournisseur.toLowerCase();
        const callbackUrl = `${this.appBaseUrl}/payments/webhook/${routeName}`;

        const nextjsUrl = this.config.get<string>('NEXTJS_URL', 'http://localhost:3000');
        const successUrl = options?.reservationId
            ? `${nextjsUrl}/dashboard/reservations/${options.reservationId}`
            : `${nextjsUrl}/payment/success`;

        const result = await provider.initiatePayment({
            amount:        Number(montant),
            referenceId:   reservationRef,
            callbackUrl,
            description:   `AutoLoc — Réservation ${reservationRef}`,
            targetPayment: options?.targetPayment,
            payerPhone:    options?.payerPhone,
            payerEmail:    options?.payerEmail,
            payerFirstName: options?.payerFirstName,
            payerLastName:  options?.payerLastName,
            successUrl,
            cancelUrl:     `${nextjsUrl}/payment/cancel`,
        });

        this.logger.log(
            `Paiement initié via ${fournisseur} : ` +
            `txId=${result.transactionId}, ` +
            `type=${result.widgetConfig ? 'widget' : 'redirect'}`,
        );

        return {
            paymentUrl:   result.paymentUrl ?? null,
            widgetConfig: result.widgetConfig,
        };
    }

    /**
     * Rembourse un paiement via le fournisseur approprié.
     */
    async refundPayment(
        fournisseur: FournisseurPaiement,
        transactionId: string,
        amount?: number,
        recipientPhone?: string,
        recipientName?: string,
    ): Promise<void> {
        const provider = this.factory.get(fournisseur);
        await provider.refundPayment(transactionId, amount, recipientPhone, recipientName);
        this.logger.log(`Remboursement via ${fournisseur} : txId=${transactionId}, phone=${recipientPhone}`);
    }
}
