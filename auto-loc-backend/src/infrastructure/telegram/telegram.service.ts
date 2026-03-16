import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ── Service ────────────────────────────────────────────────────────────────────
// Envoie des alertes Telegram au(x) admin(s) via Bot API.
//
// Variables d'environnement requises :
//   TELEGRAM_BOT_TOKEN   — token du bot (@BotFather)
//   TELEGRAM_ADMIN_CHAT_ID — chat_id du groupe/canal admin (peut être négatif)
//
// Si les variables ne sont pas configurées, les alertes sont loggées en mode stub.

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly botToken: string;
    private readonly chatId: string;

    constructor(private readonly config: ConfigService) {
        this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN', '');
        this.chatId = this.config.get<string>('TELEGRAM_ADMIN_CHAT_ID', '');
    }

    /**
     * Envoie un message texte (MarkdownV2) au canal admin.
     * Fire-and-forget : ne rejette jamais, log les erreurs.
     */
    async sendAdminAlert(text: string): Promise<void> {
        if (!this.botToken || !this.chatId) {
            this.logger.log(`[Telegram:stub] ${text}`);
            return;
        }

        try {
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text,
                    parse_mode: 'HTML',
                }),
            });

            if (!res.ok) {
                const err = await res.text();
                this.logger.error(`[Telegram] sendMessage failed: ${res.status} — ${err}`);
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`[Telegram] sendMessage exception: ${msg}`);
        }
    }
}
