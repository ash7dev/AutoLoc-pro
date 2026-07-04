import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    PaymentProviderInterface,
    InitiatePaymentParams,
    InitiatePaymentResult,
    WebhookPayload,
    InitiatePayoutParams,
    InitiatePayoutResult,
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
        status?: 'succeeded' | 'failed' | 'reversed' | 'completed';
        payment_status?: 'succeeded' | 'failed' | 'reversed';
        amount: string;
        client_reference?: string;
        currency: string;
    };
}

interface WavePayoutResponse {
    id: string;
    amount: string;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    recipient: {
        mobile: string;
        name?: string;
    };
    client_reference?: string;
    created_at: string;
}

// ── Provider ───────────────────────────────────────────────────────────────────

@Injectable()
export class WaveProvider implements PaymentProviderInterface {
    readonly provider = 'WAVE' as const;
    private readonly logger = new Logger(WaveProvider.name);

    private readonly apiKey: string;
    private readonly webhookSecret: string;
    private readonly signingSecret: string;
    private readonly apiUrl: string;
    private readonly isSandbox: boolean;

    constructor(private readonly config: ConfigService) {
        this.apiKey = this.config.get<string>('WAVE_API_KEY', '');
        this.webhookSecret = this.config.get<string>('WAVE_WEBHOOK_SECRET', '');
        this.signingSecret = this.config.get<string>('WAVE_SIGNING_SECRET', '');
        this.apiUrl = this.config.get<string>(
            'WAVE_API_URL',
            'https://api.sandbox.wave.com/v1',
        );
        this.isSandbox = this.apiUrl.includes('sandbox');

        if (this.isSandbox) {
            this.logger.warn('Wave provider running in SANDBOX mode');
        }
    }

    // ── Generate Wave-Signature Header ─────────────────────────────────────────────

    private generateWaveSignature(body: string): string {
        if (!this.signingSecret) {
            this.logger.warn('WAVE_SIGNING_SECRET not set — skipping request signing');
            return '';
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const payload = `${timestamp}${body}`;  // Pas de point entre timestamp et body
        const signature = crypto
            .createHmac('sha256', this.signingSecret)
            .update(payload)
            .digest('hex');

        return `t=${timestamp},v1=${signature}`;
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
            error_url: params.cancelUrl || `${params.callbackUrl}?status=error`,
            success_url: params.successUrl || `${params.callbackUrl}?status=success`,
            client_reference: params.referenceId,
        };

        this.logger.log(`Initiating Wave payment: ${JSON.stringify(body)}`);

        // 🚀 OPTIMISATION: Timeout + Retry avec backoff exponentiel
        const maxRetries = 2;
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8_000); // 8s timeout

            try {
                const bodyString = JSON.stringify(body);
                const waveSignature = this.generateWaveSignature(bodyString);

                const headers: Record<string, string> = {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                };

                if (waveSignature) {
                    headers['Wave-Signature'] = waveSignature;
                }

                const response = await fetch(`${this.apiUrl}/checkout/sessions`, {
                    method: 'POST',
                    headers,
                    body: bodyString,
                    signal: controller.signal,
                });

                clearTimeout(timeout);

                if (!response.ok) {
                    const errorText = await response.text();

                    // Retry uniquement sur erreurs 5xx ou 429
                    if (attempt < maxRetries && (response.status >= 500 || response.status === 429)) {
                        const retryAfter = response.headers.get('retry-after');
                        const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * (attempt + 1);
                        this.logger.warn(`Wave API error ${response.status}, retrying in ${delayMs}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                        continue;
                    }

                    this.logger.error(`Wave API error: ${response.status} — ${errorText}`);
                    throw new Error(`Wave API error: ${response.status}`);
                }

                // Success!
                const data = (await response.json()) as WaveCheckoutResponse;
                this.logger.log(`Wave checkout created: ${data.id}`);

                return {
                    paymentUrl: data.wave_launch_url,
                    transactionId: data.id,
                };
            } catch (error) {
                clearTimeout(timeout);
                lastError = error as Error;

                if ((error as { name?: string }).name === 'AbortError') {
                    // Timeout: retry
                    if (attempt < maxRetries) {
                        this.logger.warn(`Wave API timeout, retrying (${attempt + 1}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                        continue;
                    }
                    throw new Error('Wave API timeout after retries');
                }

                // Autre erreur réseau: retry
                if (attempt < maxRetries) {
                    this.logger.warn(`Wave network error, retrying: ${error}`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }

                throw error;
            }
        }

        throw lastError || new Error('Wave payment failed after retries');
    }

    // ── Webhook Signature ──────────────────────────────────────────────────────

    verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
        if (!this.webhookSecret) {
            this.logger.warn('WAVE_WEBHOOK_SECRET not set — skipping signature check (dev mode)');
            return true;
        }

        // Wave envoie la signature au format: "t=timestamp,v1=hash"
        // On doit extraire le timestamp t et le hash v1
        const tMatch = signature.match(/t=(\d+)/);
        const v1Match = signature.match(/v1=([a-f0-9]+)/);
        if (!tMatch || !v1Match) {
            this.logger.warn('Wave webhook signature format invalide (t ou v1 manquant)');
            return false;
        }

        const timestamp = tMatch[1];
        const receivedHash = v1Match[1];

        // Calculer le hash attendu : timestamp + rawBody
        const expected = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(timestamp)
            .update(rawBody)
            .digest('hex');

        // Comparer de manière sécurisée
        try {
            const isValid = crypto.timingSafeEqual(
                Buffer.from(expected, 'hex'),
                Buffer.from(receivedHash, 'hex'),
            );

            if (!isValid) {
                this.logger.warn('Wave webhook signature INVALID');
            }

            return isValid;
        } catch (err) {
            this.logger.error('Error comparing Wave webhook signatures', err);
            return false;
        }
    }

