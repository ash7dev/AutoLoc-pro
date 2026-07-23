import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/owner_reservation.dart';

/// Card premium pour afficher une réservation Owner
/// Design: Glassmorphisme avec blur 10, photo véhicule, infos locataire, montants
class OwnerReservationCard extends StatelessWidget {
  const OwnerReservationCard({
    super.key,
    required this.reservation,
    this.onTap,
  });

  final OwnerReservation reservation;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.15),
                width: 1.5,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header avec photo véhicule
                _VehicleHeader(reservation: reservation),

                Padding(
                  padding: const EdgeInsets.all(DSSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Infos locataire
                      _TenantInfo(reservation: reservation),

                      const SizedBox(height: DSSpacing.md),

                      // Dates de location
                      _ReservationDates(reservation: reservation),

                      const SizedBox(height: DSSpacing.md),

                      // Divider
                      Container(
                        height: 1,
                        color: Colors.white.withOpacity(0.1),
                      ),

                      const SizedBox(height: DSSpacing.md),

                      // Montants et statut
                      _AmountAndStatus(reservation: reservation),
                    ],
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

/// Header avec photo du véhicule et badge statut
class _VehicleHeader extends StatelessWidget {
  const _VehicleHeader({required this.reservation});

  final OwnerReservation reservation;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Photo du véhicule
        Container(
          height: 160,
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(20),
            ),
          ),
          child: reservation.vehiculePhoto != null
              ? Image.network(
                  reservation.vehiculePhoto!,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _VehiclePlaceholder(
                    vehicleName: reservation.vehiculeNom,
                  ),
                )
              : _VehiclePlaceholder(vehicleName: reservation.vehiculeNom),
        ),

        // Gradient overlay
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.7),
                ],
              ),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(20),
              ),
            ),
          ),
        ),

        // Nom du véhicule
        Positioned(
          bottom: DSSpacing.md,
          left: DSSpacing.lg,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                reservation.vehiculeNom,
                style: DSTypography.h4.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (reservation.vehiculeImmatriculation != null)
                Text(
                  reservation.vehiculeImmatriculation!,
                  style: DSTypography.bodySmall.copyWith(
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
            ],
          ),
        ),

        // Badge statut
        Positioned(
          top: DSSpacing.md,
          right: DSSpacing.md,
          child: _StatusBadge(reservation: reservation),
        ),
      ],
    );
  }
}

/// Placeholder pour photo véhicule manquante
class _VehiclePlaceholder extends StatelessWidget {
  const _VehiclePlaceholder({required this.vehicleName});

  final String vehicleName;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: DSColors.emerald600.withOpacity(0.2),
      child: Center(
        child: Icon(
          Icons.directions_car,
          size: 48,
          color: DSColors.emerald600,
        ),
      ),
    );
  }
}

/// Badge de statut avec couleur
class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.reservation});

  final OwnerReservation reservation;

  Color get statusColor {
    if (reservation.isEnCours) return DSColors.emerald600;
    if (reservation.isTerminee) return DSColors.success;
    if (reservation.isAnnulee) return DSColors.error;
    if (reservation.isLitige) return DSColors.warning;
    return DSColors.darkTextSecondary;
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: DSSpacing.sm,
            vertical: DSSpacing.xs,
          ),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: statusColor.withOpacity(0.4),
              width: 1,
            ),
          ),
          child: Text(
            reservation.statusLabel,
            style: DSTypography.labelSmall.copyWith(
              color: statusColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

/// Infos du locataire avec avatar
class _TenantInfo extends StatelessWidget {
  const _TenantInfo({required this.reservation});

  final OwnerReservation reservation;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Avatar locataire
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: DSColors.emerald600.withOpacity(0.2),
            border: Border.all(
              color: DSColors.emerald600.withOpacity(0.3),
              width: 1.5,
            ),
          ),
          child: reservation.locatairePhoto != null
              ? ClipOval(
                  child: Image.network(
                    reservation.locatairePhoto!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Icon(
                      Icons.person,
                      color: DSColors.emerald600,
                      size: 20,
                    ),
                  ),
                )
              : Icon(
                  Icons.person,
                  color: DSColors.emerald600,
                  size: 20,
                ),
        ),

        const SizedBox(width: DSSpacing.sm),

        // Nom et téléphone
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                reservation.locataireNomComplet,
                style: DSTypography.labelLarge.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (reservation.locataireTelephone != null)
                Text(
                  reservation.locataireTelephone!,
                  style: DSTypography.bodySmall.copyWith(
                    color: DSColors.darkTextSecondary,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Dates de la réservation
class _ReservationDates extends StatelessWidget {
  const _ReservationDates({required this.reservation});

  final OwnerReservation reservation;

  String _formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy', 'fr_FR').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          Icons.calendar_today,
          size: 16,
          color: DSColors.emerald600,
        ),
        const SizedBox(width: DSSpacing.xs),
        Text(
          '${_formatDate(reservation.dateDebut)} → ${_formatDate(reservation.dateFin)}',
          style: DSTypography.bodyMedium.copyWith(
            color: Colors.white,
          ),
        ),
        const SizedBox(width: DSSpacing.sm),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: DSSpacing.xs,
            vertical: 2,
          ),
          decoration: BoxDecoration(
            color: DSColors.emerald600.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '${reservation.nombreJours}j',
            style: DSTypography.labelSmall.copyWith(
              color: DSColors.emerald600,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

/// Montants et bouton d'action
class _AmountAndStatus extends StatelessWidget {
  const _AmountAndStatus({required this.reservation});

  final OwnerReservation reservation;

  String _formatAmount(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount)} FCFA';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Montant net propriétaire
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Revenu net',
              style: DSTypography.bodySmall.copyWith(
                color: DSColors.darkTextSecondary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              _formatAmount(reservation.netProprietaire),
              style: DSTypography.h4.copyWith(
                color: DSColors.emerald600,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),

        // Bouton d'action rapide (selon le statut)
        if (reservation.statut == 'PAYEE')
          _ActionButton(
            label: 'Confirmer',
            icon: Icons.check_circle_outline,
            color: DSColors.emerald600,
            onTap: () {
              // TODO: Implémenter confirmation
            },
          ),
      ],
    );
  }
}

/// Bouton d'action rapide
class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: DSSpacing.md,
              vertical: DSSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: color.withOpacity(0.4),
                width: 1.5,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 18, color: color),
                const SizedBox(width: DSSpacing.xs),
                Text(
                  label,
                  style: DSTypography.labelMedium.copyWith(
                    color: color,
                    fontWeight: FontWeight.w700,
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
