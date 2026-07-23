import 'package:intl/intl.dart';

/// Formatter pour les montants en FCFA (Franc CFA)
class MoneyFormatter {
  MoneyFormatter._();

  /// Formate un montant en FCFA avec séparateur de milliers
  /// Exemple : 50000 → "50 000 FCFA"
  static String format(
    num amount, {
    bool showCurrency = true,
    bool showDecimals = false,
  }) {
    final formatter = NumberFormat('#,##0', 'fr_FR');
    final formatted = formatter.format(amount);

    // Remplacer la virgule par un espace (style français)
    final withSpaces = formatted.replaceAll(',', ' ');

    if (showCurrency) {
      return '$withSpaces FCFA';
    }

    return withSpaces;
  }

  /// Formate avec décimales (2 chiffres)
  /// Exemple : 50000.50 → "50 000,50 FCFA"
  static String formatWithDecimals(num amount, {bool showCurrency = true}) {
    final formatter = NumberFormat('#,##0.00', 'fr_FR');
    final formatted = formatter.format(amount);

    // Remplacer la virgule par un espace pour les milliers
    // et garder la virgule pour les décimales
    final parts = formatted.split(',');
    if (parts.length == 2) {
      final withSpaces = parts[0].replaceAll(',', ' ');
      final result = '$withSpaces,${parts[1]}';

      if (showCurrency) {
        return '$result FCFA';
      }
      return result;
    }

    if (showCurrency) {
      return '${formatted.replaceAll(',', ' ')} FCFA';
    }
    return formatted.replaceAll(',', ' ');
  }

  /// Formate en notation compacte
  /// Exemple : 50000 → "50K FCFA", 1000000 → "1M FCFA"
  static String formatCompact(num amount, {bool showCurrency = true}) {
    String value;

    if (amount >= 1000000000) {
      value = '${(amount / 1000000000).toStringAsFixed(1)}B';
    } else if (amount >= 1000000) {
      value = '${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      value = '${(amount / 1000).toStringAsFixed(1)}K';
    } else {
      value = amount.toString();
    }

    // Retirer le .0 si c'est un nombre entier
    value = value.replaceAll(RegExp(r'\.0$'), '');

    if (showCurrency) {
      return '$value FCFA';
    }
    return value;
  }

  /// Parse une chaîne formatée en nombre
  /// Exemple : "50 000 FCFA" → 50000
  static double? parse(String formatted) {
    try {
      // Retirer "FCFA" et les espaces
      final cleaned = formatted
          .replaceAll(' FCFA', '')
          .replaceAll('FCFA', '')
          .replaceAll(' ', '')
          .replaceAll(',', '.');

      return double.tryParse(cleaned);
    } catch (e) {
      return null;
    }
  }

  /// Formate un montant par jour
  /// Exemple : 50000 → "50 000 FCFA/jour"
  static String formatPerDay(num amount) {
    return '${format(amount, showCurrency: false)} FCFA/jour';
  }

  /// Formate une fourchette de prix
  /// Exemple : (10000, 50000) → "10 000 - 50 000 FCFA"
  static String formatRange(num min, num max) {
    final minFormatted = format(min, showCurrency: false);
    final maxFormatted = format(max, showCurrency: false);
    return '$minFormatted - $maxFormatted FCFA';
  }

  /// Formate un prix avec réduction
  /// Exemple : (50000, 45000) → "45 000 FCFA  ̶5̶0̶ ̶0̶0̶0̶ ̶F̶C̶F̶A̶"
  static String formatWithDiscount(num originalPrice, num discountedPrice) {
    final discounted = format(discountedPrice);
    final original = format(originalPrice);
    return '$discounted  (était $original)';
  }

  /// Calcule et formate le pourcentage de réduction
  /// Exemple : (50000, 45000) → "-10%"
  static String formatDiscountPercentage(num originalPrice, num discountedPrice) {
    final percentage = ((originalPrice - discountedPrice) / originalPrice * 100);
    return '-${percentage.toStringAsFixed(0)}%';
  }

