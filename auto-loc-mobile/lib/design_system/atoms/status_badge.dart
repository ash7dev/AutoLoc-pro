import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../tokens/ds_radius.dart';

/// Status Badge
/// Badge pour afficher les statuts (réservation, KYC, véhicule...)
/// Utilise les couleurs sémantiques synchronisées avec le backend
class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    required this.type,
    this.icon,
    this.size = BadgeSize.medium,
  });

  final String label;
  final BadgeType type;
  final IconData? icon;
  final BadgeSize size;

  @override
  Widget build(BuildContext context) {
    final colors = _getColors(type);

    final TextStyle textStyle = switch (size) {
      BadgeSize.small => DSTypography.labelSmall,
      BadgeSize.medium => DSTypography.labelMedium,
      BadgeSize.large => DSTypography.labelLarge,
    };

    final EdgeInsetsGeometry padding = switch (size) {
      BadgeSize.small => const EdgeInsets.symmetric(
          horizontal: DSSpacing.xs,
          vertical: DSSpacing.xxs,
        ),
      BadgeSize.medium => DSSpacing.badgePadding,
      BadgeSize.large => const EdgeInsets.symmetric(
          horizontal: DSSpacing.sm,
          vertical: DSSpacing.xs,
        ),
    };

    final double iconSize = switch (size) {
      BadgeSize.small => 12,
      BadgeSize.medium => 14,
      BadgeSize.large => 16,
    };

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: DSRadius.borderRadiusFull,
        border: Border.all(
          color: colors.border,
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: iconSize,
              color: colors.text,
            ),
            const SizedBox(width: DSSpacing.xxs),
          ],
          Text(
            label,
            style: textStyle.copyWith(color: colors.text),
          ),
        ],
      ),
    );
  }

  _BadgeColors _getColors(BadgeType type) {
    return switch (type) {
      // Booking statuses
      BadgeType.confirmed => _BadgeColors(
          background: DSColors.statusConfirmed.withOpacity(0.1),
          border: DSColors.statusConfirmed.withOpacity(0.3),
          text: DSColors.statusConfirmed,
        ),
      BadgeType.pending => _BadgeColors(
          background: DSColors.statusPending.withOpacity(0.1),
          border: DSColors.statusPending.withOpacity(0.3),
          text: DSColors.statusPending,
        ),
      BadgeType.cancelled => _BadgeColors(
          background: DSColors.statusCancelled.withOpacity(0.1),
          border: DSColors.statusCancelled.withOpacity(0.3),
          text: DSColors.statusCancelled,
        ),
      BadgeType.completed => _BadgeColors(
          background: DSColors.statusCompleted.withOpacity(0.1),
          border: DSColors.statusCompleted.withOpacity(0.3),
          text: DSColors.statusCompleted,
        ),
      BadgeType.inProgress => _BadgeColors(
          background: DSColors.statusOngoing.withOpacity(0.1),
          border: DSColors.statusOngoing.withOpacity(0.3),
          text: DSColors.statusOngoing,
        ),

      // KYC statuses
      BadgeType.kycVerified => _BadgeColors(
          background: DSColors.kycVerified.withOpacity(0.1),
          border: DSColors.kycVerified.withOpacity(0.3),
          text: DSColors.kycVerified,
        ),
      BadgeType.kycPending => _BadgeColors(
          background: DSColors.kycPending.withOpacity(0.1),
          border: DSColors.kycPending.withOpacity(0.3),
          text: DSColors.kycPending,
        ),
      BadgeType.kycRejected => _BadgeColors(
          background: DSColors.kycRejected.withOpacity(0.1),
          border: DSColors.kycRejected.withOpacity(0.3),
          text: DSColors.kycRejected,
        ),

      // Vehicle statuses
      BadgeType.available => _BadgeColors(
          background: DSColors.emerald600.withOpacity(0.1),
          border: DSColors.emerald600.withOpacity(0.3),
          text: DSColors.emerald600,
        ),
      BadgeType.unavailable => _BadgeColors(
          background: DSColors.red600.withOpacity(0.1),
          border: DSColors.red600.withOpacity(0.3),
          text: DSColors.red600,
        ),

      // Generic statuses
      BadgeType.success => _BadgeColors(
          background: DSColors.success.withOpacity(0.1),
          border: DSColors.success.withOpacity(0.3),
          text: DSColors.success,
        ),
      BadgeType.error => _BadgeColors(
          background: DSColors.error.withOpacity(0.1),
          border: DSColors.error.withOpacity(0.3),
          text: DSColors.error,
        ),
      BadgeType.warning => _BadgeColors(
          background: DSColors.warning.withOpacity(0.1),
          border: DSColors.warning.withOpacity(0.3),
          text: DSColors.warning,
        ),
      BadgeType.info => _BadgeColors(
          background: DSColors.info.withOpacity(0.1),
          border: DSColors.info.withOpacity(0.3),
          text: DSColors.info,
        ),
      BadgeType.neutral => _BadgeColors(
          background: DSColors.darkSurfaceGlass,
          border: DSColors.darkBorderGlass,
          text: DSColors.darkTextSecondary,
        ),
    };
  }
}

/// Type de badge
enum BadgeType {
  // Booking statuses
  confirmed,
  pending,
  cancelled,
  completed,
  inProgress,

  // KYC statuses
  kycVerified,
  kycPending,
  kycRejected,

  // Vehicle statuses
  available,
  unavailable,

  // Generic statuses
  success,
  error,
  warning,
  info,
  neutral,
}

/// Taille du badge
enum BadgeSize {
  small,
  medium,
  large,
}

class _BadgeColors {
  final Color background;
  final Color border;
  final Color text;

  _BadgeColors({
    required this.background,
    required this.border,
    required this.text,
  });
}
