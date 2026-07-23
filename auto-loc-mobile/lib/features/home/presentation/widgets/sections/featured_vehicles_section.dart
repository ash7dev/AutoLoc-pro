import 'package:flutter/material.dart';

import '../../../../../shared/presentation/widgets/cards/vehicle_card.dart';
import '../../../../../shared/presentation/widgets/cards/vehicle_card_shimmer.dart';
import '../../../../vehicle/domain/entities/vehicle.dart';

const Color _emerald = Color(0xFF34D399);

/// Featured Vehicles Section
///
/// Section carousel horizontal des véhicules à la une
/// Design : Titre + carousel scrollable horizontalement
///
/// **Usage :**
/// ```dart
/// FeaturedVehiclesSection(
///   vehicles: vehicles,
///   isLoading: false,
/// )
/// ```
class FeaturedVehiclesSection extends StatelessWidget {
  const FeaturedVehiclesSection({
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
              // Titre avec gradient
              ShaderMask(
                blendMode: BlendMode.srcIn,
                shaderCallback: (bounds) => const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.white, _emerald],
                  stops: [0.3, 1.0],
                ).createShader(bounds),
                child: const Text(
                  'À la une',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Badge "Featured"
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
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
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _emerald.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: const Text(
                  '★',
                  style: TextStyle(
                    color: _emerald,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
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
