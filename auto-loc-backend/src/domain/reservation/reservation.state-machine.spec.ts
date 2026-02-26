import { StatutReservation } from '@prisma/client';
import { ReservationStateMachine } from './reservation.state-machine';
import { BusinessRuleException } from '../../common/exceptions/business-rule.exception';

describe('ReservationStateMachine', () => {
    let sm: ReservationStateMachine;

    beforeEach(() => {
        sm = new ReservationStateMachine();
    });

    // ── Valid transitions ────────────────────────────────────────────────────

    const validTransitions: [StatutReservation, StatutReservation][] = [
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

    it.each(validTransitions)(
        'should allow %s → %s',
        (from, to) => {
            expect(() => sm.transition(from, to)).not.toThrow();
            expect(sm.canTransition(from, to)).toBe(true);
        },
    );

    // ── Invalid transitions ──────────────────────────────────────────────────

    const invalidTransitions: [StatutReservation, StatutReservation][] = [
        [StatutReservation.TERMINEE, StatutReservation.ANNULEE],
        [StatutReservation.TERMINEE, StatutReservation.EN_COURS],
        [StatutReservation.ANNULEE, StatutReservation.INITIEE],
        [StatutReservation.ANNULEE, StatutReservation.PAYEE],
        [StatutReservation.EN_COURS, StatutReservation.ANNULEE],
        [StatutReservation.EN_COURS, StatutReservation.CONFIRMEE],
        [StatutReservation.PAYEE, StatutReservation.EN_COURS],
        [StatutReservation.INITIEE, StatutReservation.CONFIRMEE],
    ];

    it.each(invalidTransitions)(
        'should reject %s → %s with BusinessRuleException (422)',
        (from, to) => {
            expect(() => sm.transition(from, to)).toThrow(BusinessRuleException);
            expect(sm.canTransition(from, to)).toBe(false);
        },
    );

    // ── Terminal states ──────────────────────────────────────────────────────

    it('should mark TERMINEE as terminal', () => {
        expect(sm.isTerminal(StatutReservation.TERMINEE)).toBe(true);
    });

    it('should mark ANNULEE as terminal', () => {
        expect(sm.isTerminal(StatutReservation.ANNULEE)).toBe(true);
    });

    it('should NOT mark EN_COURS as terminal', () => {
        expect(sm.isTerminal(StatutReservation.EN_COURS)).toBe(false);
    });

    // ── Cancellable states ───────────────────────────────────────────────────

    const cancellable = [
        StatutReservation.INITIEE,
        StatutReservation.EN_ATTENTE_PAIEMENT,
        StatutReservation.PAYEE,
        StatutReservation.CONFIRMEE,
    ];

    it.each(cancellable)('should mark %s as cancellable', (status) => {
        expect(sm.isCancellable(status)).toBe(true);
    });

    const notCancellable = [
        StatutReservation.EN_COURS,
        StatutReservation.TERMINEE,
        StatutReservation.ANNULEE,
        StatutReservation.LITIGE,
    ];

    it.each(notCancellable)('should NOT mark %s as cancellable', (status) => {
        expect(sm.isCancellable(status)).toBe(false);
    });

    // ── getAllowedTransitions ─────────────────────────────────────────────────

    it('should return empty array for terminal TERMINEE', () => {
        expect(sm.getAllowedTransitions(StatutReservation.TERMINEE)).toEqual([]);
    });

    it('should return correct transitions for PAYEE', () => {
        const allowed = sm.getAllowedTransitions(StatutReservation.PAYEE);
        expect(allowed).toContain(StatutReservation.CONFIRMEE);
        expect(allowed).toContain(StatutReservation.ANNULEE);
        expect(allowed).toHaveLength(2);
    });

    // ── Static compatibility ─────────────────────────────────────────────────

    it('static transition should work identically', () => {
        expect(() =>
            ReservationStateMachine.transition(
                StatutReservation.PAYEE,
                StatutReservation.CONFIRMEE,
            ),
        ).not.toThrow();
    });

    it('BusinessRuleException should have status 422', () => {
        try {
            sm.transition(StatutReservation.TERMINEE, StatutReservation.INITIEE);
            fail('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(BusinessRuleException);
            expect((err as BusinessRuleException).getStatus()).toBe(422);
        }
    });
});
