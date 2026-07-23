import 'package:flutter/material.dart';

import '../../tokens/ds_colors.dart';
import '../../tokens/ds_typography.dart';
import '../../tokens/ds_spacing.dart';
import '../../tokens/ds_radius.dart';
import '../../tokens/ds_elevation.dart';
import '../../tokens/ds_duration.dart';

const Color _emerald = Color(0xFF34D399);
const Color _emeraldDeep = Color(0xFF059669);

/// Primary Button
/// Bouton principal de l'application avec gradient emerald + glow effect
/// Utilisé pour les actions primaires (Réserver, Confirmer, Enregistrer...)
class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.isDisabled = false,
    this.icon,
    this.iconPosition = IconPosition.left,
    this.size = ButtonSize.medium,
    this.fullWidth = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDisabled;
  final IconData? icon;
  final IconPosition iconPosition;
  final ButtonSize size;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    final bool enabled = !isDisabled && !isLoading && onPressed != null;

    // Dimensions selon la taille
    final double height = switch (size) {
      ButtonSize.small => 40.0,
      ButtonSize.medium => 48.0,
      ButtonSize.large => 56.0,
    };

    final EdgeInsetsGeometry padding = switch (size) {
      ButtonSize.small => DSSpacing.buttonSmallPadding,
      ButtonSize.medium => DSSpacing.buttonPadding,
      ButtonSize.large => DSSpacing.buttonLargePadding,
    };

    final TextStyle textStyle = switch (size) {
      ButtonSize.small => DSTypography.buttonSmall,
      ButtonSize.medium => DSTypography.buttonMedium,
      ButtonSize.large => DSTypography.buttonLarge,
    };

    return AnimatedContainer(
      duration: DSDuration.fastDuration,
      width: fullWidth ? double.infinity : null,
      height: height,
      decoration: BoxDecoration(
        borderRadius: DSRadius.borderRadiusButton,
        gradient: enabled
            ? LinearGradient(
                colors: [_emerald, _emeraldDeep],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: enabled ? null : DSColors.darkSurfaceGlass,
        boxShadow: enabled
            ? [
                BoxShadow(
                  color: _emerald.withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: enabled ? onPressed : null,
          borderRadius: DSRadius.borderRadiusButton,
          child: Container(
            padding: padding,
            alignment: Alignment.center,
            child: isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        enabled ? Colors.white : DSColors.darkTextDisabled,
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
    final Color color = enabled ? Colors.white : DSColors.darkTextDisabled;

    if (icon == null) {
      return Text(
        label,
        style: textStyle.copyWith(color: color),
        textAlign: TextAlign.center,
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (iconPosition == IconPosition.left) ...[
          Icon(icon, size: 20, color: color),
          const SizedBox(width: DSSpacing.iconTextSpacing),
        ],
        Text(
          label,
          style: textStyle.copyWith(color: color),
        ),
        if (iconPosition == IconPosition.right) ...[
          const SizedBox(width: DSSpacing.iconTextSpacing),
          Icon(icon, size: 20, color: color),
        ],
      ],
    );
  }
}

/// Taille du bouton
enum ButtonSize {
  small,
  medium,
  large,
}

/// Position de l'icône
enum IconPosition {
  left,
  right,
}
