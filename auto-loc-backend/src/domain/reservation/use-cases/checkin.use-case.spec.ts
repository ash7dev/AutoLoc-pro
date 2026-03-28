import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { CheckInUseCase, CheckInRole } from './checkin.use-case';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockTx = {
    reservation: { update: jest.fn() },
    reservationHistorique: { create: jest.fn() },
};

const mockPrisma = {
    utilisateur: { findUnique: jest.fn() },
    reservation: { findUnique: jest.fn() },
    photoEtatLieu: { count: jest.fn().mockResolvedValue(1) },
    $transaction: jest.fn(async (fn: any) => fn(mockTx)),
};

const mockQueue = {
    scheduleAutoClose: jest.fn().mockResolvedValue('job-id'),
    scheduleNotification: jest.fn().mockResolvedValue('notif-id'),
    scheduleTacitCheckinReminders: jest.fn().mockResolvedValue(undefined),
};

const mockCheckinSideEffects = {
    runAfterFinalizedCheckin: jest.fn().mockResolvedValue({ walletCredited: true }),
};



const PROPRIETAIRE_ID = 'prop-123';
const LOCATAIRE_ID = 'loc-456';
const RESERVATION_ID = 'res-789';

const baseReservation = {
    id: RESERVATION_ID,
    statut: StatutReservation.CONFIRMEE,
    proprietaireId: PROPRIETAIRE_ID,
    locataireId: LOCATAIRE_ID,
    dateDebut: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h ago (J-1 ok)
    dateFin: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    checkinProprietaireLe: null,
    checkinLocataireLe: null,
    checkinLe: null,
    locataire: { telephone: '+221771234567', prenom: 'Amadou' },
    proprietaire: { telephone: '+221779876543', prenom: 'Fatou' },
};

describe('CheckInUseCase — Double Confirmation', () => {
    let useCase: CheckInUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CheckInUseCase(
            mockPrisma as any,
            mockQueue as any,
            mockCheckinSideEffects as any,
        );
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: PROPRIETAIRE_ID });
        mockPrisma.reservation.findUnique.mockResolvedValue({ ...baseReservation });
    });

    // ── 1. Owner confirms first → not finalized ────────────────────────────

    it('should record owner confirmation without finalizing', async () => {
        const result = await useCase.execute(
            { sub: 'owner-sub' } as any,
            RESERVATION_ID,
            { role: CheckInRole.PROPRIETAIRE },
        );

        expect(result.statut).toBe(StatutReservation.CONFIRMEE);
        expect(result.checkinProprietaireLe).toBeInstanceOf(Date);
        expect(result.checkinLocataireLe).toBeNull();
        expect(result.checkinLe).toBeNull();
        expect(result.finalized).toBe(false);

        expect(mockCheckinSideEffects.runAfterFinalizedCheckin).not.toHaveBeenCalled();
        expect(mockQueue.scheduleAutoClose).not.toHaveBeenCalled();
        expect(mockQueue.scheduleTacitCheckinReminders).toHaveBeenCalled();
    });

    // ── 2. Both confirm → finalized with wallet credit ─────────────────────

    it('should finalize when tenant confirms after owner', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: LOCATAIRE_ID });
        mockPrisma.reservation.findUnique.mockResolvedValue({
            ...baseReservation,
            checkinProprietaireLe: new Date(), // owner already confirmed
        });

        const result = await useCase.execute(
            { sub: 'tenant-sub' } as any,
            RESERVATION_ID,
            { role: CheckInRole.LOCATAIRE },
        );

        expect(result.statut).toBe(StatutReservation.EN_COURS);
        expect(result.checkinLe).toBeInstanceOf(Date);
        expect(result.finalized).toBe(true);
        expect(result.walletCredited).toBe(true);

        expect(mockCheckinSideEffects.runAfterFinalizedCheckin).toHaveBeenCalledWith(
            expect.objectContaining({ reservationId: RESERVATION_ID }),
        );
    });

    // ── 3. Reverse order: tenant first, owner second ───────────────────────

    it('should finalize when owner confirms after tenant', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue({
            ...baseReservation,
            checkinLocataireLe: new Date(), // tenant already confirmed
        });

        const result = await useCase.execute(
            { sub: 'owner-sub' } as any,
            RESERVATION_ID,
            { role: CheckInRole.PROPRIETAIRE },
        );

        expect(result.statut).toBe(StatutReservation.EN_COURS);
        expect(result.finalized).toBe(true);
        expect(result.walletCredited).toBe(true);
    });

    // ── 4. Wrong party for role ────────────────────────────────────────────

    it('should throw ForbiddenException for non-owner claiming PROPRIETAIRE role', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: 'stranger-id' });

        await expect(
            useCase.execute({ sub: 'stranger' } as any, RESERVATION_ID, { role: CheckInRole.PROPRIETAIRE }),
        ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for non-tenant claiming LOCATAIRE role', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: 'stranger-id' });

        await expect(
            useCase.execute({ sub: 'stranger' } as any, RESERVATION_ID, { role: CheckInRole.LOCATAIRE }),
        ).rejects.toThrow(ForbiddenException);
    });

    // ── 5. Missing reservation ─────────────────────────────────────────────

    it('should throw NotFoundException for missing reservation', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue(null);

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID, { role: CheckInRole.PROPRIETAIRE }),
        ).rejects.toThrow(NotFoundException);
    });

    // ── 6. Already finalized ───────────────────────────────────────────────

    it('should reject if check-in already finalized', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue({
            ...baseReservation,
            checkinLe: new Date(),
        });

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID, { role: CheckInRole.PROPRIETAIRE }),
        ).rejects.toThrow(BusinessRuleException);
    });

    // ── 7. Double confirmation by same party ───────────────────────────────

    it('should reject if owner already confirmed', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue({
            ...baseReservation,
            checkinProprietaireLe: new Date(),
        });

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID, { role: CheckInRole.PROPRIETAIRE }),
        ).rejects.toThrow(BusinessRuleException);
    });

    // ── 8. Too early (> J-1) ───────────────────────────────────────────────

    it('should reject checkin too early (> J-1)', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue({
            ...baseReservation,
            dateDebut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        });

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID, { role: CheckInRole.PROPRIETAIRE }),
        ).rejects.toThrow(BusinessRuleException);
    });

    // ── 9. Invalid status (not CONFIRMEE) ────────────────────────────────────

    it('should reject checkin for non-CONFIRMEE status', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue({
            ...baseReservation,
            statut: StatutReservation.ANNULEE,
        });

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID, { role: CheckInRole.PROPRIETAIRE }),
        ).rejects.toThrow(BusinessRuleException);
    });

    it('should reject owner check-in without at least one CHECKIN photo', async () => {
        mockPrisma.photoEtatLieu.count.mockResolvedValue(0);

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID, { role: CheckInRole.PROPRIETAIRE }),
        ).rejects.toThrow(BusinessRuleException);

        mockPrisma.photoEtatLieu.count.mockResolvedValue(1);
    });
});
