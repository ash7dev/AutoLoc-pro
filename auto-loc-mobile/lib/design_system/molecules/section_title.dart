import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../atoms/buttons/text_button.dart';
import '../atoms/buttons/primary_button.dart';

/// Section Title
/// Titre de section avec action optionnelle ("Voir tout", etc.)
/// Utilisé dans le feed, les listes, etc.
class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.title,
    this.subtitle,
    this.action,
    this.actionLabel,
    this.icon,
    this.size = SectionTitleSize.medium,
  });

  final String title;
  final String? subtitle;
  final VoidCallback? action;
  final String? actionLabel;
  final IconData? icon;
  final SectionTitleSize size;

  @override
  Widget build(BuildContext context) {
    final TextStyle titleStyle = switch (size) {
      SectionTitleSize.small => DSTypography.h5,
      SectionTitleSize.medium => DSTypography.h4,
      SectionTitleSize.large => DSTypography.h3,
    };

    final TextStyle subtitleStyle = switch (size) {
      SectionTitleSize.small => DSTypography.bodySmall,
      SectionTitleSize.medium => DSTypography.bodyMedium,
      SectionTitleSize.large => DSTypography.bodyLarge,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: DSSpacing.screenPaddingHorizontal,
        vertical: DSSpacing.sm,
      ),
      child: Row(
        children: [
          // Icon
          if (icon != null) ...[
            Icon(
              icon,
              size: 24,
              color: DSColors.emerald600,
            ),
            const SizedBox(width: DSSpacing.sm),
          ],

          // Title & Subtitle
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: titleStyle.copyWith(
                    color: DSColors.darkTextPrimary,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: DSSpacing.xxs),
                  Text(
                    subtitle!,
                    style: subtitleStyle.copyWith(
                      color: DSColors.darkTextSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Action button
          if (action != null && actionLabel != null)
            AppTextButton(
              label: actionLabel!,
              onPressed: action,
              size: ButtonSize.small,
              icon: Icons.arrow_forward,
              iconPosition: IconPosition.right,
            ),
        ],
      ),
    );
  }
}

/// Taille du titre de section
enum SectionTitleSize {
  small,
  medium,
  large,
}
