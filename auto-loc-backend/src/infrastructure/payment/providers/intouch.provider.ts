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

interface IntouchCallbackQuery {
    command_number?:          string;
    payment_token?:           string;
    payment_status?:          string;
    paid_amount?:             string;
    paid_sum?:                string;
    payment_mode?:            string;
    payment_validation_date?: string;
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class IntouchProvider implements PaymentProviderInterface {
    readonly provider = 'INTOUCH' as const;
    private readonly logger = new Logger(IntouchProvider.name);

    private readonly agencyCode:    string;
    private readonly loginApi:      string;
    private readonly passwordApi:   string;
    private readonly webhookSecret: string;

    private readonly API_BASE = 'https://api.gutouch.com/dist/api/touchpayapi/v1';

    constructor(private readonly config: ConfigService) {
        this.agencyCode    = this.config.get<string>('INTOUCH_AGENCY_CODE', '');
        this.loginApi      = this.config.get<string>('INTOUCH_LOGIN_API', '');
        this.passwordApi   = this.config.get<string>('INTOUCH_PASSWORD_API', '');
        this.webhookSecret = this.config.get<string>('INTOUCH_WEBHOOK_SECRET', '');

        if (!this.agencyCode || !this.loginApi || !this.passwordApi) {
            this.logger.warn(
                'INTOUCH_AGENCY_CODE / INTOUCH_LOGIN_API / INTOUCH_PASSWORD_API non configurés',
            );
        }
    }

    // ── Initiate Payment ───────────────────────────────────────────────────────

    async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
        if (!params.payerPhone) {
            throw new BadRequestException(
                'Le numéro de téléphone est requis pour le paiement InTouch',
            );
        }

        const serviceCode = SERVICE_CODES[params.targetPayment ?? ''] ?? 'SNPAIEMENTWAVE';
        const phone       = params.payerPhone.replace(/\s+/g, '').replace(/^00/, '+');

        const url =
            `${this.API_BASE}/${this.agencyCode}/transaction` +
            `?loginAgent=${encodeURIComponent(this.loginApi)}` +
            `&passwordAgent=${encodeURIComponent(this.passwordApi)}`;

        const bodyObj = {
            idFromClient:     params.referenceId,
            additionnalInfos: {
                destinataire: phone,
                currency:     'XOF',
                return_url:   params.successUrl,
                cancel_url:   params.cancelUrl,
            },
            amount:          Math.round(params.amount),
            callback:        params.callbackUrl,
            recipientNumber: phone,
            serviceCode,
        };
        const bodyStr = JSON.stringify(bodyObj);

        this.logger.log(
            `InTouch API directe : ref=${params.referenceId}, ` +
            `montant=${bodyObj.amount} XOF, service=${serviceCode}, phone=${phone}`,
        );

        const response = await this.fetchWithDigestAuth(url, 'PUT', bodyStr);
        const responseText = await response.text();

        if (!response.ok) {
            this.logger.error(`InTouch API error ${response.status} : ${responseText}`);
            throw new BadRequestException(
                `Erreur paiement InTouch (${response.status}) — vérifiez le numéro saisi`,
            );
        }

        this.logger.log(`InTouch API réponse : ${responseText}`);

        return { transactionId: `it_${params.referenceId}` };
    }

    // ── Digest Auth ────────────────────────────────────────────────────────────
    // InTouch utilise HTTP Digest MD5. Les credentials sont passés en SHA-256
    // (comme observé dans la collection Postman fournie par InTouch).

    private async fetchWithDigestAuth(
        url: string,
        method: string,
        body: string,
    ): Promise<Response> {
        // InTouch Digest auth : les credentials sont passés en SHA-256 (cf. collection Postman officielle)
        const username = crypto.createHash('sha256').update(this.loginApi).digest('hex');
        const password = crypto.createHash('sha256').update(this.passwordApi).digest('hex');

        // Étape 1 : requête probe pour récupérer le nonce du serveur
        const probe = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        if (probe.status !== 401) return probe;

        const wwwAuth = probe.headers.get('www-authenticate') ?? '';
        const realm   = this.digestField(wwwAuth, 'realm');
        const nonce   = this.digestField(wwwAuth, 'nonce');
        const qop     = this.digestField(wwwAuth, 'qop');

        const algorithm = this.digestField(wwwAuth, 'algorithm') || 'MD5';
        const opaque  = this.digestField(wwwAuth, 'opaque');
        const urlObj  = new URL(url);
        // RFC 2617 : uri = request-uri (chemin + query string) exactement comme dans la requête
        const uri     = urlObj.pathname + urlObj.search;

        // qop peut être renvoyé comme "auth" ou "auth,auth-int" ; on prend auth si disponible.
        const qopList = qop.split(',').map((v) => v.trim());
        const qopValue = qopList.includes('auth') ? 'auth' : qopList[0] ?? '';

        // Étape 2 : calcul réponse Digest (RFC 2617 / MD5)
        const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
        const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');

        let digestResponse: string;
        let authHeader: string;

        if (qopValue === 'auth') {
            const nc     = '00000001';
            const cnonce = crypto.randomBytes(8).toString('hex');
            digestResponse = crypto.createHash('md5')
                .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qopValue}:${ha2}`)
                .digest('hex');
            authHeader =
                `Digest username="${username}", realm="${realm}", nonce="${nonce}", ` +
                `uri="${uri}", algorithm=${algorithm}, qop=${qopValue}, nc=${nc}, ` +
                `cnonce="${cnonce}", response="${digestResponse}"` +
                (opaque ? `, opaque="${opaque}"` : '');
        } else {
            digestResponse = crypto.createHash('md5')
                .update(`${ha1}:${nonce}:${ha2}`)
                .digest('hex');
            authHeader =
                `Digest username="${username}", realm="${realm}", nonce="${nonce}", ` +
                `uri="${uri}", algorithm=${algorithm}, response="${digestResponse}"` +
                (opaque ? `, opaque="${opaque}"` : '');
        }

        this.logger.log(
            `InTouch Digest auth : realm="${realm}", qop="${qop}", ` +
            `uri="${uri}", ha1="${ha1}", ha2="${ha2}", response="${digestResponse}"`,
        );

        // Étape 3 : vraie requête avec l'Authorization Digest
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body,
        });
    }

    private digestField(header: string, field: string): string {
        const match = header.match(new RegExp(`${field}="([^"]+)"`));
        return match?.[1] ?? '';
    }

    // ── Webhook Signature ──────────────────────────────────────────────────────

    verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
        if (!this.webhookSecret) {
            this.logger.warn(
                'INTOUCH_WEBHOOK_SECRET non configuré — vérification signature désactivée',
            );
            return true;
        }

        if (!signature) return false;

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
    // Données dans les query params : payment_status='00' = succès.

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

        return { transactionId, status, amount, referenceId, rawPayload: q as unknown as Record<string, unknown> };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────

    async refundPayment(transactionId: string, amount?: number): Promise<void> {
        this.logger.warn(
            `[REMBOURSEMENT MANUEL REQUIS] InTouch — ` +
            `txId=${transactionId}, montant=${amount ?? 'total'} XOF`,
        );
    }
}
