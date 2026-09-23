import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseAdminService } from '../../infrastructure/supabase/supabase-admin.service';
import { UpdateSecurityDto } from './dto/update-security.dto';

@Injectable()
export class SecurityService {
  constructor(private readonly prisma: PrismaService, private readonly supabase: SupabaseAdminService) {}

  async update(userId: string, dto: UpdateSecurityDto) {
    if (!dto.email && !dto.password) {
      throw new BadRequestException('Indiquez une adresse e-mail ou un mot de passe à modifier.');
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: { id: true, email: true, phoneVerified: true },
    });
    if (!user) throw new NotFoundException('Profil utilisateur introuvable');
    if (!user.phoneVerified) {
      throw new BadRequestException('Confirmez d’abord votre numéro de téléphone par SMS pour modifier vos identifiants.');
    }

    const email = dto.email?.trim().toLowerCase();
    if (email && email !== user.email.toLowerCase()) {
      const collision = await this.prisma.utilisateur.findFirst({
        where: { email, userId: { not: userId } }, select: { id: true },
      });
      if (collision) throw new ConflictException('Cette adresse e-mail est déjà associée à un compte.');
    }

    // Supabase Auth est la source de vérité des identifiants : aucune écriture
    // locale n'est faite si cette opération échoue.
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      ...(email && email !== user.email.toLowerCase() ? { email, email_confirm: true, user_metadata: { email } } : {}),
      ...(dto.password ? { password: dto.password } : {}),
    });
    if (error) throw new BadRequestException(`Impossible de mettre à jour vos identifiants : ${error.message}`);

    if (email && email !== user.email.toLowerCase()) {
      await this.prisma.$transaction([
        this.prisma.utilisateur.update({ where: { id: user.id }, data: { email } }),
        this.prisma.profile.update({ where: { userId }, data: { email } }),
      ]);
    }

    return {
      success: true,
      emailUpdated: Boolean(email && email !== user.email.toLowerCase()),
      passwordUpdated: Boolean(dto.password),
      email: email ?? user.email,
      message: 'Vos identifiants de connexion ont été mis à jour.',
    };
  }
}
