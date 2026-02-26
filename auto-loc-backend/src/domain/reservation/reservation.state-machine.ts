import { Injectable } from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { BusinessRuleException } from '../../common/exceptions/business-rule.exception';

// ── Transition map ─────────────────────────────────────────────────────────────

const ALLOWED: Partial<Record<StatutReservation, StatutReservation[]>> = {
  [StatutReservation.INITIEE]: [
    StatutReservation.EN_ATTENTE_PAIEMENT,
    StatutReservation.ANNULEE,
  ],
  [StatutReservation.EN_ATTENTE_PAIEMENT]: [
    StatutReservation.PAYEE,
    StatutReservation.ANNULEE,
  ],
  [StatutReservation.PAYEE]: [
    StatutReservation.CONFIRMEE,
    StatutReservation.ANNULEE,
  ],
  [StatutReservation.CONFIRMEE]: [
    StatutReservation.EN_COURS,
    StatutReservation.ANNULEE,
  ],
  [StatutReservation.EN_COURS]: [
    StatutReservation.TERMINEE,
    StatutReservation.LITIGE,
  ],
  [StatutReservation.TERMINEE]: [],
  [StatutReservation.ANNULEE]: [],
  [StatutReservation.LITIGE]: [StatutReservation.TERMINEE],
};

const TERMINAL: ReadonlySet<StatutReservation> = new Set([
  StatutReservation.TERMINEE,
  StatutReservation.ANNULEE,
]);

const CANCELLABLE: ReadonlySet<StatutReservation> = new Set([
  StatutReservation.INITIEE,
  StatutReservation.EN_ATTENTE_PAIEMENT,
  StatutReservation.PAYEE,
  StatutReservation.CONFIRMEE,
]);

// ── Injectable service ─────────────────────────────────────────────────────────

@Injectable()
export class ReservationStateMachine {
  /**
   * Vérifie que la transition from → to est autorisée.
   * Lève BusinessRuleException (422) sinon.
   */
  transition(from: StatutReservation, to: StatutReservation): void {
    ReservationStateMachine.transition(from, to);
  }

  canTransition(from: StatutReservation, to: StatutReservation): boolean {
    return ReservationStateMachine.canTransition(from, to);
  }

  getAllowedTransitions(from: StatutReservation): StatutReservation[] {
    return ReservationStateMachine.getAllowedTransitions(from);
  }

  isTerminal(status: StatutReservation): boolean {
    return ReservationStateMachine.isTerminal(status);
  }

  isCancellable(status: StatutReservation): boolean {
    return ReservationStateMachine.isCancellable(status);
  }

  // ── Static methods (rétrocompatibilité) ────────────────────────────────────

  static transition(from: StatutReservation, to: StatutReservation): void {
    const allowed = ALLOWED[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BusinessRuleException(
        `Transition ${from} → ${to} non autorisée`,
        'INVALID_STATE_TRANSITION',
      );
    }
  }

  static canTransition(from: StatutReservation, to: StatutReservation): boolean {
    return (ALLOWED[from] ?? []).includes(to);
  }

  static getAllowedTransitions(from: StatutReservation): StatutReservation[] {
    return [...(ALLOWED[from] ?? [])];
  }

  static isTerminal(status: StatutReservation): boolean {
    return TERMINAL.has(status);
  }

  static isCancellable(status: StatutReservation): boolean {
    return CANCELLABLE.has(status);
  }
}
