import {
    Controller,
    Post,
    Headers,
    RawBody,
    HttpCode,
    HttpStatus,
    Logger,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { PaymentProviderFactory } from '../../infrastructure/payment/payment-provider.factory';
import { ConfirmPaymentUseCase } from '../../domain/reservation/use-cases/confirm-payment.use-case';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('payments/webhook')
export class PaymentWebhookController {
    private readonly logger = new Logger(PaymentWebhookController.name);

    constructor(
        private readonly providerFactory: PaymentProviderFactory,
        private readonly confirmPayment: ConfirmPaymentUseCase,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * POST /payments/webhook/wave
     * Webhook public (pas de JWT) — vérifie la signature HMAC.
     */
    @Post('wave')
    @HttpCode(HttpStatus.OK)
    async handleWaveWebhook(
        @RawBody() rawBody: Buffer,
        @Headers('x-wave-signature') signature?: string,
    ) {
        return this.handleWebhook('wave', rawBody, signature);
    }

    /**
     * POST /payments/webhook/orange-money
     * Webhook public (pas de JWT) — vérifie la signature.
     */
    @Post('orange-money')
    @HttpCode(HttpStatus.OK)
    async handleOrangeMoneyWebhook(
        @RawBody() rawBody: Buffer,
        @Headers('x-orange-signature') signature?: string,
    ) {
        return this.handleWebhook('orange-money', rawBody, signature);
    }

    // ── Generic Webhook Handler ────────────────────────────────────────────────

    private async handleWebhook(
        routeName: string,
        rawBody: Buffer,
        signature?: string,
    ): Promise<{ received: true }> {
        const startTime = Date.now();

        this.logger.log(`Webhook received: ${routeName} (${rawBody.length} bytes)`);

        // 1. Resolve provider
        const provider = this.providerFactory.getByRoute(routeName);
        if (!provider) {
            throw new BadRequestException(`Unknown webhook route: ${routeName}`);
        }

        // 2. Verify HMAC signature
        if (!provider.verifyWebhookSignature(rawBody, signature ?? '')) {
            this.logger.error(
                `WEBHOOK_SIGNATURE_INVALID [${routeName}] — sig=${signature?.substring(0, 16)}...`,
            );
            throw new UnauthorizedException('Invalid webhook signature');
        }

        // 3. Parse payload
        let payload;
        try {
            payload = provider.parseWebhookPayload(rawBody);
        } catch (err) {
            this.logger.error(`WEBHOOK_PARSE_ERROR [${routeName}]:`, err);
            throw new BadRequestException('Invalid webhook payload');
        }

        this.logger.log(
            `Webhook parsed [${routeName}]: txId=${payload.transactionId}, ` +
            `status=${payload.status}, amount=${payload.amount}, ref=${payload.referenceId}`,
        );

        // 4. Route based on status
        if (payload.status === 'SUCCESS') {
            await this.handlePaymentSuccess(payload.transactionId, payload.referenceId);
        } else if (payload.status === 'REFUNDED') {
            this.logger.log(`WEBHOOK_REFUND [${routeName}]: txId=${payload.transactionId}`);
            // Refund handling could be added here
        } else {
            this.logger.warn(
                `WEBHOOK_FAILED [${routeName}]: txId=${payload.transactionId}, ref=${payload.referenceId}`,
            );
        }

        const durationMs = Date.now() - startTime;
        this.logger.log(
            `Webhook processed [${routeName}] in ${durationMs}ms — txId=${payload.transactionId}`,
        );

        return { received: true };
    }

    // ── Payment Success Handler ────────────────────────────────────────────────

    private async handlePaymentSuccess(
        transactionId: string,
        referenceId: string,
    ): Promise<void> {
        // Trouver la réservation via la référence (paymentRef dans idTransactionFournisseur)
        const paiement = await this.prisma.paiement.findFirst({
            where: {
                idTransactionFournisseur: referenceId,
            },
            select: { reservationId: true },
        });

        if (!paiement) {
            // Essayer via le referenceId directement comme reservationId
            this.logger.warn(
                `WEBHOOK_PAIEMENT_NOT_FOUND: ref=${referenceId}, txId=${transactionId}`,
            );
            return;
        }

        await this.confirmPayment
            .execute(paiement.reservationId, { transactionId })
            .catch((err) => {
                this.logger.error(
                    `WEBHOOK_CONFIRM_ERROR: reservationId=${paiement.reservationId}, ` +
                    `error=${err.message}`,
                );
            });
    }
}
