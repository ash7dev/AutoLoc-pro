/// Dispute Resolution (RésolutionLitige dans le backend)
/// Résolution possible pour un litige arbitré par l'admin
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum DisputeResolution {
  favorLocataire('FAVOR_LOCATAIRE'),
  favorProprietaire('FAVOR_PROPRIO'),
  partage('PARTAGE');

  const DisputeResolution(this.value);

  final String value;

  /// Convertit une string en DisputeResolution
  static DisputeResolution fromString(String value) {
    return DisputeResolution.values.firstWhere(
      (resolution) => resolution.value == value,
      orElse: () => DisputeResolution.partage,
    );
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      DisputeResolution.favorLocataire => 'Favorable au locataire',
      DisputeResolution.favorProprietaire => 'Favorable au propriétaire',
      DisputeResolution.partage => 'Partage des frais',
    };
  }

  /// Est favorable au locataire
  bool get isFavorTenant => this == DisputeResolution.favorLocataire;

  /// Est favorable au propriétaire
  bool get isFavorOwner => this == DisputeResolution.favorProprietaire;

  /// Est un partage
  bool get isShare => this == DisputeResolution.partage;
}
