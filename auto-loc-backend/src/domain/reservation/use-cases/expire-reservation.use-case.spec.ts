import { StatutReservation, StatutPaiement } from '@prisma/client';
import { ExpireReservationUseCase } from './expire-reservation.use-case';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockTx = {
    $queryRaw: jest.fn(),
    paiement: { findUnique: jest.fn(), update: jest.fn() },
    reservation: { findUnique: jest.fn(), update: jest.fn() },
    reservationHistorique: { create: jest.fn() },
};

const mockPrisma = {
    $transaction: jest.fn(async (fn: any) => fn(mockTx)),
};

const mockRedis = {
    delPattern: jest.fn().mockResolvedValue(undefined),
};

const RESERVATION_ID = 'res-123';

const mockContractGeneration = {
    generateAndStore: jest.fn().mockResolvedValue({ contratUrl: 'url', contratPublicId: 'id' }),
};

describe('ExpireReservationUseCase', () => {
    let useCase: ExpireReservationUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ExpireReservationUseCase(
            mockPrisma as any,
            mockRedis as any,
            mockContractGeneration as any,
        );
    });

    it('should expire a reservation in EN_ATTENTE_PAIEMENT', async () => {
        mockTx.$queryRaw.mockResolvedValue([
            { id: RESERVATION_ID, statut: StatutReservation.EN_ATTENTE_PAIEMENT },
        ]);
        mockTx.paiement.findUnique.mockResolvedValue({
            id: 'pay-1',
            statut: StatutPaiement.EN_ATTENTE,
        });
        mockTx.reservation.findUnique.mockResolvedValue({
            vehicule: { ville: 'Dakar' },
        });

        const result = await useCase.execute(RESERVATION_ID);

        expect(result.action).toBe('EXPIRED');
        expect(mockTx.reservation.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    statut: StatutReservation.ANNULEE,
                }),
            }),
        );
        expect(mockTx.paiement.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    statut: StatutPaiement.ECHOUE,
                }),
            }),
        );
        expect(mockTx.reservationHistorique.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    modifiePar: 'SYSTEM_EXPIRY',
                }),
            }),
        );
    });

    it('should skip if payment already confirmed (race condition)', async () => {
        mockTx.$queryRaw.mockResolvedValue([
            { id: RESERVATION_ID, statut: StatutReservation.EN_ATTENTE_PAIEMENT },
        ]);
        mockTx.paiement.findUnique.mockResolvedValue({
            id: 'pay-1',
            statut: StatutPaiement.CONFIRME,
        });

        const result = await useCase.execute(RESERVATION_ID);

        expect(result.action).toBe('SKIPPED');
        expect(result.reason).toBe('PAYMENT_CONFIRMED');
        expect(mockTx.reservation.update).not.toHaveBeenCalled();
    });

    it('should skip if reservation in wrong status', async () => {
        mockTx.$queryRaw.mockResolvedValue([
            { id: RESERVATION_ID, statut: StatutReservation.CONFIRMEE },
        ]);
        mockTx.paiement.findUnique.mockResolvedValue({
            id: 'pay-1',
            statut: StatutPaiement.CONFIRME,
        });

        const result = await useCase.execute(RESERVATION_ID);

        expect(result.action).toBe('SKIPPED');
        expect(mockTx.reservation.update).not.toHaveBeenCalled();
    });

    it('should skip if reservation not found', async () => {
        mockTx.$queryRaw.mockResolvedValue([]);

        const result = await useCase.execute(RESERVATION_ID);

        expect(result.action).toBe('SKIPPED');
        expect(result.reason).toBe('NOT_FOUND');
    });

    it('should also expire INITIEE status', async () => {
        mockTx.$queryRaw.mockResolvedValue([
            { id: RESERVATION_ID, statut: StatutReservation.INITIEE },
        ]);
        mockTx.paiement.findUnique.mockResolvedValue(null);
        mockTx.reservation.findUnique.mockResolvedValue({
            vehicule: { ville: 'Dakar' },
        });

        const result = await useCase.execute(RESERVATION_ID);

        expect(result.action).toBe('EXPIRED');
    });

    it('should invalidate cache on expiry', async () => {
        mockTx.$queryRaw.mockResolvedValue([
            { id: RESERVATION_ID, statut: StatutReservation.EN_ATTENTE_PAIEMENT },
        ]);
        mockTx.paiement.findUnique.mockResolvedValue({
            id: 'pay-1',
            statut: StatutPaiement.EN_ATTENTE,
        });
        mockTx.reservation.findUnique.mockResolvedValue({
            vehicule: { ville: 'Dakar' },
        });

        await useCase.execute(RESERVATION_ID);

        expect(mockRedis.delPattern).toHaveBeenCalledWith(
            expect.stringContaining('dakar'),
        );
    });
});
