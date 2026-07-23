import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../enums/booking_status.dart';

const Color _emerald = Color(0xFF34D399);
const Color _emeraldDeep = Color(0xFF16A34A);

/// Booking Status Filter
///
/// Filtre horizontal pour filtrer les réservations par statut.
/// Design avec effet glow émeraude sur l'élément sélectionné.
class BookingStatusFilter extends StatelessWidget {
  const BookingStatusFilter({
    super.key,
    required this.selectedStatus,
    required this.onStatusChanged,
    this.bookingCounts = const {},
  });

  final BookingStatus? selectedStatus;
  final Function(BookingStatus?) onStatusChanged;
  final Map<BookingStatus?, int> bookingCounts;

  static const _filters = <_FilterItem>[
    _FilterItem(
      status: null,
      label: 'Toutes',
      icon: Icons.list_rounded,
    ),
    _FilterItem(
      status: BookingStatus.confirmed,
      label: 'Confirmées',
      icon: Icons.check_circle_rounded,
    ),
    _FilterItem(
      status: BookingStatus.inProgress,
      label: 'En cours',
      icon: Icons.timer_rounded,
    ),
    _FilterItem(
      status: BookingStatus.completed,
      label: 'Terminées',
      icon: Icons.check_circle_outline_rounded,
    ),
    _FilterItem(
      status: BookingStatus.cancelled,
      label: 'Annulées',
      icon: Icons.cancel_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _filters.length,
        separatorBuilder: (context, index) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final filter = _filters[index];
          final isActive = selectedStatus == filter.status;
          final count = bookingCounts[filter.status] ?? 0;

          return _FilterChip(
            label: filter.label,
            icon: filter.icon,
            count: count,
            isActive: isActive,
            onTap: () {
              HapticFeedback.selectionClick();
              onStatusChanged(filter.status);
            },
          );
        },
      ),
    );
  }
}

class _FilterItem {
  final BookingStatus? status;
  final String label;
  final IconData icon;

  const _FilterItem({
    required this.status,
    required this.label,
    required this.icon,
  });
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.icon,
    required this.count,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final int count;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 280),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: isActive
                ? const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [_emerald, _emeraldDeep],
                  )
                : LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.06),
                      Colors.white.withOpacity(0.03),
                    ],
                  ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isActive
                  ? _emerald.withOpacity(0.4)
                  : Colors.white.withOpacity(0.12),
              width: 1.5,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: _emerald.withOpacity(0.4),
                      blurRadius: 20,
                      spreadRadius: 2,
                      offset: const Offset(0, 4),
                    ),
                    BoxShadow(
                      color: _emerald.withOpacity(0.2),
                      blurRadius: 30,
                      spreadRadius: 0,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icône
              Icon(
                icon,
                size: 24,
                color: isActive ? Colors.black87 : Colors.white.withOpacity(0.65),
              ),
              const SizedBox(height: 6),
              // Label
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 280),
                style: TextStyle(
                  color: isActive ? Colors.black87 : Colors.white.withOpacity(0.65),
                  fontSize: 12,
                  fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                  letterSpacing: isActive ? -0.3 : 0,
                ),
                child: Text(label),
              ),
              // Count badge
              if (count > 0) ...[
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isActive
                        ? Colors.black.withOpacity(0.15)
                        : _emerald.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isActive
                          ? Colors.black.withOpacity(0.2)
                          : _emerald.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    count.toString(),
                    style: TextStyle(
                      color: isActive ? Colors.black87 : _emerald,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
