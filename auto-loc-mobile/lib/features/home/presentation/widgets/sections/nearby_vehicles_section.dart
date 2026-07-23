import 'package:flutter/material.dart';

import '../../../../../shared/presentation/widgets/cards/vehicle_card.dart';
import '../../../../../shared/presentation/widgets/cards/vehicle_card_shimmer.dart';
import '../../../../vehicle/domain/entities/vehicle.dart';

const Color _emerald = Color(0xFF34D399);

/// Nearby Vehicles Section
///
/// Section carousel des véhicules à proximité / recommandés
/// Design : Titre avec icône localisation + carousel
///
/// **Usage :**
/// ```dart
/// NearbyVehiclesSection(
///   vehicles: vehicles,
///   isLoading: false,
/// )
/// ```
class NearbyVehiclesSection extends StatelessWidget {
  const NearbyVehiclesSection({
    super.key,
    required this.vehicles,
    this.isLoading = false,
  });

  final List<Vehicle> vehicles;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    if (!isLoading && vehicles.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Titre de section
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              // Icône localisation
              Container(
                padding: const EdgeInsets.all(8),
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
                child: const Icon(
                  Icons.location_on_rounded,
                  color: _emerald,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              // Titre
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'À proximité',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      'Véhicules disponibles près de vous',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.5),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Carousel horizontal
        SizedBox(
          height: 310,
          child: isLoading
              ? ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: 3,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(
                        right: index < 2 ? 16 : 0,
                      ),
                      child: const VehicleCardShimmer(),
                    );
                  },
                )
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: vehicles.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(
                        right: index < vehicles.length - 1 ? 16 : 0,
                      ),
                      child: VehicleCard(vehicle: vehicles[index]),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
