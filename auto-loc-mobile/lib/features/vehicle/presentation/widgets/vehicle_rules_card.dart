import 'dart:ui';

import 'package:flutter/material.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

const Color _emerald = Color(0xFF34D399);

/// **VehicleRulesCard**
/// Carte affichant les règles d'utilisation spécifiques au véhicule.
class VehicleRulesCard extends StatelessWidget {
  const VehicleRulesCard({
    super.key,
    this.reglesSpecifiques,
  });

  final String? reglesSpecifiques;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const EmeraldIconChip(
              icon: Icons.rule_rounded,
              size: 28,
              iconSize: 15,
              glow: false,
            ),
            const SizedBox(width: DSSpacing.xs),
            Text(
              'Règles spécifiques',
              style: DSTypography.h5.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(width: DSSpacing.xs),
            Expanded(
              child: Container(
                height: 2,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      kEmerald.withOpacity(0.5),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.xs),
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(DSSpacing.md),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white.withOpacity(0.15),
                  width: 1,
                ),
                color: Colors.white.withOpacity(0.08),
              ),
              child: Text(
                reglesSpecifiques != null && reglesSpecifiques!.trim().isNotEmpty
                    ? reglesSpecifiques!
                    : 'Aucune règle spécifique renseignée par le propriétaire.',
                style: DSTypography.bodyMedium.copyWith(
                  color: Colors.white.withOpacity(0.9),
                  fontWeight: FontWeight.w600,
                  height: 1.5,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
