import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../../core/utils/formatters/money_formatter.dart';

/// Price Text
/// Affiche un prix formaté en FCFA avec différentes variantes
/// Utilise la couleur emerald pour mettre en valeur
class PriceText extends StatelessWidget {
  const PriceText({
    super.key,
    required this.amount,
    this.size = PriceSize.medium,
    this.period,
    this.showCurrency = true,
    this.color,
    this.crossedOut = false,
  });

  final int amount;
  final PriceSize size;
  final String? period; // e.g., "/jour", "/mois"
  final bool showCurrency;
  final Color? color;
  final bool crossedOut;

  @override
  Widget build(BuildContext context) {
    final TextStyle priceStyle = switch (size) {
      PriceSize.small => DSTypography.priceSmall,
      PriceSize.medium => DSTypography.price,
      PriceSize.large => DSTypography.priceLarge,
    };

    final TextStyle periodStyle = switch (size) {
      PriceSize.small => DSTypography.bodySmall,
      PriceSize.medium => DSTypography.bodyMedium,
      PriceSize.large => DSTypography.bodyLarge,
    };

    final Color textColor = color ?? DSColors.emerald600;

    // Formater le montant
    final String formattedAmount = MoneyFormatter.format(amount, showCurrency: showCurrency);

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          formattedAmount,
          style: priceStyle.copyWith(
            color: textColor,
            decoration: crossedOut ? TextDecoration.lineThrough : null,
            decorationColor: textColor,
          ),
        ),
        if (period != null) ...[
          const SizedBox(width: DSSpacing.xxs),
          Text(
            period!,
            style: periodStyle.copyWith(
              color: DSColors.darkTextSecondary,
              decoration: crossedOut ? TextDecoration.lineThrough : null,
            ),
          ),
        ],
      ],
    );
  }
}

/// Price Range Text
/// Affiche une fourchette de prix (min - max)
class PriceRangeText extends StatelessWidget {
  const PriceRangeText({
    super.key,
    required this.minAmount,
    required this.maxAmount,
    this.size = PriceSize.medium,
    this.period,
    this.showCurrency = true,
  });

  final int minAmount;
  final int maxAmount;
  final PriceSize size;
  final String? period;
  final bool showCurrency;

  @override
  Widget build(BuildContext context) {
    final TextStyle priceStyle = switch (size) {
      PriceSize.small => DSTypography.priceSmall,
      PriceSize.medium => DSTypography.price,
      PriceSize.large => DSTypography.priceLarge,
    };

    final TextStyle periodStyle = switch (size) {
      PriceSize.small => DSTypography.bodySmall,
      PriceSize.medium => DSTypography.bodyMedium,
      PriceSize.large => DSTypography.bodyLarge,
    };

    // Formater les montants
    final String formattedMin = MoneyFormatter.format(minAmount, showCurrency: showCurrency);

    final String formattedMax = MoneyFormatter.format(maxAmount, showCurrency: showCurrency);

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          formattedMin,
          style: priceStyle.copyWith(
            color: DSColors.emerald600,
          ),
        ),
        Text(
          ' - ',
          style: priceStyle.copyWith(
            color: DSColors.darkTextSecondary,
          ),
        ),
        Text(
          formattedMax,
          style: priceStyle.copyWith(
            color: DSColors.emerald600,
          ),
        ),
        if (period != null) ...[
          const SizedBox(width: DSSpacing.xxs),
          Text(
            period!,
            style: periodStyle.copyWith(
              color: DSColors.darkTextSecondary,
            ),
          ),
        ],
      ],
    );
  }
}

/// Taille du prix
enum PriceSize {
  small,
  medium,
  large,
}
