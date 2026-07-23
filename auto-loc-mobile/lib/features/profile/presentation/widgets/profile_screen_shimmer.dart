import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../design_system/tokens/ds_spacing.dart';

/// Profile Screen Shimmer Skeleton
///
/// Skeleton loader qui reproduit fidèlement la structure complète de la page
/// paramètres côté tenant : header card (avatar + nom + barre complétude),
/// puis 4 sections glass (Identité 3 rows, Contact 2 rows,
/// Sécurité 2 rows, Compte 3 rows).
class ProfileScreenShimmer extends StatelessWidget {
  const ProfileScreenShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Header Card — avatar + infos + progress bar
          _HeaderCardShimmer(),
          const SizedBox(height: DSSpacing.md),

          // 2. Section Identité (3 rows)
          _SectionShimmer(labelWidth: 60, rowCount: 3),
          const SizedBox(height: DSSpacing.md),

          // 3. Section Contact (2 rows)
          _SectionShimmer(labelWidth: 52, rowCount: 2),
          const SizedBox(height: DSSpacing.md),

          // 4. Section Identité & Sécurité (2 rows)
          _SectionShimmer(labelWidth: 120, rowCount: 2),
          const SizedBox(height: DSSpacing.md),

          // 5. Section Compte (3 rows)
          _SectionShimmer(labelWidth: 55, rowCount: 3),
          const SizedBox(height: DSSpacing.lg),
        ],
      ),
    );
  }
}

// =============================================================================
// HEADER CARD — avatar + nom/email + barre de complétude
// =============================================================================

class _HeaderCardShimmer extends StatelessWidget {
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
      child: Shimmer.fromColors(
        baseColor: Colors.white.withOpacity(0.06),
        highlightColor: Colors.white.withOpacity(0.12),
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

            // PROFIL COMPLÉTÉ label + percentage
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 10,
                  width: 100,
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
            const SizedBox(height: 8),
            // Missing fields text
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                height: 10,
                width: 220,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// SECTION SHIMMER — reproduit _Section (titre + glass card avec N rows)
// =============================================================================

class _SectionShimmer extends StatelessWidget {
  final double labelWidth;
  final int rowCount;

  const _SectionShimmer({
    required this.labelWidth,
    required this.rowCount,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.white.withOpacity(0.06),
      highlightColor: Colors.white.withOpacity(0.12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title (UPPERCASE eyebrow)
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

          // Glass card with rows
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
              children: List.generate(rowCount, (index) {
                return Column(
                  children: [
                    if (index > 0)
                      Divider(
                        height: 1,
                        thickness: 1,
                        color: Colors.white.withOpacity(0.06),
                      ),
                    _InfoRowShimmer(),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// INFO ROW SHIMMER — reproduit _InfoRow (icon chip + label + value)
// =============================================================================

class _InfoRowShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Vary widths slightly for visual realism
    final labelWidth = 90.0 + (identityHashCode(this) % 60);
    final valueWidth = 120.0 + (identityHashCode(this) % 80);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          // EmeraldIconChip placeholder
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          const SizedBox(width: DSSpacing.md),
          // Label + value
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 13,
                  width: labelWidth,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  height: 10,
                  width: valueWidth,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
