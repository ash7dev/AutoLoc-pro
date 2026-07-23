/// Payment Status (StatutPaiement dans le backend)
/// Statuts des paiements
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum PaymentStatus {
  pending('EN_ATTENTE'),
  confirmed('CONFIRME'),
  failed('ECHOUE'),
  refunded('REMBOURSE'),
  pendingRefund('EN_ATTENTE_REMBOURSEMENT');

  const PaymentStatus(this.value);

  final String value;

  /// Convertit une string en PaymentStatus
  static PaymentStatus fromString(String value) {
    return PaymentStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => PaymentStatus.pending,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      PaymentStatus.pending => 'En attente',
      PaymentStatus.confirmed => 'Confirmé',
      PaymentStatus.failed => 'Échoué',
      PaymentStatus.refunded => 'Remboursé',
      PaymentStatus.pendingRefund => 'Remboursement en cours',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
