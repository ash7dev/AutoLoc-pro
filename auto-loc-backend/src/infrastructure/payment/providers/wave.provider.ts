import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    PaymentProviderInterface,
    InitiatePaymentParams,
    InitiatePaymentResult,
    WebhookPayload,
} from '../payment-provider.interface';

// ── Wave API Types (based on Wave CI documentation) ────────────────────────────

interface WaveCheckoutResponse {
    id: string;
    checkout_status: string;
    wave_launch_url: string;
}

interface WaveWebhookBody {
    id: string;
    type: string;
    data: {
        id: string;
        status: 'succeeded' | 'failed' | 'reversed';
        amount: string;
        client_reference?: string;
        currency: string;
    };
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class WaveProvider implements PaymentProviderInterface {
    readonly provider = 'WAVE' as const;
    private readonly logger = new Logger(WaveProvider.name);

    private readonly apiKey: string;
    private readonly webhookSecret: string;
    private readonly apiUrl: string;
    private readonly isSandbox: boolean;

    constructor(private readonly config: ConfigService) {
        this.apiKey = this.config.get<string>('WAVE_API_KEY', '');
        this.webhookSecret = this.config.get<string>('WAVE_WEBHOOK_SECRET', '');
        this.apiUrl = this.config.get<string>(
            'WAVE_API_URL',
            'https://api.sandbox.wave.com/v1',
        );
        this.isSandbox = this.apiUrl.includes('sandbox');

        if (this.isSandbox) {
            this.logger.warn('Wave provider running in SANDBOX mode');
        }
    }

    // ── Initiate Payment ───────────────────────────────────────────────────────

    async initiatePayment(
        params: InitiatePaymentParams,
    ): Promise<InitiatePaymentResult> {
        // Si pas de clé API → mode stub (retourne une URL factice)
        if (!this.apiKey) {
            this.logger.warn('WAVE_API_KEY not set — returning stub payment URL');
            const stubTxId = `wave_stub_${Date.now()}_${params.referenceId}`;
            return {
                paymentUrl: `${this.apiUrl}/checkout/stub?ref=${params.referenceId}&amount=${params.amount}`,
                transactionId: stubTxId,
            };
        }

        // Appel réel API Wave — POST /v1/checkout/sessions
        const body = {
            amount: params.amount.toString(),
            currency: 'XOF',
            error_url: `${params.callbackUrl}?status=error`,
            success_url: `${params.callbackUrl}?status=success`,
            client_reference: params.referenceId,
        };

        this.logger.log(`Initiating Wave payment: ${JSON.stringify(body)}`);

        const response = await fetch(`${this.apiUrl}/checkout/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Wave API error: ${response.status} — ${errorText}`);
            throw new Error(`Wave API error: ${response.status}`);
        }

        const data = (await response.json()) as WaveCheckoutResponse;

        this.logger.log(`Wave checkout created: ${data.id}`);

        return {
            paymentUrl: data.wave_launch_url,
            transactionId: data.id,
        };
    }

    // ── Webhook Signature ──────────────────────────────────────────────────────

    verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
        if (!this.webhookSecret) {
            this.logger.warn('WAVE_WEBHOOK_SECRET not set — skipping signature check (dev mode)');
            return true;
        }

        const expected = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(rawBody)
            .digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(expected, 'hex'),
            Buffer.from(signature, 'hex'),
        );

        if (!isValid) {
            this.logger.warn('Wave webhook signature INVALID');
        }

        return isValid;
    }

    // ── Parse Webhook ──────────────────────────────────────────────────────────

    parseWebhookPayload(rawBody: Buffer): WebhookPayload {
        const body = JSON.parse(rawBody.toString()) as WaveWebhookBody;

        const statusMap: Record<string, 'SUCCESS' | 'FAILED' | 'REFUNDED'> = {
            succeeded: 'SUCCESS',
            failed: 'FAILED',
            reversed: 'REFUNDED',
        };

        return {
            transactionId: body.data.id,
            status: statusMap[body.data.status] ?? 'FAILED',
            amount: parseFloat(body.data.amount),
            referenceId: body.data.client_reference ?? '',
            rawPayload: body as unknown as Record<string, unknown>,
        };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────

    async refundPayment(transactionId: string, amount?: number): Promise<void> {
        if (!this.apiKey) {
            this.logger.warn(`STUB: Wave refund requested for ${transactionId}`);
            return;
        }

        this.logger.log(
            `Initiating Wave refund: ${transactionId}${amount ? ` (${amount} XOF)` : ''}`,
        );

        // POST /v1/refunds (Wave API)
        const response = await fetch(`${this.apiUrl}/refunds`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transaction_id: transactionId,
                ...(amount ? { amount: amount.toString() } : {}),
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Wave refund error: ${response.status} — ${errorText}`);
            throw new Error(`Wave refund error: ${response.status}`);
        }

        this.logger.log(`Wave refund completed for ${transactionId}`);
    }
}
