import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../design_system/components/premium_glass.dart';

/// Vehicle Type Selector
///
/// Sélecteur horizontal de type de véhicule, en tuiles icône + label
/// (au lieu de pills), inspiré d'une référence visuelle (jaune → repris en
/// émeraude ici). Réutilise directement `kVehicleTypes` de
/// `filter_provider.dart` — les mêmes catégories que le filtre.
///
/// **Usage :**
/// ```dart
/// VehicleTypeSelector(
///   selected: filters.type, // '' = Tous
///   onChanged: (type) => onChange(filters.copyWith(type: type)),
/// )
/// ```
class VehicleTypeSelector extends StatelessWidget {
  const VehicleTypeSelector({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final String selected;
  final Function(String) onChanged;

  static const _entries = <_TypeEntry>[
    _TypeEntry(value: '', label: 'Tous', icon: Icons.grid_view_rounded),
    _TypeEntry(
        value: 'CITADINE', label: 'Citadine', icon: Icons.directions_car_rounded),
    _TypeEntry(
        value: 'BERLINE', label: 'Berline', icon: Icons.time_to_leave_rounded),
    _TypeEntry(
        value: 'SUV', label: 'SUV', icon: Icons.directions_car_filled_rounded),
    _TypeEntry(
        value: 'PICKUP', label: 'Pick-up', icon: Icons.local_shipping_rounded),
    _TypeEntry(
        value: 'MINIVAN', label: 'Minivan', icon: Icons.airport_shuttle_rounded),
    _TypeEntry(
        value: 'MONOSPACE',
        label: 'Monospace',
        icon: Icons.directions_bus_rounded),
    _TypeEntry(
        value: 'MINIBUS',
        label: 'Minibus',
        icon: Icons.directions_bus_filled_rounded),
    _TypeEntry(
        value: 'UTILITAIRE',
        label: 'Utilitaire',
        icon: Icons.construction_rounded),
    _TypeEntry(value: 'LUXE', label: 'Luxe', icon: Icons.diamond_rounded),
    _TypeEntry(
        value: 'FOUR_X_FOUR', label: '4x4', icon: Icons.terrain_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 85,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _entries.length,
        separatorBuilder: (context, index) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final entry = _entries[index];
          final isActive = selected == entry.value;
          return _CategoryTile(
            label: entry.label,
            icon: entry.icon,
            isActive: isActive,
            onTap: () {
              HapticFeedback.selectionClick();
              onChanged(entry.value);
            },
          );
        },
      ),
    );
  }
}

class _TypeEntry {
  const _TypeEntry({
    required this.value,
    required this.label,
    required this.icon,
  });

  final String value;
  final String label;
  final IconData icon;
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({
    required this.label,
    required this.icon,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: SizedBox(
          width: 64,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Container avec effet blur (sans glow)
              ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 280),
                    curve: Curves.easeOutCubic,
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      gradient: isActive
                          ? const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [kEmerald, kEmeraldDeep],
                            )
                          : LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Colors.white.withOpacity(0.05),
                                Colors.white.withOpacity(0.02),
                              ],
                            ),
                      border: Border.all(
                        color: isActive
                            ? kEmerald.withOpacity(0.4)
                            : Colors.white.withOpacity(0.12),
                        width: 1.5,
                      ),
                    ),
                    child: Icon(
                      icon,
                      size: 23,
                      color: isActive ? Colors.black87 : Colors.white.withOpacity(0.65),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 5),
              // Label
              Flexible(
                child: AnimatedDefaultTextStyle(
                  duration: const Duration(milliseconds: 280),
                  curve: Curves.easeOutCubic,
                  style: TextStyle(
                    color: isActive ? kEmerald : Colors.white.withOpacity(0.65),
                    fontSize: 10.5,
                    fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                    height: 1.1,
                    letterSpacing: isActive ? -0.2 : 0,
                  ),
                  child: Text(
                    label,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
