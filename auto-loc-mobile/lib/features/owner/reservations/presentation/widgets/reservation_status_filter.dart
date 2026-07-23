import 'package:flutter/material.dart';

import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';

/// Enum pour les statuts de réservation
enum ReservationStatus {
  all,
  ongoing,
  completed,
  cancelled,
  dispute,
}

/// Extension pour avoir les labels en français
extension ReservationStatusExtension on ReservationStatus {
  String get label {
    switch (this) {
      case ReservationStatus.all:
        return 'Toutes';
      case ReservationStatus.ongoing:
        return 'En cours';
      case ReservationStatus.completed:
        return 'Terminées';
      case ReservationStatus.cancelled:
        return 'Annulées';
      case ReservationStatus.dispute:
        return 'Litiges';
    }
  }
}

/// Composant de filtres pour les réservations Owner
/// Style: Chips horizontaux avec actif = fond blanc + texte émeraude
class ReservationStatusFilter extends StatelessWidget {
  const ReservationStatusFilter({
    super.key,
    required this.selectedStatus,
    required this.onStatusChanged,
  });

  final ReservationStatus selectedStatus;
  final ValueChanged<ReservationStatus> onStatusChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
        itemCount: ReservationStatus.values.length,
        separatorBuilder: (_, __) => const SizedBox(width: DSSpacing.sm),
        itemBuilder: (context, index) {
          final status = ReservationStatus.values[index];
          final isActive = selectedStatus == status;

          return _FilterChip(
            label: status.label,
            isActive: isActive,
            onTap: () => onStatusChanged(status),
          );
        },
      ),
    );
  }
}

/// Chip individuel pour un statut
class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(
          horizontal: DSSpacing.md,
          vertical: DSSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: isActive ? Colors.white : Colors.white.withOpacity(0.15),
            width: isActive ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: DSTypography.labelMedium.copyWith(
            color: isActive ? Colors.black : DSColors.darkTextSecondary,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }
}
