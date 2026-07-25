import { Prisma } from '@prisma/client';
import { ReservationPricingService, calculateCommissionRate } from './reservation-pricing.service';

describe('ReservationPricingService', () => {
    let service: ReservationPricingService;

    beforeEach(() => {
        service = new ReservationPricingService();
    });

    describe('calculateCommissionRate', () => {
        it('should return 17.5% for prices <= 20,000 FCFA', () => {
            expect(calculateCommissionRate(15000).toString()).toBe('0.175');
            expect(calculateCommissionRate(20000).toString()).toBe('0.175');
        });

        it('should return 15.5% for prices between 20,001 and 35,000 FCFA', () => {
            expect(calculateCommissionRate(25000).toString()).toBe('0.155');
            expect(calculateCommissionRate(35000).toString()).toBe('0.155');
        });

        it('should return 13.5% for prices between 35,001 and 60,000 FCFA', () => {
            expect(calculateCommissionRate(40000).toString()).toBe('0.135');
            expect(calculateCommissionRate(60000).toString()).toBe('0.135');
        });

        it('should return 11.5% for prices between 60,001 and 100,000 FCFA', () => {
            expect(calculateCommissionRate(75000).toString()).toBe('0.115');
            expect(calculateCommissionRate(100000).toString()).toBe('0.115');
        });

        it('should return 10.0% for prices > 100,000 FCFA', () => {
            expect(calculateCommissionRate(120000).toString()).toBe('0.1');
        });
    });

    describe('calculate', () => {
        it('should calculate correct totals for 15,000 FCFA/day (17.5% commission rounded to 100 FCFA)', () => {
            const res = service.calculate(new Prisma.Decimal(15000), 2);
            expect(res.totalBase.toString()).toBe('30000'); // 15000 * 2
            expect(res.tauxCommission.toString()).toBe('0.175');
            expect(res.montantCommission.toString()).toBe('5300'); // 5250 rounded to 5300
            expect(res.totalLocataire.toString()).toBe('35300');
            expect(res.netProprietaire.toString()).toBe('30000');
        });

        it('should calculate correct totals for 50,000 FCFA/day (13.5% commission rounded to 100 FCFA)', () => {
            const res = service.calculate(new Prisma.Decimal(50000), 3);
            expect(res.totalBase.toString()).toBe('150000'); // 50000 * 3
            expect(res.tauxCommission.toString()).toBe('0.135');
            expect(res.montantCommission.toString()).toBe('20300'); // 20250 rounded to 20300
            expect(res.totalLocataire.toString()).toBe('170300');
            expect(res.netProprietaire.toString()).toBe('150000');
        });
    });
});
