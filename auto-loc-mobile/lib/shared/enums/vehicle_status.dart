/// Vehicle Status (StatutVehicule dans le backend)
/// Statuts des véhicules
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum VehicleStatus {
  /// Véhicule non finalisé (édition en cours)
  draft('BROUILLON'),

  /// Véhicule soumis pour validation admin (valeur par défaut)
  pendingValidation('EN_ATTENTE_VALIDATION'),

  /// Véhicule approuvé et visible sur la plateforme
  verified('VERIFIE'),

  /// Véhicule temporairement suspendu
  suspended('SUSPENDU'),

  /// Véhicule archivé/retiré
  archived('ARCHIVE');

  const VehicleStatus(this.value);

  final String value;

  /// Convertit une string en VehicleStatus
  static VehicleStatus fromString(String value) {
    return VehicleStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => VehicleStatus.pendingValidation,
    );
  }

  /// Vérifie si le véhicule est visible sur la plateforme
  bool get isVisible =>
      this == VehicleStatus.verified ||
      this == VehicleStatus.pendingValidation;

  /// Vérifie si le véhicule peut être réservé
  bool get isBookable => this == VehicleStatus.verified;

  /// Vérifie si le véhicule peut être modifié
  bool get isEditable =>
      this == VehicleStatus.draft || this == VehicleStatus.pendingValidation;

  /// Vérifie si le véhicule est actif (pas archivé ni suspendu)
  bool get isActive =>
      this != VehicleStatus.archived && this != VehicleStatus.suspended;

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      VehicleStatus.draft => 'Brouillon',
      VehicleStatus.pendingValidation => 'En attente de validation',
      VehicleStatus.verified => 'Vérifié',
      VehicleStatus.suspended => 'Suspendu',
      VehicleStatus.archived => 'Archivé',
    };
  }

  /// Description pour le propriétaire
  String get ownerDescription {
    return switch (this) {
      VehicleStatus.draft =>
        'Votre véhicule est en cours d\'édition. Finalisez-le pour le soumettre à validation.',
      VehicleStatus.pendingValidation =>
        'Votre véhicule est en cours de vérification par notre équipe.',
      VehicleStatus.verified =>
        'Votre véhicule est approuvé et visible sur la plateforme.',
      VehicleStatus.suspended =>
        'Votre véhicule a été temporairement suspendu. Contactez le support pour plus d\'informations.',
      VehicleStatus.archived =>
        'Votre véhicule est archivé et n\'est plus visible sur la plateforme.',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
