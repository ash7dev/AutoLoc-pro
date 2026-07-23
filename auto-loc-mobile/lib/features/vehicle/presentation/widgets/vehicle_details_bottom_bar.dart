import 'dart:ui';

import 'package:flutter/material.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

/// **VehicleDetailsBottomBar**
/// Barre fixe en bas de page : prix de départ + bouton "Réserver".
/// Glass sobre (blur 10, comme le reste de l'écran) — pas de glow,
/// pas d'accent card ici, l'attention doit revenir au CTA lui-même.
class VehicleDetailsBottomBar extends StatelessWidget {
  const VehicleDetailsBottomBar({
    super.key,
    required this.formattedPrice,
    required this.onReservePressed,
  });

  final String formattedPrice;
  final VoidCallback onReservePressed;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(DSSpacing.md),
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(
                color: Colors.white.withOpacity(0.15),
                width: 1,
              ),
            ),
            color: Colors.black.withOpacity(0.3),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Prix par jour',
                        style: DSTypography.bodySmall.copyWith(
                          color: Colors.white.withOpacity(0.6),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        formattedPrice,
                        style: DSTypography.h4.copyWith(
                          color: kEmerald,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: DSSpacing.md),
                Expanded(
                  child: PrimaryButton(
                    label: 'Réserver',
                    onPressed: onReservePressed,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}