/// User Role (RoleProfile dans le backend)
/// Rôles des utilisateurs dans l'application
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum UserRole {
  /// Client qui loue un véhicule (valeur par défaut)
  locataire('LOCATAIRE'),

  /// Propriétaire/loueur de véhicule
  proprietaire('PROPRIETAIRE'),

  /// Administrateur système
  admin('ADMIN'),

  /// Support/Modérateur
  support('SUPPORT');

  const UserRole(this.value);

  final String value;

  /// Convertit une string en UserRole
  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => UserRole.locataire,
    );
  }

  /// Vérifie si l'utilisateur est propriétaire
  bool get isOwner => this == UserRole.proprietaire;

  /// Vérifie si l'utilisateur est locataire
  bool get isTenant => this == UserRole.locataire;

  /// Vérifie si l'utilisateur est admin
  bool get isAdmin => this == UserRole.admin;

  /// Vérifie si l'utilisateur est support
  bool get isSupport => this == UserRole.support;

  /// Vérifie si l'utilisateur peut switch de rôle
  /// Selon le backend, seuls LOCATAIRE et PROPRIETAIRE peuvent être switchés
  bool get canSwitch => this == UserRole.locataire || this == UserRole.proprietaire;

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      UserRole.locataire => 'Locataire',
      UserRole.proprietaire => 'Propriétaire',
      UserRole.admin => 'Admin',
      UserRole.support => 'Support',
    };
  }
}
