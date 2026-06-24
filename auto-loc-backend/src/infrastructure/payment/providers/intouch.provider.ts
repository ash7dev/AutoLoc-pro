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
    WAVE: 'SNPAIEMENTWAVE',
    ORANGE_MONEY: 'PAIEMENTMARCHANDOMQRCODE',
    ORANGE_MONEY_MAXIT: 'PAIEMENTMARCHANDOMQRCODE_MAXIT',
    FREE_MONEY: 'PAIEMENTMARCHANDTIGO',
};

// ── InTouch Webhook Query Params ───────────────────────────────────────────────

interface IntouchCallbackQuery {
    command_number?: string;
    payment_token?: string;
    payment_status?: string;
    paid_amount?: string;
    paid_sum?: string;
    payment_mode?: string;
    payment_validation_date?: string;
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class IntouchProvider implements PaymentProviderInterface {
    readonly provider = 'INTOUCH' as const;
    private readonly logger = new Logger(IntouchProvider.name);

    private readonly agencyCode: string;
    private readonly loginApi: string;
    private readonly passwordApi: string;
    private readonly digestUsername: string;
    private readonly digestPassword: string;
    private readonly webhookSecret: string;

    private readonly API_BASE = 'https://api.gutouch.com/dist/api/touchpayapi/v1';

    private lastRealm = '';
    private lastNonce = '';
    private lastQop = '';
    private lastOpaque = '';
    private ncCounter = 0;

    constructor(private readonly config: ConfigService) {
        this.agencyCode = this.config.get<string>('INTOUCH_AGENCY_CODE', '');
        this.loginApi = this.config.get<string>('INTOUCH_LOGIN_API', '');
        this.passwordApi = this.config.get<string>('INTOUCH_PASSWORD_API', '');
        this.digestUsername = this.config.get<string>('INTOUCH_DIGEST_USERNAME', '');
        this.digestPassword = this.config.get<string>('INTOUCH_DIGEST_PASSWORD', '');
        this.webhookSecret = this.config.get<string>('INTOUCH_WEBHOOK_SECRET', '');

        if (!this.agencyCode || !this.loginApi || !this.passwordApi) {
            this.logger.warn(
                'INTOUCH_AGENCY_CODE / INTOUCH_LOGIN_API / INTOUCH_PASSWORD_API non configurés',
            );
        }
        if (!this.digestUsername || !this.digestPassword) {
            this.logger.warn(
                'INTOUCH_DIGEST_USERNAME / INTOUCH_DIGEST_PASSWORD non configurés — ' +
                'ce sont les credentials SHA-256 pré-calculés pour le Digest Auth (cf. collection Postman InTouch)',
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
        const phone = params.payerPhone.replace(/\s+/g, '').replace(/^00/, '+');

        const url =
            `${this.API_BASE}/${this.agencyCode}/transaction` +
            `?loginAgent=${encodeURIComponent(this.loginApi)}` +
            `&passwordAgent=${encodeURIComponent(this.passwordApi)}`;

        const bodyObj = {
            idFromClient: params.referenceId,
            additionnalInfos: {
                recipientEmail: params.payerEmail ?? 'contact@autoloc.sn',
                recipientFirstName: params.payerFirstName ?? 'Client',
                recipientLastName: params.payerLastName ?? 'AutoLoc',
                destinataire: phone,
                partner_name: 'AutoLoc',
                return_url: params.successUrl,
                cancel_url: params.cancelUrl,
                currency: 'XOF',
            },
            amount: Math.round(params.amount),
            callback: params.callbackUrl,
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

        let paymentUrl: string | undefined;
        try {
            const resData = JSON.parse(responseText);
            paymentUrl = resData.deepLink ?? resData.MAXIT ?? resData.OM ?? resData.paymentUrl ?? resData.payment_url;
        } catch {
            this.logger.warn('Impossible de parser la réponse JSON d\'InTouch');
        }

        return {
            transactionId: `it_${params.referenceId}`,
            paymentUrl,
        };
    }

    // ── Digest Auth ────────────────────────────────────────────────────────────
    // InTouch utilise HTTP Digest MD5.
    // IMPORTANT : le username et password pour le Digest Auth sont des valeurs
    // SHA-256 pré-calculées fournies directement par InTouch (dans la collection
    // Postman). Ce ne sont PAS le SHA-256 de loginAgent/passwordAgent.
    // loginAgent/passwordAgent vont uniquement dans la query string de l'URL.

    private async fetchWithDigestAuth(
        url: string,
        method: string,
        body: string,
    ): Promise<Response> {


        // Sinon (ou si la tentative préemptive a renvoyé 401), on fait la requête probe
        // On évite d'envoyer le body sur la requête probe pour économiser la bande passante et accélérer l'échange
        const probe = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: method === 'GET' || method === 'HEAD' ? undefined : '',
        });

        if (probe.status !== 401) return probe;

        const wwwAuth = probe.headers.get('www-authenticate') ?? '';
        this.lastRealm = this.digestField(wwwAuth, 'realm');
        this.lastNonce = this.digestField(wwwAuth, 'nonce');
        this.lastQop = this.digestField(wwwAuth, 'qop');
        this.lastOpaque = this.digestField(wwwAuth, 'opaque');
        this.ncCounter = 1;

        const authHeader = this.buildDigestHeader(
            method,
            url,
            this.lastRealm,
            this.lastNonce,
            this.lastQop,
            this.lastOpaque,
            this.ncCounter,
        );

        this.logger.log(`InTouch Digest : nouvelle authentification établie`);
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body,
        });
    }

