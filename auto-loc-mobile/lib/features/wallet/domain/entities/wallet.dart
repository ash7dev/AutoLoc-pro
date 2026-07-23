import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/transaction_direction.dart';
import '../../../../shared/enums/transaction_type.dart';
import '../../../../shared/enums/withdrawal_method.dart';
import '../../../../shared/enums/withdrawal_status.dart';

part 'wallet.freezed.dart';

/// Wallet Entity
///
/// Représente le portefeuille d'un propriétaire avec toutes ses informations.
/// Synchronisé avec: GET /wallet/me (wallet.service.ts getWallet)
@freezed
class Wallet with _$Wallet {
  const factory Wallet({
    required String id,
    required String utilisateurId,
    required WalletBalance balance,
    required DateTime creeLe,
    required DateTime misAJourLe,
    @Default([]) List<WalletTransaction> transactions,
    @Default([]) List<Withdrawal> retraits,
  }) = _Wallet;

  const Wallet._();

  /// Peut retirer ce montant
  bool canWithdraw(double amount) {
    return balance.soldeRetirableDouble >= amount && amount >= 5000;
  }

  /// Montant minimum de retrait
  double get montantMinimumRetrait => 5000.0;
}

/// Wallet Balance
///
/// Balance détaillée du wallet retournée par GET /wallet/me
/// Synchronisé avec wallet.service.ts lignes 137-145
@freezed
class WalletBalance with _$WalletBalance {
  const factory WalletBalance({
    /// Solde disponible total dans le wallet
    required double soldeDisponible,

    /// Solde retirable (soldeDisponible - pénalités en attente)
    required double soldeRetirable,

    /// Solde des crédits Wave
    required double soldeWave,

    /// Solde des crédits Orange Money
    required double soldeOrangeMoney,

    /// Montant en attente (réservations PAYEE, CONFIRMEE, EN_COURS non encore créditées)
    required double enAttente,

    /// Total gagné (toutes réservations PAYEE, CONFIRMEE, EN_COURS, TERMINEE)
    required double totalGagne,
  }) = _WalletBalance;

  const WalletBalance._();

  /// Solde disponible formatté
  String get soldeDisponibleFormatte =>
      '${soldeDisponible.toStringAsFixed(0)} FCFA';

  /// Solde retirable formatté
  String get soldeRetirableFormatte =>
      '${soldeRetirable.toStringAsFixed(0)} FCFA';

  /// En attente formatté
  String get enAttenteFormatte => '${enAttente.toStringAsFixed(0)} FCFA';

  /// Total gagné formatté
  String get totalGagneFormatte => '${totalGagne.toStringAsFixed(0)} FCFA';

  /// Solde Wave formatté
  String get soldeWaveFormatte => '${soldeWave.toStringAsFixed(0)} FCFA';

  /// Solde Orange Money formatté
  String get soldeOrangeMoneyFormatte =>
      '${soldeOrangeMoney.toStringAsFixed(0)} FCFA';

  /// Getter pour double (pour calculations)
  double get soldeDisponibleDouble => soldeDisponible;
  double get soldeRetirableDouble => soldeRetirable;
}

/// Transaction Wallet
///
/// Représente une transaction dans le wallet.
/// Synchronisé avec: model TransactionWallet (schema.prisma) et wallet.service.ts ligne 146-154
@freezed
class WalletTransaction with _$WalletTransaction {
  const factory WalletTransaction({
    required String id,
    required String walletId,
    String? reservationId,
    required TransactionType type,
    required double montant,
    required TransactionDirection sens,
    required double soldeApres,
    PaymentProvider? fournisseur,
    required DateTime creeLe,
  }) = _WalletTransaction;

  const WalletTransaction._();

  /// Montant formatté avec signe
  String get montantFormatte {
    final sign = sens == TransactionDirection.credit ? '+' : '-';
    return '$sign${montant.toStringAsFixed(0)} FCFA';
  }

  /// Solde après formatté
  String get soldeApresFormatte => '${soldeApres.toStringAsFixed(0)} FCFA';

  /// Est un crédit
  bool get isCredit => sens == TransactionDirection.credit;

  /// Est un débit
  bool get isDebit => sens == TransactionDirection.debit;

  /// Description de la transaction
  String get description {
    return switch (type) {
      TransactionType.creditRental => 'Revenus de location',
      TransactionType.debitPenalty => 'Pénalité',
      TransactionType.debitWithdrawal => 'Retrait',
    };
  }
}

/// Withdrawal (Retrait)
///
/// Représente une demande de retrait.
/// Synchronisé avec: model Retrait (schema.prisma)
@freezed
class Withdrawal with _$Withdrawal {
  const factory Withdrawal({
    required String id,
    required String walletId,
    required double montant,
    required WithdrawalMethod methode,

    /// Numéro de téléphone du destinataire
    required String destinataire,
    required WithdrawalStatus statut,
    String? raisonRejet,
    String? idTransactionFournisseur,
    required DateTime demandeeLe,
    DateTime? traiteLe,
  }) = _Withdrawal;

  const Withdrawal._();

  /// Montant formatté
  String get montantFormatte => '${montant.toStringAsFixed(0)} FCFA';

  /// Est en attente
  bool get isPending => statut == WithdrawalStatus.pending;

  /// Est effectué
  bool get isCompleted => statut == WithdrawalStatus.completed;

  /// Est rejeté
  bool get isRejected => statut == WithdrawalStatus.rejected;

  /// Est approuvé
  bool get isApproved => statut == WithdrawalStatus.approved;

  /// Peut être annulé (seulement si EN_ATTENTE)
  bool get canCancel => statut == WithdrawalStatus.pending;
}

/// Penalty (Pénalité Propriétaire)
///
/// Représente une pénalité appliquée au propriétaire.
/// Synchronisé avec: model PenaliteProprietaire (schema.prisma)
@freezed
class Penalty with _$Penalty {
  const factory Penalty({
    required String id,
    required String utilisateurId,
    required String reservationId,
    required double montant,
    required String raison,
    required DateTime creeLe,
    DateTime? preleveleLe,
  }) = _Penalty;

  const Penalty._();

  /// Montant formatté
  String get montantFormatte => '${montant.toStringAsFixed(0)} FCFA';

  /// Est prélevée
  bool get isPrelevee => preleveleLe != null;

  /// Est en attente
  bool get isPending => preleveleLe == null;
}
