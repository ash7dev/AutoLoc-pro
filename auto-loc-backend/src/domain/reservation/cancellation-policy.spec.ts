import { Prisma } from '@prisma/client';
import { CancellationPolicyService, ReservationForCancellation } from './cancellation-policy.service';

describe('CancellationPolicyService', () => {
    let service: CancellationPolicyService;

    beforeEach(() => {
        service = new CancellationPolicyService();
    });

    // ── Helpers ──────────────────────────────────────────────────────────────

    const makeReservation = (
        dateDebut: Date,
        overrides?: Partial<ReservationForCancellation>,
    ): ReservationForCancellation => ({
        dateDebut,
        totalBase: new Prisma.Decimal('75000'),
        totalLocataire: new Prisma.Decimal('86250'), // 75000 + 15% commission
        montantCommission: new Prisma.Decimal('11250'),
        netProprietaire: new Prisma.Decimal('75000'),
        ...overrides,
    });

    const daysFromNow = (days: number): Date => {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        return d;
    };

    // ── Tenant cancellation ──────────────────────────────────────────────────

    describe('calculateForTenant', () => {
        it('> 5 days: 100% refund minus commission', () => {
            const reservation = makeReservation(daysFromNow(10));
            const result = service.calculateForTenant(reservation);

            expect(result.refundPercentage).toBe(100);
            expect(result.refundAmount.equals(new Prisma.Decimal('75000'))).toBe(true);
            expect(result.commissionRetained.equals(new Prisma.Decimal('11250'))).toBe(true);
            expect(result.canCancel).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });

        it('2-5 days: 75% refund', () => {
            const reservation = makeReservation(daysFromNow(3));
            const result = service.calculateForTenant(reservation);

            expect(result.refundPercentage).toBe(75);
            // 75% of 86250 = 64687.50
            expect(result.refundAmount.equals(new Prisma.Decimal('64687.50'))).toBe(true);
            expect(result.canCancel).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('< 24h: 0% refund', () => {
            const reservation = makeReservation(daysFromNow(0.5));
            const result = service.calculateForTenant(reservation);

            expect(result.refundPercentage).toBe(0);
            expect(result.refundAmount.equals(new Prisma.Decimal('0'))).toBe(true);
            expect(result.canCancel).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('exactly 5 days: should get 100% (> 5)', () => {
            const reservation = makeReservation(daysFromNow(5.1));
            const result = service.calculateForTenant(reservation);
            expect(result.refundPercentage).toBe(100);
        });

        it('exactly 2 days: should get 75%', () => {
            const reservation = makeReservation(daysFromNow(2));
            const result = service.calculateForTenant(reservation);
            expect(result.refundPercentage).toBe(75);
        });
    });

    // ── Owner cancellation ───────────────────────────────────────────────────

    describe('calculateForOwner', () => {
        it('> 7 days: full refund, no penalty', () => {
            const reservation = makeReservation(daysFromNow(10));
            const result = service.calculateForOwner(reservation);

            expect(result.refundPercentage).toBe(100);
            expect(result.refundAmount.equals(new Prisma.Decimal('86250'))).toBe(true);
            expect(result.ownerPenaltyPercentage).toBe(0);
            expect(result.ownerPenaltyAmount.equals(new Prisma.Decimal('0'))).toBe(true);
            expect(result.canCancel).toBe(true);
        });

        it('3-7 days: full refund + 20% penalty', () => {
            const reservation = makeReservation(daysFromNow(5));
            const result = service.calculateForOwner(reservation);

            expect(result.refundPercentage).toBe(100);
            expect(result.ownerPenaltyPercentage).toBe(20);
            // 20% of 75000 = 15000
            expect(result.ownerPenaltyAmount.equals(new Prisma.Decimal('15000'))).toBe(true);
            expect(result.canCancel).toBe(true);
        });

        it('< 3 days: full refund + 40% penalty', () => {
            const reservation = makeReservation(daysFromNow(1.5));
            const result = service.calculateForOwner(reservation);

            expect(result.refundPercentage).toBe(100);
            expect(result.ownerPenaltyPercentage).toBe(40);
            // 40% of 75000 = 30000
            expect(result.ownerPenaltyAmount.equals(new Prisma.Decimal('30000'))).toBe(true);
            expect(result.canCancel).toBe(true);
        });

        it('same day: cannot cancel', () => {
            const reservation = makeReservation(daysFromNow(0.3));
            const result = service.calculateForOwner(reservation);

            expect(result.canCancel).toBe(false);
            expect(result.warnings).toContainEqual(
                expect.stringContaining('jour même impossible'),
            );
        });
    });

    // ── Force majeure ────────────────────────────────────────────────────────

    describe('calculateForceMajeure', () => {
        it('returns 100% refund, no commission retained', () => {
            const reservation = makeReservation(daysFromNow(1));
            const result = service.calculateForceMajeure(reservation);

            expect(result.refundPercentage).toBe(100);
            expect(result.refundAmount.equals(new Prisma.Decimal('86250'))).toBe(true);
            expect(result.commissionRetained.equals(new Prisma.Decimal('0'))).toBe(true);
            expect(result.canCancel).toBe(true);
        });
    });

    // ── daysUntilStart helper ────────────────────────────────────────────────

    describe('daysUntilStart', () => {
        it('returns 0 when dateDebut is in the past', () => {
            const pastDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
            expect(service.daysUntilStart(pastDate, new Date())).toBe(0);
        });

        it('returns correct number of days', () => {
            const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            const days = service.daysUntilStart(futureDate, new Date());
            expect(days).toBeCloseTo(5, 0);
        });
    });
});
