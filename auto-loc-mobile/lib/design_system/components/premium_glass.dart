import 'dart:ui';
import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_spacing.dart';
import '../tokens/ds_typography.dart';

/// **Premium Glass**
/// Le bloc glass "signature" : dégradé de fond, bordure subtile,
/// ombre ambiante + halo émeraude optionnel. Utilisé par tous les
/// composants de la fiche véhicule pour garantir une cohérence totale.

/// **Design tokens émeraude — source unique de vérité pour tous les
/// composants "Vehicle Detail" (header, specs, équipements...).**
const Color kEmerald = Color(0xFF34D399);
const Color kEmeraldDeep = Color(0xFF059669);
const Color kEmeraldGlow = Color(0x6634D399); // ~40% opacity glow

/// Rayons cohérents selon l'importance visuelle du bloc.
class PremiumRadius {
  static const double hero = 26;
  static const double card = 22;
  static const double chip = 16;
  static const double icon = 14;
}

/// **PremiumGlassCard**
/// Le bloc glass "signature" : dégradé de fond, bordure subtile,
/// ombre ambiante + halo émeraude optionnel. Utilisé par tous les
/// composants de la fiche véhicule pour garantir une cohérence totale.
class PremiumGlassCard extends StatelessWidget {
  const PremiumGlassCard({
    super.key,
    required this.child,
    this.radius = PremiumRadius.card,
    this.blur = 20,
    this.padding = const EdgeInsets.all(16),
    this.accent = false,
    this.borderWidth = 1.4,
  });

  final Widget child;
  final double radius;
  final double blur;
  final EdgeInsetsGeometry padding;
  final bool accent;
  final double borderWidth;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: accent
                  ? [
                      kEmerald.withOpacity(0.20),
                      kEmeraldDeep.withOpacity(0.10),
                    ]
                  : [
                      Colors.white.withOpacity(0.12),
                      Colors.white.withOpacity(0.05),
                    ],
            ),
            borderRadius: BorderRadius.circular(radius),
            border: Border.all(
              color: accent
                  ? kEmerald.withOpacity(0.35)
                  : Colors.white.withOpacity(0.16),
              width: borderWidth,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.22),
                blurRadius: 24,
                offset: const Offset(0, 10),
              ),
              if (accent)
                BoxShadow(
                  color: kEmerald.withOpacity(0.28),
                  blurRadius: 20,
                  spreadRadius: -2,
                ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}
/// **StatusIconBadge**
/// Icône ronde utilisée pour les états de succès/attente/erreur en fin
/// de formulaire (gates KYC, permis, téléphone...). Remplace les
/// Container 64×64 dupliqués dans chaque écran.
class StatusIconBadge extends StatelessWidget {
  const StatusIconBadge({
    super.key,
    required this.icon,
    this.color = kEmerald,
    this.size = 64,
    this.iconSize = 32,
  });

  final IconData icon;
  final Color color;
  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        border: Border.all(color: color.withOpacity(0.25)),
        borderRadius: BorderRadius.circular(PremiumRadius.icon + 6),
      ),
      alignment: Alignment.center,
      child: Icon(icon, color: color, size: iconSize),
    );
  }
}

/// **InlineErrorBanner**
/// Bandeau d'erreur sobre, réutilisé dans tous les formulaires
/// (gates, checkout...). Remplace les Container rouge dupliqués.
class InlineErrorBanner extends StatelessWidget {
  const InlineErrorBanner({super.key, required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.sm),
      decoration: BoxDecoration(
        color: DSColors.red600.withOpacity(0.1),
        border: Border.all(color: DSColors.red600.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(PremiumRadius.chip),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.error_outline_rounded, color: DSColors.red600, size: 20),
          const SizedBox(width: DSSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: DSTypography.bodySmall.copyWith(color: DSColors.red600, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
/// **EmeraldIconChip**
/// Icône en badge dégradé + glow, réutilisée partout (specs, équipements,
/// header). Évite d'avoir 4 styles d'icônes différents sur la même page.
class EmeraldIconChip extends StatelessWidget {
  const EmeraldIconChip({
    super.key,
    required this.icon,
    this.size = 44,
    this.iconSize = 20,
    this.glow = true,
  });

  final IconData icon;
  final double size;
  final double iconSize;
  final bool glow;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            kEmerald.withOpacity(0.30),
            kEmeraldDeep.withOpacity(0.20),
          ],
        ),
        borderRadius: BorderRadius.circular(PremiumRadius.icon),
        border: Border.all(color: kEmerald.withOpacity(0.4), width: 1.4),
        boxShadow: glow
            ? [
                BoxShadow(
                  color: kEmerald.withOpacity(0.38),
                  blurRadius: 16,
                ),
                BoxShadow(
                  color: kEmerald.withOpacity(0.18),
                  blurRadius: 24,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: Icon(icon, color: kEmerald, size: iconSize),
    );
  }
}