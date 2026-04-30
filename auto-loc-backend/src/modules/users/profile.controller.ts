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
            include: {
                profile: {
                    select: { role: true, email: true, phone: true, createdAt: true },
                },
            },
        });

        if (!utilisateur) {
            // Fallback: Si pas d'utilisateur métier, on retourne les infos du profil d'auth
            const profile = await this.prisma.profile.findUnique({
                where: { userId: user.sub },
            });
            if (!profile) throw new ForbiddenException('Profil inexistant');

            return {
                id: '',
                userId: profile.userId,
                email: profile.email || '',
                telephone: profile.phone || '',
                prenom: '',
                nom: '',
                avatarUrl: null,
                dateNaissance: null,
                phoneVerified: false,
                profileCompleted: false,
                statutKyc: 'NON_VERIFIE',
                role: profile.role,
                noteLocataire: 0,
                noteProprietaire: 0,
                totalAvis: 0,
                creeLe: profile.createdAt.toISOString(),
            };
        }

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
        let utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true, prenom: true, nom: true, dateNaissance: true, statutKyc: true },
        });

        // 1. Création à la volée si absent (cas Google login sans onboarding fini)
        if (!utilisateur) {
            const profile = await this.prisma.profile.findUnique({
                where: { userId: user.sub },
            });
            if (!profile) throw new ForbiddenException('Profil inexistant');

            utilisateur = await this.prisma.utilisateur.create({
                data: {
                    userId: user.sub,
                    email: profile.email || '',
                    telephone: profile.phone || '',
                    prenom: dto.prenom || '',
                    nom: dto.nom || '',
                    profileCompleted: !!(dto.prenom && dto.nom),
                },
                select: { id: true, prenom: true, nom: true, dateNaissance: true, statutKyc: true },
            });
        }

        const data: Record<string, unknown> = {};
        if (dto.prenom !== undefined) data.prenom = dto.prenom;
        if (dto.nom !== undefined) data.nom = dto.nom;
        if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
        if (dto.dateNaissance !== undefined) {
            data.dateNaissance = new Date(dto.dateNaissance);
        }

        let kycResetMsg = false;
        const prenomChanged = dto.prenom !== undefined && dto.prenom !== utilisateur.prenom;
        const nomChanged = dto.nom !== undefined && dto.nom !== utilisateur.nom;
        const currentDbDate = utilisateur.dateNaissance ? utilisateur.dateNaissance.getTime() : null;
        const newDbDate = dto.dateNaissance ? new Date(dto.dateNaissance).getTime() : null;
        const dateChanged = dto.dateNaissance !== undefined && newDbDate !== currentDbDate;

        if (prenomChanged || nomChanged || dateChanged) {
            if (utilisateur.statutKyc !== 'NON_VERIFIE') {
                data.statutKyc = 'NON_VERIFIE';
                data.kycDocumentUrl = null;
                data.kycSelfieUrl = null;
                data.kycRejectionReason = null;
                kycResetMsg = true;
            }
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
            kycReset: kycResetMsg,
        };
    }
}
