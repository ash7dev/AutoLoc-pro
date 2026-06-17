import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    PaymentProviderInterface,
    InitiatePaymentParams,
    InitiatePaymentResult,
    WebhookPayload,
} from '../payment-provider.interface';

// ── InTouch Service Codes ──────────────────────────────────────────────────────

const SERVICE_CODES: Record<string, string> = {
    WAVE:         'SNPAIEMENTWAVE',
    ORANGE_MONEY: 'PAIEMENTMARCHANDOMQRCODE',
    FREE_MONEY:   'PAIEMENTMARCHANDTIGO',
};

// ── InTouch Webhook Query Params ───────────────────────────────────────────────
// InTouch envoie les données de callback dans les QUERY PARAMS (pas le body).

interface IntouchCallbackQuery {
    command_number?:       string;  // notre idFromClient (paymentRef)
    payment_token?:        string;  // transaction ID côté InTouch
    payment_status?:       string;  // '00' = succès, autre = échec
    paid_amount?:          string;
    paid_sum?:             string;
    payment_mode?:         string;  // SNPAIEMENTWAVE, etc.
    payment_validation_date?: string;
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class IntouchProvider implements PaymentProviderInterface {
    readonly provider = 'INTOUCH' as const;
    private readonly logger = new Logger(IntouchProvider.name);

    private readonly agencyCode:   string;
    private readonly loginApi:     string;
    private readonly passwordApi:  string;
    private readonly webhookSecret: string;

    private readonly API_BASE = 'https://api.gutouch.com/dist/api/touchpayapi/v1';

    constructor(private readonly config: ConfigService) {
        this.agencyCode   = this.config.get<string>('INTOUCH_AGENCY_CODE', '');
        this.loginApi     = this.config.get<string>('INTOUCH_LOGIN_API', '');
        this.passwordApi  = this.config.get<string>('INTOUCH_PASSWORD_API', '');
        this.webhookSecret = this.config.get<string>('INTOUCH_WEBHOOK_SECRET', '');

        if (!this.agencyCode || !this.loginApi || !this.passwordApi) {
            this.logger.warn(
                'INTOUCH_AGENCY_CODE / INTOUCH_LOGIN_API / INTOUCH_PASSWORD_API non configurés',
            );
        }
    }

    // ── Initiate Payment ───────────────────────────────────────────────────────
    // Appel direct à l'API InTouch — pas de widget, l'utilisateur reçoit une
    // notification sur son téléphone (Wave, Orange Money, Free Money).

    async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
        if (!params.payerPhone) {
            throw new BadRequestException(
                'Le numéro de téléphone est requis pour le paiement InTouch',
            );
        }

        const serviceCode = SERVICE_CODES[params.targetPayment ?? ''] ?? 'SNPAIEMENTWAVE';
        const phone = params.payerPhone.replace(/\s+/g, '').replace(/^00/, '+');

        const url =
            `${this.API_BASE}/${this.agencyCode}/transaction` +
            `?loginAgent=${encodeURIComponent(this.loginApi)}` +
            `&passwordAgent=${encodeURIComponent(this.passwordApi)}`;

        const body = {
            idFromClient:     params.referenceId,
            additionnalInfos: {
                destinataire: phone,
                currency:     'XOF',
                return_url:   params.successUrl,
                cancel_url:   params.cancelUrl,
            },
            amount:           Math.round(params.amount),
            callback:         params.callbackUrl,
            recipientNumber:  phone,
            serviceCode,
        };

        this.logger.log(
            `InTouch API directe : ref=${params.referenceId}, ` +
            `montant=${body.amount} XOF, service=${serviceCode}, phone=${phone}`,
        );

        const response = await fetch(url, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body),
        });

        const responseText = await response.text();

        if (!response.ok) {
            this.logger.error(
                `InTouch API error ${response.status} : ${responseText}`,
            );
            throw new BadRequestException(
                `Erreur paiement InTouch (${response.status}) — vérifiez le numéro`,
            );
        }

        this.logger.log(`InTouch API réponse : ${responseText}`);

        return {
            transactionId: `it_${params.referenceId}`,
        };
    }

    // ── Webhook Signature ──────────────────────────────────────────────────────

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
            return false;
        }
    }

    // ── Parse Webhook ──────────────────────────────────────────────────────────
    // InTouch envoie les données en query params, pas dans le body JSON.
    // payment_status='00' = succès, tout autre code = échec.

    parseWebhookPayload(_rawBody: Buffer, queryParams?: Record<string, string>): WebhookPayload {
        const q = (queryParams ?? {}) as IntouchCallbackQuery;

        const referenceId   = q.command_number ?? '';
        const transactionId = q.payment_token  ?? `it_${referenceId || 'unknown'}`;
        const isSuccess     = q.payment_status === '00';
        const status: 'SUCCESS' | 'FAILED' = isSuccess ? 'SUCCESS' : 'FAILED';
        const amount        = Number(q.paid_amount ?? q.paid_sum ?? 0);

        this.logger.log(
            `InTouch callback : ref=${referenceId}, ` +
            `txId=${transactionId}, status=${q.payment_status}, ` +
            `method=${q.payment_mode ?? '—'}`,
        );

        return {
            transactionId,
            status,
            amount,
            referenceId,
            rawPayload: q as unknown as Record<string, unknown>,
        };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────

    async refundPayment(transactionId: string, amount?: number): Promise<void> {
        this.logger.warn(
            `[REMBOURSEMENT MANUEL REQUIS] InTouch — ` +
            `txId=${transactionId}, montant=${amount ?? 'total'} XOF`,
        );
    }
}
