import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { CheckInUseCase } from './checkin.use-case';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockTx = {
    reservation: { update: jest.fn() },
    reservationHistorique: { create: jest.fn() },
};

const mockPrisma = {
    utilisateur: { findUnique: jest.fn() },
    reservation: { findUnique: jest.fn() },
    $transaction: jest.fn(async (fn: any) => fn(mockTx)),
};

const mockQueue = {
    scheduleAutoClose: jest.fn().mockResolvedValue('job-id'),
    scheduleNotification: jest.fn().mockResolvedValue('notif-id'),
};

const mockStateMachine = {
    transition: jest.fn(),
};

const PROPRIETAIRE_ID = 'prop-123';
const RESERVATION_ID = 'res-456';

const baseReservation = {
    id: RESERVATION_ID,
    statut: StatutReservation.CONFIRMEE,
    proprietaireId: PROPRIETAIRE_ID,
    dateDebut: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h ago (J-1 ok)
    dateFin: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    locataire: { telephone: '+221771234567', prenom: 'Amadou' },
};

describe('CheckInUseCase', () => {
    let useCase: CheckInUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CheckInUseCase(
            mockPrisma as any,
            mockQueue as any,
            mockStateMachine as any,
        );
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: PROPRIETAIRE_ID });
        mockPrisma.reservation.findUnique.mockResolvedValue(baseReservation);
    });

    it('should checkin CONFIRMEE → EN_COURS', async () => {
        const result = await useCase.execute(
            { sub: 'owner-sub' } as any,
            RESERVATION_ID,
        );

        expect(result.statut).toBe(StatutReservation.EN_COURS);
        expect(result.checkinLe).toBeInstanceOf(Date);
        expect(mockStateMachine.transition).toHaveBeenCalledWith(
            StatutReservation.CONFIRMEE,
            StatutReservation.EN_COURS,
        );
        expect(mockTx.reservation.update).toHaveBeenCalled();
        expect(mockTx.reservationHistorique.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-owner', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: 'stranger-id' });

        await expect(
            useCase.execute({ sub: 'stranger' } as any, RESERVATION_ID),
        ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for missing reservation', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue(null);

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID),
        ).rejects.toThrow(NotFoundException);
    });

    it('should reject checkin too early (> J-1)', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue({
            ...baseReservation,
            dateDebut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        });

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID),
        ).rejects.toThrow(BusinessRuleException);
    });

    it('should schedule auto-close and notification', async () => {
        await useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID);

        expect(mockQueue.scheduleAutoClose).toHaveBeenCalledWith(
            RESERVATION_ID,
            baseReservation.dateFin,
        );
        expect(mockQueue.scheduleNotification).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'reservation.checkin' }),
        );
    });

    it('should reject bad transition via state machine', async () => {
        mockStateMachine.transition.mockImplementation(() => {
            throw new BusinessRuleException('Transition invalide');
        });

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID),
        ).rejects.toThrow(BusinessRuleException);
    });
});
