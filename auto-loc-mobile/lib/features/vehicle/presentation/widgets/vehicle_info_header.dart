import 'package:flutter/material.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

/// **VehicleInfoHeader**
/// Header premium : titre, carte prix hero (glow émeraude) et barre
/// localisation/note en glass neutre pour hiérarchiser l'attention.
class VehicleInfoHeader extends StatelessWidget {
  const VehicleInfoHeader({
    super.key,
    required this.nomComplet,
    required this.ville,
    this.adresse,
    required this.note,
    required this.prixFormateLocataire,
  });

  final String nomComplet;
  final String ville;
  final String? adresse;
  final double note;
  final String prixFormateLocataire;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          nomComplet,
          style: DSTypography.h2.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            height: 1.1,
            letterSpacing: -0.5,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: DSSpacing.md),

        // Localisation + note — glass neutre (contraste volontaire avec le hero)
        PremiumGlassCard(
          radius: PremiumRadius.chip,
          padding: const EdgeInsets.all(DSSpacing.sm),
          child: Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    EmeraldIconChip(
                      icon: Icons.location_on_rounded,
                      size: 36,
                      iconSize: 18,
                      glow: false,
                    ),
                    const SizedBox(width: DSSpacing.sm),
                    Expanded(
                      child: Text(
                        adresse != null ? '$ville, $adresse' : ville,
                        style: DSTypography.bodySmall.copyWith(
                          color: Colors.white.withOpacity(0.9),
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              if (note > 0) ...[
                const SizedBox(width: DSSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: DSColors.amber400.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: DSColors.amber400.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.star_rounded, color: DSColors.amber400, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        note.toStringAsFixed(1),
                        style: DSTypography.bodySmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: DSSpacing.sm),

        // Carte prix — bloc hero, seul élément "accent" fort de l'écran
        PremiumGlassCard(
          radius: PremiumRadius.hero,
          accent: true,
          blur: 10,
          padding: const EdgeInsets.all(DSSpacing.md),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    prixFormateLocataire,
                    style: DSTypography.displaySmall.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      height: 1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'par jour',
                    style: DSTypography.bodyMedium.copyWith(
                      color: Colors.white.withOpacity(0.75),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.14),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_rounded, size: 16, color: Colors.white),
                    const SizedBox(width: 4),
                    Text(
                      'Vérifié',
                      style: DSTypography.labelSmall.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}