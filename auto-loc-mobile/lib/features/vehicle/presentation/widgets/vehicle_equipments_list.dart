import 'package:flutter/material.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

class VehicleEquipmentsList extends StatelessWidget {
  const VehicleEquipmentsList({super.key, required this.equipements});
  final List<String> equipements;

  IconData _getEquipmentIcon(String name) {
    final n = name.toLowerCase();
    if (n.contains('clim')) return Icons.ac_unit_rounded;
    if (n.contains('gps') || n.contains('navig')) return Icons.navigation_rounded;
    if (n.contains('blue')) return Icons.bluetooth_rounded;
    if (n.contains('cam') || n.contains('recul')) return Icons.photo_camera_back_rounded;
    if (n.contains('bébé') || n.contains('enfant')) return Icons.child_care_rounded;
    if (n.contains('secours') || n.contains('roue')) return Icons.album_rounded;
    if (n.contains('cuir') || n.contains('siège')) return Icons.chair_rounded;
    if (n.contains('régulateur') || n.contains('vitesse')) return Icons.speed_rounded;
    if (n.contains('radar') || n.contains('stationn')) return Icons.sensors_rounded;
    if (n.contains('toit')) return Icons.wb_sunny_rounded;
    if (n.contains('vitre') || n.contains('teint')) return Icons.opacity_rounded;
    return Icons.check_circle_outline_rounded;
  }

  @override
  Widget build(BuildContext context) {
    if (equipements.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const EmeraldIconChip(
              icon: Icons.build_circle_outlined,
              size: 28,
              iconSize: 15,
              glow: false,
            ),
            const SizedBox(width: DSSpacing.xs),
            Text(
              'Équipements',
              style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w900),
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
        Wrap(
          spacing: DSSpacing.sm,
          runSpacing: DSSpacing.sm,
          children: equipements.map((name) {
            return PremiumGlassCard(
              radius: PremiumRadius.chip,
              padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.sm),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  EmeraldIconChip(
                    icon: _getEquipmentIcon(name),
                    size: 28,
                    iconSize: 15,
                    glow: false,
                  ),
                  const SizedBox(width: DSSpacing.sm),
                  Text(
                    name,
                    style: DSTypography.bodyMedium.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}