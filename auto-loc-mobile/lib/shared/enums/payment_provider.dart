/// Payment Provider (FournisseurPaiement dans le backend)
/// Fournisseurs de paiement disponibles
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum PaymentProvider {
  /// Fournisseur Wave (mobile money Sénégal/Afrique)
  wave('WAVE'),

  /// Orange Money (paiement mobile)
  orangeMoney('ORANGE_MONEY');

  const PaymentProvider(this.value);

  final String value;

  /// Convertit une string en PaymentProvider
  static PaymentProvider fromString(String value) {
    return PaymentProvider.values.firstWhere(
      (provider) => provider.value == value,
      orElse: () => PaymentProvider.wave,
    );
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;

  /// Vérifie si c'est un provider de mobile money
  bool get isMobileMoney => true;

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      PaymentProvider.wave => 'Wave',
      PaymentProvider.orangeMoney => 'Orange Money',
    };
  }

  /// Description pour l'utilisateur
  String get description {
    return switch (this) {
      PaymentProvider.wave => 'Paiement mobile Wave',
      PaymentProvider.orangeMoney => 'Paiement mobile Orange Money',
    };
  }

  /// Icône associée (nom de l'asset)
  String get iconAsset {
    return switch (this) {
      PaymentProvider.wave => 'assets/icons/wave.svg',
      PaymentProvider.orangeMoney => 'assets/icons/orange_money.svg',
    };
  }

  /// Vérifie si le provider est disponible au Sénégal
  bool get isAvailableInSenegal => true;
}
