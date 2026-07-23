import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../features/vehicle/domain/entities/vehicle.dart';

const Color _emerald = Color(0xFF34D399);

/// Vehicle List Item
///
/// Item de véhicule pour la liste verticale Explorer (style Instagram)
/// Design : glassmorphism subtil + compact
///
/// **Usage :**
/// ```dart
/// VehicleListItem(vehicle: vehicle)
/// ```
class VehicleListItem extends StatelessWidget {
  const VehicleListItem({
    super.key,
    required this.vehicle,
  });

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: () => context.push(Routes.vehicleDetailsPath(vehicle.id)),
          borderRadius: BorderRadius.circular(18),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.06),
                  Colors.white.withOpacity(0.03),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.10),
                width: 1,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                child: Row(
                  children: [
                    // Photo à gauche
                    ClipRRect(
                      borderRadius: const BorderRadius.horizontal(
                        left: Radius.circular(18),
                      ),
                      child: CachedNetworkImage(
                        imageUrl: vehicle.photoPrincipale ?? '',
                        width: 130,
                        height: 130,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          width: 130,
                          height: 130,
                          color: Colors.grey.shade900,
                          child: const Center(
                            child: CircularProgressIndicator(
                              color: _emerald,
                              strokeWidth: 2,
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          width: 130,
                          height: 130,
                          color: Colors.grey.shade900,
                          child: Icon(
                            Icons.directions_car_rounded,
                            size: 40,
                            color: Colors.white.withOpacity(0.3),
                          ),
                        ),
                      ),
                    ),

                    // Informations à droite
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Nom
                            Text(
                              vehicle.nomComplet,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.3,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 6),

                            // Ville
                            Row(
                              children: [
                                Icon(
                                  Icons.location_on_rounded,
                                  size: 13,
                                  color: Colors.white.withOpacity(0.5),
                                ),
                                const SizedBox(width: 3),
                                Expanded(
                                  child: Text(
                                    vehicle.ville ?? 'Dakar',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.6),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 10),

                            // Prix et note
                            Row(
                              children: [
                                // Prix
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                      colors: [
                                        _emerald.withOpacity(0.15),
                                        _emerald.withOpacity(0.08),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: _emerald.withOpacity(0.25),
                                      width: 1,
                                    ),
                                  ),
                                  child: Text(
                                    vehicle.prixFormate,
                                    style: const TextStyle(
                                      color: _emerald,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: -0.3,
                                    ),
                                  ),
                                ),

                                const Spacer(),

                                // Note si disponible
                                if (vehicle.note != null && vehicle.note! > 0)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.08),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: Colors.white.withOpacity(0.15),
                                        width: 1,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(
                                          Icons.star_rounded,
                                          color: _emerald,
                                          size: 14,
                                        ),
                                        const SizedBox(width: 3),
                                        Text(
                                          vehicle.note!.toStringAsFixed(1),
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Flèche à droite
                    Padding(
                      padding: const EdgeInsets.only(right: 14),
                      child: Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 16,
                        color: Colors.white.withOpacity(0.4),
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
}
