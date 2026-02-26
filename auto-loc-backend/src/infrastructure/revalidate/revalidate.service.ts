import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidateService {
    private readonly logger = new Logger(RevalidateService.name);

    constructor(private readonly config: ConfigService) { }

    async revalidatePath(path: string): Promise<void> {
        await this.callWebhook({ path });
    }

    async revalidateTag(tag: string): Promise<void> {
        await this.callWebhook({ tag });
    }

    private async callWebhook(payload: { path?: string; tag?: string }, retries = 3): Promise<void> {
        const url = this.config.get<string>('NEXTJS_URL') + '/api/revalidate';
        const secret = this.config.get<string>('REVALIDATE_SECRET');

        if (!url || !secret) {
            this.logger.warn('Webhook URL or Secret not configured. Skipping revalidation.');
            return;
        }

        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-revalidate-secret': secret,
                    },
                    body: JSON.stringify(payload),
                });

                if (res.ok) return;

                if (i === retries - 1) {
                    this.logger.error(`Revalidation failed with status ${res.status} for ${JSON.stringify(payload)}`);
                }
            } catch (err: any) {
                if (i === retries - 1) {
                    this.logger.error(`Revalidation failed for ${JSON.stringify(payload)}: ${err.message}`);
                }
            }
            await new Promise(res => setTimeout(res, 500));
        }
    }
}