  /// Formate un total avec détails
  /// Exemple : breakdown({subtotal: 45000, fees: 5000, total: 50000})
  static String formatBreakdown(Map<String, num> breakdown) {
    final buffer = StringBuffer();

    if (breakdown.containsKey('subtotal')) {
      buffer.writeln('Sous-total: ${format(breakdown['subtotal']!)}');
    }

    if (breakdown.containsKey('fees')) {
      buffer.writeln('Frais de service: ${format(breakdown['fees']!)}');
    }

    if (breakdown.containsKey('deposit')) {
      buffer.writeln('Caution: ${format(breakdown['deposit']!)}');
    }

    if (breakdown.containsKey('discount')) {
      buffer.writeln('Réduction: -${format(breakdown['discount']!)}');
    }

    if (breakdown.containsKey('total')) {
      buffer.write('Total: ${format(breakdown['total']!)}');
    }

    return buffer.toString();
  }

  /// Vérifie si un montant est valide
  static bool isValid(num amount) {
    return amount >= 0;
  }

  /// Formate pour input (sans FCFA, avec espaces)
  /// Exemple : 50000 → "50 000"
  static String formatForInput(num amount) {
    return format(amount, showCurrency: false);
  }

  /// Symbole de la devise
  static const String currencySymbol = 'FCFA';

  /// Code de la devise
  static const String currencyCode = 'XOF';

  /// Taux de commission AutoLoc (15%)
  static const double commissionRate = 0.15;

  /// Coefficient pour convertir prix propriétaire en prix locataire
  /// Prix locataire = Prix propriétaire × 1.15
  static const double tenantPriceCoefficient = 1.15;

  /// Convertit le prix propriétaire en prix locataire (avec commission 15%)
  /// Exemple : 50000 FCFA (proprio) → 57500 FCFA (locataire affiché)
  static num applyCommission(num ownerPrice) {
    return (ownerPrice * tenantPriceCoefficient).round();
  }

  /// Formate le prix locataire à partir du prix propriétaire
  /// Exemple : 50000 (prix proprio) → "57 500 FCFA" (prix affiché)
  static String formatTenantPrice(num ownerPrice, {bool showCurrency = true}) {
    final tenantPrice = applyCommission(ownerPrice);
    return format(tenantPrice, showCurrency: showCurrency);
  }

  /// Formate le prix locataire par jour
  /// Exemple : 50000 (prix proprio) → "57 500 FCFA/jour"
  static String formatTenantPricePerDay(num ownerPrice) {
    final tenantPrice = applyCommission(ownerPrice);
    return formatPerDay(tenantPrice);
  }

  /// Calcule l'économie en pourcentage entre deux tarifs progressifs
  /// Exemple : (50000, 45000) → 10 (10% d'économie)
  static int calculateSavingsPercent(num baseOwnerPrice, num discountedOwnerPrice) {
    if (baseOwnerPrice <= discountedOwnerPrice) return 0;
    return ((baseOwnerPrice - discountedOwnerPrice) / baseOwnerPrice * 100).round();
  }

  /// Formate le badge d'économies pour les tarifs progressifs
  /// Exemple : (50000, 45000, 7) → "−10% dès 7j"
  static String formatSavingsBadge(num baseOwnerPrice, num discountedOwnerPrice, int minDays) {
    final savingsPercent = calculateSavingsPercent(baseOwnerPrice, discountedOwnerPrice);
    if (savingsPercent <= 0) return '';
    return '−$savingsPercent% dès ${minDays}j';
  }
}

/// Extension sur num pour faciliter le formatage
extension MoneyFormatterExtension on num {
  /// Formate en FCFA
  String get fcfa => MoneyFormatter.format(this);

  /// Formate en FCFA compact
  String get fcfaCompact => MoneyFormatter.formatCompact(this);

  /// Formate en FCFA par jour
  String get fcfaPerDay => MoneyFormatter.formatPerDay(this);

  /// Formate sans devise
  String get formatNumber => MoneyFormatter.format(this, showCurrency: false);
}
