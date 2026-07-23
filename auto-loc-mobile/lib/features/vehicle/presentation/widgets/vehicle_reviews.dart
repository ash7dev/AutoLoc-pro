import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

const Color _emerald = Color(0xFF34D399);

/// **VehicleReviews**
/// Widget affichant les avis des locataires sur le propriétaire du véhicule.
/// Affiche les 4 premiers avis avec note, commentaire et date.
class VehicleReviews extends StatelessWidget {
  const VehicleReviews({
    super.key,
    required this.ownerNote,
    required this.totalReviews,
    this.reviews = const [],
  });

  final double? ownerNote;
  final int? totalReviews;
  final List<ReviewData> reviews;

  @override
  Widget build(BuildContext context) {
    // Si pas d'avis, ne rien afficher
    if (reviews.isEmpty && (totalReviews == null || totalReviews == 0)) {
      return const SizedBox.shrink();
    }

    final avgNote = ownerNote ?? 0.0;
    final total = totalReviews ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Titre avec stats
        Row(
          children: [
            Text(
              'Avis sur le propriétaire',
              style: DSTypography.h5.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(width: DSSpacing.xs),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 8,
                vertical: 3,
              ),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$total',
                style: DSTypography.labelSmall.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.xs),

        // Note moyenne avec étoiles
        Row(
          children: [
            ...List.generate(5, (index) {
              return Padding(
                padding: const EdgeInsets.only(right: 2),
                child: Icon(
                  index < avgNote.round()
                      ? Icons.star_rounded
                      : Icons.star_outline_rounded,
                  size: 16,
                  color: index < avgNote.round()
                      ? DSColors.amber400
                      : Colors.white.withOpacity(0.3),
                ),
              );
            }),
            const SizedBox(width: DSSpacing.xs),
            Text(
              '${avgNote.toStringAsFixed(1)} / 5',
              style: DSTypography.bodySmall.copyWith(
                color: Colors.white.withOpacity(0.7),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.md),

        // Liste des avis (max 4)
        if (reviews.isNotEmpty)
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: reviews.length > 4 ? 4 : reviews.length,
            separatorBuilder: (context, index) =>
                const SizedBox(height: DSSpacing.sm),
            itemBuilder: (context, index) {
              final review = reviews[index];
              return _ReviewCard(review: review);
            },
          )
        else
          // Message si pas d'avis détaillés disponibles
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(DSSpacing.md),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.08),
                      Colors.white.withOpacity(0.04),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.15),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.rate_review_rounded,
                      color: Colors.white.withOpacity(0.5),
                      size: 20,
                    ),
                    const SizedBox(width: DSSpacing.sm),
                    Expanded(
                      child: Text(
                        'Les avis détaillés seront bientôt disponibles',
                        style: DSTypography.bodySmall.copyWith(
                          color: Colors.white.withOpacity(0.6),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Card d'un avis individuel
class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.review});

  final ReviewData review;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(DSSpacing.md),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withOpacity(0.08),
                Colors.white.withOpacity(0.04),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withOpacity(0.15),
              width: 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header : Avatar + Nom + Note
              Row(
                children: [
                  // Avatar
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          _emerald.withOpacity(0.3),
                          _emerald.withOpacity(0.15),
                        ],
                      ),
                    ),
                    child: Center(
                      child: Text(
                        review.authorInitial,
                        style: DSTypography.bodyMedium.copyWith(
                          color: _emerald,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: DSSpacing.sm),

                  // Nom
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          review.authorName,
                          style: DSTypography.bodyMedium.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          review.formattedDate,
                          style: DSTypography.labelSmall.copyWith(
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Note étoiles
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(5, (index) {
                      return Icon(
                        index < review.rating
                            ? Icons.star_rounded
                            : Icons.star_outline_rounded,
                        size: 14,
                        color: index < review.rating
                            ? DSColors.amber400
                            : Colors.white.withOpacity(0.2),
                      );
                    }),
                  ),
                ],
              ),

              // Commentaire
              if (review.comment != null && review.comment!.isNotEmpty) ...[
                const SizedBox(height: DSSpacing.sm),
                Text(
                  review.comment!,
                  style: DSTypography.bodySmall.copyWith(
                    color: Colors.white.withOpacity(0.8),
                    height: 1.5,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Modèle de données pour un avis
class ReviewData {
  final String id;
  final String authorName;
  final String authorInitial;
  final int rating;
  final String? comment;
  final DateTime createdAt;

  ReviewData({
    required this.id,
    required this.authorName,
    required this.authorInitial,
    required this.rating,
    this.comment,
    required this.createdAt,
  });

  String get formattedDate {
    final now = DateTime.now();
    final diff = now.difference(createdAt);

    if (diff.inDays > 365) {
      return 'Il y a ${(diff.inDays / 365).floor()} an${(diff.inDays / 365).floor() > 1 ? 's' : ''}';
    } else if (diff.inDays > 30) {
      return 'Il y a ${(diff.inDays / 30).floor()} mois';
    } else if (diff.inDays > 0) {
      return 'Il y a ${diff.inDays} jour${diff.inDays > 1 ? 's' : ''}';
    } else if (diff.inHours > 0) {
      return 'Il y a ${diff.inHours} heure${diff.inHours > 1 ? 's' : ''}';
    } else {
      return 'À l\'instant';
    }
  }
}
