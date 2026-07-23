import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../atoms/buttons/primary_button.dart';

/// Error View
/// Affiche un état d'erreur avec message et action de retry
class ErrorView extends StatelessWidget {
  const ErrorView({
    super.key,
    required this.message,
    this.title = 'Une erreur est survenue',
    this.icon,
    this.actionLabel,
    this.onRetry,
  });

  final String title;
  final String message;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onRetry;

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
                color: DSColors.red600.withOpacity(0.1),
              ),
              child: Icon(
                icon ?? Icons.error_outline,
                size: 64,
                color: DSColors.red600,
              ),
            ),
            const SizedBox(height: DSSpacing.xl),

            // Title
            Text(
              title,
              style: DSTypography.h4.copyWith(
                color: DSColors.darkTextPrimary,
              ),
              textAlign: TextAlign.center,
            ),

            // Message
            const SizedBox(height: DSSpacing.sm),
            Text(
              message,
              style: DSTypography.bodyMedium.copyWith(
                color: DSColors.darkTextSecondary,
              ),
              textAlign: TextAlign.center,
            ),

            // Retry action
            if (onRetry != null) ...[
              const SizedBox(height: DSSpacing.xl),
              PrimaryButton(
                label: actionLabel ?? 'Réessayer',
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

/// Network Error View
/// État d'erreur réseau spécifique
class NetworkErrorView extends StatelessWidget {
  const NetworkErrorView({
    super.key,
    this.onRetry,
  });

  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return ErrorView(
      title: 'Erreur de connexion',
      message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.',
      icon: Icons.wifi_off,
      onRetry: onRetry,
    );
  }
}

/// Server Error View
/// État d'erreur serveur spécifique
class ServerErrorView extends StatelessWidget {
  const ServerErrorView({
    super.key,
    this.onRetry,
  });

  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return ErrorView(
      title: 'Erreur serveur',
      message: 'Le serveur ne répond pas. Veuillez réessayer plus tard.',
      icon: Icons.cloud_off,
      onRetry: onRetry,
    );
  }
}

/// Not Found View
/// État 404 / ressource non trouvée
class NotFoundView extends StatelessWidget {
  const NotFoundView({
    super.key,
    this.message = 'La ressource demandée n\'a pas été trouvée.',
    this.onGoBack,
  });

  final String message;
  final VoidCallback? onGoBack;

  @override
  Widget build(BuildContext context) {
    return ErrorView(
      title: 'Introuvable',
      message: message,
      icon: Icons.search_off,
      actionLabel: 'Retour',
      onRetry: onGoBack,
    );
  }
}

/// Unauthorized View
/// État 401 / non autorisé
class UnauthorizedView extends StatelessWidget {
  const UnauthorizedView({
    super.key,
    this.message = 'Vous n\'êtes pas autorisé à accéder à cette ressource.',
    this.onLogin,
  });

  final String message;
  final VoidCallback? onLogin;

  @override
  Widget build(BuildContext context) {
    return ErrorView(
      title: 'Accès refusé',
      message: message,
      icon: Icons.lock_outline,
      actionLabel: 'Se connecter',
      onRetry: onLogin,
    );
  }
}
