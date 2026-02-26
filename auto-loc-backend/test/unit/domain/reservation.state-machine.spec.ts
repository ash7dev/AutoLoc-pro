import { BadRequestException } from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { ReservationStateMachine } from '../../../src/domain/reservation/reservation.state-machine';

describe('ReservationStateMachine', () => {
    // ── Valid transitions ──────────────────────────────────────────────────────

    describe('valid transitions', () => {
        const validCases: [StatutReservation, StatutReservation][] = [
            [StatutReservation.INITIEE, StatutReservation.EN_ATTENTE_PAIEMENT],
            [StatutReservation.INITIEE, StatutReservation.ANNULEE],
            [StatutReservation.EN_ATTENTE_PAIEMENT, StatutReservation.PAYEE],
            [StatutReservation.EN_ATTENTE_PAIEMENT, StatutReservation.ANNULEE],
            [StatutReservation.PAYEE, StatutReservation.CONFIRMEE],
            [StatutReservation.PAYEE, StatutReservation.ANNULEE],
            [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS],
            [StatutReservation.CONFIRMEE, StatutReservation.ANNULEE],
            [StatutReservation.EN_COURS, StatutReservation.TERMINEE],
            [StatutReservation.EN_COURS, StatutReservation.LITIGE],
            [StatutReservation.LITIGE, StatutReservation.TERMINEE],
        ];

        it.each(validCases)('%s → %s should be allowed', (from, to) => {
            expect(() => ReservationStateMachine.transition(from, to)).not.toThrow();
        });

        it.each(validCases)('canTransition(%s, %s) should return true', (from, to) => {
            expect(ReservationStateMachine.canTransition(from, to)).toBe(true);
        });
    });

    // ── Invalid transitions ────────────────────────────────────────────────────

    describe('invalid transitions', () => {
        const invalidCases: [StatutReservation, StatutReservation][] = [
            [StatutReservation.TERMINEE, StatutReservation.EN_COURS],
            [StatutReservation.ANNULEE, StatutReservation.PAYEE],
            [StatutReservation.PAYEE, StatutReservation.EN_COURS], // skip CONFIRMEE
            [StatutReservation.EN_ATTENTE_PAIEMENT, StatutReservation.CONFIRMEE], // skip PAYEE
            [StatutReservation.INITIEE, StatutReservation.TERMINEE],
            [StatutReservation.TERMINEE, StatutReservation.ANNULEE],
            [StatutReservation.ANNULEE, StatutReservation.ANNULEE],
        ];

        it.each(invalidCases)('%s → %s should throw', (from, to) => {
            expect(() => ReservationStateMachine.transition(from, to)).toThrow(
                BadRequestException,
            );
        });

        it.each(invalidCases)('canTransition(%s, %s) should return false', (from, to) => {
            expect(ReservationStateMachine.canTransition(from, to)).toBe(false);
        });
    });

    // ── Terminal states ────────────────────────────────────────────────────────

    describe('terminal states', () => {
        it('TERMINEE should have no allowed transitions', () => {
            for (const target of Object.values(StatutReservation)) {
                expect(
                    ReservationStateMachine.canTransition(StatutReservation.TERMINEE, target),
                ).toBe(false);
            }
        });

        it('ANNULEE should have no allowed transitions', () => {
            for (const target of Object.values(StatutReservation)) {
                expect(
                    ReservationStateMachine.canTransition(StatutReservation.ANNULEE, target),
                ).toBe(false);
            }
        });
    });
});
