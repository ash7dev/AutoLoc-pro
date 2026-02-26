import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma, StatutReservation, StatutPaiement, TypeTransactionWallet } from '@prisma/client';
import { CancelReservationUseCase } from './cancel-reservation.use-case';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockTx = {
    reservation: { update: jest.fn() },
    reservationHistorique: { create: jest.fn() },
    paiement: { update: jest.fn() },
    wallet: { findUnique: jest.fn(), update: jest.fn() },
    transactionWallet: { findUnique: jest.fn(), create: jest.fn() },
};

const mockPrisma = {
    utilisateur: { findUnique: jest.fn() },
    reservation: { findUnique: jest.fn() },
    $transaction: jest.fn(async (fn: any) => fn(mockTx)),
};

const mockRedis = {
    delPattern: jest.fn().mockResolvedValue(undefined),
};

const mockQueue = {
    scheduleNotification: jest.fn().mockResolvedValue('job-id'),
};

const mockStateMachine = {
    isCancellable: jest.fn().mockReturnValue(true),
    transition: jest.fn(),
};

const mockCancellationPolicy = {
    calculateForTenant: jest.fn(),
    calculateForOwner: jest.fn(),
};

const mockContractGeneration = {
    generateAndStore: jest.fn().mockResolvedValue({ contratUrl: 'url', contratPublicId: 'id' }),
};

const mockRevalidateService = {
    revalidatePath: jest.fn().mockResolvedValue(undefined),
    revalidateTag: jest.fn().mockResolvedValue(undefined),
};

