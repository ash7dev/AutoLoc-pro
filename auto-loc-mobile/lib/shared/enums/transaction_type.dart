/// Transaction Type (TypeTransactionWallet dans le backend)
/// Types de transactions wallet
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum TransactionType {
  creditRental('CREDIT_LOCATION'),
  debitPenalty('DEBIT_PENALITE'),
  debitWithdrawal('DEBIT_RETRAIT');

  const TransactionType(this.value);

  final String value;

  /// Convertit une string en TransactionType
  static TransactionType fromString(String value) {
    return TransactionType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => TransactionType.creditRental,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      TransactionType.creditRental => 'Revenus location',
      TransactionType.debitPenalty => 'Pénalité',
      TransactionType.debitWithdrawal => 'Retrait',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
