import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    PaymentProviderInterface,
    InitiatePaymentParams,
    InitiatePaymentResult,
    WebhookPayload,
} from '../payment-provider.interface';

// ── PayTech API Types ──────────────────────────────────────────────────────────

interface PaytechPaymentResponse {
    success: 1 | -1 | 0;
    token?: string;
    redirect_url?: string;
    message?: string;
}

interface PaytechIPNPayload {
    type_event: string;       // 'sale_complete' | 'sale_canceled'
    ref_command: string;      // Notre paymentRef
    item_price: string;       // Montant
    token: string;            // Token PayTech
    payment_method?: string;  // 'Wave' | 'Orange Money' | 'Free Money' | ...
    client_phone?: string;
    api_key_sha256: string;
    api_secret_sha256: string;
    hmac_compute?: string;    // HMAC-SHA256 pour vérification
    custom_field?: string;
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class PaytechProvider implements PaymentProviderInterface {
    readonly provider = 'PAYTECH' as const;
    private readonly logger = new Logger(PaytechProvider.name);

    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly env: string;
    private readonly baseUrl = 'https://paytech.sn/api';

    constructor(private readonly config: ConfigService) {
        this.apiKey = this.config.get<string>('PAYTECH_API_KEY', '');
        this.apiSecret = this.config.get<string>('PAYTECH_API_SECRET', '');
        this.env = this.config.get<string>('PAYTECH_ENV', 'test');

        if (this.env === 'test') {
            this.logger.warn('PayTech provider running in TEST (sandbox) mode');
        }
    }

    // ── Initiate Payment ───────────────────────────────────────────────────────

    async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
        if (!this.apiKey || !this.apiSecret) {
            this.logger.warn('PAYTECH_API_KEY/SECRET not set — returning stub URL');
            return {
                paymentUrl: `https://paytech.sn/payment/checkout/stub?ref=${params.referenceId}`,
                transactionId: `pt_stub_${Date.now()}_${params.referenceId}`,
            };
        }

        const body: Record<string, string> = {
            item_name: params.description ?? `AutoLoc — Réservation ${params.referenceId}`,
            item_price: Math.round(params.amount).toString(),
            currency: 'XOF',
            ref_command: params.referenceId,
            command_name: params.description ?? `Réservation AutoLoc`,
            ipn_url: params.callbackUrl,
            success_url: params.successUrl ?? `${this.config.get('NEXTJS_URL', 'http://localhost:3000')}/payment/success`,
            cancel_url: params.cancelUrl ?? `${this.config.get('NEXTJS_URL', 'http://localhost:3000')}/payment/cancel`,
            env: this.env,
        };

        if (params.targetPayment) {
            body['target_payment'] = params.targetPayment;
        }

        this.logger.log(`Initiating PayTech payment: ref=${params.referenceId}, amount=${body.item_price} XOF, method=${params.targetPayment ?? 'all'}`);

        const response = await fetch(`${this.baseUrl}/payment/request-payment`, {
            method: 'POST',
            headers: {
                'API_KEY': this.apiKey,
                'API_SECRET': this.apiSecret,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`PayTech API error: ${response.status} — ${errorText}`);
            throw new Error(`PayTech API error: ${response.status}`);
        }

        const data = (await response.json()) as PaytechPaymentResponse;

        if (data.success !== 1 || !data.token || !data.redirect_url) {
            this.logger.error(`PayTech payment initiation failed: ${data.message ?? JSON.stringify(data)}`);
            throw new Error(`PayTech payment failed: ${data.message ?? 'Unknown error'}`);
        }

        this.logger.log(`PayTech payment created: token=${data.token}`);

        return {
            paymentUrl: data.redirect_url,
            transactionId: data.token,
        };
    }

    // ── Webhook Signature ──────────────────────────────────────────────────────
    // PayTech embeds the signature inside the IPN body (not in a header).
    // We parse the body to extract hmac_compute, then verify locally.

    verifyWebhookSignature(rawBody: Buffer, _signature: string): boolean {
        if (!this.apiKey || !this.apiSecret) {
            this.logger.warn('PayTech credentials not set — skipping signature check');
            return true;
        }

        const body = this.parseIPNBody(rawBody);
        const { item_price, ref_command, hmac_compute, api_key_sha256, api_secret_sha256 } = body;

        // Primary: HMAC-SHA256(item_price|ref_command|api_key, api_secret)
        if (hmac_compute && item_price && ref_command) {
            const message = `${item_price}|${ref_command}|${this.apiKey}`;
            const expected = crypto
                .createHmac('sha256', this.apiSecret)
                .update(message)
                .digest('hex');

            try {
                const isValid = crypto.timingSafeEqual(
                    Buffer.from(expected, 'hex'),
                    Buffer.from(hmac_compute, 'hex'),
                );
                if (!isValid) {
                    this.logger.warn('PayTech HMAC signature INVALID');
                }
                return isValid;
            } catch {
                this.logger.warn('PayTech HMAC comparison failed (format error)');
                return false;
            }
        }

        // Fallback: SHA256 hash comparison
        if (api_key_sha256 && api_secret_sha256) {
            const keyHash = crypto.createHash('sha256').update(this.apiKey).digest('hex');
            const secretHash = crypto.createHash('sha256').update(this.apiSecret).digest('hex');
            const isValid = api_key_sha256 === keyHash && api_secret_sha256 === secretHash;
            if (!isValid) {
                this.logger.warn('PayTech SHA256 credentials INVALID');
            }
            return isValid;
        }

        this.logger.warn('PayTech IPN missing signature fields — rejecting');
        return false;
    }

    // ── Parse Webhook ──────────────────────────────────────────────────────────

    parseWebhookPayload(rawBody: Buffer): WebhookPayload {
        const body = this.parseIPNBody(rawBody);

        const status: 'SUCCESS' | 'FAILED' =
            body.type_event === 'sale_complete' ? 'SUCCESS' : 'FAILED';

        this.logger.log(
            `PayTech IPN parsed: event=${body.type_event}, ref=${body.ref_command}, token=${body.token}, method=${body.payment_method}`,
        );

        return {
            transactionId: body.token ?? '',
            status,
            amount: parseFloat(body.item_price ?? '0'),
            referenceId: body.ref_command ?? '',
            rawPayload: body as unknown as Record<string, unknown>,
        };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────

    async refundPayment(refCommand: string, _amount?: number): Promise<void> {
        if (!this.apiKey || !this.apiSecret) {
            this.logger.warn(`STUB: PayTech refund requested for ref=${refCommand}`);
            return;
        }

        this.logger.log(`Initiating PayTech refund: ref=${refCommand}`);

        const body = new URLSearchParams({ ref_command: refCommand });

        const response = await fetch(`${this.baseUrl}/payment/refund-payment`, {
            method: 'POST',
            headers: {
                'API_KEY': this.apiKey,
                'API_SECRET': this.apiSecret,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`PayTech refund error: ${response.status} — ${errorText}`);
            throw new Error(`PayTech refund error: ${response.status}`);
        }

        this.logger.log(`PayTech refund completed for ref=${refCommand}`);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private parseIPNBody(rawBody: Buffer): Partial<PaytechIPNPayload> {
        const str = rawBody.toString('utf8');
        try {
            return JSON.parse(str) as Partial<PaytechIPNPayload>;
        } catch {
            // PayTech may send as application/x-www-form-urlencoded
            const params = new URLSearchParams(str);
            const result: Partial<PaytechIPNPayload> = {};
            params.forEach((value, key) => {
                (result as Record<string, string>)[key] = value;
            });
            return result;
        }
    }
}