    // ── Parse Webhook ──────────────────────────────────────────────────────────

    parseWebhookPayload(rawBody: Buffer): WebhookPayload {
        const body = JSON.parse(rawBody.toString()) as WaveWebhookBody;

        const statusMap: Record<string, 'SUCCESS' | 'FAILED' | 'REFUNDED'> = {
            succeeded: 'SUCCESS',
            completed: 'SUCCESS',
            failed: 'FAILED',
            reversed: 'REFUNDED',
        };

        const rawStatus = body.data.payment_status ?? body.data.status ?? 'failed';

        return {
            transactionId: body.data.id,
            status: statusMap[rawStatus] ?? 'FAILED',
            amount: parseFloat(body.data.amount),
            referenceId: body.data.client_reference ?? '',
            rawPayload: body as unknown as Record<string, unknown>,
        };
    }

    // ── Refund ─────────────────────────────────────────────────────────────────

    async refundPayment(transactionId: string, amount?: number): Promise<void> {
        // ⚠️ IMPORTANT: Wave n'a pas d'API publique pour les remboursements automatiques
        // Les remboursements doivent être effectués manuellement depuis le dashboard Wave Business
        // Voir: https://business.wave.com/transactions

        this.logger.warn(
            `⚠️ Wave refund requested for ${transactionId}${amount ? ` (${amount} XOF)` : ''} - ` +
            `Manual refund required via Wave Business dashboard. ` +
            `Wave API does not support automatic refunds.`,
        );

        // On ne lance pas d'erreur pour ne pas bloquer le flux,
        // mais le remboursement devra être fait manuellement
        return;
    }

    // ── Payout (Retrait) ───────────────────────────────────────────────────────

    async initiatePayout(params: InitiatePayoutParams): Promise<InitiatePayoutResult> {
        // Mode stub si pas de clé API
        if (!this.apiKey) {
            this.logger.warn('WAVE_API_KEY not set — returning stub payout');
            return {
                transactionId: `wave_payout_stub_${Date.now()}`,
                status: 'PENDING',
            };
        }

        // Normaliser le numéro de téléphone (format international)
        const phone = params.recipientPhone
            .replace(/\s+/g, '')
            .replace(/^00/, '+')
            .replace(/^221/, '+221');

        const body = {
            amount: params.amount.toString(),
            currency: 'XOF',
            mobile: phone,
            client_reference: params.referenceId,
            ...(params.recipientName ? { recipient_name: params.recipientName } : {}),
        };

        this.logger.log(
            `Initiating Wave payout: ${params.amount} XOF → ${phone} (ref: ${params.referenceId})`,
        );

        // 🚀 OPTIMISATION: Timeout + Retry
        const maxRetries = 2;
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

            try {
                const bodyString = JSON.stringify(body);
                const waveSignature = this.generateWaveSignature(bodyString);

                const headers: Record<string, string> = {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                };

                if (waveSignature) {
                    headers['Wave-Signature'] = waveSignature;
                }

                const response = await fetch(`${this.apiUrl}/payouts`, {
                    method: 'POST',
                    headers,
                    body: bodyString,
                    signal: controller.signal,
                });

                clearTimeout(timeout);

                if (!response.ok) {
                    const errorText = await response.text();

                    // Retry uniquement sur erreurs 5xx ou 429
                    if (attempt < maxRetries && (response.status >= 500 || response.status === 429)) {
                        const retryAfter = response.headers.get('retry-after');
                        const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * (attempt + 1);
                        this.logger.warn(`Wave Payout API error ${response.status}, retrying in ${delayMs}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                        continue;
                    }

                    this.logger.error(`Wave Payout API error: ${response.status} — ${errorText}`);
                    throw new Error(`Wave Payout error: ${response.status} - ${errorText}`);
                }

                // Success!
                const data = (await response.json()) as WavePayoutResponse;
                this.logger.log(`Wave payout created: ${data.id} (status: ${data.status})`);

                const statusMap: Record<string, 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'> = {
                    pending: 'PENDING',
                    processing: 'PROCESSING',
                    completed: 'COMPLETED',
                    failed: 'FAILED',
                };

                return {
                    transactionId: data.id,
                    status: statusMap[data.status] ?? 'PENDING',
                };
            } catch (error) {
                clearTimeout(timeout);
                lastError = error as Error;

                if ((error as { name?: string }).name === 'AbortError') {
                    // Timeout: retry
                    if (attempt < maxRetries) {
                        this.logger.warn(`Wave Payout API timeout, retrying (${attempt + 1}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                        continue;
                    }
                    throw new Error('Wave Payout API timeout after retries');
                }

                // Autre erreur réseau: retry
                if (attempt < maxRetries) {
                    this.logger.warn(`Wave Payout network error, retrying: ${error}`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }

                throw error;
            }
        }

        throw lastError || new Error('Wave payout failed after retries');
    }
}
