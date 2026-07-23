import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/vehicle.dart';

const Color _emerald = Color(0xFF34D399);
const Color _emeraldDeep = Color(0xFF059669);

/// **VehicleOwnerCard**
/// Carte affichant les informations du propriétaire du véhicule avec badge KYC,
/// note, nombre d'avis et nombre de locations.
class VehicleOwnerCard extends StatelessWidget {
  const VehicleOwnerCard({
    super.key,
    required this.vehicle,
  });

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    final owner = vehicle.proprietaire;
    final fullName = owner?.nomComplet ?? 'Propriétaire';
    final initial = owner?.initiale ?? 'P';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Titre de section
        Row(
          children: [
            Text(
              'Le propriétaire',
              style: DSTypography.h5.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(width: DSSpacing.sm),
            Expanded(
              child: Container(
                height: 1,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withOpacity(0.2),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.md),

        // Card glassmorphism
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              padding: const EdgeInsets.all(DSSpacing.md),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withOpacity(0.1),
                    Colors.white.withOpacity(0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                  width: 1.5,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar avec gradient
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color(0xFF1E293B),
                          Color(0xFF334155),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        initial,
                        style: DSTypography.h3.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: DSSpacing.md),

                  // Infos propriétaire
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Nom + Badge KYC
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                fullName.isNotEmpty ? fullName : 'Propriétaire',
                                style: DSTypography.bodyLarge.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: DSSpacing.xs),
                            // Badge KYC vérifié
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: _emerald.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: _emerald.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.verified_rounded,
                                    size: 12,
                                    color: _emerald,
                                  ),
                                  const SizedBox(width: 3),
                                  Text(
                                    'KYC',
                                    style: DSTypography.labelSmall.copyWith(
                                      color: _emerald,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 9,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: DSSpacing.xs),

                        // Note + Stats
                        Row(
                          children: [
                            // Note
                            Row(
                              children: [
                                Icon(
                                  Icons.star_rounded,
                                  size: 14,
                                  color: DSColors.amber400,
                                ),
                                const SizedBox(width: 3),
                                Text(
                                  vehicle.note != null
                                      ? vehicle.note!.toStringAsFixed(1)
                                      : '—',
                                  style: DSTypography.bodySmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(width: 3),
                                Text(
                                  '(${vehicle.totalAvis ?? 0} avis)',
                                  style: DSTypography.bodySmall.copyWith(
                                    color: Colors.white.withOpacity(0.5),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: DSSpacing.xs),
                            Text(
                              '•',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.3),
                              ),
                            ),
                            const SizedBox(width: DSSpacing.xs),
                            // Nombre de locations
                            Text(
                              '${vehicle.totalLocations ?? 0} locations',
                              style: DSTypography.bodySmall.copyWith(
                                color: Colors.white.withOpacity(0.7),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: DSSpacing.sm),

                        // Description
                        Text(
                          'Ce véhicule a été inspecté et validé par notre équipe. Le propriétaire dispose d\'un profil vérifié et d\'un KYC valide sur AutoLoc.',
                          style: DSTypography.bodySmall.copyWith(
                            color: Colors.white.withOpacity(0.7),
                            height: 1.5,
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
