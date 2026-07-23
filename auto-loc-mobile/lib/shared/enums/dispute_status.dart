/// Dispute Status (StatutLitige dans le backend)
/// Statuts possibles pour un litige
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum DisputeStatus {
  enAttente('EN_ATTENTE'),
  enCours('EN_COURS'),
  resolu('RESOLU'),
  rejete('REJETE');

  const DisputeStatus(this.value);

  final String value;

  /// Convertit une string en DisputeStatus
  static DisputeStatus fromString(String value) {
    return DisputeStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => DisputeStatus.enAttente,
    );
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      DisputeStatus.enAttente => 'En attente',
      DisputeStatus.enCours => 'En cours',
      DisputeStatus.resolu => 'Résolu',
      DisputeStatus.rejete => 'Rejeté',
    };
  }

  /// Est en attente
  bool get isPending => this == DisputeStatus.enAttente;

  /// Est en cours de traitement
  bool get isInProgress => this == DisputeStatus.enCours;

  /// Est résolu
  bool get isResolved => this == DisputeStatus.resolu;

  /// Est rejeté
  bool get isRejected => this == DisputeStatus.rejete;

  /// Est terminé (résolu ou rejeté)
  bool get isClosed => this == DisputeStatus.resolu || this == DisputeStatus.rejete;
}
