/// Type d'avis
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma (enum TypeAvis)
enum ReviewType {
  tenantNotesOwner('LOCATAIRE_NOTE_PROPRIO'),
  ownerNotesTenant('PROPRIO_NOTE_LOCATAIRE');

  const ReviewType(this.value);

  final String value;

  /// Convertit une string en ReviewType
  static ReviewType fromString(String value) {
    return ReviewType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => ReviewType.tenantNotesOwner,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      ReviewType.tenantNotesOwner => 'Locataire note propriétaire',
      ReviewType.ownerNotesTenant => 'Propriétaire note locataire',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
