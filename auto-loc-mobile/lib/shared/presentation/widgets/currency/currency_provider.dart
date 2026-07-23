import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../features/splash/presentation/providers/splash_providers.dart';

/// Currency - Devises supportées
class Currency {
  const Currency({
    required this.code,
    required this.label,
    required this.symbol,
    required this.flag,
    required this.rate,
  });

  final String code;
  final String label;
  final String symbol;
  final String flag;
  final double rate; // Taux de conversion depuis XOF

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Currency &&
          runtimeType == other.runtimeType &&
          code == other.code;

  @override
  int get hashCode => code.hashCode;
}

/// Liste des devises supportées
const kCurrencies = [
  Currency(
    code: 'XOF',
    label: 'Franc CFA',
    symbol: 'FCFA',
    flag: '🇸🇳',
    rate: 1.0,
  ),
  Currency(
    code: 'EUR',
    label: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    rate: 0.00152,
  ),
  Currency(
    code: 'USD',
    label: 'Dollar US',
    symbol: '\$',
    flag: '🇺🇸',
    rate: 0.00166,
  ),
  Currency(
    code: 'GBP',
    label: 'Livre Sterling',
    symbol: '£',
    flag: '🇬🇧',
    rate: 0.00131,
  ),
  Currency(
    code: 'CAD',
    label: 'Dollar Canadien',
    symbol: 'CA\$',
    flag: '🇨🇦',
    rate: 0.00228,
  ),
  Currency(
    code: 'CHF',
    label: 'Franc Suisse',
    symbol: 'CHF',
    flag: '🇨🇭',
    rate: 0.00146,
  ),
];

const _kStorageKey = 'selected_currency';

/// Currency Notifier - Gère la devise sélectionnée
class CurrencyNotifier extends StateNotifier<Currency> {
  CurrencyNotifier(this._prefs) : super(kCurrencies[0]) {
    _loadSavedCurrency();
  }

  final SharedPreferences _prefs;

  void _loadSavedCurrency() {
    final saved = _prefs.getString(_kStorageKey);
    if (saved != null) {
      final currency = kCurrencies.firstWhere(
        (c) => c.code == saved,
        orElse: () => kCurrencies[0],
      );
      state = currency;
    }
  }

  Future<void> setCurrency(Currency currency) async {
    state = currency;
    await _prefs.setString(_kStorageKey, currency.code);
  }

  /// Convertit un montant en XOF vers la devise sélectionnée
  double convert(double amountXOF) {
    return amountXOF * state.rate;
  }

  /// Formate un montant en XOF dans la devise sélectionnée
  String format(double amountXOF) {
    if (state.code == 'XOF') {
      final amount = amountXOF.round();
      return '${_formatNumber(amount)} ${state.symbol}';
    }

    final converted = convert(amountXOF);
    if (state.code == 'EUR' || state.code == 'GBP') {
      return '${converted.toStringAsFixed(2)} ${state.symbol}';
    }
    return '${state.symbol} ${converted.toStringAsFixed(2)}';
  }

  String _formatNumber(int number) {
    final str = number.toString();
    final buffer = StringBuffer();
    var count = 0;

    for (var i = str.length - 1; i >= 0; i--) {
      if (count > 0 && count % 3 == 0) {
        buffer.write(' ');
      }
      buffer.write(str[i]);
      count++;
    }

    return buffer.toString().split('').reversed.join();
  }
}

/// Provider pour la devise sélectionnée
///
/// Utilise le sharedPreferencesProvider de splash_providers.dart
/// qui est override dans main.dart
final currencyProvider = StateNotifierProvider<CurrencyNotifier, Currency>((ref) {
  // Import depuis splash_providers qui est déjà override dans main.dart
  final prefs = ref.watch(sharedPreferencesProvider);
  return CurrencyNotifier(prefs);
});

/// Extension pour faciliter l'utilisation
extension CurrencyRef on WidgetRef {
  /// Devise actuelle
  Currency get currency => watch(currencyProvider);

  /// Change la devise
  Future<void> setCurrency(Currency currency) {
    return read(currencyProvider.notifier).setCurrency(currency);
  }

  /// Convertit un montant XOF
  double convertPrice(double amountXOF) {
    return read(currencyProvider.notifier).convert(amountXOF);
  }

  /// Formate un prix XOF dans la devise sélectionnée
  String formatPrice(double amountXOF) {
    return read(currencyProvider.notifier).format(amountXOF);
  }
}
