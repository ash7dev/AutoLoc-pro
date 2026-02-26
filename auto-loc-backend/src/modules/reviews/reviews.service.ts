import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import { CreateReviewDto } from './dto/create-review.dto';
import {
    CreateReviewUseCase,
    CreateReviewResult,
} from '../../domain/review/create-review.use-case';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly createReviewUseCase: CreateReviewUseCase,
    ) { }

    // ── POST /reviews ──────────────────────────────────────────────────────────

    async create(
        user: RequestUser,
        dto: CreateReviewDto,
    ): Promise<CreateReviewResult> {
        // Resolve utilisateur from user.sub
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true },
        });
        if (!utilisateur) {
            throw new Error('Profile not found');
        }

        return this.createReviewUseCase.execute(utilisateur.id, {
            reservationId: dto.reservationId,
            note: dto.note,
            commentaire: dto.commentaire,
        });
    }

    // ── GET /reviews/user/:id ──────────────────────────────────────────────────

    async getByUser(userId: string) {
        const avis = await this.prisma.avis.findMany({
            where: { cibleId: userId },
            orderBy: { creeLe: 'desc' },
            take: 20,
            select: {
                id: true,
                note: true,
                commentaire: true,
                typeAvis: true,
                creeLe: true,
                auteur: {
                    select: {
                        prenom: true,
                        nom: true,
                    },
                },
                reservation: {
                    select: {
                        id: true,
                        vehicule: {
                            select: {
                                marque: true,
                                modele: true,
                            },
                        },
                    },
                },
            },
        });

        // Get aggregate stats
        const stats = await this.prisma.avis.aggregate({
            where: { cibleId: userId },
            _avg: { note: true },
            _count: { note: true },
        });

        return {
            avis,
            stats: {
                average: stats._avg.note ?? 0,
                total: stats._count.note,
            },
        };
    }
}
