/// Transaction Direction (SensTransaction dans le backend)
/// Sens d'une transaction (crédit ou débit)
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum TransactionDirection {
  credit('CREDIT'),
  debit('DEBIT');

  const TransactionDirection(this.value);

  final String value;

  /// Convertit une string en TransactionDirection
  static TransactionDirection fromString(String value) {
    return TransactionDirection.values.firstWhere(
      (direction) => direction.value == value,
      orElse: () => TransactionDirection.credit,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      TransactionDirection.credit => 'Crédit',
      TransactionDirection.debit => 'Débit',
    };
  }

  /// Icône associée
  String get icon {
    return switch (this) {
      TransactionDirection.credit => 'arrow_downward',
      TransactionDirection.debit => 'arrow_upward',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
