import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidateService {
    private readonly logger = new Logger(RevalidateService.name);

    constructor(private readonly config: ConfigService) { }

    async revalidatePath(path: string): Promise<void> {
        // Fire-and-forget: ne bloque pas le thread NestJS
        this.callWebhook({ path }).catch(() => { });
    }

    async revalidateTag(tag: string): Promise<void> {
        // Fire-and-forget: ne bloque pas le thread NestJS
        this.callWebhook({ tag }).catch(() => { });
    }

    async revalidateReservation(reservationId: string): Promise<void> {
        // Fire-and-forget: ne bloque pas le thread NestJS
        this.callWebhook({ reservationId } as any).catch(() => { });
    }

    private async callWebhook(payload: { path?: string; tag?: string; reservationId?: string }, retries = 2): Promise<void> {
        const url = this.config.get<string>('NEXTJS_URL') + '/api/revalidate';
        const secret = this.config.get<string>('REVALIDATE_SECRET');

        if (!url || !secret) {
            this.logger.warn('Webhook URL or Secret not configured. Skipping revalidation.');
            return;
        }

        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500); // Max 1.5s par tentative

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-revalidate-secret': secret,
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                if (res.ok) return;
            } catch (err: any) {
                // Silencieusement ignoré en arrière-plan
            }
            await new Promise(res => setTimeout(res, 200));
        }
    }
}
