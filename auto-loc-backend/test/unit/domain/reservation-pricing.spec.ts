import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReservationPricingService } from '../../../src/domain/reservation/reservation-pricing.service';

describe('ReservationPricingService', () => {
    let service: ReservationPricingService;

    beforeEach(() => {
        service = new ReservationPricingService();
    });

    // ── parseDatesAndDuration ─────────────────────────────────────────────────

    describe('parseDatesAndDuration', () => {
        it('should parse valid dates and calculate days', () => {
            const result = service.parseDatesAndDuration('2025-07-01', '2025-07-04');
            expect(result.nbJours).toBe(3);
            expect(result.debut.getUTCHours()).toBe(0);
            expect(result.fin.getUTCHours()).toBe(0);
        });

        it('should throw when dateFin equals dateDebut', () => {
            expect(() =>
                service.parseDatesAndDuration('2025-07-01', '2025-07-01'),
            ).toThrow(BadRequestException);
        });

        it('should throw when dateFin is before dateDebut', () => {
            expect(() =>
                service.parseDatesAndDuration('2025-07-05', '2025-07-01'),
            ).toThrow(BadRequestException);
        });

        it('should handle single day rental (1 day diff)', () => {
            const result = service.parseDatesAndDuration('2025-07-01', '2025-07-02');
            expect(result.nbJours).toBe(1);
        });

        it('should handle long rental (30 days)', () => {
            const result = service.parseDatesAndDuration('2025-07-01', '2025-07-31');
            expect(result.nbJours).toBe(30);
        });
    });

    // ── calculate ─────────────────────────────────────────────────────────────

    describe('calculate', () => {
        it('should calculate commission at 15%', () => {
            const prixParJour = new Prisma.Decimal('10000');
            const result = service.calculate(prixParJour, 3);

            expect(result.totalBase.toString()).toBe('30000');
            expect(result.tauxCommission.toString()).toBe('0.15');
            expect(result.montantCommission.toString()).toBe('4500');
            expect(result.totalLocataire.toString()).toBe('34500');
            expect(result.netProprietaire.toString()).toBe('30000');
        });

        it('should round commission to 2 decimal places', () => {
            const prixParJour = new Prisma.Decimal('3333');
            const result = service.calculate(prixParJour, 1);

            // 3333 * 0.15 = 499.95
            expect(result.montantCommission.toString()).toBe('499.95');
            expect(result.totalLocataire.toString()).toBe('3832.95');
        });

        it('should handle 1 day rental', () => {
            const prixParJour = new Prisma.Decimal('5000');
            const result = service.calculate(prixParJour, 1);

            expect(result.totalBase.toString()).toBe('5000');
            expect(result.montantCommission.toString()).toBe('750');
            expect(result.totalLocataire.toString()).toBe('5750');
        });

        it('should preserve prixParJour in result', () => {
            const prixParJour = new Prisma.Decimal('15000');
            const result = service.calculate(prixParJour, 2);
            expect(result.prixParJour.equals(prixParJour)).toBe(true);
        });
    });

    // ── calculateAge ──────────────────────────────────────────────────────────

    describe('calculateAge', () => {
        it('should calculate age correctly for past birthday this year', () => {
            const today = new Date();
            const birthDate = new Date(today.getFullYear() - 25, 0, 1); // Jan 1st, 25 years ago
            expect(service.calculateAge(birthDate)).toBe(25);
        });

        it('should subtract 1 if birthday has not occurred this year', () => {
            const today = new Date();
            const birthDate = new Date(today.getFullYear() - 20, 11, 31); // Dec 31st, 20 years ago
            // If today is before Dec 31, age should be 19
            const expected = today.getMonth() === 11 && today.getDate() >= 31 ? 20 : 19;
            expect(service.calculateAge(birthDate)).toBe(expected);
        });
    });
});
