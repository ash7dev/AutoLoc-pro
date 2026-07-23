import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Booking List Item Shimmer
///
/// Skeleton loader pour BookingListItem avec effet shimmer et design glassmorphism.
class BookingListItemShimmer extends StatelessWidget {
  const BookingListItemShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withOpacity(0.08),
              Colors.white.withOpacity(0.03),
            ],
          ),
          border: Border.all(
            color: Colors.white.withOpacity(0.12),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 20,
              offset: const Offset(0, 10),
              spreadRadius: -5,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Shimmer.fromColors(
              baseColor: Colors.white.withOpacity(0.06),
              highlightColor: Colors.white.withOpacity(0.12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Photo du véhicule placeholder
                  Stack(
                    children: [
                      Container(
                        height: 140,
                        width: double.infinity,
                        color: Colors.black,
                      ),
                      // Badge placeholder en haut à droite
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          width: 80,
                          height: 24,
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Informations
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Nom du véhicule placeholder
                        Container(
                          height: 16,
                          width: 150,
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Dates row placeholder
                        Row(
                          children: [
                            Container(
                              width: 14,
                              height: 14,
                              decoration: const BoxDecoration(
                                color: Colors.black,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              height: 12,
                              width: 120,
                              decoration: BoxDecoration(
                                color: Colors.black,
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Durée row placeholder
                        Row(
                          children: [
                            Container(
                              width: 14,
                              height: 14,
                              decoration: const BoxDecoration(
                                color: Colors.black,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              height: 12,
                              width: 60,
                              decoration: BoxDecoration(
                                color: Colors.black,
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Prix + Flèche placeholder
                        Row(
                          children: [
                            Container(
                              height: 32,
                              width: 110,
                              decoration: BoxDecoration(
                                color: Colors.black,
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            const Spacer(),
                            Container(
                              width: 16,
                              height: 16,
                              decoration: const BoxDecoration(
                                color: Colors.black,
                                shape: BoxShape.circle,
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
}
