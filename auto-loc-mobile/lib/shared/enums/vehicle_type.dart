/// Vehicle Type (TypeVehicule dans le backend)
/// Types/catégories de véhicules
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum VehicleType {
  berline('BERLINE'),
  suv('SUV'),
  pickup('PICKUP'),
  minivan('MINIVAN'),
  utilitaire('UTILITAIRE'),
  citadine('CITADINE'),
  monospace('MONOSPACE'),
  minibus('MINIBUS'),
  luxe('LUXE'),
  fourXFour('FOUR_X_FOUR');

  const VehicleType(this.value);

  final String value;

  /// Convertit une string en VehicleType
  static VehicleType fromString(String value) {
    return VehicleType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => VehicleType.berline,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      VehicleType.berline => 'Berline',
      VehicleType.suv => 'SUV',
      VehicleType.pickup => 'Pick-up',
      VehicleType.minivan => 'Minivan',
      VehicleType.utilitaire => 'Utilitaire',
      VehicleType.citadine => 'Citadine',
      VehicleType.monospace => 'Monospace',
      VehicleType.minibus => 'Minibus',
      VehicleType.luxe => 'Luxe',
      VehicleType.fourXFour => '4x4',
    };
  }

  /// Description pour l'utilisateur
  String get description {
    return switch (this) {
      VehicleType.berline => 'Véhicule confortable pour 4-5 personnes',
      VehicleType.suv => 'Véhicule spacieux et polyvalent',
      VehicleType.pickup => 'Véhicule utilitaire avec plateau',
      VehicleType.minivan => 'Véhicule familial spacieux',
      VehicleType.utilitaire => 'Véhicule pour transport de marchandises',
      VehicleType.citadine => 'Petite voiture idéale en ville',
      VehicleType.monospace => 'Grand espace pour familles nombreuses',
      VehicleType.minibus => 'Transport de groupe (7+ personnes)',
      VehicleType.luxe => 'Véhicule haut de gamme',
      VehicleType.fourXFour => 'Véhicule tout-terrain',
    };
  }

  /// Icône associée
  String get icon {
    return switch (this) {
      VehicleType.berline => 'directions_car',
      VehicleType.suv => 'directions_car',
      VehicleType.pickup => 'local_shipping',
      VehicleType.minivan => 'airport_shuttle',
      VehicleType.utilitaire => 'local_shipping',
      VehicleType.citadine => 'directions_car',
      VehicleType.monospace => 'airport_shuttle',
      VehicleType.minibus => 'directions_bus',
      VehicleType.luxe => 'star',
      VehicleType.fourXFour => 'terrain',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
