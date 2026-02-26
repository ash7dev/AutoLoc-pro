import { ConflictException } from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { ReservationAvailabilityService } from '../../../src/domain/reservation/reservation-availability.service';

describe('ReservationAvailabilityService', () => {
    let service: ReservationAvailabilityService;

    beforeEach(() => {
        service = new ReservationAvailabilityService();
    });

    // ── lockVehicle ───────────────────────────────────────────────────────────

    describe('lockVehicle', () => {
        it('should return true when vehicle is locked successfully', async () => {
            const tx = {
                $queryRaw: jest.fn().mockResolvedValue([{ id: 'v1' }]),
                reservation: { findFirst: jest.fn() },
            };
            const result = await service.lockVehicle(tx as any, 'v1');
            expect(result).toBe(true);
        });

        it('should return false when vehicle is not available', async () => {
            const tx = {
                $queryRaw: jest.fn().mockResolvedValue([]),
                reservation: { findFirst: jest.fn() },
            };
            const result = await service.lockVehicle(tx as any, 'v1');
            expect(result).toBe(false);
        });
    });

    // ── hasOverlap ────────────────────────────────────────────────────────────

    describe('hasOverlap', () => {
        it('should return true when an overlapping reservation exists', async () => {
            const tx = {
                $queryRaw: jest.fn(),
                reservation: {
                    findFirst: jest.fn().mockResolvedValue({ id: 'overlap-id' }),
                },
            };
            const result = await service.hasOverlap(
                tx as any,
                'v1',
                new Date('2025-07-01'),
                new Date('2025-07-05'),
            );
            expect(result).toBe(true);
        });

        it('should return false when no overlapping reservation exists', async () => {
            const tx = {
                $queryRaw: jest.fn(),
                reservation: {
                    findFirst: jest.fn().mockResolvedValue(null),
                },
            };
            const result = await service.hasOverlap(
                tx as any,
                'v1',
                new Date('2025-07-01'),
                new Date('2025-07-05'),
            );
            expect(result).toBe(false);
        });

        it('should pass correct statuses in the where clause', async () => {
            const findFirstMock = jest.fn().mockResolvedValue(null);
            const tx = {
                $queryRaw: jest.fn(),
                reservation: { findFirst: findFirstMock },
            };
            await service.hasOverlap(
                tx as any,
                'v1',
                new Date('2025-07-01'),
                new Date('2025-07-05'),
            );

            const whereArg = findFirstMock.mock.calls[0][0].where;
            expect(whereArg.statut.in).toEqual([
                StatutReservation.EN_ATTENTE_PAIEMENT,
                StatutReservation.PAYEE,
                StatutReservation.CONFIRMEE,
                StatutReservation.EN_COURS,
            ]);
        });
    });

    // ── ensureAvailable ───────────────────────────────────────────────────────

    describe('ensureAvailable', () => {
        it('should throw ConflictException when vehicle cannot be locked', async () => {
            const tx = {
                $queryRaw: jest.fn().mockResolvedValue([]),
                reservation: { findFirst: jest.fn() },
            };

            await expect(
                service.ensureAvailable(
                    tx as any,
                    'v1',
                    new Date('2025-07-01'),
                    new Date('2025-07-05'),
                ),
            ).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException when overlap is detected', async () => {
            const tx = {
                $queryRaw: jest.fn().mockResolvedValue([{ id: 'v1' }]),
                reservation: {
                    findFirst: jest.fn().mockResolvedValue({ id: 'existing' }),
                },
            };

            await expect(
                service.ensureAvailable(
                    tx as any,
                    'v1',
                    new Date('2025-07-01'),
                    new Date('2025-07-05'),
                ),
            ).rejects.toThrow(ConflictException);
        });

        it('should resolve when vehicle is available', async () => {
            const tx = {
                $queryRaw: jest.fn().mockResolvedValue([{ id: 'v1' }]),
                reservation: {
                    findFirst: jest.fn().mockResolvedValue(null),
                },
            };

            await expect(
                service.ensureAvailable(
                    tx as any,
                    'v1',
                    new Date('2025-07-01'),
                    new Date('2025-07-05'),
                ),
            ).resolves.toBeUndefined();
        });
    });
});
