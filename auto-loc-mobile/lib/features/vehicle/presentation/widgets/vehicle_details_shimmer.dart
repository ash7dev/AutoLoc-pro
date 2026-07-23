import 'package:flutter/material.dart';
import '../../../../design_system/states/skeleton_box.dart';
import '../../../../design_system/tokens/ds_spacing.dart';

/// **VehicleDetailsShimmer**
/// Écran de chargement squelette (Skeleton / Shimmer) pour la page détails,
/// reproduisant fidèlement la structure de la page.
class VehicleDetailsShimmer extends StatelessWidget {
  const VehicleDetailsShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image de couverture squelette
          const SkeletonBox(
            width: double.infinity,
            height: 300,
            borderRadius: BorderRadius.zero,
          ),

          Padding(
            padding: const EdgeInsets.all(DSSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // En-tête : Titre & Note
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SkeletonLine(width: 200, height: 24),
                          const SizedBox(height: DSSpacing.sm),
                          const SkeletonLine(width: 140, height: 12),
                        ],
                      ),
                    ),
                    const SkeletonBox(width: 50, height: 32),
                  ],
                ),
                const SizedBox(height: DSSpacing.lg),

                // Grille de spécifications (3 colonnes)
                Row(
                  children: [
                    Expanded(
                      child: const SkeletonBox(height: 72),
                    ),
                    const SizedBox(width: DSSpacing.sm),
                    Expanded(
                      child: const SkeletonBox(height: 72),
                    ),
                    const SizedBox(width: DSSpacing.sm),
                    Expanded(
                      child: const SkeletonBox(height: 72),
                    ),
                  ],
                ),
                const SizedBox(height: DSSpacing.lg),

                // Titre section Équipements
                const SkeletonLine(width: 120, height: 16),
                const SizedBox(height: DSSpacing.sm),

                // Éléments équipements
                Wrap(
                  spacing: DSSpacing.sm,
                  runSpacing: DSSpacing.sm,
                  children: const [
                    SkeletonBox(width: 130, height: 36),
                    SkeletonBox(width: 110, height: 36),
                    SkeletonBox(width: 140, height: 36),
                    SkeletonBox(width: 120, height: 36),
                  ],
                ),
                const SizedBox(height: DSSpacing.lg),

                // Titre section Tarification
                const SkeletonLine(width: 140, height: 16),
                const SizedBox(height: DSSpacing.sm),

                // Paliers tarifs
                const SkeletonBox(width: double.infinity, height: 64),
                const SizedBox(height: DSSpacing.sm),
                const SkeletonBox(width: double.infinity, height: 64),
                const SizedBox(height: DSSpacing.lg),

                // Titre section Règles
                const SkeletonLine(width: 160, height: 16),
                const SizedBox(height: DSSpacing.sm),
                const SkeletonBox(width: double.infinity, height: 80),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
