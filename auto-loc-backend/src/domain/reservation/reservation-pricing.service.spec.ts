import { Prisma } from '@prisma/client';
import { ReservationPricingService, calculateCommissionRate } from './reservation-pricing.service';

describe('ReservationPricingService', () => {
    let service: ReservationPricingService;

    beforeEach(() => {
        service = new ReservationPricingService();
    });

    describe('calculateCommissionRate', () => {
        it('should return a flat 10% whatever the daily price', () => {
            for (const price of [15000, 20000, 35000, 60000, 100000, 120000]) {
                expect(calculateCommissionRate(price).toString()).toBe('0.1');
            }
        });
    });

    describe('calculate', () => {
        it('should calculate correct totals for 15,000 FCFA/day (10% commission)', () => {
            const res = service.calculate(new Prisma.Decimal(15000), 2);
            expect(res.totalBase.toString()).toBe('30000');
            expect(res.tauxCommission.toString()).toBe('0.1');
            expect(res.montantCommission.toString()).toBe('3000');
            expect(res.totalLocataire.toString()).toBe('33000');
            expect(res.netProprietaire.toString()).toBe('30000');
        });

        it('should round the commission to the nearest 100 FCFA', () => {
            const res = service.calculate(new Prisma.Decimal(17250), 3);
            expect(res.totalBase.toString()).toBe('51750');
            expect(res.montantCommission.toString()).toBe('5200'); // 5175 → 5200
        });

        it('should bill the hors Dakar supplement only on declared days', () => {
            const res = service.calculate(new Prisma.Decimal(20000), 5, undefined, 5000, 1);
            expect(res.prixParJour.toString()).toBe('20000');
            expect(res.nbJoursHorsDakar).toBe(1);
            expect(res.montantHorsDakar.toString()).toBe('5000');
            expect(res.totalBase.toString()).toBe('105000'); // 20000*5 + 5000*1
            expect(res.montantCommission.toString()).toBe('10500');
            expect(res.totalLocataire.toString()).toBe('115500');
        });

        it('should default to the whole duration and clamp to nbJours', () => {
            expect(service.calculate(new Prisma.Decimal(20000), 3, undefined, 5000).nbJoursHorsDakar).toBe(3);
            expect(service.calculate(new Prisma.Decimal(20000), 3, undefined, 5000, 10).nbJoursHorsDakar).toBe(3);
            expect(service.calculate(new Prisma.Decimal(20000), 3, undefined, 0, 2).nbJoursHorsDakar).toBe(0);
        });
    });
});
