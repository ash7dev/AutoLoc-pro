import 'package:flutter/material.dart';

import '../../../enums/booking_status.dart';

const Color _emerald = Color(0xFF34D399);
const Color _emeraldDeep = Color(0xFF16A34A);

/// Booking Status Badge
///
/// Badge affichant le statut d'une réservation avec couleurs et icône.
class BookingStatusBadge extends StatelessWidget {
  const BookingStatusBadge({
    super.key,
    required this.status,
    this.size = BadgeSize.medium,
  });

  final BookingStatus status;
  final BadgeSize size;

  @override
  Widget build(BuildContext context) {
    final config = _getStatusConfig(status);
    final isSmall = size == BadgeSize.small;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 4 : 6,
      ),
      decoration: BoxDecoration(
        gradient: config.gradient,
        borderRadius: BorderRadius.circular(isSmall ? 6 : 8),
        border: Border.all(
          color: config.borderColor,
          width: 1,
        ),
        boxShadow: config.hasPulse
            ? [
                BoxShadow(
                  color: config.glowColor.withOpacity(0.3),
                  blurRadius: 8,
                  spreadRadius: 0,
                ),
              ]
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Dot pulsant si nécessaire
          if (config.hasPulse) ...[
            Container(
              width: isSmall ? 6 : 8,
              height: isSmall ? 6 : 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: config.dotColor,
                boxShadow: [
                  BoxShadow(
                    color: config.dotColor.withOpacity(0.5),
                    blurRadius: 4,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
            SizedBox(width: isSmall ? 4 : 6),
          ],
          // Icône
          Icon(
            config.icon,
            size: isSmall ? 12 : 14,
            color: config.textColor,
          ),
          SizedBox(width: isSmall ? 4 : 6),
          // Label
          Text(
            config.label,
            style: TextStyle(
              color: config.textColor,
              fontSize: isSmall ? 11 : 12,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
          ),
        ],
      ),
    );
  }

  _StatusConfig _getStatusConfig(BookingStatus status) {
    switch (status) {
      case BookingStatus.initiated:
        return _StatusConfig(
          label: 'Initiée',
          icon: Icons.pending_outlined,
          gradient: LinearGradient(
            colors: [
              Colors.white.withOpacity(0.12),
              Colors.white.withOpacity(0.06),
            ],
          ),
          borderColor: Colors.white.withOpacity(0.2),
          textColor: Colors.white.withOpacity(0.7),
          dotColor: Colors.white.withOpacity(0.7),
          glowColor: Colors.white,
          hasPulse: false,
        );

      case BookingStatus.waitingPayment:
        return _StatusConfig(
          label: 'À payer',
          icon: Icons.payment_rounded,
          gradient: LinearGradient(
            colors: [
              const Color(0xFFF59E0B).withOpacity(0.15),
              const Color(0xFFEF4444).withOpacity(0.1),
            ],
          ),
          borderColor: const Color(0xFFF59E0B).withOpacity(0.3),
          textColor: const Color(0xFFF59E0B),
          dotColor: const Color(0xFFF59E0B),
          glowColor: const Color(0xFFF59E0B),
          hasPulse: true,
        );

      case BookingStatus.paid:
        return _StatusConfig(
          label: 'Payée',
          icon: Icons.paid_rounded,
          gradient: LinearGradient(
            colors: [
              const Color(0xFF10B981).withOpacity(0.15),
              const Color(0xFF059669).withOpacity(0.1),
            ],
          ),
          borderColor: const Color(0xFF10B981).withOpacity(0.3),
          textColor: const Color(0xFF10B981),
          dotColor: const Color(0xFF10B981),
          glowColor: const Color(0xFF10B981),
          hasPulse: false,
        );

      case BookingStatus.confirmed:
        return _StatusConfig(
          label: 'Confirmée',
          icon: Icons.check_circle_rounded,
          gradient: LinearGradient(
            colors: [
              _emerald.withOpacity(0.15),
              _emeraldDeep.withOpacity(0.1),
            ],
          ),
          borderColor: _emerald.withOpacity(0.3),
          textColor: _emerald,
          dotColor: _emerald,
          glowColor: _emerald,
          hasPulse: false,
        );

      case BookingStatus.inProgress:
        return _StatusConfig(
          label: 'En cours',
          icon: Icons.timer_rounded,
          gradient: LinearGradient(
            colors: [
              const Color(0xFF3B82F6).withOpacity(0.15),
              const Color(0xFF6366F1).withOpacity(0.1),
            ],
          ),
          borderColor: const Color(0xFF3B82F6).withOpacity(0.3),
          textColor: const Color(0xFF3B82F6),
          dotColor: const Color(0xFF3B82F6),
          glowColor: const Color(0xFF3B82F6),
          hasPulse: true,
        );

      case BookingStatus.completed:
        return _StatusConfig(
          label: 'Terminée',
          icon: Icons.check_circle_outline_rounded,
          gradient: LinearGradient(
            colors: [
              Colors.white.withOpacity(0.08),
              Colors.white.withOpacity(0.04),
            ],
          ),
          borderColor: Colors.white.withOpacity(0.15),
          textColor: Colors.white.withOpacity(0.6),
          dotColor: Colors.white.withOpacity(0.6),
          glowColor: Colors.white,
          hasPulse: false,
        );

      case BookingStatus.cancelled:
        return _StatusConfig(
          label: 'Annulée',
          icon: Icons.cancel_rounded,
          gradient: LinearGradient(
            colors: [
              const Color(0xFFEF4444).withOpacity(0.15),
              const Color(0xFFDC2626).withOpacity(0.1),
            ],
          ),
          borderColor: const Color(0xFFEF4444).withOpacity(0.3),
          textColor: const Color(0xFFEF4444),
          dotColor: const Color(0xFFEF4444),
          glowColor: const Color(0xFFEF4444),
          hasPulse: false,
        );

      case BookingStatus.dispute:
        return _StatusConfig(
          label: 'Litige',
          icon: Icons.warning_rounded,
          gradient: LinearGradient(
            colors: [
              const Color(0xFFF97316).withOpacity(0.15),
              const Color(0xFFEA580C).withOpacity(0.1),
            ],
          ),
          borderColor: const Color(0xFFF97316).withOpacity(0.3),
          textColor: const Color(0xFFF97316),
          dotColor: const Color(0xFFF97316),
          glowColor: const Color(0xFFF97316),
          hasPulse: true,
        );
    }
  }
}

class _StatusConfig {
  final String label;
  final IconData icon;
  final Gradient gradient;
  final Color borderColor;
  final Color textColor;
  final Color dotColor;
  final Color glowColor;
  final bool hasPulse;

  _StatusConfig({
    required this.label,
    required this.icon,
    required this.gradient,
    required this.borderColor,
    required this.textColor,
    required this.dotColor,
    required this.glowColor,
    required this.hasPulse,
  });
}

enum BadgeSize { small, medium }
