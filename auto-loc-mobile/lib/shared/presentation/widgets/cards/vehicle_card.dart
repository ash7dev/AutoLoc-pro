import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../features/vehicle/domain/entities/vehicle.dart';

/// Vehicle Card
///
/// Card rectangulaire de véhicule pour le Home. Même système que le
/// reste de l'app : glass sobre (blur 10, PremiumGlassCard), pas de
/// glow — seul le prix reste en accent chromatique (kEmerald), fidèle
/// au principe hero/sobre appliqué partout ailleurs.
///
/// **Usage :**
/// ```dart
/// VehicleCard(vehicle: vehicle)
/// ```
class VehicleCard extends StatelessWidget {
  const VehicleCard({
    super.key,
    required this.vehicle,
    this.width = 280,
  });

  final Vehicle vehicle;
  final double width;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(PremiumRadius.card),
      child: InkWell(
        onTap: () => context.push(Routes.vehicleDetailsPath(vehicle.id)),
        borderRadius: BorderRadius.circular(PremiumRadius.card),
        child: SizedBox(
          width: width,
          child: PremiumGlassCard(
            radius: PremiumRadius.card,
            blur: 10,
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Photo du véhicule
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(PremiumRadius.card),
                      ),
                      child: CachedNetworkImage(
                        imageUrl: vehicle.photoPrincipale ?? '',
                        height: 168,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          height: 168,
                          color: Colors.white.withOpacity(0.04),
                          child: const Center(
                            child: CircularProgressIndicator(
                              color: kEmerald,
                              strokeWidth: 2,
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          height: 168,
                          color: Colors.white.withOpacity(0.04),
                          child: Icon(
                            Icons.directions_car_rounded,
                            size: 56,
                            color: Colors.white.withOpacity(0.25),
                          ),
                        ),
                      ),
                    ),

                    // Badge note flottant en haut à droite
                    if (vehicle.note != null && vehicle.note! > 0)
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.55),
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(color: kEmerald.withOpacity(0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded, color: kEmerald, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                vehicle.note!.toStringAsFixed(1),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),

                // Informations
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Nom du véhicule
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

                      const SizedBox(height: 10),

                      // Localisation
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(color: Colors.white.withOpacity(0.10)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.location_on_rounded,
                              size: 12,
                              color: Colors.white.withOpacity(0.6),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              vehicle.ville ?? 'Dakar',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.75),
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Prix + Badge d'économies
                      Row(
                        children: [
                          if (vehicle.badgeEconomies != null) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFBBF24).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFFBBF24).withOpacity(0.28)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.trending_down_rounded,
                                    color: Color(0xFFFBBF24),
                                    size: 13,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    vehicle.badgeEconomies!,
                                    style: const TextStyle(
                                      color: Color(0xFFFBBF24),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                          ],
                          const Spacer(),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                vehicle.prixFormateLocataire,
                                style: const TextStyle(
                                  color: kEmerald,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                  height: 1.0,
                                ),
                              ),
                              Text(
                                'par jour',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.45),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  height: 1.2,
                                ),
                              ),
                            ],
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
    );
  }
}