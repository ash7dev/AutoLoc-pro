import 'package:flutter/material.dart';
import '../widgets/animated_vehicle_card.dart';

/// Page 1 - Découvrir
///
/// Message: Louez une voiture partout au Sénégal en toute simplicité
/// Visuel: Carte véhicule glassmorphism avec animation
class DiscoverPage extends StatelessWidget {
  const DiscoverPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 60),

          // Carte véhicule animée
          const AnimatedVehicleCard(animate: true),

          const SizedBox(height: 60),

          // Titre
          const Text(
            'Découvrir',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: 0.5,
            ),
          ),

          const SizedBox(height: 16),

          // Description
          Text(
            'Louez une voiture partout au Sénégal\nen toute simplicité.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              color: Colors.white.withOpacity(0.9),
              height: 1.6,
              letterSpacing: 0.3,
            ),
          ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
