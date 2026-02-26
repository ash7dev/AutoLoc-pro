import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { StatutReservation } from '@prisma/client';

// Type allégé pour le client transactionnel Prisma.
// On utilise un type structurel plutôt qu'un import interne de Prisma
// pour garder le service découplé.
type PrismaTx = {
    $queryRaw<T>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
    reservation: {
        findFirst: (args: {
            where: Record<string, unknown>;
            select: Record<string, boolean>;
        }) => Promise<{ id: string } | null>;
    };
};

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ReservationAvailabilityService {
    /**
     * Acquiert un verrou exclusif sur le véhicule via SELECT FOR UPDATE SKIP LOCKED.
     * Retourne true si le lock a été acquis, false sinon (véhicule déjà locké ou non VERIFIE).
     */
    async lockVehicle(tx: PrismaTx, vehiculeId: string): Promise<boolean> {
        const locked = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "Vehicule"
      WHERE id = ${vehiculeId}
        AND statut::text = 'VERIFIE'
      FOR UPDATE SKIP LOCKED
    `;
        return locked.length > 0;
    }

    /**
     * Vérifie qu'aucune réservation active ne chevauche la période demandée.
     * Retourne true s'il y a un chevauchement, false sinon.
     */
    async hasOverlap(
        tx: PrismaTx,
        vehiculeId: string,
        debut: Date,
        fin: Date,
    ): Promise<boolean> {
        const overlap = await tx.reservation.findFirst({
            where: {
                vehiculeId,
                statut: {
                    in: [
                        StatutReservation.EN_ATTENTE_PAIEMENT,
                        StatutReservation.PAYEE,
                        StatutReservation.CONFIRMEE,
                        StatutReservation.EN_COURS,
                    ],
                },
                dateDebut: { lt: fin },
                dateFin: { gt: debut },
            },
            select: { id: true },
        });
        return overlap !== null;
    }

    /**
     * Combine lockVehicle + hasOverlap.
     * Lève ConflictException si le véhicule n'est pas disponible.
     */
    async ensureAvailable(
        tx: PrismaTx,
        vehiculeId: string,
        debut: Date,
        fin: Date,
    ): Promise<void> {
        const locked = await this.lockVehicle(tx, vehiculeId);
        if (!locked) {
            throw new ConflictException('Véhicule non disponible');
        }

        const overlap = await this.hasOverlap(tx, vehiculeId, debut, fin);
        if (overlap) {
            throw new ConflictException('Véhicule non disponible');
        }
    }
}
