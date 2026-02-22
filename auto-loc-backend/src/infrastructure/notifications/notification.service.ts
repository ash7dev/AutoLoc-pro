import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface WhatsAppMessage {
  to: string;
  body: string;
}

@Injectable()
export class NotificationService {
  private readonly twilioSid?: string;
  private readonly twilioToken?: string;
  private readonly twilioFrom?: string;

  constructor(private readonly configService: ConfigService) {
    this.twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.twilioToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioFrom = this.configService.get<string>('TWILIO_WHATSAPP_FROM');
  }

  private isTwilioConfigured(): boolean {
    return Boolean(this.twilioSid && this.twilioToken && this.twilioFrom);
  }

  // Envoie WhatsApp si Twilio configuré, sinon log (mode stub).
  async sendWhatsApp(message: WhatsAppMessage): Promise<void> {
    if (!this.isTwilioConfigured()) {
      process.stdout.write(
        `📨 [WhatsApp:stub] to=${message.to} body="${message.body}"\n`,
      );
      return;
    }

    // TODO: brancher Twilio réel ici.
    // On garde le stub tant que l'intégration n'est pas prête.
    process.stdout.write(
      `📨 [WhatsApp:stub-ready] to=${message.to} body="${message.body}"\n`,
    );
  }
}
