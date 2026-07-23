/// Rôle de l'utilisateur dans l'application
/// Synchronisé avec Prisma enum RoleProfile
enum RoleProfile {
  /// Locataire (loue des véhicules)
  locataire('LOCATAIRE'),
  
  /// Propriétaire (met des véhicules en location)
  proprietaire('PROPRIETAIRE'),
  
  /// Administrateur
  admin('ADMIN'),
  
  /// Support client
  support('SUPPORT');

  const RoleProfile(this.value);
  final String value;

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;

  /// Crée depuis une string Prisma
  static RoleProfile fromPrismaString(String value) {
    return RoleProfile.values.firstWhere(
      (e) => e.value == value,
      orElse: () => RoleProfile.locataire,
    );
  }

  /// Label français pour affichage
  String get label {
    switch (this) {
      case RoleProfile.locataire:
        return 'Locataire';
      case RoleProfile.proprietaire:
        return 'Propriétaire';
      case RoleProfile.admin:
        return 'Administrateur';
      case RoleProfile.support:
        return 'Support';
    }
  }
}
