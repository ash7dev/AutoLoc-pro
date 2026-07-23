import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../design_system/tokens/ds_spacing.dart';

/// Owner Settings Shimmer Skeleton
///
/// Skeleton loader qui reproduit fidèlement la structure complète de la page
/// paramètres côté propriétaire (OwnerSettingsScreen).
class OwnerSettingsShimmer extends StatelessWidget {
  const OwnerSettingsShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Header (fond blanc, bords arrondis en bas)
          _HeaderShimmer(),
          const SizedBox(height: 24),

          // Contenu principal
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Shimmer.fromColors(
              baseColor: Colors.white.withOpacity(0.06),
              highlightColor: Colors.white.withOpacity(0.12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 2. Profile Card (Avatar + nom + email + complétude)
                  _ProfileCardShimmer(),
                  const SizedBox(height: 24),

                  // 3. Section Espace & Profil (2 tiles)
                  _SectionShimmer(labelWidth: 100, tileCount: 2),
                  const SizedBox(height: 20),

                  // 4. Section Application & Aide (3 tiles)
                  _SectionShimmer(labelWidth: 80, tileCount: 3),
                  const SizedBox(height: 20),

                  // 5. Section Compte (1 tile - Déconnexion)
                  _SectionShimmer(labelWidth: 60, tileCount: 1),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade200,
            highlightColor: Colors.grey.shade50,
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      height: 28,
                      width: 160,
                      decoration: BoxDecoration(
                        color: Colors.grey,
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 14,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.grey,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileCardShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
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
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar placeholder (72x72, rounded square)
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              const SizedBox(width: DSSpacing.md),
              // Name + email
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 16,
                      width: 140,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 12,
                      width: 180,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: DSSpacing.md),
          // Progress bar percentage
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                height: 10,
                width: 120,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
              Container(
                height: 12,
                width: 30,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: Container(
              height: 6,
              color: Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionShimmer extends StatelessWidget {
  final double labelWidth;
  final int tileCount;

  const _SectionShimmer({
    required this.labelWidth,
    required this.tileCount,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section title (eyebrow)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Container(
            height: 10,
            width: labelWidth,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(5),
            ),
          ),
        ),

        // Glass panel with tiles
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
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
          ),
          child: Column(
            children: List.generate(tileCount, (index) {
              return Column(
                children: [
                  if (index > 0)
                    Divider(
                      height: 1,
                      thickness: 1,
                      color: Colors.white.withOpacity(0.06),
                    ),
                  _TileShimmer(),
                ],
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _TileShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final titleWidth = 100.0 + (identityHashCode(this) % 50);
    final subtitleWidth = 140.0 + (identityHashCode(this) % 80);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          // Icon Box placeholder
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(width: DSSpacing.md),
          // Title + Subtitle
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 14,
                  width: titleWidth,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  height: 10,
                  width: subtitleWidth,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ],
            ),
          ),
          // Chevron placeholder
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
    );
  }
}
