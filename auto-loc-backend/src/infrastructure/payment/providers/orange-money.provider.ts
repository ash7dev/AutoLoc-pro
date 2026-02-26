import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
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

    private accessToken: string | null = null;
    private tokenExpiresAt = 0;

    constructor(private readonly config: ConfigService) {
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

    // ── OAuth2 Token ───────────────────────────────────────────────────────────

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const credentials = Buffer.from(
            `${this.clientId}:${this.clientSecret}`,
        ).toString('base64');

        const response = await fetch('https://api.orange.com/oauth/v3/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Orange OAuth error: ${response.status} — ${errorText}`);
            throw new Error(`Orange Money OAuth error: ${response.status}`);
        }

        const data = (await response.json()) as OrangeTokenResponse;
        this.accessToken = data.access_token;
        // Expire 60s before actual expiry for safety margin
        this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

        this.logger.log('Orange Money OAuth token refreshed');
        return this.accessToken;
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

        const response = await fetch(`${this.apiUrl}/webpayment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Orange Money API error: ${response.status} — ${errorText}`);
            throw new Error(`Orange Money API error: ${response.status}`);
        }

        const data = (await response.json()) as OrangePaymentResponse;

        this.logger.log(`Orange Money payment created: ${data.data.txnid}`);

        return {
            paymentUrl: data.data.payment_url,
            transactionId: data.data.txnid,
        };
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