    private buildDigestHeader(
        method: string,
        url: string,
        realm: string,
        nonce: string,
        qop: string,
        opaque: string,
        ncVal: number,
    ): string {
        const username = this.digestUsername;
        const password = this.digestPassword;
        const algorithm = 'MD5';
        const urlObj = new URL(url);
        const uri = urlObj.pathname + urlObj.search;

        const qopList = qop.split(',').map((v) => v.trim());
        const qopValue = qopList.includes('auth') ? 'auth' : qopList[0] ?? '';

        const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
        const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');

        let digestResponse: string;
        let authHeader: string;

        if (qopValue === 'auth') {
            const nc = String(ncVal).padStart(8, '0');
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
        return authHeader;
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
    // InTouch envoie les données dans le body JSON ET/OU dans les query params.
    // On merge les deux sources (body prioritaire, query params en fallback).

    parseWebhookPayload(rawBody: Buffer, queryParams?: Record<string, string>): WebhookPayload {
        // Tenter de parser le body JSON
        let bodyData: Record<string, unknown> = {};
        try {
            const bodyStr = rawBody.toString();
            if (bodyStr.trim()) {
                bodyData = JSON.parse(bodyStr);
            }
        } catch {
            this.logger.warn('InTouch callback : body JSON invalide, fallback sur query params');
        }

        // Merger : body JSON > query params
        const q = { ...(queryParams ?? {}), ...bodyData } as IntouchCallbackQuery;

        this.logger.log(`InTouch callback raw body : ${rawBody.toString().substring(0, 500)}`);
        this.logger.log(`InTouch callback query params : ${JSON.stringify(queryParams ?? {})}`);

        // Mapper les champs de la Direct API (body JSON) ou du Widget (query params)
        const referenceId = (bodyData.partner_transaction_id as string) ?? q.command_number ?? (bodyData.idFromClient as string) ?? '';
        const transactionId = (bodyData.gu_transaction_id as string) ?? q.payment_token ?? `it_${referenceId || 'unknown'}`;

        const isSuccess = q.payment_status === '00' || bodyData.status === 'SUCCESS' || bodyData.status === 'SUCCESSFUL';
        const status: 'SUCCESS' | 'FAILED' = isSuccess ? 'SUCCESS' : 'FAILED';
        const amount = Number(bodyData.amount ?? q.paid_amount ?? q.paid_sum ?? 0);

        this.logger.log(
            `InTouch callback : ref=${referenceId}, ` +
            `txId=${transactionId}, status=${status} (brut=${bodyData.status ?? q.payment_status ?? '—'}), ` +
            `method=${bodyData.service_id ?? q.payment_mode ?? '—'}`,
        );

        return { transactionId, status, amount, referenceId, rawPayload: { ...bodyData, ...queryParams } as Record<string, unknown> };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────

    async refundPayment(transactionId: string, amount?: number): Promise<void> {
        this.logger.warn(
            `[REMBOURSEMENT MANUEL REQUIS] InTouch — ` +
            `txId=${transactionId}, montant=${amount ?? 'total'} XOF`,
        );
    }
}
