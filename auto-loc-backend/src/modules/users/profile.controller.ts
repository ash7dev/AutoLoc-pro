import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RequestUser } from '../../common/types/auth.types';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForbiddenException } from '@nestjs/common';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * GET /users/me/profile
     * Retourne le profil complet de l'utilisateur connecté.
     */
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@Req() req: Request & { user?: RequestUser }) {
        const user = req.user!;
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: {
                id: true,
                userId: true,
                email: true,
                telephone: true,
                prenom: true,
                nom: true,
                avatarUrl: true,
                dateNaissance: true,
                phoneVerified: true,
                profileCompleted: true,
                statutKyc: true,
                noteLocataire: true,
                noteProprietaire: true,
                totalAvis: true,
                creeLe: true,
                misAJourLe: true,
                profile: {
                    select: { role: true },
                },
            },
        });
        if (!utilisateur) throw new ForbiddenException('Profile not completed');

        return {
            id: utilisateur.id,
            userId: utilisateur.userId,
            email: utilisateur.email,
            telephone: utilisateur.telephone,
            prenom: utilisateur.prenom,
            nom: utilisateur.nom,
            avatarUrl: utilisateur.avatarUrl,
            dateNaissance: utilisateur.dateNaissance?.toISOString() ?? null,
            phoneVerified: utilisateur.phoneVerified,
            profileCompleted: utilisateur.profileCompleted,
            statutKyc: utilisateur.statutKyc,
            role: utilisateur.profile?.role ?? 'LOCATAIRE',
            noteLocataire: Number(utilisateur.noteLocataire),
            noteProprietaire: Number(utilisateur.noteProprietaire),
            totalAvis: utilisateur.totalAvis,
            creeLe: utilisateur.creeLe.toISOString(),
        };
    }

    /**
     * PATCH /users/me/profile
     * Met à jour le profil de l'utilisateur connecté.
     */
    @Patch('profile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @Req() req: Request & { user?: RequestUser },
        @Body() dto: UpdateProfileDto,
    ) {
        const user = req.user!;
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true },
        });
        if (!utilisateur) throw new ForbiddenException('Profile not completed');

        const data: Record<string, unknown> = {};
        if (dto.prenom !== undefined) data.prenom = dto.prenom;
        if (dto.nom !== undefined) data.nom = dto.nom;
        if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
        if (dto.dateNaissance !== undefined) {
            data.dateNaissance = new Date(dto.dateNaissance);
        }

        const updated = await this.prisma.utilisateur.update({
            where: { id: utilisateur.id },
            data,
            select: {
                id: true,
                prenom: true,
                nom: true,
                avatarUrl: true,
                dateNaissance: true,
                misAJourLe: true,
            },
        });

        return {
            ...updated,
            dateNaissance: updated.dateNaissance?.toISOString() ?? null,
            misAJourLe: updated.misAJourLe.toISOString(),
        };
    }
}
