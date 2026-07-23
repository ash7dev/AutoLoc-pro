import 'package:flutter/material.dart';

import '../tokens/ds_spacing.dart';
import '../tokens/ds_radius.dart';
import '../theme/glassmorphism.dart';
import 'skeleton_box.dart';

/// Skeleton List
/// Affiche une liste de cards skeleton pour le loading
class SkeletonList extends StatelessWidget {
  const SkeletonList({
    super.key,
    this.itemCount = 5,
    this.itemBuilder,
  });

  final int itemCount;
  final Widget Function(int index)? itemBuilder;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: DSSpacing.screenPadding,
      itemCount: itemCount,
      separatorBuilder: (context, index) => const SizedBox(
        height: DSSpacing.listItemSpacing,
      ),
      itemBuilder: (context, index) {
        return itemBuilder?.call(index) ?? const SkeletonVehicleCard();
      },
    );
  }
}

/// Skeleton Vehicle Card
/// Card skeleton pour les véhicules
class SkeletonVehicleCard extends StatelessWidget {
  const SkeletonVehicleCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Glassmorphism.glassCard(
      padding: DSSpacing.cardPaddingAll,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          const SkeletonBox(
            width: double.infinity,
            height: 200,
            borderRadius: DSRadius.borderRadiusMd,
          ),
          const SizedBox(height: DSSpacing.sm),

          // Title
          const SkeletonLine(
            width: 200,
            height: 20,
          ),
          const SizedBox(height: DSSpacing.xs),

          // Subtitle
          const SkeletonLine(
            width: 150,
            height: 14,
          ),
          const SizedBox(height: DSSpacing.sm),

          // Rating & Price
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SkeletonLine(
                width: 80,
                height: 16,
              ),
              const SkeletonLine(
                width: 100,
                height: 18,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Skeleton Booking Card
/// Card skeleton pour les réservations
class SkeletonBookingCard extends StatelessWidget {
  const SkeletonBookingCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Glassmorphism.glassCard(
      padding: DSSpacing.cardPaddingAll,
      child: Row(
        children: [
          // Image
          const SkeletonBox(
            width: 80,
            height: 80,
            borderRadius: DSRadius.borderRadiusMd,
          ),
          const SizedBox(width: DSSpacing.md),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SkeletonLine(
                  width: 150,
                  height: 16,
                ),
                const SizedBox(height: DSSpacing.xs),
                const SkeletonLine(
                  width: 100,
                  height: 12,
                ),
                const SizedBox(height: DSSpacing.xs),
                const SkeletonLine(
                  width: 80,
                  height: 12,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Skeleton Profile Header
/// Header skeleton pour le profil
class SkeletonProfileHeader extends StatelessWidget {
  const SkeletonProfileHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: DSSpacing.screenPadding,
      child: Column(
        children: [
          // Avatar
          const SkeletonCircle(size: 80),
          const SizedBox(height: DSSpacing.md),

          // Name
          const SkeletonLine(
            width: 150,
            height: 20,
          ),
          const SizedBox(height: DSSpacing.xs),

          // Email
          const SkeletonLine(
            width: 200,
            height: 14,
          ),
          const SizedBox(height: DSSpacing.lg),

          // Stats
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatSkeleton(),
              _buildStatSkeleton(),
              _buildStatSkeleton(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatSkeleton() {
    return Column(
      children: [
        const SkeletonLine(
          width: 40,
          height: 24,
        ),
        const SizedBox(height: DSSpacing.xxs),
        const SkeletonLine(
          width: 60,
          height: 12,
        ),
      ],
    );
  }
}
