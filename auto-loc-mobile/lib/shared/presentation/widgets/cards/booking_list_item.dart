import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../features/booking/domain/entities/booking.dart';
import '../badges/booking_status_badge.dart';

const Color _emerald = Color(0xFF34D399);

/// Booking List Item
///
/// Item de réservation pour la liste verticale avec design glassmorphism.
class BookingListItem extends StatelessWidget {
  const BookingListItem({
    super.key,
    required this.booking,
    this.vehicleName,
    this.vehiclePhoto,
  });

  final Booking booking;
  final String? vehicleName;
  final String? vehiclePhoto;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: () => context.push(Routes.bookingDetailsPath(booking.id)),
          borderRadius: BorderRadius.circular(20),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.08),
                  Colors.white.withOpacity(0.03),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.12),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                  spreadRadius: -5,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Column(
                  children: [
                    // Photo du véhicule + Status badge
                    Stack(
                      children: [
                        // Photo
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(19),
                          ),
                          child: vehiclePhoto != null
                              ? CachedNetworkImage(
                                  imageUrl: vehiclePhoto!,
                                  width: double.infinity,
                                  height: 140,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    width: double.infinity,
                                    height: 140,
                                    color: Colors.grey.shade900,
                                    child: const Center(
                                      child: CircularProgressIndicator(
                                        color: _emerald,
                                        strokeWidth: 2,
                                      ),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) =>
                                      _buildPlaceholder(),
                                )
                              : _buildPlaceholder(),
                        ),

                        // Status badge en haut à droite
                        Positioned(
                          top: 10,
                          right: 10,
                          child: BookingStatusBadge(
                            status: booking.statut,
                            size: BadgeSize.small,
                          ),
                        ),
                      ],
                    ),

                    // Informations
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Nom du véhicule
                          Text(
                            vehicleName ?? 'Véhicule',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.3,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 10),

                          // Dates
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today_rounded,
                                size: 14,
                                color: Colors.white.withOpacity(0.5),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  _formatDateRange(),
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          // Durée
                          Row(
                            children: [
                              Icon(
                                Icons.access_time_rounded,
                                size: 14,
                                color: Colors.white.withOpacity(0.5),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '${booking.nombreJours} jour${booking.nombreJours > 1 ? 's' : ''}',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 12),

                          // Prix + Flèche
                          Row(
                            children: [
                              // Prix
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [
                                      _emerald.withOpacity(0.2),
                                      _emerald.withOpacity(0.1),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: _emerald.withOpacity(0.3),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  '${_formatPrice(booking.totalLocataire)} FCFA',
                                  style: const TextStyle(
                                    color: _emerald,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                              ),

                              const Spacer(),

                              // Flèche
                              Icon(
                                Icons.arrow_forward_ios_rounded,
                                size: 16,
                                color: Colors.white.withOpacity(0.4),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: double.infinity,
      height: 140,
      color: Colors.grey.shade900,
      child: Icon(
        Icons.directions_car_rounded,
        size: 50,
        color: Colors.white.withOpacity(0.3),
      ),
    );
  }

  String _formatDateRange() {
    final formatter = DateFormat('dd MMM', 'fr_FR');
    final debut = formatter.format(booking.dateDebut);
    final fin = formatter.format(booking.dateFin);
    return '$debut → $fin';
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]} ',
        );
  }
}
