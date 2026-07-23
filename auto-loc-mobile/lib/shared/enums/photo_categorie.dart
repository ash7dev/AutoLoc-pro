/// Catégorie de photo d'état des lieux
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma (enum CategoriePhoto)
enum PhotoCategorie {
  avant('AVANT'),
  arriere('ARRIERE'),
  coteGauche('COTE_GAUCHE'),
  coteDroit('COTE_DROIT'),
  interieur('INTERIEUR'),
  compteurKm('COMPTEUR_KM'),
  carburant('CARBURANT'),
  autre('AUTRE');

  const PhotoCategorie(this.value);

  final String value;

  /// Convertit une string en PhotoCategorie
  static PhotoCategorie fromString(String value) {
    return PhotoCategorie.values.firstWhere(
      (categorie) => categorie.value == value,
      orElse: () => PhotoCategorie.autre,
    );
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      PhotoCategorie.avant => 'Avant',
      PhotoCategorie.arriere => 'Arrière',
      PhotoCategorie.coteGauche => 'Côté gauche',
      PhotoCategorie.coteDroit => 'Côté droit',
      PhotoCategorie.interieur => 'Intérieur',
      PhotoCategorie.compteurKm => 'Compteur kilométrique',
      PhotoCategorie.carburant => 'Niveau carburant',
      PhotoCategorie.autre => 'Autre',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
