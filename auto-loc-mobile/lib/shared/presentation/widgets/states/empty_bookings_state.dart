import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/components/premium_glass.dart';

/// Empty Bookings State
///
/// État vide pour la liste des réservations avec design glassmorphism et glow émeraude.
class EmptyBookingsState extends StatelessWidget {
  const EmptyBookingsState({
    super.key,
    this.message = 'Aucune réservation',
    this.showExploreButton = true,
  });

  final String message;
  final bool showExploreButton;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withOpacity(0.08),
                    Colors.white.withOpacity(0.03),
                  ],
                ),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                  color: Colors.white.withOpacity(0.12),
                  width: 1.5,
                ),
              ),
              child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icône sans effet glow
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: kEmerald.withOpacity(0.1),
                ),
                child: const Icon(
                  Icons.event_busy_rounded,
                  size: 60,
                  color: kEmerald,
                ),
              ),

              const SizedBox(height: 32),

              // Message principal
              Text(
                message,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 12),

              // Sous-message
              Text(
                showExploreButton
                    ? 'Explorez nos véhicules disponibles\net réservez votre prochaine location'
                    : 'Aucune réservation ne correspond\nà ce filtre',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.6),
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              if (showExploreButton) ...[
                const SizedBox(height: 32),

                // Bouton Explorer
                Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    onTap: () => context.push(Routes.explore),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 14,
                      ),
                      decoration: BoxDecoration(
                        color: kEmerald,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.explore_rounded,
                            color: Colors.black87,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Explorer les véhicules',
                            style: TextStyle(
                              color: Colors.black87,
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
            ),
          ),
        ),
      ),
    );
  }
}
