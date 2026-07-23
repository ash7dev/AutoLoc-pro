import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';

/// Loading View
/// Affiche un indicateur de chargement avec un message optionnel
class LoadingView extends StatelessWidget {
  const LoadingView({
    super.key,
    this.message,
    this.size = LoadingSize.medium,
  });

  final String? message;
  final LoadingSize size;

  @override
  Widget build(BuildContext context) {
    final double indicatorSize = switch (size) {
      LoadingSize.small => 24,
      LoadingSize.medium => 32,
      LoadingSize.large => 48,
    };

    final TextStyle textStyle = switch (size) {
      LoadingSize.small => DSTypography.bodySmall,
      LoadingSize.medium => DSTypography.bodyMedium,
      LoadingSize.large => DSTypography.bodyLarge,
    };

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: indicatorSize,
            height: indicatorSize,
            child: const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(
                DSColors.emerald600,
              ),
              strokeWidth: 3,
            ),
          ),
          if (message != null) ...[
            const SizedBox(height: DSSpacing.md),
            Text(
              message!,
              style: textStyle.copyWith(
                color: DSColors.darkTextSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

/// Taille du loading
enum LoadingSize {
  small,
  medium,
  large,
}

/// Loading Overlay
/// Overlay avec loading pour bloquer l'interaction pendant le chargement
class LoadingOverlay extends StatelessWidget {
  const LoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
    this.message,
  });

  final bool isLoading;
  final Widget child;
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(0.5),
              child: LoadingView(
                message: message,
                size: LoadingSize.large,
              ),
            ),
          ),
      ],
    );
  }
}
