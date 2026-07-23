import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/transaction_direction.dart';
import '../../../../shared/enums/transaction_type.dart';
import '../../../../shared/enums/withdrawal_method.dart';
import '../../../../shared/enums/withdrawal_status.dart';
import '../../domain/entities/wallet.dart';
import '../dto/wallet_dto.dart';

class WalletMapper {
  static Wallet toEntity(WalletDto dto, String id, String utilisateurId, DateTime creeLe, DateTime misAJourLe) {
    return Wallet(
      id: id,
      utilisateurId: utilisateurId,
      balance: _mapBalance(dto.balance),
      creeLe: creeLe,
      misAJourLe: misAJourLe,
      transactions: dto.transactions.map((t) => mapTransaction(t, id)).toList(),
    );
  }

  static WalletBalance _mapBalance(WalletBalanceDto dto) {
    return WalletBalance(
      soldeDisponible: double.tryParse(dto.soldeDisponible) ?? 0,
      soldeRetirable: double.tryParse(dto.soldeRetirable) ?? 0,
      soldeWave: double.tryParse(dto.soldeWave) ?? 0,
      soldeOrangeMoney: double.tryParse(dto.soldeOrangeMoney) ?? 0,
      enAttente: double.tryParse(dto.enAttente) ?? 0,
      totalGagne: double.tryParse(dto.totalGagne) ?? 0,
    );
  }

  static WalletTransaction mapTransaction(WalletTransactionDto dto, String walletId) {
    return WalletTransaction(
      id: dto.id,
      walletId: walletId,
      reservationId: dto.reservationId,
      type: TransactionType.fromString(dto.type),
      montant: double.tryParse(dto.montant) ?? 0,
      sens: TransactionDirection.fromString(dto.sens),
      soldeApres: double.tryParse(dto.soldeApres) ?? 0,
      fournisseur: dto.fournisseur != null ? PaymentProvider.fromString(dto.fournisseur!) : null,
      creeLe: dto.creeLe,
    );
  }

  static Withdrawal mapWithdrawal(WithdrawalDto dto) {
    return Withdrawal(
      id: dto.id,
      walletId: dto.walletId,
      montant: double.tryParse(dto.montant) ?? 0,
      methode: WithdrawalMethod.fromString(dto.methode),
      destinataire: dto.destinataire,
      statut: WithdrawalStatus.fromString(dto.statut),
      raisonRejet: dto.raisonRejet,
      idTransactionFournisseur: dto.idTransactionFournisseur,
      demandeeLe: dto.demandeeLe,
      traiteLe: dto.traiteLe,
    );
  }

  static Penalty mapPenalty(PenaltyDto dto) {
    return Penalty(
      id: dto.id,
      utilisateurId: dto.utilisateurId,
      reservationId: dto.reservationId,
      montant: double.tryParse(dto.montant) ?? 0,
      raison: dto.raison,
      creeLe: dto.creeLe,
      preleveleLe: dto.preleveleLe,
    );
  }
}
