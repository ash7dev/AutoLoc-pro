/// Withdrawal Status (StatutRetrait dans le backend)
/// Statuts des demandes de retrait
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum WithdrawalStatus {
  pending('EN_ATTENTE'),
  approved('VALIDE'),
  completed('EFFECTUE'),
  rejected('REJETE');

  const WithdrawalStatus(this.value);

  final String value;

  /// Convertit une string en WithdrawalStatus
  static WithdrawalStatus fromString(String value) {
    return WithdrawalStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => WithdrawalStatus.pending,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      WithdrawalStatus.pending => 'En attente',
      WithdrawalStatus.approved => 'Validé',
      WithdrawalStatus.completed => 'Effectué',
      WithdrawalStatus.rejected => 'Rejeté',
    };
  }

  /// Description pour l'utilisateur
  String get description {
    return switch (this) {
      WithdrawalStatus.pending =>
        'Votre demande de retrait est en cours de traitement',
      WithdrawalStatus.approved =>
        'Votre retrait a été validé et sera traité prochainement',
      WithdrawalStatus.completed => 'Le retrait a été effectué avec succès',
      WithdrawalStatus.rejected =>
        'Votre demande de retrait a été rejetée',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
