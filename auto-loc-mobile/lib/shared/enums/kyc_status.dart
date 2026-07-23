/// Statut de vérification KYC (Know Your Customer)
/// Synchronisé avec Prisma enum StatutKyc
enum KycStatus {
  /// Utilisateur non vérifié (initial)
  notVerified('NON_VERIFIE'),
  
  /// Documents soumis, en attente de validation admin
  pending('EN_ATTENTE'),
  
  /// KYC vérifié et approuvé
  verified('VERIFIE'),
  
  /// KYC rejeté par l'admin
  rejected('REJETE');

  const KycStatus(this.value);
  final String value;

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;

  /// Crée depuis une string Prisma
  static KycStatus fromPrismaString(String value) {
    return KycStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => KycStatus.notVerified,
    );
  }

  /// Label français pour affichage
  String get label {
    switch (this) {
      case KycStatus.notVerified:
        return 'Non vérifié';
      case KycStatus.pending:
        return 'En attente';
      case KycStatus.verified:
        return 'Vérifié';
      case KycStatus.rejected:
        return 'Rejeté';
    }
  }
}
