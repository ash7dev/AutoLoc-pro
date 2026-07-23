/// Withdrawal Method (MethodeRetrait dans le backend)
/// Méthodes de retrait disponibles
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum WithdrawalMethod {
  wave('WAVE'),
  orangeMoney('ORANGE_MONEY');

  const WithdrawalMethod(this.value);

  final String value;

  /// Convertit une string en WithdrawalMethod
  static WithdrawalMethod fromString(String value) {
    return WithdrawalMethod.values.firstWhere(
      (method) => method.value == value,
      orElse: () => WithdrawalMethod.wave,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      WithdrawalMethod.wave => 'Wave',
      WithdrawalMethod.orangeMoney => 'Orange Money',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
