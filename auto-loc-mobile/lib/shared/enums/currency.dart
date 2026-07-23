/// Currency (Devise dans le backend)
/// Devises supportées
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum Currency {
  /// Franc CFA Ouest Africain (devise par défaut au Sénégal)
  xof('XOF'),

  /// Euro
  eur('EUR'),

  /// Dollar US
  usd('USD');

  const Currency(this.value);

  final String value;

  /// Convertit une string en Currency
  static Currency fromString(String value) {
    return Currency.values.firstWhere(
      (currency) => currency.value == value,
      orElse: () => Currency.xof,
    );
  }

  /// Symbole de la devise
  String get symbol {
    return switch (this) {
      Currency.xof => 'FCFA',
      Currency.eur => '€',
      Currency.usd => '\$',
    };
  }

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      Currency.xof => 'Franc CFA',
      Currency.eur => 'Euro',
      Currency.usd => 'Dollar US',
    };
  }

  /// Nom complet de la devise
  String get fullName {
    return switch (this) {
      Currency.xof => 'Franc CFA Ouest Africain',
      Currency.eur => 'Euro',
      Currency.usd => 'Dollar Américain',
    };
  }

  /// Vérifie si c'est la devise principale (FCFA)
  bool get isPrimary => this == Currency.xof;
}
