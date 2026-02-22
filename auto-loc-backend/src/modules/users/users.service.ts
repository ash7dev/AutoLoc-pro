import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  async setUserStatus(userId: string, dto: BanUserDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, actif: true, bloqueJusqua: true, telephone: true },
    });
    if (!utilisateur) throw new NotFoundException('User not found');

    const updated = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        actif: dto.actif,
        bloqueJusqua: dto.bloqueJusqua ? new Date(dto.bloqueJusqua) : null,
      },
      select: { id: true, actif: true, bloqueJusqua: true, telephone: true },
    });

    const phone = updated.telephone?.trim();
    if (phone) {
      const statusText = updated.actif
        ? 'réactivé'
        : 'suspendu';
      const untilText = updated.bloqueJusqua
        ? ` jusqu'au ${updated.bloqueJusqua.toISOString().slice(0, 10)}`
        : '';
      const reasonText = dto.raison ? `\nRaison: ${dto.raison}` : '';

      await this.notification.sendWhatsApp({
        to: `whatsapp:${phone.startsWith('+') ? phone : `+221${phone}`}`,
        body: `Ton compte Auto Loc a été ${statusText}${untilText}.${reasonText}`,
      });
    }

    return updated;
  }
}
