import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../atoms/buttons/primary_button.dart';

/// Empty View
/// Affiche un état vide avec illustration, message et action optionnelle
class EmptyView extends StatelessWidget {
  const EmptyView({
    super.key,
    required this.title,
    this.message,
    this.icon,
    this.illustration,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? message;
  final IconData? icon;
  final Widget? illustration;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: DSSpacing.screenPadding,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Illustration ou Icon
            if (illustration != null)
              illustration!
            else if (icon != null)
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: DSColors.darkSurfaceGlass,
                ),
                child: Icon(
                  icon,
                  size: 64,
                  color: DSColors.darkTextSecondary,
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
            if (message != null) ...[
              const SizedBox(height: DSSpacing.sm),
              Text(
                message!,
                style: DSTypography.bodyMedium.copyWith(
                  color: DSColors.darkTextSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],

            // Action
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: DSSpacing.xl),
              PrimaryButton(
                label: actionLabel!,
                onPressed: onAction,
                size: ButtonSize.large,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Empty List View
/// État vide spécifique pour les listes
class EmptyListView extends StatelessWidget {
  const EmptyListView({
    super.key,
    required this.message,
    this.icon,
    this.actionLabel,
    this.onAction,
  });

  final String message;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return EmptyView(
      title: 'Aucun résultat',
      message: message,
      icon: icon ?? Icons.inbox_outlined,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }
}

/// No Vehicles View
/// État vide pour la liste de véhicules
class NoVehiclesView extends StatelessWidget {
  const NoVehiclesView({
    super.key,
    this.onExplore,
  });

  final VoidCallback? onExplore;

  @override
  Widget build(BuildContext context) {
    return EmptyView(
      title: 'Aucun véhicule disponible',
      message: 'Il n\'y a pas de véhicules disponibles pour le moment. Essayez de modifier vos critères de recherche.',
      icon: Icons.directions_car_outlined,
      actionLabel: onExplore != null ? 'Explorer' : null,
      onAction: onExplore,
    );
  }
}

/// No Bookings View
/// État vide pour la liste de réservations
class NoBookingsView extends StatelessWidget {
  const NoBookingsView({
    super.key,
    this.onExplore,
  });

  final VoidCallback? onExplore;

  @override
  Widget build(BuildContext context) {
    return EmptyView(
      title: 'Aucune réservation',
      message: 'Vous n\'avez pas encore effectué de réservation. Explorez nos véhicules disponibles.',
      icon: Icons.receipt_long_outlined,
      actionLabel: onExplore != null ? 'Explorer les véhicules' : null,
      onAction: onExplore,
    );
  }
}

/// No Favorites View
/// État vide pour les favoris
class NoFavoritesView extends StatelessWidget {
  const NoFavoritesView({
    super.key,
    this.onExplore,
  });

  final VoidCallback? onExplore;

  @override
  Widget build(BuildContext context) {
    return EmptyView(
      title: 'Aucun favori',
      message: 'Vous n\'avez pas encore ajouté de véhicules à vos favoris.',
      icon: Icons.favorite_border,
      actionLabel: onExplore != null ? 'Explorer' : null,
      onAction: onExplore,
    );
  }
}
