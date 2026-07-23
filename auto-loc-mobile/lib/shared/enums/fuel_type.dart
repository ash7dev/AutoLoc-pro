/// Fuel Type (Carburant dans le backend)
/// Types de carburant
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum FuelType {
  essence('ESSENCE'),
  diesel('DIESEL'),
  hybride('HYBRIDE'),
  electrique('ELECTRIQUE');

  const FuelType(this.value);

  final String value;

  /// Convertit une string en FuelType
  static FuelType fromString(String value) {
    return FuelType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => FuelType.essence,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      FuelType.essence => 'Essence',
      FuelType.diesel => 'Diesel',
      FuelType.hybride => 'Hybride',
      FuelType.electrique => 'Électrique',
    };
  }

  /// Vérifie si c'est écologique
  bool get isEcoFriendly =>
      this == FuelType.hybride || this == FuelType.electrique;

  /// Icône associée
  String get icon {
    return switch (this) {
      FuelType.essence => 'local_gas_station',
      FuelType.diesel => 'local_gas_station',
      FuelType.hybride => 'eco',
      FuelType.electrique => 'ev_station',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
