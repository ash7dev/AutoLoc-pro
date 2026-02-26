import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { CheckOutUseCase } from './checkout.use-case';
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
    schedulePostCheckout: jest.fn().mockResolvedValue('job-id'),
    scheduleNotification: jest.fn().mockResolvedValue('notif-id'),
};

const mockStateMachine = {
    transition: jest.fn(),
};

const PROPRIETAIRE_ID = 'prop-123';
const RESERVATION_ID = 'res-456';

const baseReservation = {
    id: RESERVATION_ID,
    statut: StatutReservation.EN_COURS,
    proprietaireId: PROPRIETAIRE_ID,
    locataire: { telephone: '+221771234567', prenom: 'Amadou' },
};

describe('CheckOutUseCase', () => {
    let useCase: CheckOutUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CheckOutUseCase(
            mockPrisma as any,
            mockQueue as any,
            mockStateMachine as any,
        );
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: PROPRIETAIRE_ID });
        mockPrisma.reservation.findUnique.mockResolvedValue(baseReservation);
    });

    it('should checkout EN_COURS → TERMINEE', async () => {
        const result = await useCase.execute(
            { sub: 'owner-sub' } as any,
            RESERVATION_ID,
        );

        expect(result.statut).toBe(StatutReservation.TERMINEE);
        expect(result.checkoutLe).toBeInstanceOf(Date);
        expect(mockStateMachine.transition).toHaveBeenCalledWith(
            StatutReservation.EN_COURS,
            StatutReservation.TERMINEE,
        );
    });

    it('should throw ForbiddenException for non-owner', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: 'stranger' });

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

    it('should dispatch POST_CHECKOUT job and notification', async () => {
        await useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID);

        expect(mockQueue.schedulePostCheckout).toHaveBeenCalledWith(RESERVATION_ID);
        expect(mockQueue.scheduleNotification).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'reservation.checkout' }),
        );
    });

    it('should reject bad transition', async () => {
        mockStateMachine.transition.mockImplementation(() => {
            throw new BusinessRuleException('Transition invalide');
        });

        await expect(
            useCase.execute({ sub: 'owner-sub' } as any, RESERVATION_ID),
        ).rejects.toThrow(BusinessRuleException);
    });
});
