import 'package:flutter/material.dart';

import '../../../../../shared/presentation/widgets/cards/vehicle_card.dart';
import '../../../../../shared/presentation/widgets/cards/vehicle_card_shimmer.dart';
import '../../../../vehicle/domain/entities/vehicle.dart';

const Color _emerald = Color(0xFF34D399);

/// Premium Selection Section
///
/// Carousel horizontal des véhicules premium
/// Design : Titre avec badge premium + carousel
///
/// **Usage :**
/// ```dart
/// PremiumSelectionGrid(
///   vehicles: vehicles,
///   isLoading: false,
/// )
/// ```
class PremiumSelectionGrid extends StatelessWidget {
  const PremiumSelectionGrid({
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

    // Afficher jusqu'à 8 véhicules dans le carousel
    final displayVehicles = vehicles.take(8).toList();

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
                  'Sélection Premium',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Badge "Premium"
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [_emerald, Color(0xFF16A34A)],
                  ),
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: _emerald.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Text(
                  'PREMIUM',
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        // Sous-titre
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'Les meilleurs véhicules sélectionnés pour vous',
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
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
                  itemCount: 5,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(
                        right: index < 4 ? 16 : 0,
                      ),
                      child: const VehicleCardShimmer(width: 280),
                    );
                  },
                )
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: displayVehicles.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(
                        right: index < displayVehicles.length - 1 ? 16 : 0,
                      ),
                      child: VehicleCard(
                        vehicle: displayVehicles[index],
                        width: 280,
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
