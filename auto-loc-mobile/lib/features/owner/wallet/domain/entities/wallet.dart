import 'package:freezed_annotation/freezed_annotation.dart';

part 'wallet.freezed.dart';

/// Entité Domain pour le Wallet (Portefeuille)
/// Représente le portefeuille d'un propriétaire avec soldes et statistiques
@freezed
class Wallet with _$Wallet {
  const factory Wallet({
    // Soldes
    required double soldeDisponible, // Solde total disponible
    required double soldeRetirable, // Solde disponible pour retrait (après pénalités)
    required double soldeWave, // Solde via Wave
    required double soldeOrangeMoney, // Solde via Orange Money
    required double enAttente, // Gains en attente (locations en cours)
    required double totalGagne, // Total gagné depuis le début
    // Pénalités
    required double totalPenalites, // Total des pénalités en attente
    required int penaltiesCount, // Nombre de pénalités
    // Historique des transactions (les 10 dernières)
    required List<WalletTransaction> transactions,
  }) = _Wallet;

  const Wallet._();

  /// Calcule le taux de remplissage du wallet (pour progress indicator)
  double get fillPercentage {
    if (totalGagne == 0) return 0.0;
    return (soldeDisponible / totalGagne).clamp(0.0, 1.0);
  }

  /// Vérifie si un retrait est possible
  bool canWithdraw(double amount) {
    return amount > 0 && amount <= soldeRetirable && amount >= 500;
  }

  /// Retourne la méthode de retrait recommandée selon les soldes
  String? get recommendedWithdrawalMethod {
    if (soldeWave > soldeOrangeMoney) return 'WAVE';
    if (soldeOrangeMoney > soldeWave) return 'ORANGE_MONEY';
    return null; // Égalité
  }
}

/// Transaction du wallet
@freezed
class WalletTransaction with _$WalletTransaction {
  const factory WalletTransaction({
    required String id,
    required TransactionType type,
    required TransactionDirection sens,
    required double montant,
    required double soldeApres,
    required DateTime creeLe,
    String? reservationId,
    String? fournisseur, // WAVE, ORANGE_MONEY, null
  }) = _WalletTransaction;

  const WalletTransaction._();

  /// Label user-friendly du type de transaction
  String get typeLabel {
    switch (type) {
      case TransactionType.creditLocation:
        return 'Paiement location';
      case TransactionType.debitPenalite:
        return 'Pénalité';
      case TransactionType.debitRetrait:
        return 'Retrait';
    }
  }

  /// Icône selon le type
  String get iconName {
    switch (type) {
      case TransactionType.creditLocation:
        return 'trending_up';
      case TransactionType.debitPenalite:
        return 'warning';
      case TransactionType.debitRetrait:
        return 'account_balance_wallet';
    }
  }

  /// Couleur selon le sens
  bool get isCredit => sens == TransactionDirection.credit;
}

/// Type de transaction wallet
enum TransactionType {
  creditLocation, // CREDIT_LOCATION
  debitPenalite, // DEBIT_PENALITE
  debitRetrait, // DEBIT_RETRAIT
}

/// Direction de la transaction
enum TransactionDirection {
  credit, // CREDIT
  debit, // DEBIT
}
