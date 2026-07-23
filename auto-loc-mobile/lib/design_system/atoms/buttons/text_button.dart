import 'package:flutter/material.dart';

import '../../tokens/ds_colors.dart';
import '../../tokens/ds_typography.dart';
import '../../tokens/ds_spacing.dart';
import '../../tokens/ds_radius.dart';
import '../../tokens/ds_duration.dart';
import 'primary_button.dart';

/// Text Button
/// Bouton texte sans background pour les actions tertiaires
/// Utilisé pour les liens, actions moins importantes
class AppTextButton extends StatelessWidget {
  const AppTextButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.isDisabled = false,
    this.icon,
    this.iconPosition = IconPosition.left,
    this.size = ButtonSize.medium,
    this.color,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDisabled;
  final IconData? icon;
  final IconPosition iconPosition;
  final ButtonSize size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final bool enabled = !isDisabled && !isLoading && onPressed != null;

    final EdgeInsetsGeometry padding = switch (size) {
      ButtonSize.small => const EdgeInsets.symmetric(
          horizontal: DSSpacing.sm,
          vertical: DSSpacing.xs,
        ),
      ButtonSize.medium => const EdgeInsets.symmetric(
          horizontal: DSSpacing.md,
          vertical: DSSpacing.sm,
        ),
      ButtonSize.large => const EdgeInsets.symmetric(
          horizontal: DSSpacing.lg,
          vertical: DSSpacing.md,
        ),
    };

    final TextStyle textStyle = switch (size) {
      ButtonSize.small => DSTypography.buttonSmall,
      ButtonSize.medium => DSTypography.buttonMedium,
      ButtonSize.large => DSTypography.buttonLarge,
    };

    return AnimatedOpacity(
      duration: DSDuration.fastDuration,
      opacity: enabled ? 1.0 : 0.5,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: enabled ? onPressed : null,
          borderRadius: DSRadius.borderRadiusSm,
          child: Container(
            padding: padding,
            child: isLoading
                ? SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        color ?? DSColors.emerald600,
                      ),
                    ),
                  )
                : _buildContent(textStyle, enabled),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(TextStyle textStyle, bool enabled) {
    final Color textColor = enabled
        ? (color ?? DSColors.emerald600)
        : DSColors.darkTextDisabled;

    if (icon == null) {
      return Text(
        label,
        style: textStyle.copyWith(color: textColor),
        textAlign: TextAlign.center,
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (iconPosition == IconPosition.left) ...[
          Icon(icon, size: 18, color: textColor),
          const SizedBox(width: DSSpacing.xs),
        ],
        Text(
          label,
          style: textStyle.copyWith(color: textColor),
        ),
        if (iconPosition == IconPosition.right) ...[
          const SizedBox(width: DSSpacing.xs),
          Icon(icon, size: 18, color: textColor),
        ],
      ],
    );
  }
}
