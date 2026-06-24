import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RedisService } from '../../redis/redis.service';
import {
    PaymentProviderInterface,
    InitiatePaymentParams,
    InitiatePaymentResult,
    WebhookPayload,
} from '../payment-provider.interface';

// ── Orange Money API Types ─────────────────────────────────────────────────────

interface OrangeTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface OrangePaymentResponse {
    status: number;
    message: string;
    data: {
        id: number;
        payment_url: string;
        notif_token: string;
        txnid: string;
    };
}

interface OrangeWebhookBody {
    status: string;         // 'SUCCESS' | 'FAILED'
    txnid: string;          // Transaction ID Orange
    order_id: string;       // Notre référence
    amount: string;
    notif_token: string;
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class OrangeMoneyProvider implements PaymentProviderInterface {
    readonly provider = 'ORANGE_MONEY' as const;
    private readonly logger = new Logger(OrangeMoneyProvider.name);

    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly webhookSecret: string;
    private readonly apiUrl: string;
    private readonly merchantKey: string;
    private readonly isSandbox: boolean;

    // 🚀 OPTIMISATION: Redis cache remplace le cache mémoire
    private static readonly TOKEN_CACHE_KEY = 'orange_money:oauth_token';
    private static readonly TOKEN_LOCK_KEY = 'orange_money:oauth_lock';

    constructor(
        private readonly config: ConfigService,
        private readonly redis: RedisService,
    ) {
        this.clientId = this.config.get<string>('ORANGE_MONEY_CLIENT_ID', '');
        this.clientSecret = this.config.get<string>('ORANGE_MONEY_CLIENT_SECRET', '');
        this.webhookSecret = this.config.get<string>('ORANGE_MONEY_WEBHOOK_SECRET', '');
        this.merchantKey = this.config.get<string>('ORANGE_MONEY_MERCHANT_KEY', '');
        this.apiUrl = this.config.get<string>(
            'ORANGE_MONEY_API_URL',
            'https://api.orange.com/orange-money-webpay/dev/v1',
        );
        this.isSandbox = this.apiUrl.includes('dev') || this.apiUrl.includes('sandbox');

        if (this.isSandbox) {
            this.logger.warn('Orange Money provider running in SANDBOX mode');
        }
    }

    // ── OAuth2 Token (🚀 OPTIMISÉ avec Redis + Lock Distribué) ────────────────

    private async getAccessToken(): Promise<string> {
        // 1. Vérifier le cache Redis
        const cachedToken = await this.redis.get(OrangeMoneyProvider.TOKEN_CACHE_KEY);
        if (cachedToken) {
            this.logger.debug('Orange Money token récupéré depuis Redis cache');
            return cachedToken;
        }

        // 2. Acquérir un lock distribué pour éviter les requêtes concurrentes
        const lockAcquired = await this.redis.acquireLock(
            OrangeMoneyProvider.TOKEN_LOCK_KEY,
            10, // 10s TTL
            10, // 10 retries
            50, // 50ms delay
        );

        if (!lockAcquired) {
            // Si on ne peut pas acquérir le lock, attendre et réessayer de récupérer le token
            this.logger.warn('Unable to acquire OAuth lock, waiting for token...');
            await new Promise(resolve => setTimeout(resolve, 500));
            const token = await this.redis.get(OrangeMoneyProvider.TOKEN_CACHE_KEY);
            if (token) return token;
            throw new Error('Failed to acquire Orange Money OAuth token');
        }

        try {
            // 3. Double-check: un autre process a peut-être créé le token pendant qu'on attendait le lock
            const recheck = await this.redis.get(OrangeMoneyProvider.TOKEN_CACHE_KEY);
            if (recheck) {
                this.logger.debug('Token créé par un autre process pendant le lock');
                return recheck;
            }

            // 4. Créer un nouveau token
            this.logger.log('Requesting new Orange Money OAuth token...');
            const credentials = Buffer.from(
                `${this.clientId}:${this.clientSecret}`,
            ).toString('base64');

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

            try {
                const response = await fetch('https://api.orange.com/oauth/v3/token', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'grant_type=client_credentials',
                    signal: controller.signal,
                });

                clearTimeout(timeout);

                if (!response.ok) {
                    const errorText = await response.text();
                    this.logger.error(`Orange OAuth error: ${response.status} — ${errorText}`);
                    throw new Error(`Orange Money OAuth error: ${response.status}`);
                }

                const data = (await response.json()) as OrangeTokenResponse;
                const token = data.access_token;

                // 5. Sauvegarder dans Redis avec TTL (60s safety margin)
                const ttl = Math.max(data.expires_in - 60, 60); // Minimum 60s
                await this.redis.setex(OrangeMoneyProvider.TOKEN_CACHE_KEY, ttl, token);

                this.logger.log(`Orange Money OAuth token cached (expires in ${ttl}s)`);
                return token;
            } catch (error) {
                clearTimeout(timeout);
                if ((error as { name?: string }).name === 'AbortError') {
                    throw new Error('Orange Money OAuth request timeout');
                }
                throw error;
            }
        } finally {
            // 6. Libérer le lock
            await this.redis.releaseLock(OrangeMoneyProvider.TOKEN_LOCK_KEY);
        }
    }

