import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/tokens/ds_typography.dart';

// Couleurs
const kEmerald = Color(0xFF34D399);

/// Owner Section Header
///
/// Header partagé et réutilisable pour toutes les pages du module Owner.
/// Offre une cohérence visuelle tout en permettant la personnalisation.
///
/// Utilisation :
/// ```dart
/// OwnerSectionHeader(
///   title: 'Ma flotte',
///   subtitle: '12 véhicules',
///   actions: [
///     IconButton(
///       icon: Icon(Icons.add_circle_outline),
///       onPressed: () => context.push(Routes.createVehicle),
///     ),
///   ],
/// )
/// ```
class OwnerSectionHeader extends StatelessWidget {
  /// Titre principal de la section
  final String title;

  /// Sous-titre optionnel (ex: nombre d'éléments, solde, etc.)
  final String? subtitle;

  /// Afficher le bouton retour (false par défaut)
  final bool hasBackButton;

  /// Actions personnalisables à droite (ex: filtres, bouton d'ajout)
  final List<Widget>? actions;

  /// Couleur de fond personnalisée (optionnel)
  final Color? backgroundColor;

  /// Callback personnalisé pour le bouton retour (optionnel)
  final VoidCallback? onBackPressed;

  const OwnerSectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.hasBackButton = false,
    this.actions,
    this.backgroundColor,
    this.onBackPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(
        bottom: Radius.circular(28),
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: backgroundColor ?? Colors.white.withOpacity(0.95),
            borderRadius: const BorderRadius.vertical(
              bottom: Radius.circular(28),
            ),
            border: Border.all(
              color: kEmerald.withOpacity(0.1),
              width: 1,
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
              child: Row(
                children: [
                  // Bouton retour (conditionnel)
                  if (hasBackButton)
                    IconButton(
                      icon: const Icon(Icons.arrow_back_rounded),
                      color: Colors.black87,
                      iconSize: 24,
                      onPressed: onBackPressed ?? () => context.pop(),
                    ),

                  if (hasBackButton) const SizedBox(width: 8),

                  // Titre et sous-titre
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          title,
                          style: DSTypography.h2.copyWith(
                            color: Colors.black87,
                            fontWeight: FontWeight.bold,
                            fontSize: 28,
                            letterSpacing: -0.5,
                          ),
                        ),
                        if (subtitle != null) ...[
                          const SizedBox(height: 6),
                          Text(
                            subtitle!,
                            style: DSTypography.bodyLarge.copyWith(
                              color: Colors.grey.shade600,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  // Actions personnalisées (optionnelles)
                  if (actions != null && actions!.isNotEmpty) ...[
                    const SizedBox(width: 12),
                    ...actions!,
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Action Button pour le header (pré-stylisé)
class OwnerHeaderActionButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color? color;
  final int? badgeCount;

  const OwnerHeaderActionButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.color,
    this.badgeCount,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          decoration: BoxDecoration(
            color: (color ?? kEmerald).withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: IconButton(
            icon: Icon(icon),
            color: color ?? kEmerald,
            iconSize: 22,
            onPressed: onPressed,
          ),
        ),
        // Badge (optionnel)
        if (badgeCount != null && badgeCount! > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 2,
                ),
              ),
              constraints: const BoxConstraints(
                minWidth: 18,
                minHeight: 18,
              ),
              child: Center(
                child: Text(
                  badgeCount! > 9 ? '9+' : badgeCount.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
