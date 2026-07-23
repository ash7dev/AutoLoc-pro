import 'package:flutter/material.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

/// **VehicleSpecsGrid**
/// Grille de specs sobre : icône discrète + label + valeur.
/// Volontairement en retrait visuellement (pas de glow) pour laisser
/// le prix (header) rester le seul point d'accent fort de l'écran.
class VehicleSpecsGrid extends StatelessWidget {
  const VehicleSpecsGrid({
    super.key,
    this.carburant,
    this.transmission,
    this.nombrePlaces,
    this.joursMinimum,
    this.ageMinimum,
  });

  final String? carburant;
  final String? transmission;
  final int? nombrePlaces;
  final int? joursMinimum;
  final int? ageMinimum;

  @override
  Widget build(BuildContext context) {
    final specItems = [
      if (carburant != null)
        _SpecBadgeData(Icons.local_gas_station_rounded, 'Carburant', _formatCarburant(carburant!)),
      if (transmission != null)
        _SpecBadgeData(Icons.settings_rounded, 'Boîte', _formatTransmission(transmission!)),
      if (nombrePlaces != null)
        _SpecBadgeData(Icons.people_alt_rounded, 'Places', '$nombrePlaces'),
      if (joursMinimum != null)
        _SpecBadgeData(Icons.calendar_month_rounded, 'Durée min.', '${joursMinimum}j'),
      if (ageMinimum != null)
        _SpecBadgeData(Icons.verified_user_rounded, 'Âge min.', '$ageMinimum ans'),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: DSSpacing.sm,
        mainAxisSpacing: DSSpacing.sm,
        childAspectRatio: 0.95,
      ),
      itemCount: specItems.length,
      itemBuilder: (context, index) {
        final item = specItems[index];
        return PremiumGlassCard(
          radius: PremiumRadius.chip,
          blur: 10,
          padding: const EdgeInsets.symmetric(vertical: DSSpacing.sm, horizontal: 4),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              EmeraldIconChip(
                icon: item.icon,
                size: 34,
                iconSize: 17,
                glow: false,
              ),
              const SizedBox(height: 6),
              Text(
                item.label,
                style: DSTypography.labelSmall.copyWith(
                  color: Colors.white.withOpacity(0.55),
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                item.value,
                style: DSTypography.bodyMedium.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatCarburant(String value) => switch (value) {
        'ESSENCE' => 'essence',
        'DIESEL' => 'diesel',
        'HYBRIDE' => 'hybride',
        'ELECTRIQUE' => 'électrique',
        _ => value.toLowerCase(),
      };

  String _formatTransmission(String value) => switch (value) {
        'MANUELLE' => 'manuelle',
        'AUTOMATIQUE' => 'automatique',
        _ => value.toLowerCase(),
      };
}

class _SpecBadgeData {
  final IconData icon;
  final String label;
  final String value;
  _SpecBadgeData(this.icon, this.label, this.value);
}