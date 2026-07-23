import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Owner Dashboard Shimmer Skeleton
///
/// Skeleton loader qui reproduit fidèlement la structure complète du dashboard
/// propriétaire : header blanc (logo + avatar + greeting + revenue card),
/// cartes de statistiques, et actions rapides — le tout animé avec un effet
/// shimmer cohérent avec le [BookingListItemShimmer] existant.
class OwnerDashboardShimmer extends StatelessWidget {
  const OwnerDashboardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        children: [
          _HeaderShimmer(),
          const SizedBox(height: 24),
          _StatsCardsShimmer(),
          const SizedBox(height: 20),
          _QuickActionsShimmer(),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

// =============================================================================
// HEADER SHIMMER — fond blanc, bords arrondis en bas (reproduit OwnerDashboardHeader)
// =============================================================================

class _HeaderShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 26),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade200,
            highlightColor: Colors.grey.shade50,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Row: logo + notif + avatar ──
                Row(
                  children: [
                    // Logo placeholder
                    Container(
                      height: 42,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.grey,
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    const Spacer(),
                    // Notification circle
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: Colors.grey,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Avatar circle
                    Container(
                      width: 46,
                      height: 46,
                      decoration: const BoxDecoration(
                        color: Colors.grey,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // ── Greeting: eyebrow row ──
                Row(
                  children: [
                    Container(
                      height: 12,
                      width: 90,
                      decoration: BoxDecoration(
                        color: Colors.grey,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 3,
                      height: 3,
                      decoration: const BoxDecoration(
                        color: Colors.grey,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      height: 12,
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.grey,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                // Greeting: name
                Container(
                  height: 22,
                  width: 160,
                  decoration: BoxDecoration(
                    color: Colors.grey,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),

                const SizedBox(height: 22),

                // ── Revenue card ──
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(26),
                    border: Border.all(
                      color: Colors.grey.shade200,
                      width: 1.2,
                    ),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Icon badge + label + currency badge
                      Row(
                        children: [
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              color: Colors.grey,
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            height: 12,
                            width: 100,
                            decoration: BoxDecoration(
                              color: Colors.grey,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          const Spacer(),
                          Container(
                            height: 22,
                            width: 50,
                            decoration: BoxDecoration(
                              color: Colors.grey,
                              borderRadius: BorderRadius.circular(100),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Monthly amount
                      Container(
                        height: 32,
                        width: 180,
                        decoration: BoxDecoration(
                          color: Colors.grey,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Month label
                      Container(
                        height: 12,
                        width: 70,
                        decoration: BoxDecoration(
                          color: Colors.grey,
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Divider
                      Container(
                        height: 1,
                        color: Colors.grey.shade200,
                      ),

                      const SizedBox(height: 16),

                      // Cumulative total row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 26,
                                height: 26,
                                decoration: BoxDecoration(
                                  color: Colors.grey,
                                  borderRadius: BorderRadius.circular(9),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                height: 12,
                                width: 80,
                                decoration: BoxDecoration(
                                  color: Colors.grey,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                            ],
                          ),
                          Container(
                            height: 18,
                            width: 120,
                            decoration: BoxDecoration(
                              color: Colors.grey,
                              borderRadius: BorderRadius.circular(8),
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
    );
  }
}

// =============================================================================
// STATS CARDS SHIMMER — reproduit OwnerStatsCards (2 + 1 hero)
// =============================================================================

class _StatsCardsShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Shimmer.fromColors(
        baseColor: Colors.white.withOpacity(0.06),
        highlightColor: Colors.white.withOpacity(0.12),
        child: Column(
          children: [
            // Row: 2 stat cards side by side
            Row(
              children: [
                Expanded(child: _StatCardShimmer()),
                const SizedBox(width: 12),
                Expanded(child: _StatCardShimmer()),
              ],
            ),
            const SizedBox(height: 12),
            // Occupancy hero card
            _OccupancyCardShimmer(),
          ],
        ),
      ),
    );
  }
}

/// Petit card stat (Véhicules / Réservations actives)
class _StatCardShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon badge
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          const SizedBox(height: 14),
          // Label
          Container(
            height: 12,
            width: 80,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(6),
            ),
          ),
          const SizedBox(height: 8),
          // Value
          Container(
            height: 28,
            width: 40,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ],
      ),
    );
  }
}

/// Hero card Taux d'occupation
class _OccupancyCardShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Icon badge
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              const SizedBox(width: 12),
              // Labels
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 10,
                      width: 130,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      height: 10,
                      width: 160,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                  ],
                ),
              ),
              // Badge pill
              Container(
                width: 70,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(100),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Big percentage number
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                height: 40,
                width: 70,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(width: 4),
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Container(
                  height: 16,
                  width: 20,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: Container(
              height: 8,
              color: Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// QUICK ACTIONS SHIMMER — reproduit OwnerQuickActions (titre + 5 items)
// =============================================================================

class _QuickActionsShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Shimmer.fromColors(
        baseColor: Colors.white.withOpacity(0.06),
        highlightColor: Colors.white.withOpacity(0.12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title "Actions rapides"
            Container(
              height: 18,
              width: 130,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            const SizedBox(height: 16),
            // 5 action items
            for (int i = 0; i < 5; i++) ...[
              _QuickActionItemShimmer(),
              if (i < 4) const SizedBox(height: 12),
            ],
          ],
        ),
      ),
    );
  }
}

/// Item d'action rapide shimmer
class _QuickActionItemShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1F1F1F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.05),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Icon box
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(width: 16),
          // Text lines
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 14,
                  width: 140,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 10,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Chevron
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(6),
            ),
          ),
        ],
      ),
    );
  }
}