function createUseCase(): CancelReservationUseCase {
    return new CancelReservationUseCase(
        mockPrisma as any,
        mockRedis as any,
        mockQueue as any,
        mockStateMachine as any,
        mockCancellationPolicy as any,
        mockContractGeneration as any,
        mockRevalidateService as any,
    );
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const LOCATAIRE_ID = 'loc-123';
const PROPRIETAIRE_ID = 'prop-456';
const RESERVATION_ID = 'res-789';

const baseReservation = {
    id: RESERVATION_ID,
    statut: StatutReservation.PAYEE,
    locataireId: LOCATAIRE_ID,
    proprietaireId: PROPRIETAIRE_ID,
    dateDebut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    totalLocataire: new Prisma.Decimal('86250'),
    totalBase: new Prisma.Decimal('75000'),
    montantCommission: new Prisma.Decimal('11250'),
    netProprietaire: new Prisma.Decimal('75000'),
    vehicule: { ville: 'Dakar' },
    paiement: { id: 'pay-1', statut: StatutPaiement.CONFIRME, montant: new Prisma.Decimal('86250') },
    locataire: { telephone: '+221771234567', prenom: 'Amadou' },
    proprietaire: { telephone: '+221779876543', prenom: 'Fatou' },
};

const tenantPolicy = {
    refundPercentage: 100,
    refundAmount: new Prisma.Decimal('75000'),
    commissionRetained: new Prisma.Decimal('11250'),
    ownerPenaltyPercentage: 0,
    ownerPenaltyAmount: new Prisma.Decimal('0'),
    warnings: [],
    canCancel: true,
};

describe('CancelReservationUseCase', () => {
    let useCase: CancelReservationUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = createUseCase();
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: LOCATAIRE_ID });
        mockPrisma.reservation.findUnique.mockResolvedValue(baseReservation);
        mockCancellationPolicy.calculateForTenant.mockReturnValue(tenantPolicy);
        mockStateMachine.isCancellable.mockReturnValue(true);
        mockStateMachine.transition.mockImplementation(() => { });
        mockTx.wallet.findUnique.mockResolvedValue(null);
    });

    it('should cancel for locataire with refund', async () => {
        const result = await useCase.execute(
            { sub: 'user-sub' } as any,
            RESERVATION_ID,
            { raison: 'Changement de plans' },
        );

        expect(result.statut).toBe(StatutReservation.ANNULEE);
        expect(result.refundPercentage).toBe(100);
        expect(mockStateMachine.isCancellable).toHaveBeenCalledWith(StatutReservation.PAYEE);
        expect(mockTx.reservation.update).toHaveBeenCalled();
        expect(mockTx.reservationHistorique.create).toHaveBeenCalled();
    });

    it('should cancel for proprietaire with penalty', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: PROPRIETAIRE_ID });
        const ownerPolicy = {
            ...tenantPolicy,
            refundPercentage: 100,
            refundAmount: new Prisma.Decimal('86250'),
            ownerPenaltyPercentage: 20,
            ownerPenaltyAmount: new Prisma.Decimal('15000'),
        };
        mockCancellationPolicy.calculateForOwner.mockReturnValue(ownerPolicy);

        const result = await useCase.execute(
            { sub: 'owner-sub' } as any,
            RESERVATION_ID,
            { raison: 'Véhicule indisponible' },
        );

        expect(result.statut).toBe(StatutReservation.ANNULEE);
        expect(mockCancellationPolicy.calculateForOwner).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: 'stranger-id' });

        await expect(
            useCase.execute(
                { sub: 'stranger' } as any,
                RESERVATION_ID,
                { raison: 'Test' },
            ),
        ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BusinessRuleException for non-cancellable status', async () => {
        mockStateMachine.isCancellable.mockReturnValue(false);

        await expect(
            useCase.execute(
                { sub: 'user-sub' } as any,
                RESERVATION_ID,
                { raison: 'Test' },
            ),
        ).rejects.toThrow(BusinessRuleException);
    });

    it('should throw NotFoundException for missing reservation', async () => {
        mockPrisma.reservation.findUnique.mockResolvedValue(null);

        await expect(
            useCase.execute(
                { sub: 'user-sub' } as any,
                RESERVATION_ID,
                { raison: 'Test' },
            ),
        ).rejects.toThrow(NotFoundException);
    });

    it('should block cancellation when policy says canCancel=false', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: PROPRIETAIRE_ID });
        mockCancellationPolicy.calculateForOwner.mockReturnValue({
            ...tenantPolicy,
            canCancel: false,
            warnings: ['Annulation le jour même impossible'],
        });

        await expect(
            useCase.execute(
                { sub: 'owner-sub' } as any,
                RESERVATION_ID,
                { raison: 'Jour même' },
            ),
        ).rejects.toThrow(BusinessRuleException);
    });

    it('should debit wallet if owner already credited', async () => {
        mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: LOCATAIRE_ID });
        mockCancellationPolicy.calculateForTenant.mockReturnValue({
            ...tenantPolicy,
            ownerPenaltyAmount: new Prisma.Decimal('15000'),
            ownerPenaltyPercentage: 20,
        });
        mockTx.wallet.findUnique.mockResolvedValue({
            id: 'wallet-1',
            soldeDisponible: new Prisma.Decimal('100000'),
        });
        mockTx.transactionWallet.findUnique.mockResolvedValue({
            id: 'tx-credit',
            type: TypeTransactionWallet.CREDIT_LOCATION,
        });

        await useCase.execute(
            { sub: 'user-sub' } as any,
            RESERVATION_ID,
            { raison: 'Test wallet debit' },
        );

        expect(mockTx.wallet.update).toHaveBeenCalled();
        expect(mockTx.transactionWallet.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    type: TypeTransactionWallet.DEBIT_PENALITE,
                }),
            }),
        );
    });

    it('should invalidate cache and notify', async () => {
        await useCase.execute(
            { sub: 'user-sub' } as any,
            RESERVATION_ID,
            { raison: 'Test notification' },
        );

        expect(mockRedis.delPattern).toHaveBeenCalledWith(
            expect.stringContaining('dakar'),
        );
        expect(mockQueue.scheduleNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'reservation.cancelled',
            }),
        );
    });
});