    // ── Initiate Payment ───────────────────────────────────────────────────────

    async initiatePayment(
        params: InitiatePaymentParams,
    ): Promise<InitiatePaymentResult> {
        if (!this.clientId) {
            this.logger.warn('ORANGE_MONEY_CLIENT_ID not set — returning stub payment URL');
            const stubTxId = `orange_stub_${Date.now()}_${params.referenceId}`;
            return {
                paymentUrl: `${this.apiUrl}/webpay/stub?ref=${params.referenceId}&amount=${params.amount}`,
                transactionId: stubTxId,
            };
        }

        const token = await this.getAccessToken();

        const body = {
            merchant_key: this.merchantKey,
            currency: 'OUV',       // Orange Money XOF
            order_id: params.referenceId,
            amount: params.amount,
            return_url: params.callbackUrl,
            cancel_url: params.callbackUrl,
            notif_url: params.callbackUrl,
            lang: 'fr',
        };

        this.logger.log(`Initiating Orange Money payment: ${JSON.stringify(body)}`);

        // 🚀 OPTIMISATION: Timeout + Retry avec backoff exponentiel
        const maxRetries = 2;
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8_000); // 8s timeout

            try {
                const response = await fetch(`${this.apiUrl}/webpayment`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });

                clearTimeout(timeout);

                if (!response.ok) {
                    const errorText = await response.text();

                    // Retry uniquement sur erreurs 5xx ou 429
                    if (attempt < maxRetries && (response.status >= 500 || response.status === 429)) {
                        const retryAfter = response.headers.get('retry-after');
                        const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * (attempt + 1);
                        this.logger.warn(`Orange Money API error ${response.status}, retrying in ${delayMs}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                        continue;
                    }

                    this.logger.error(`Orange Money API error: ${response.status} — ${errorText}`);
                    throw new Error(`Orange Money API error: ${response.status}`);
                }

                // Success! Return response
                const data = (await response.json()) as OrangePaymentResponse;
                this.logger.log(`Orange Money payment created: ${data.data.txnid}`);
                return {
                    paymentUrl: data.data.payment_url,
                    transactionId: data.data.txnid,
                };
            } catch (error) {
                clearTimeout(timeout);
                lastError = error as Error;

                if ((error as { name?: string }).name === 'AbortError') {
                    // Timeout: retry si on a des tentatives restantes
                    if (attempt < maxRetries) {
                        this.logger.warn(`Orange Money API timeout, retrying (${attempt + 1}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                        continue;
                    }
                    throw new Error('Orange Money API timeout after retries');
                }

                // Autre erreur réseau: retry
                if (attempt < maxRetries) {
                    this.logger.warn(`Orange Money network error, retrying: ${error}`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }

                throw error;
            }
        }

        throw lastError || new Error('Orange Money payment failed after retries');
    }

    // ── Webhook Signature ──────────────────────────────────────────────────────

    verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
        if (!this.webhookSecret) {
            this.logger.warn('ORANGE_MONEY_WEBHOOK_SECRET not set — skipping signature check (dev mode)');
            return true;
        }

        // Orange Money utilise HMAC-SHA256 sur le body brut
        const expected = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(rawBody)
            .digest('hex');

        try {
            return crypto.timingSafeEqual(
                Buffer.from(expected, 'hex'),
                Buffer.from(signature, 'hex'),
            );
        } catch {
            this.logger.warn('Orange Money webhook signature verification failed (format error)');
            return false;
        }
    }

    // ── Parse Webhook ──────────────────────────────────────────────────────────

    parseWebhookPayload(rawBody: Buffer): WebhookPayload {
        const body = JSON.parse(rawBody.toString()) as OrangeWebhookBody;

        const statusMap: Record<string, 'SUCCESS' | 'FAILED' | 'REFUNDED'> = {
            SUCCESS: 'SUCCESS',
            SUCCESSFULL: 'SUCCESS',
            FAILED: 'FAILED',
            INITIATED: 'FAILED',
        };

        return {
            transactionId: body.txnid,
            status: statusMap[body.status?.toUpperCase()] ?? 'FAILED',
            amount: parseFloat(body.amount),
            referenceId: body.order_id ?? '',
            rawPayload: body as unknown as Record<string, unknown>,
        };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────

    async refundPayment(transactionId: string, amount?: number): Promise<void> {
        if (!this.clientId) {
            this.logger.warn(`STUB: Orange Money refund requested for ${transactionId}`);
            return;
        }

        this.logger.log(
            `Initiating Orange Money refund: ${transactionId}${amount ? ` (${amount} XOF)` : ''}`,
        );

        // Orange Money refund endpoint (check docs for actual endpoint)
        const token = await this.getAccessToken();

        const response = await fetch(`${this.apiUrl}/refund`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transaction_id: transactionId,
                ...(amount ? { amount } : {}),
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Orange Money refund error: ${response.status} — ${errorText}`);
            throw new Error(`Orange Money refund error: ${response.status}`);
        }

        this.logger.log(`Orange Money refund completed for ${transactionId}`);
    }
}
