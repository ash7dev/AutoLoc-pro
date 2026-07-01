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
import { ExpireReservationUseCase } from '../../domain/reservation/use-cases/expire-reservation.use-case';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@SkipThrottle()
@Controller('payments/webhook')
export class PaymentWebhookController {
    private readonly logger = new Logger(PaymentWebhookController.name);

    // 🚀 OPTIMISATION: Déduplication des webhooks
    private static readonly WEBHOOK_DEDUP_PREFIX = 'webhook:processed:';
    private static readonly WEBHOOK_DEDUP_TTL = 86400; // 24h

    constructor(
        private readonly providerFactory: PaymentProviderFactory,
        private readonly confirmPayment: ConfirmPaymentUseCase,
        private readonly expireUseCase: ExpireReservationUseCase,
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
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

        // 4. 🚀 OPTIMISATION: Vérifier la déduplication (idempotence)
        const webhookId = payload.transactionId || payload.referenceId;
        const dedupKey = `${PaymentWebhookController.WEBHOOK_DEDUP_PREFIX}${routeName}:${webhookId}`;

        const alreadyProcessed = await this.redis.get(dedupKey);
        if (alreadyProcessed) {
            this.logger.warn(
                `WEBHOOK_DUPLICATE [${routeName}] : txId=${payload.transactionId} déjà traité, ignoring...`,
            );
            return { received: true }; // Return OK pour éviter les retries du provider
        }

        // Marquer comme en cours de traitement (lock)
        const lockKey = `${dedupKey}:lock`;
        const lockAcquired = await this.redis.acquireLock(lockKey, 30); // 30s timeout

        if (!lockAcquired) {
            this.logger.warn(
                `WEBHOOK_CONCURRENT [${routeName}] : txId=${payload.transactionId} en cours de traitement par un autre process`,
            );
            return { received: true }; // Return OK
        }

        try {
            // 5. Dispatcher selon le statut et le type d'événement
            const webhookType = (payload.rawPayload as any).type;

            // Si c'est un payout (retrait Wave)
            if (webhookType && webhookType.includes('payout')) {
                if (payload.status === 'SUCCESS') {
                    await this.handlePayoutSuccess(payload.transactionId, payload.referenceId);
                } else {
                    await this.handlePayoutFailure(payload.transactionId, payload.referenceId);
                }
            } else {
                // Sinon c'est un payment (paiement classique)
                if (payload.status === 'SUCCESS') {
                    await this.handlePaymentSuccess(payload.transactionId, payload.referenceId);
                } else if (payload.status === 'REFUNDED') {
                    this.logger.log(`WEBHOOK_REFUND [${routeName}] : txId=${payload.transactionId}`);
                } else {
                    this.logger.warn(
                        `WEBHOOK_FAILED [${routeName}] : txId=${payload.transactionId}, ref=${payload.referenceId}`,
                    );
                    await this.handlePaymentFailure(payload.referenceId);
                }
            }

            // 6. Marquer le webhook comme traité (idempotence)
            await this.redis.setex(
                dedupKey,
                PaymentWebhookController.WEBHOOK_DEDUP_TTL,
                JSON.stringify({
                    processedAt: new Date().toISOString(),
                    status: payload.status,
                    amount: payload.amount,
                }),
            );

            this.logger.log(
                `Webhook traité [${routeName}] en ${Date.now() - startTime}ms`,
            );

            return { received: true };
        } finally {
            // 7. Libérer le lock
            await this.redis.releaseLock(lockKey);
        }
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

    // ── Échec paiement ─────────────────────────────────────────────────────────

    private async handlePaymentFailure(referenceId: string): Promise<void> {
        // Le referenceId = paymentRef stocké dans Paiement.idTransactionFournisseur
        const paiement = await this.prisma.paiement.findFirst({
            where: { idTransactionFournisseur: referenceId },
            select: { reservationId: true },
        });

        if (!paiement) {
            this.logger.warn(
                `WEBHOOK_PAIEMENT_FAILURE_INTROUVABLE : ref=${referenceId}`,
            );
            return;
        }

        await this.expireUseCase
            .execute(paiement.reservationId)
            .catch((err) => {
                this.logger.error(
                    `WEBHOOK_EXPIRE_ERROR : reservationId=${paiement.reservationId}, ` +
                    `erreur=${err.message}`,
                );
            });
    }

    // ── Succès payout (retrait Wave) ───────────────────────────────────────────

    private async handlePayoutSuccess(
        transactionId: string,
        referenceId: string,
    ): Promise<void> {
        // Le referenceId = ID du retrait
        const retrait = await this.prisma.retrait.findUnique({
            where: { id: referenceId },
            select: {
                id: true,
                montant: true,
                destinataire: true,
                wallet: {
                    select: {
                        utilisateur: {
                            select: { prenom: true, nom: true },
                        },
                    },
                },
            },
        });

        if (!retrait) {
            this.logger.warn(
                `WEBHOOK_PAYOUT_INTROUVABLE : ref=${referenceId}, txId=${transactionId}`,
            );
            return;
        }

        // Marquer le retrait comme effectué
        await this.prisma.retrait.update({
            where: { id: referenceId },
            data: {
                statut: 'EFFECTUE',
                traiteLe: new Date(),
                idTransactionFournisseur: transactionId,
            },
        });

        const ownerName = [
            retrait.wallet.utilisateur?.prenom,
            retrait.wallet.utilisateur?.nom,
        ].filter(Boolean).join(' ') || 'Propriétaire';

        this.logger.log(
            `✅ PAYOUT_SUCCESS : ${Number(retrait.montant)} FCFA → ${retrait.destinataire} (owner: ${ownerName})`,
        );
    }

    // ── Échec payout (retrait Wave) ────────────────────────────────────────────

    private async handlePayoutFailure(
        transactionId: string,
        referenceId: string,
    ): Promise<void> {
        // Le referenceId = ID du retrait
        const retrait = await this.prisma.retrait.findUnique({
            where: { id: referenceId },
            select: {
                id: true,
                montant: true,
                destinataire: true,
                walletId: true,
                wallet: {
                    select: {
                        utilisateur: {
                            select: { prenom: true, nom: true },
                        },
                    },
                },
            },
        });

        if (!retrait) {
            this.logger.warn(
                `WEBHOOK_PAYOUT_FAILURE_INTROUVABLE : ref=${referenceId}, txId=${transactionId}`,
            );
            return;
        }

        // Rembourser le solde du wallet (annuler le débit)
        await this.prisma.wallet.update({
            where: { id: retrait.walletId },
            data: {
                soldeDisponible: {
                    increment: retrait.montant,
                },
            },
        });

        // Marquer le retrait comme rejeté
        await this.prisma.retrait.update({
            where: { id: referenceId },
            data: {
                statut: 'REJETE',
                raisonRejet: 'Payout Wave échoué',
                traiteLe: new Date(),
                idTransactionFournisseur: transactionId,
            },
        });

        const ownerName = [
            retrait.wallet.utilisateur?.prenom,
            retrait.wallet.utilisateur?.nom,
        ].filter(Boolean).join(' ') || 'Propriétaire';

        this.logger.error(
            `❌ PAYOUT_FAILED : ${Number(retrait.montant)} FCFA → ${retrait.destinataire} (owner: ${ownerName}) — Solde remboursé`,
        );
    }
}
