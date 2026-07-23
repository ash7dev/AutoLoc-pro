import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../atoms/buttons/primary_button.dart';

/// Offline View
/// Affiche un état hors ligne avec message et action
class OfflineView extends StatelessWidget {
  const OfflineView({
    super.key,
    this.message,
    this.onRetry,
    this.showRetry = true,
  });

  final String? message;
  final VoidCallback? onRetry;
  final bool showRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: DSSpacing.screenPadding,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: DSColors.amber600.withOpacity(0.1),
              ),
              child: const Icon(
                Icons.cloud_off,
                size: 64,
                color: DSColors.amber600,
              ),
            ),
            const SizedBox(height: DSSpacing.xl),

            // Title
            Text(
              'Hors ligne',
              style: DSTypography.h4.copyWith(
                color: DSColors.darkTextPrimary,
              ),
              textAlign: TextAlign.center,
            ),

            // Message
            const SizedBox(height: DSSpacing.sm),
            Text(
              message ??
                  'Vous n\'êtes pas connecté à internet. Certaines fonctionnalités peuvent être limitées.',
              style: DSTypography.bodyMedium.copyWith(
                color: DSColors.darkTextSecondary,
              ),
              textAlign: TextAlign.center,
            ),

            // Retry action
            if (showRetry && onRetry != null) ...[
              const SizedBox(height: DSSpacing.xl),
              PrimaryButton(
                label: 'Réessayer',
                onPressed: onRetry,
                size: ButtonSize.large,
                icon: Icons.refresh,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Offline Banner
/// Bannière pour indiquer l'état hors ligne (sticky top)
class OfflineBanner extends StatelessWidget {
  const OfflineBanner({
    super.key,
    this.message = 'Vous êtes hors ligne',
  });

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: DSSpacing.md,
        vertical: DSSpacing.sm,
      ),
      decoration: const BoxDecoration(
        color: DSColors.amber600,
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            const Icon(
              Icons.cloud_off,
              size: 16,
              color: Colors.white,
            ),
            const SizedBox(width: DSSpacing.xs),
            Expanded(
              child: Text(
                message,
                style: DSTypography.labelSmall.copyWith(
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Offline Indicator
/// Petit indicateur pour afficher l'état hors ligne (dans la navigation, etc.)
class OfflineIndicator extends StatelessWidget {
  const OfflineIndicator({
    super.key,
    this.size = 8,
  });

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: DSColors.amber600,
      ),
    );
  }
}
