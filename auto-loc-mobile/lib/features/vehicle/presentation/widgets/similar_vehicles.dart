import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/presentation/widgets/cards/vehicle_card.dart';
import '../../domain/entities/vehicle.dart';

const Color _emerald = Color(0xFF34D399);

/// **SimilarVehicles**
/// Widget affichant une section de véhicules similaires (même type/ville).
/// Affiche jusqu'à 3 véhicules dans un carrousel horizontal.
class SimilarVehicles extends StatelessWidget {
  const SimilarVehicles({
    super.key,
    required this.currentVehicle,
    required this.similarVehicles,
  });

  final Vehicle currentVehicle;
  final List<Vehicle> similarVehicles;

  @override
  Widget build(BuildContext context) {
    // Si pas de véhicules similaires, ne rien afficher
    if (similarVehicles.isEmpty) {
      return const SizedBox.shrink();
    }

    // Prendre max 3 véhicules
    final vehicles = similarVehicles.take(3).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Titre de section
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Véhicules similaires',
                style: DSTypography.h3.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: DSSpacing.xs),
              Text(
                'À ${_getZoneLabel(currentVehicle.ville ?? "Dakar")}',
                style: DSTypography.bodySmall.copyWith(
                  color: _emerald,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: DSSpacing.md),

        // Liste horizontale scrollable
        SizedBox(
          height: 280,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md),
            itemCount: vehicles.length,
            separatorBuilder: (context, index) =>
                const SizedBox(width: DSSpacing.sm),
            itemBuilder: (context, index) {
              final vehicle = vehicles[index];
              return SizedBox(
                width: 280,
                child: _SimilarVehicleCard(
                  vehicle: vehicle,
                  onTap: () {
                    // Navigation vers la page de détail du véhicule
                    context.push('/vehicle/${vehicle.id}');
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _getZoneLabel(String ville) {
    const zoneLabels = {
      'almadies-ngor-mamelles': 'Almadies – Ngor – Mamelles',
      'ouakam-yoff': 'Ouakam – Yoff',
      'mermoz-sacrecoeur-ckg': 'Mermoz – Sacré-Cœur – CKG',
      'plateau-medina-gueuletapee': 'Plateau – Médina',
      'liberte-sicap-granddakar': 'Liberté – Sicap',
      'parcelles-grandyoff': 'Parcelles Assainies – Grand Yoff',
      'pikine-guediawaye': 'Pikine – Guédiawaye',
      'keurmassar-rufisque': 'Keur Massar – Rufisque',
    };
    return zoneLabels[ville] ?? ville;
  }
}

/// Card d'un véhicule similaire
class _SimilarVehicleCard extends StatelessWidget {
  const _SimilarVehicleCard({
    required this.vehicle,
    required this.onTap,
  });

  final Vehicle vehicle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final photo = vehicle.photoPrincipale ?? (vehicle.photos.isNotEmpty ? vehicle.photos.first : null);

    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.1),
                  Colors.white.withOpacity(0.05),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1.5,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image
                Container(
                  height: 160,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                  ),
                  child: photo != null
                      ? Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.network(
                              (photo as PhotoVehicule).url,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Center(
                                  child: Icon(
                                    Icons.directions_car_rounded,
                                    size: 48,
                                    color: Colors.white.withOpacity(0.3),
                                  ),
                                );
                              },
                            ),
                            // Gradient overlay
                            Positioned.fill(
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withOpacity(0.3),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        )
                      : Center(
                          child: Icon(
                            Icons.directions_car_rounded,
                            size: 48,
                            color: Colors.white.withOpacity(0.3),
                          ),
                        ),
                ),

                // Infos
                Padding(
                  padding: const EdgeInsets.all(DSSpacing.sm),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Nom véhicule
                      Text(
                        vehicle.nomComplet,
                        style: DSTypography.bodyLarge.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: DSSpacing.xs),

                      // Localisation
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_rounded,
                            size: 14,
                            color: Colors.white.withOpacity(0.5),
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              vehicle.ville ?? 'Dakar',
                              style: DSTypography.bodySmall.copyWith(
                                color: Colors.white.withOpacity(0.6),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: DSSpacing.xs),

                      // Prix
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                vehicle.prixFormateLocataire,
                                style: DSTypography.h5.copyWith(
                                  color: _emerald,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Text(
                                'par jour',
                                style: DSTypography.labelSmall.copyWith(
                                  color: Colors.white.withOpacity(0.5),
                                ),
                              ),
                            ],
                          ),
                          // Icône flèche
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: _emerald.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              Icons.arrow_forward_rounded,
                              size: 16,
                              color: _emerald,
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
    );
  }
}
