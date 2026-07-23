/// Transmission
/// Types de transmission
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum Transmission {
  manuelle('MANUELLE'),
  automatique('AUTOMATIQUE');

  const Transmission(this.value);

  final String value;

  /// Convertit une string en Transmission
  static Transmission fromString(String value) {
    return Transmission.values.firstWhere(
      (type) => type.value == value,
      orElse: () => Transmission.manuelle,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      Transmission.manuelle => 'Manuelle',
      Transmission.automatique => 'Automatique',
    };
  }

  /// Icône associée
  String get icon {
    return switch (this) {
      Transmission.manuelle => 'settings',
      Transmission.automatique => 'autorenew',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
