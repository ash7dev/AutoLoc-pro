import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../theme/glassmorphism.dart';
import '../atoms/buttons/primary_button.dart';
import '../atoms/buttons/text_button.dart';

/// App Dialog
/// Dialog avec glassmorphism pour les confirmations, alertes, etc.
class AppDialog extends StatelessWidget {
  const AppDialog({
    super.key,
    this.title,
    this.message,
    this.content,
    this.icon,
    this.iconColor,
    this.primaryAction,
    this.primaryActionLabel,
    this.secondaryAction,
    this.secondaryActionLabel,
    this.isDanger = false,
  });

  final String? title;
  final String? message;
  final Widget? content;
  final IconData? icon;
  final Color? iconColor;
  final VoidCallback? primaryAction;
  final String? primaryActionLabel;
  final VoidCallback? secondaryAction;
  final String? secondaryActionLabel;
  final bool isDanger;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: Glassmorphism.glassDialog(
        padding: DSSpacing.dialogPaddingAll,
        width: double.infinity,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            if (icon != null) ...[
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (iconColor ?? DSColors.emerald600).withOpacity(0.1),
                ),
                child: Icon(
                  icon,
                  size: 32,
                  color: iconColor ?? DSColors.emerald600,
                ),
              ),
              const SizedBox(height: DSSpacing.lg),
            ],

            // Title
            if (title != null) ...[
              Text(
                title!,
                style: DSTypography.h4.copyWith(
                  color: DSColors.darkTextPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: DSSpacing.sm),
            ],

            // Message
            if (message != null) ...[
              Text(
                message!,
                style: DSTypography.bodyMedium.copyWith(
                  color: DSColors.darkTextSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: DSSpacing.lg),
            ],

            // Custom content
            if (content != null) ...[
              content!,
              const SizedBox(height: DSSpacing.lg),
            ],

            // Actions
            if (primaryAction != null || secondaryAction != null)
              Row(
                children: [
                  // Secondary action
                  if (secondaryAction != null) ...[
                    Expanded(
                      child: AppTextButton(
                        label: secondaryActionLabel ?? 'Annuler',
                        onPressed: secondaryAction,
                        size: ButtonSize.large,
                      ),
                    ),
                    if (primaryAction != null)
                      const SizedBox(width: DSSpacing.sm),
                  ],

                  // Primary action
                  if (primaryAction != null)
                    Expanded(
                      child: PrimaryButton(
                        label: primaryActionLabel ?? 'OK',
                        onPressed: primaryAction,
                        size: ButtonSize.large,
                      ),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  /// Helper pour afficher un dialog de confirmation
  static Future<bool?> showConfirmation(
    BuildContext context, {
    required String title,
    required String message,
    String? confirmLabel,
    String? cancelLabel,
    IconData? icon,
    Color? iconColor,
    bool isDanger = false,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AppDialog(
        title: title,
        message: message,
        icon: icon ?? Icons.help_outline,
        iconColor: iconColor ?? (isDanger ? DSColors.red600 : DSColors.emerald600),
        primaryActionLabel: confirmLabel ?? 'Confirmer',
        primaryAction: () => Navigator.of(context).pop(true),
        secondaryActionLabel: cancelLabel ?? 'Annuler',
        secondaryAction: () => Navigator.of(context).pop(false),
        isDanger: isDanger,
      ),
    );
  }

  /// Helper pour afficher un dialog d'information
  static Future<void> showInfo(
    BuildContext context, {
    required String title,
    required String message,
    String? buttonLabel,
    IconData? icon,
    Color? iconColor,
  }) {
    return showDialog(
      context: context,
      builder: (context) => AppDialog(
        title: title,
        message: message,
        icon: icon ?? Icons.info_outline,
        iconColor: iconColor ?? DSColors.blue600,
        primaryActionLabel: buttonLabel ?? 'OK',
        primaryAction: () => Navigator.of(context).pop(),
      ),
    );
  }

  /// Helper pour afficher un dialog de succès
  static Future<void> showSuccess(
    BuildContext context, {
    required String title,
    required String message,
    String? buttonLabel,
  }) {
    return showDialog(
      context: context,
      builder: (context) => AppDialog(
        title: title,
        message: message,
        icon: Icons.check_circle_outline,
        iconColor: DSColors.success,
        primaryActionLabel: buttonLabel ?? 'OK',
        primaryAction: () => Navigator.of(context).pop(),
      ),
    );
  }

  /// Helper pour afficher un dialog d'erreur
  static Future<void> showError(
    BuildContext context, {
    required String title,
    required String message,
    String? buttonLabel,
  }) {
    return showDialog(
      context: context,
      builder: (context) => AppDialog(
        title: title,
        message: message,
        icon: Icons.error_outline,
        iconColor: DSColors.error,
        primaryActionLabel: buttonLabel ?? 'OK',
        primaryAction: () => Navigator.of(context).pop(),
      ),
    );
  }
}
