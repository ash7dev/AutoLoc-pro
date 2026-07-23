/// Checkin Source (CheckinLocataireSource dans le backend)
/// Source du check-in du locataire
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum CheckinSource {
  manual('MANUEL'),
  tacit('TACITE');

  const CheckinSource(this.value);

  final String value;

  /// Convertit une string en CheckinSource
  static CheckinSource fromString(String value) {
    return CheckinSource.values.firstWhere(
      (source) => source.value == value,
      orElse: () => CheckinSource.manual,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      CheckinSource.manual => 'Manuel',
      CheckinSource.tacit => 'Tacite',
    };
  }

  /// Description
  String get description {
    return switch (this) {
      CheckinSource.manual =>
        'Check-in effectué manuellement par le locataire',
      CheckinSource.tacit =>
        'Check-in tacite (automatique après délai)',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
