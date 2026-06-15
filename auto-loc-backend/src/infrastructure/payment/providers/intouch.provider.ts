import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    PaymentProviderInterface,
    InitiatePaymentParams,
    InitiatePaymentResult,
    IntouchWidgetConfig,
    WebhookPayload,
} from '../payment-provider.interface';

// ── InTouch Webhook Payload ────────────────────────────────────────────────────

interface IntouchCallbackPayload {
    /** Notre référence passée en idFromClient — sert de clé de lookup */
    idFromClient?: string;
    /** ID de transaction côté InTouch */
    transactionId?: string;
    /** Statut du paiement */
    status?: string;
    /** Montant en XOF */
    amount?: number | string;
    /** Devise */
    currency?: string;
    /** Code erreur (0 = succès) */
    errorCode?: number;
    /** Message d'erreur */
    errorMessage?: string;
    /** Numéro du payeur */
    recipientNumber?: string;
    /** Méthode utilisée (WAVE, ORANGE_MONEY, etc.) */
    paymentMethod?: string;
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class IntouchProvider implements PaymentProviderInterface {
    readonly provider = 'INTOUCH' as const;
    private readonly logger = new Logger(IntouchProvider.name);

    private readonly merchantId: string;
    private readonly token: string;
    private readonly domain: string;
    private readonly city: string;
    private readonly webhookSecret: string;

    private readonly SCRIPT_URL =
        'https://touchpay.gutouch.net/touchpayv2/script/prod_touchpay-0.0.1.js';

    constructor(private readonly config: ConfigService) {
        this.merchantId = this.config.get<string>('INTOUCH_MERCHANT_ID', '');
        this.token      = this.config.get<string>('INTOUCH_TOKEN', '');
        this.domain     = this.config.get<string>('INTOUCH_DOMAIN', 'autoloc.sn');
        this.city       = this.config.get<string>('INTOUCH_CITY', 'Dakar');
        this.webhookSecret = this.config.get<string>('INTOUCH_WEBHOOK_SECRET', '');

        if (!this.merchantId || !this.token) {
            this.logger.warn(
                'INTOUCH_MERCHANT_ID / INTOUCH_TOKEN non configurés — mode stub actif',
            );
        }
    }

    // ── Initiate Payment ───────────────────────────────────────────────────────
    // Pas d'appel API côté backend : le widget TouchPay est déclenché directement
    // depuis le frontend via sendPaymentInfos(). On retourne la config nécessaire.

    async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
        const nextjsUrl = this.config.get<string>('NEXTJS_URL', 'http://localhost:3000');

        const widgetConfig: IntouchWidgetConfig = {
            scriptUrl:   this.SCRIPT_URL,
            merchantId:  this.merchantId,
            token:       this.token,
            domain:      this.domain,
            city:        this.city,
            idFromClient: params.referenceId,
            amount:      Math.round(params.amount),
            successUrl:  params.successUrl ?? `${nextjsUrl}/payment/success`,
            cancelUrl:   params.cancelUrl  ?? `${nextjsUrl}/payment/cancel`,
        };

        this.logger.log(
            `InTouch widget config : ref=${params.referenceId}, montant=${widgetConfig.amount} XOF`,
        );

        return {
            widgetConfig,
            transactionId: `it_${params.referenceId}`,
        };
    }

    // ── Webhook Signature ──────────────────────────────────────────────────────
    // InTouch envoie la signature dans le header X-Intouch-Signature (HMAC-SHA256).
    // Si INTOUCH_WEBHOOK_SECRET n'est pas configuré on passe en mode permissif
    // (dev / sandbox) — à ne pas laisser en production sans secret.

    verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
        if (!this.webhookSecret) {
            this.logger.warn(
                'INTOUCH_WEBHOOK_SECRET non configuré — vérification signature désactivée',
            );
            return true;
        }

        if (!signature) {
            this.logger.warn('Webhook InTouch reçu sans header de signature');
            return false;
        }

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
            this.logger.warn('Comparaison signature InTouch échouée (format invalide)');
            return false;
        }
    }

    // ── Parse Webhook ──────────────────────────────────────────────────────────

    parseWebhookPayload(rawBody: Buffer): WebhookPayload {
        const body = JSON.parse(rawBody.toString('utf8')) as IntouchCallbackPayload;

        // Succès si status === 'SUCCESS' ou errorCode === 0
        const isSuccess =
            body.status === 'SUCCESS' ||
            (body.errorCode !== undefined && body.errorCode === 0);
        const status: 'SUCCESS' | 'FAILED' = isSuccess ? 'SUCCESS' : 'FAILED';

        this.logger.log(
            `InTouch callback : ref=${body.idFromClient}, ` +
            `txId=${body.transactionId}, status=${body.status}, ` +
            `method=${body.paymentMethod ?? '—'}`,
        );

        return {
            transactionId: body.transactionId ?? `it_${body.idFromClient ?? 'unknown'}`,
            status,
            amount:      Number(body.amount ?? 0),
            referenceId: body.idFromClient ?? '',
            rawPayload:  body as unknown as Record<string, unknown>,
        };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────
    // L'API de remboursement InTouch sera câblée ici quand la documentation
    // complète sera fournie. En attendant : log + no-op (remboursement manuel).

    async refundPayment(transactionId: string, amount?: number): Promise<void> {
        this.logger.warn(
            `[REMBOURSEMENT MANUEL REQUIS] InTouch — ` +
            `txId=${transactionId}, montant=${amount ?? 'total'} XOF. ` +
            `Câbler l'API refund InTouch ici quand disponible.`,
        );
    }
}
