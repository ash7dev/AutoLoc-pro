import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { TypeAvis, StatutReservation } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateReviewInput {
    reservationId: string;
    note: number; // 1-5
    commentaire?: string;
}

export interface CreateReviewResult {
    avisId: string;
    typeAvis: TypeAvis;
    cibleId: string;
    note: number;
    newAverage: number;
    totalAvis: number;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CreateReviewUseCase {
    private readonly logger = new Logger(CreateReviewUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
        private readonly telegram: TelegramService,
    ) { }

    async execute(
        auteurId: string,
        input: CreateReviewInput,
    ): Promise<CreateReviewResult> {
        // ── 1. Validate note range ─────────────────────────────────────────
        if (input.note < 1 || input.note > 5 || !Number.isInteger(input.note)) {
            throw new ForbiddenException('La note doit être un entier entre 1 et 5');
        }

        // ── 2. Fetch reservation ───────────────────────────────────────────
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: input.reservationId },
            select: {
                id: true,
                statut: true,
                locataireId: true,
                proprietaireId: true,
                vehiculeId: true,
            },
        });
        if (!reservation) {
            throw new NotFoundException('Réservation introuvable');
        }

        // ── 3. Verify reservation is TERMINEE ──────────────────────────────
        if (reservation.statut !== StatutReservation.TERMINEE) {
            throw new ForbiddenException(
                `Cannot review a reservation with status '${reservation.statut}'. Must be TERMINEE.`,
            );
        }

        // ── 4. Determine typeAvis and cibleId ──────────────────────────────
        let typeAvis: TypeAvis;
        let cibleId: string;

        if (auteurId === reservation.locataireId) {
            typeAvis = TypeAvis.LOCATAIRE_NOTE_PROPRIO;
            cibleId = reservation.proprietaireId;
        } else if (auteurId === reservation.proprietaireId) {
            typeAvis = TypeAvis.PROPRIO_NOTE_LOCATAIRE;
            cibleId = reservation.locataireId;
        } else {
            throw new ForbiddenException(
                'You are neither the tenant nor the owner of this reservation',
            );
        }

        // ── 5. Create Avis (unique constraint protects duplicates) ─────────
        let avis;
        try {
            avis = await this.prisma.avis.create({
                data: {
                    reservationId: input.reservationId,
                    auteurId,
                    cibleId,
                    typeAvis,
                    note: input.note,
                    commentaire: input.commentaire ?? null,
                },
                select: { id: true },
            });
        } catch (err) {
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002'
            ) {
                throw new ConflictException(
                    'You have already reviewed this reservation',
                );
            }
            throw err;
        }

        this.logger.log(
            `Review created: ${avis.id} (${typeAvis} by ${auteurId} → target ${cibleId}, note=${input.note})`,
        );

        // ── 6. Recalcul synchrone AVG(note) ───────────────────────────────
        const { newAverage, totalAvis } = await this.recalculateRating(
            cibleId,
            typeAvis,
            typeAvis === TypeAvis.LOCATAIRE_NOTE_PROPRIO ? reservation.vehiculeId : undefined,
        );

        // ── 7. Notification (best-effort) ──────────────────────────────────
        await this.queue
            .scheduleNotification({
                type: 'avis.recu',
                data: {
                    reservationId: input.reservationId,
                    cibleId,
                    note: input.note,
                    commentaire: input.commentaire ?? null,
                },
            })
            .catch(() => { });

        // Alerte admin Telegram — monitoring qualité, fire-and-forget
        const stars = '⭐'.repeat(input.note);
        const roleLabel = typeAvis === TypeAvis.LOCATAIRE_NOTE_PROPRIO ? 'Locataire → Propriétaire' : 'Propriétaire → Locataire';
        this.telegram.sendAdminAlert(
            `${stars} <b>Nouvel avis (${input.note}/5)</b>\n` +
            `${roleLabel}\n` +
            `${input.commentaire ? `"${input.commentaire.slice(0, 120)}${input.commentaire.length > 120 ? '…' : ''}"` : 'Pas de commentaire'}`,
        ).catch(() => { });

        return {
            avisId: avis.id,
            typeAvis,
            cibleId,
            note: input.note,
            newAverage,
            totalAvis,
        };
    }

    // ── Rating Recalculation ───────────────────────────────────────────────────

    private async recalculateRating(
        cibleId: string,
        typeAvis: TypeAvis,
        vehiculeId?: string,
    ): Promise<{ newAverage: number; totalAvis: number }> {
        // Calculate AVG(note) for all reviews where this user is the target
        // and the typeAvis matches (locataire rating or proprietaire rating)
        const aggregate = await this.prisma.avis.aggregate({
            where: { cibleId, typeAvis },
            _avg: { note: true },
            _count: { note: true },
        });

        const newAverage = aggregate._avg.note ?? 0;
        const totalAvis = aggregate._count.note;

        // Determine which field to update
        const updateField =
            typeAvis === TypeAvis.LOCATAIRE_NOTE_PROPRIO
                ? 'noteProprietaire' // Locataire rates the proprietaire
                : 'noteLocataire';   // Proprietaire rates the locataire

        await this.prisma.utilisateur.update({
            where: { id: cibleId },
            data: {
                [updateField]: new Prisma.Decimal(newAverage.toFixed(2)),
                totalAvis,
            },
        });

        // Sync vehicle stats when a tenant rates the owner
        if (vehiculeId) {
            const vehicleAgg = await this.prisma.avis.aggregate({
                where: {
                    typeAvis: TypeAvis.LOCATAIRE_NOTE_PROPRIO,
                    reservation: { vehiculeId },
                },
                _avg: { note: true },
                _count: { note: true },
            });
            await this.prisma.vehicule.update({
                where: { id: vehiculeId },
                data: {
                    note: new Prisma.Decimal((vehicleAgg._avg.note ?? 0).toFixed(2)),
                    totalAvis: vehicleAgg._count.note,
                },
            });
        }

        this.logger.log(
            `Rating recalculated for ${cibleId}: ${updateField}=${newAverage.toFixed(2)}, totalAvis=${totalAvis}`,
        );

        return { newAverage: parseFloat(newAverage.toFixed(2)), totalAvis };
    }
}
