import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RequestUser } from '../../common/types/auth.types';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForbiddenException } from '@nestjs/common';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { ALLOWED_MIMES, VEHICLE_PHOTO_MULTER_OPTIONS } from '../upload/upload.config';
import { assertValidImageBuffer } from '../../infrastructure/cloudinary/utils/file-validator';
import { RevalidateService } from '../../infrastructure/revalidate/revalidate.service';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    private readonly logger = new Logger(ProfileController.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly revalidate: RevalidateService,
    ) { }

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
                permisUrl: null,
                kycDocumentUrl: null,
                kycDocumentBackUrl: null,
                kycSelfieUrl: null,
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
            permisUrl: utilisateur.permisUrl,
            kycDocumentUrl: utilisateur.kycDocumentUrl,
            kycDocumentBackUrl: utilisateur.kycDocumentBackUrl,
            kycSelfieUrl: utilisateur.kycSelfieUrl,
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
            select: { id: true, prenom: true, nom: true, email: true, dateNaissance: true, statutKyc: true },
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
                select: { id: true, prenom: true, nom: true, email: true, dateNaissance: true, statutKyc: true },
            });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (dto.email !== undefined && dto.email !== utilisateur.email) {
            const existingWithEmail = await this.prisma.utilisateur.findFirst({
                where: {
                    email: dto.email,
                    userId: { not: user.sub },
                },
            });
            if (existingWithEmail) {
                throw new ForbiddenException('Cet email est déjà utilisé par un autre compte');
            }
        }

        const data: Record<string, unknown> = {};
        if (dto.prenom !== undefined) data.prenom = dto.prenom;
        if (dto.nom !== undefined) data.nom = dto.nom;
        if (dto.email !== undefined) data.email = dto.email;
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

        // Invalider le cache du profil utilisateur
        this.revalidate.revalidatePath('/dashboard/owner').catch(() => { });
        this.revalidate.revalidatePath('/dashboard/tenant').catch(() => { });
        this.revalidate.revalidatePath('/parametres').catch(() => { });

        return {
            ...updated,
            dateNaissance: updated.dateNaissance?.toISOString() ?? null,
            misAJourLe: updated.misAJourLe.toISOString(),
            kycReset: kycResetMsg,
        };
    }

    /**
     * POST /users/me/avatar
     * Upload une photo de profil pour l'utilisateur connecté.
     */
    @Post('avatar')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', VEHICLE_PHOTO_MULTER_OPTIONS))
    async uploadAvatar(
        @Req() req: Request & { user?: RequestUser },
        @UploadedFile() file: Express.Multer.File | undefined,
    ): Promise<{ avatarUrl: string; publicId: string }> {
        const user = req.user!;

        if (!file?.buffer) {
            throw new BadRequestException('Fichier requis');
        }

        try {
            await assertValidImageBuffer(file.buffer, ALLOWED_MIMES);
        } catch {
            throw new BadRequestException('Format de fichier invalide. Formats acceptés : JPEG, PNG, WebP.');
        }

        // Récupère l'utilisateur pour supprimer l'ancien avatar si existant
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true, avatarUrl: true, avatarPublicId: true },
        });

        if (!utilisateur) {
            throw new ForbiddenException('Profil inexistant');
        }

        try {
            // Upload le nouvel avatar
            const result = await this.cloudinaryService.uploadAvatar(file.buffer, user.sub);

            // Supprime l'ancien avatar si existant
            if (utilisateur.avatarPublicId) {
                await this.cloudinaryService.deleteByPublicId(utilisateur.avatarPublicId).catch((err) => {
                    this.logger.warn(`Failed to delete old avatar: ${err.message}`);
                });
            }

            // Met à jour l'URL de l'avatar dans la base de données
            await this.prisma.utilisateur.update({
                where: { id: utilisateur.id },
                data: {
                    avatarUrl: result.url,
                    avatarPublicId: result.publicId,
                },
            });

            return { avatarUrl: result.url, publicId: result.publicId };
        } catch (err) {
            this.logger.error(
                err instanceof Error ? err.message : 'Avatar upload failed',
                err instanceof Error ? err.stack : undefined,
            );
            throw new InternalServerErrorException("Échec de l'upload");
        }
    }

    /**
     * DELETE /users/me/avatar
     * Supprime la photo de profil de l'utilisateur connecté.
     */
    @Delete('avatar')
    @HttpCode(HttpStatus.OK)
    async deleteAvatar(
        @Req() req: Request & { user?: RequestUser },
    ): Promise<{ message: string }> {
        const user = req.user!;

        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true, avatarPublicId: true },
        });

        if (!utilisateur) {
            throw new ForbiddenException('Profil inexistant');
        }

        if (!utilisateur.avatarPublicId) {
            throw new BadRequestException('Aucune photo de profil à supprimer');
        }

        try {
            // Supprime l'avatar de Cloudinary
            await this.cloudinaryService.deleteByPublicId(utilisateur.avatarPublicId);

            // Met à jour la base de données
            await this.prisma.utilisateur.update({
                where: { id: utilisateur.id },
                data: {
                    avatarUrl: null,
                    avatarPublicId: null,
                },
            });

            return { message: 'Photo de profil supprimée avec succès' };
        } catch (err) {
            this.logger.error(
                err instanceof Error ? err.message : 'Avatar deletion failed',
                err instanceof Error ? err.stack : undefined,
            );
            throw new InternalServerErrorException('Échec de la suppression');
        }
    }

    /**
     * DELETE /users/me/account
     * Supprime définitivement le compte de l'utilisateur et toutes ses données associées.
     * Cette action est irréversible.
     */
    @Delete('account')
    @HttpCode(HttpStatus.OK)
    async deleteAccount(
        @Req() req: Request & { user?: RequestUser },
    ): Promise<{ message: string }> {
        const user = req.user!;

        this.logger.log(`[DELETE ACCOUNT] User ${user.sub} requested account deletion`);

        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: {
                id: true,
                avatarPublicId: true,
                permisPublicId: true,
                kycDocumentPublicId: true,
                kycDocumentBackPublicId: true,
                kycSelfiePublicId: true,
            },
        });

        if (!utilisateur) {
            // Si pas d'utilisateur métier, on supprime quand même le profil
            await this.prisma.profile.delete({
                where: { userId: user.sub },
            }).catch((err) => {
                this.logger.error(`Failed to delete profile for ${user.sub}:`, err);
            });
            return { message: 'Compte supprimé avec succès' };
        }

        try {
            // 1. Supprimer les photos des véhicules de Cloudinary
            const vehicules = await this.prisma.vehicule.findMany({
                where: { proprietaireId: utilisateur.id },
                select: { photos: true },
            });

            const photoPublicIds: string[] = [];
            for (const v of vehicules) {
                if (v.photos && Array.isArray(v.photos)) {
                    for (const photo of v.photos as any[]) {
                        if (photo.publicId) photoPublicIds.push(photo.publicId);
                    }
                }
            }

            // Supprimer toutes les photos de véhicules en parallèle
            if (photoPublicIds.length > 0) {
                this.logger.log(`[DELETE ACCOUNT] Deleting ${photoPublicIds.length} vehicle photos from Cloudinary`);
                await Promise.allSettled(
                    photoPublicIds.map((publicId) =>
                        this.cloudinaryService.deleteByPublicId(publicId).catch((err) => {
                            this.logger.warn(`Failed to delete vehicle photo ${publicId}: ${err.message}`);
                        })
                    )
                );
            }

            // 2. Supprimer les documents KYC et avatar de Cloudinary
            const cloudinaryDeletions: Promise<any>[] = [];

            if (utilisateur.avatarPublicId) {
                cloudinaryDeletions.push(
                    this.cloudinaryService.deleteByPublicId(utilisateur.avatarPublicId).catch((err) => {
                        this.logger.warn(`Failed to delete avatar: ${err.message}`);
                    })
                );
            }
            if (utilisateur.permisPublicId) {
                cloudinaryDeletions.push(
                    this.cloudinaryService.deleteByPublicId(utilisateur.permisPublicId).catch((err) => {
                        this.logger.warn(`Failed to delete permis: ${err.message}`);
                    })
                );
            }
            if (utilisateur.kycDocumentPublicId) {
                cloudinaryDeletions.push(
                    this.cloudinaryService.deleteByPublicId(utilisateur.kycDocumentPublicId).catch((err) => {
                        this.logger.warn(`Failed to delete KYC document: ${err.message}`);
                    })
                );
            }
            if (utilisateur.kycDocumentBackPublicId) {
                cloudinaryDeletions.push(
                    this.cloudinaryService.deleteByPublicId(utilisateur.kycDocumentBackPublicId).catch((err) => {
                        this.logger.warn(`Failed to delete KYC document back: ${err.message}`);
                    })
                );
            }
            if (utilisateur.kycSelfiePublicId) {
                cloudinaryDeletions.push(
                    this.cloudinaryService.deleteByPublicId(utilisateur.kycSelfiePublicId).catch((err) => {
                        this.logger.warn(`Failed to delete KYC selfie: ${err.message}`);
                    })
                );
            }

            if (cloudinaryDeletions.length > 0) {
                this.logger.log(`[DELETE ACCOUNT] Deleting ${cloudinaryDeletions.length} user documents from Cloudinary`);
                await Promise.allSettled(cloudinaryDeletions);
            }

            // 3. Supprimer toutes les données en base de données
            // Les relations CASCADE vont gérer la suppression des données liées
            this.logger.log(`[DELETE ACCOUNT] Deleting database records for user ${utilisateur.id}`);

            await this.prisma.$transaction(async (tx) => {
                // Supprimer l'utilisateur (les relations CASCADE vont supprimer les véhicules, réservations, avis, etc.)
                await tx.utilisateur.delete({
                    where: { id: utilisateur.id },
                });

                // Supprimer le profil d'authentification
                await tx.profile.delete({
                    where: { userId: user.sub },
                });
            });

            this.logger.log(`[DELETE ACCOUNT] Account ${user.sub} successfully deleted`);

            return { message: 'Compte supprimé avec succès' };
        } catch (err) {
            this.logger.error(
                `[DELETE ACCOUNT] Failed to delete account ${user.sub}:`,
                err instanceof Error ? err.message : 'Unknown error',
                err instanceof Error ? err.stack : undefined,
            );
            throw new InternalServerErrorException('Échec de la suppression du compte. Veuillez réessayer.');
        }
    }
}
