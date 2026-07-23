import 'dart:math';

import 'package:flutter/material.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/vehicle.dart';

/// **VehiclePricingTable**
/// Grille tarifaire dégressive. Même langage visuel que VehicleSpecsGrid /
/// VehicleEquipmentsList / VehicleDetailSpecs : glass sobre (blur 10),
/// icônes sans glow. Le palier le plus avantageux (`isLowest`) se
/// distingue uniquement par la couleur (bordure + texte émeraude),
/// jamais par un effet lumineux.
class VehiclePricingTable extends StatelessWidget {
  const VehiclePricingTable({
    super.key,
    required this.prixParJour,
    required this.tarifs,
  });

  final double prixParJour;
  final List<TarifDuree> tarifs;

  @override
  Widget build(BuildContext context) {
    if (tarifs.isEmpty) {
      return const SizedBox.shrink();
    }

    final basePriceTenant = (prixParJour * 1.15).round();

    final List<Map<String, dynamic>> tenantTiers = tarifs.map((t) {
      final int tenantPrix = (t.prix * 1.15).round();
      return {
        'id': t.id,
        'joursMin': t.joursMin,
        'joursMax': t.joursMax,
        'tenantPrix': tenantPrix,
      };
    }).toList();

    tenantTiers.sort((a, b) => (a['joursMin'] as int).compareTo(b['joursMin'] as int));

    final int maxPrice = basePriceTenant;
    final int minPrice = tenantTiers.map((t) => t['tenantPrix'] as int).reduce(min);
    final bool hasDiscount = maxPrice > minPrice;
    final int maxSavingPct =
        hasDiscount ? (((maxPrice - minPrice) / maxPrice) * 100).round() : 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // En-tête avec icône et ligne
        Row(
          children: [
            const EmeraldIconChip(
              icon: Icons.local_offer_rounded,
              size: 28,
              iconSize: 15,
              glow: false,
            ),
            const SizedBox(width: DSSpacing.xs),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hasDiscount ? 'Tarifs dégressifs' : 'Tarification',
                    style: DSTypography.h5.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  if (hasDiscount) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Économisez jusqu\'à $maxSavingPct% sur les longues durées',
                      style: DSTypography.bodySmall.copyWith(
                        color: Colors.white.withOpacity(0.6),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: DSSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(100),
                color: kEmerald.withOpacity(0.15),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    hasDiscount ? Icons.trending_down_rounded : Icons.local_offer_rounded,
                    color: kEmerald,
                    size: 14,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    hasDiscount ? 'Dégressif' : 'Prix fixe',
                    style: DSTypography.labelSmall.copyWith(
                      color: kEmerald,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.sm),

        // Lignes de paliers
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: EdgeInsets.zero,
          itemCount: tenantTiers.length,
          separatorBuilder: (context, index) => const SizedBox(height: DSSpacing.sm),
          itemBuilder: (context, index) {
            final tier = tenantTiers[index];
            final int joursMin = tier['joursMin'] as int;
            final int? joursMax = tier['joursMax'] as int?;
            final int tenantPrix = tier['tenantPrix'] as int;

            final String durationLabel =
                joursMax != null ? '$joursMin – $joursMax jours' : '$joursMin+ jours';
            final bool isLowest = tenantPrix == minPrice;
            final int savingPct = (((maxPrice - tenantPrix) / maxPrice) * 100).round();
            final int savingFcfa = maxPrice - tenantPrix;

            final double barPct = hasDiscount
                ? (15 + ((maxPrice - tenantPrix) / (maxPrice - minPrice)) * 85)
                : 100.0;

            return PremiumGlassCard(
              radius: PremiumRadius.chip,
              blur: 10,
              accent: isLowest,
              borderWidth: isLowest ? 1.5 : 1,
              padding: const EdgeInsets.all(DSSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      EmeraldIconChip(
                        icon: Icons.access_time_filled_rounded,
                        size: 28,
                        iconSize: 15,
                        glow: false,
                      ),
                      const SizedBox(width: DSSpacing.sm),
                      Text(
                        durationLabel,
                        style: DSTypography.bodyMedium.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const Spacer(),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '$tenantPrix FCFA',
                            style: DSTypography.bodyLarge.copyWith(
                              color: isLowest ? kEmerald : Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          Text(
                            'par jour',
                            style: DSTypography.labelSmall.copyWith(
                              color: Colors.white.withOpacity(0.6),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  if (savingPct > 0) ...[
                    const SizedBox(height: DSSpacing.sm),
                    Row(
                      children: [
                        const SizedBox(width: 36),
                        Expanded(
                          child: Text(
                            'Économisez $savingFcfa FCFA/jour',
                            style: DSTypography.bodySmall.copyWith(
                              color: Colors.white.withOpacity(0.6),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isLowest
                                ? kEmerald.withOpacity(0.15)
                                : Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '-$savingPct%',
                            style: DSTypography.labelSmall.copyWith(
                              color: isLowest ? kEmerald : Colors.white.withOpacity(0.8),
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],

                  const SizedBox(height: DSSpacing.sm),
                  Container(
                    height: 4,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                    alignment: Alignment.centerLeft,
                    child: FractionallySizedBox(
                      widthFactor: barPct / 100.0,
                      child: Container(
                        decoration: BoxDecoration(
                          color: isLowest ? kEmerald : Colors.white.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}