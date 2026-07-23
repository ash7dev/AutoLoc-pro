import 'package:flutter/material.dart';
import '../widgets/animated_route_path.dart';

/// Page 2 - Réserver
///
/// Message: Réservez votre véhicule en quelques minutes
/// Visuel: Animation de trajet GPS avec marqueurs
class ReservePage extends StatelessWidget {
  const ReservePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 40),

          // Animation trajet GPS
          const AnimatedRoutePath(animate: true),

          const SizedBox(height: 60),

          // Titre
          const Text(
            'Réserver',
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
            'Réservez votre véhicule\nen quelques minutes.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              color: Colors.white.withOpacity(0.9),
              height: 1.6,
              letterSpacing: 0.3,
            ),
          ),

          const SizedBox(height: 60),
        ],
      ),
    );
  }
}
