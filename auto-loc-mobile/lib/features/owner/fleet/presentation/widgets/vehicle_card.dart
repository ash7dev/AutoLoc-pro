import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../domain/entities/owner_vehicle.dart';

const kEmerald = Color(0xFF34D399);

/// Card pour afficher un véhicule de la flotte
///
/// Design premium avec glass effect, photo, statut, et infos principales
class VehicleCard extends StatelessWidget {
  final OwnerVehicle vehicle;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const VehicleCard({
    super.key,
    required this.vehicle,
    this.onTap,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: Colors.white.withOpacity(0.08),
            width: 1,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1F1F1F),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Photo + Statut Badge
                  _buildPhotoSection(),

                  // Infos véhicule
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Titre
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                vehicle.fullName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: -0.3,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (!vehicle.estValide)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.orange.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.orange.withOpacity(0.3),
                                  ),
                                ),
                                child: const Text(
                                  'En attente',
                                  style: TextStyle(
                                    color: Colors.orange,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),

                        const SizedBox(height: 4),

                        // Immatriculation
                        Text(
                          vehicle.immatriculation,
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Stats row
                        Row(
                          children: [
                            _buildStatChip(
                              icon: Icons.event_available_rounded,
                              label: '${vehicle.totalReservations}',
                              tooltip: 'Total réservations',
                            ),
                            const SizedBox(width: 8),
                            _buildStatChip(
                              icon: Icons.schedule_rounded,
                              label: '${vehicle.reservationsActives}',
                              tooltip: 'Réservations actives',
                              color: kEmerald,
                            ),
                            const Spacer(),
                            // Prix
                            Text(
                              '${vehicle.prixParJour.toStringAsFixed(0)} FCFA',
                              style: const TextStyle(
                                color: kEmerald,
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.3,
                              ),
                            ),
                            const Text(
                              '/jour',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),

                        // Actions row
                        Row(
                          children: [
                            Expanded(
                              child: _buildActionButton(
                                icon: Icons.edit_rounded,
                                label: 'Modifier',
                                onTap: onEdit,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildActionButton(
                                icon: Icons.visibility_rounded,
                                label: 'Détails',
                                onTap: onTap,
                                isPrimary: true,
                              ),
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
    );
  }

  Widget _buildPhotoSection() {
    return Stack(
      children: [
        // Photo
        Container(
          height: 180,
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.grey.shade900,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(24),
            ),
          ),
          child: vehicle.mainPhoto != null
              ? CachedNetworkImage(
                  imageUrl: vehicle.mainPhoto!,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Center(
                    child: CircularProgressIndicator(
                      color: kEmerald,
                      strokeWidth: 2,
                    ),
                  ),
                  errorWidget: (context, url, error) => _buildPlaceholder(),
                )
              : _buildPlaceholder(),
        ),

        // Gradient overlay
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(24),
              ),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.3),
                  Colors.transparent,
                  Colors.black.withOpacity(0.7),
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),
        ),

        // Statut badge (top right)
        Positioned(
          top: 12,
          right: 12,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Color(int.parse(
                vehicle.statusColor.replaceFirst('#', '0xFF'),
              )).withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Color(int.parse(
                  vehicle.statusColor.replaceFirst('#', '0xFF'),
                )).withOpacity(0.5),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: Color(int.parse(
                      vehicle.statusColor.replaceFirst('#', '0xFF'),
                    )),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  vehicle.statusLabel,
                  style: TextStyle(
                    color: Color(int.parse(
                      vehicle.statusColor.replaceFirst('#', '0xFF'),
                    )),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),

        // Nombre de photos (bottom left)
        if (vehicle.photos.length > 1)
          Positioned(
            bottom: 12,
            left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.image_rounded,
                    color: Colors.white,
                    size: 14,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${vehicle.photos.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: Colors.grey.shade900,
      child: Center(
        child: Icon(
          Icons.directions_car_rounded,
          size: 60,
          color: Colors.grey.shade700,
        ),
      ),
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    required String tooltip,
    Color? color,
  }) {
    final effectiveColor = color ?? Colors.grey.shade600;

    return Tooltip(
      message: tooltip,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: effectiveColor.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: effectiveColor.withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: effectiveColor,
              size: 14,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: effectiveColor,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback? onTap,
    bool isPrimary = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isPrimary
              ? kEmerald.withOpacity(0.15)
              : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isPrimary
                ? kEmerald.withOpacity(0.3)
                : Colors.white.withOpacity(0.1),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isPrimary ? kEmerald : Colors.white70,
              size: 16,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isPrimary ? kEmerald : Colors.white70,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
