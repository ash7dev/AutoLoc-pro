import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../shared/widgets/owner_section_header.dart';

/// Shimmer loading pour la liste de véhicules
class FleetShimmer extends StatelessWidget {
  const FleetShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          const OwnerSectionHeader(
            title: 'Ma flotte',
            subtitle: 'Chargement...',
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: 3,
              itemBuilder: (context, index) => _buildShimmerCard(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1F1F1F),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Photo placeholder
          Shimmer.fromColors(
            baseColor: Colors.grey.shade900,
            highlightColor: Colors.grey.shade800,
            child: Container(
              height: 180,
              decoration: BoxDecoration(
                color: Colors.grey.shade900,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
              ),
            ),
          ),

          // Content placeholder
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Shimmer.fromColors(
                  baseColor: Colors.grey.shade800,
                  highlightColor: Colors.grey.shade700,
                  child: Container(
                    height: 20,
                    width: 200,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade800,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),

                const SizedBox(height: 8),

                // Subtitle
                Shimmer.fromColors(
                  baseColor: Colors.grey.shade800,
                  highlightColor: Colors.grey.shade700,
                  child: Container(
                    height: 14,
                    width: 120,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade800,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Stats row
                Row(
                  children: [
                    Shimmer.fromColors(
                      baseColor: Colors.grey.shade800,
                      highlightColor: Colors.grey.shade700,
                      child: Container(
                        height: 24,
                        width: 60,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade800,
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Shimmer.fromColors(
                      baseColor: Colors.grey.shade800,
                      highlightColor: Colors.grey.shade700,
                      child: Container(
                        height: 24,
                        width: 60,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade800,
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    const Spacer(),
                    Shimmer.fromColors(
                      baseColor: Colors.grey.shade800,
                      highlightColor: Colors.grey.shade700,
                      child: Container(
                        height: 20,
                        width: 100,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade800,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Buttons row
                Row(
                  children: [
                    Expanded(
                      child: Shimmer.fromColors(
                        baseColor: Colors.grey.shade800,
                        highlightColor: Colors.grey.shade700,
                        child: Container(
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade800,
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Shimmer.fromColors(
                        baseColor: Colors.grey.shade800,
                        highlightColor: Colors.grey.shade700,
                        child: Container(
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade800,
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
