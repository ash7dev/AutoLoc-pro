import {
    Controller,
    Post,
    Headers,
    Query,
    RawBody,
    HttpCode,
    HttpStatus,
    Logger,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentProviderFactory } from '../../infrastructure/payment/payment-provider.factory';
import { ConfirmPaymentUseCase } from '../../domain/reservation/use-cases/confirm-payment.use-case';
import { PrismaService } from '../../prisma/prisma.service';

@SkipThrottle()
@Controller('payments/webhook')
export class PaymentWebhookController {
    private readonly logger = new Logger(PaymentWebhookController.name);

    constructor(
        private readonly providerFactory: PaymentProviderFactory,
        private readonly confirmPayment: ConfirmPaymentUseCase,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * POST /payments/webhook/intouch
     * Callback InTouch/TouchPay — données en query params, signature dans hash header.
     */
    @Post('intouch')
    @HttpCode(HttpStatus.OK)
    async handleIntouchCallback(
        @RawBody() rawBody: Buffer,
        @Query() queryParams: Record<string, string>,
        @Headers('hash') signature?: string,
    ) {
        return this.handleWebhook('intouch', rawBody, signature ?? '', queryParams);
    }

    /**
     * POST /payments/webhook/wave
     * Webhook Wave — signature HMAC-SHA256 dans X-Wave-Signature.
     */
    @Post('wave')
    @HttpCode(HttpStatus.OK)
    async handleWaveWebhook(
        @RawBody() rawBody: Buffer,
        @Headers('x-wave-signature') signature?: string,
    ) {
        return this.handleWebhook('wave', rawBody, signature ?? '');
    }

    /**
     * POST /payments/webhook/orange-money
     * Webhook Orange Money — signature dans X-Orange-Signature.
     */
    @Post('orange-money')
    @HttpCode(HttpStatus.OK)
    async handleOrangeMoneyWebhook(
        @RawBody() rawBody: Buffer,
        @Headers('x-orange-signature') signature?: string,
    ) {
        return this.handleWebhook('orange-money', rawBody, signature ?? '');
    }

    // ── Gestionnaire générique ─────────────────────────────────────────────────

    private async handleWebhook(
        routeName: string,
        rawBody: Buffer,
        signature: string,
        queryParams?: Record<string, string>,
    ): Promise<{ received: true }> {
        const startTime = Date.now();
        this.logger.log(`Webhook reçu [${routeName}] — ${rawBody.length} octets`);

        // 1. Résoudre le provider
        const provider = this.providerFactory.getByRoute(routeName);
        if (!provider) {
            throw new BadRequestException(`Route webhook inconnue : ${routeName}`);
        }

        // 2. Vérifier la signature HMAC
        if (!provider.verifyWebhookSignature(rawBody, signature)) {
            this.logger.error(
                `WEBHOOK_SIGNATURE_INVALIDE [${routeName}] — sig=${signature.substring(0, 16)}...`,
            );
            throw new UnauthorizedException('Signature webhook invalide');
        }

        // 3. Parser le payload
        let payload;
        try {
            payload = provider.parseWebhookPayload(rawBody, queryParams);
        } catch (err) {
            this.logger.error(`WEBHOOK_PARSE_ERROR [${routeName}] :`, err);
            throw new BadRequestException('Payload webhook invalide');
        }

        this.logger.log(
            `Webhook parsé [${routeName}] : txId=${payload.transactionId}, ` +
            `status=${payload.status}, montant=${payload.amount}, ref=${payload.referenceId}`,
        );

        // 4. Dispatcher selon le statut
        if (payload.status === 'SUCCESS') {
            await this.handlePaymentSuccess(payload.transactionId, payload.referenceId);
        } else if (payload.status === 'REFUNDED') {
            this.logger.log(`WEBHOOK_REFUND [${routeName}] : txId=${payload.transactionId}`);
        } else {
            this.logger.warn(
                `WEBHOOK_FAILED [${routeName}] : txId=${payload.transactionId}, ref=${payload.referenceId}`,
            );
        }

        this.logger.log(
            `Webhook traité [${routeName}] en ${Date.now() - startTime}ms`,
        );

        return { received: true };
    }

    // ── Succès paiement ────────────────────────────────────────────────────────

    private async handlePaymentSuccess(
        transactionId: string,
        referenceId: string,
    ): Promise<void> {
        // Le referenceId = paymentRef stocké dans Paiement.idTransactionFournisseur
        const paiement = await this.prisma.paiement.findFirst({
            where: { idTransactionFournisseur: referenceId },
            select: { reservationId: true },
        });

        if (!paiement) {
            this.logger.warn(
                `WEBHOOK_PAIEMENT_INTROUVABLE : ref=${referenceId}, txId=${transactionId}`,
            );
            return;
        }

        await this.confirmPayment
            .execute(paiement.reservationId, { transactionId })
            .catch((err) => {
                this.logger.error(
                    `WEBHOOK_CONFIRM_ERROR : reservationId=${paiement.reservationId}, ` +
                    `erreur=${err.message}`,
                );
            });
    }
}
