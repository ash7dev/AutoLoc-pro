import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';

/// Rating
/// Affiche une note avec des étoiles
/// Supporte l'affichage en lecture seule ou interactif
class Rating extends StatelessWidget {
  const Rating({
    super.key,
    required this.rating,
    this.maxRating = 5,
    this.size = RatingSize.medium,
    this.showLabel = true,
    this.onRatingChanged,
  });

  final double rating;
  final int maxRating;
  final RatingSize size;
  final bool showLabel;
  final ValueChanged<double>? onRatingChanged;

  @override
  Widget build(BuildContext context) {
    final double iconSize = switch (size) {
      RatingSize.small => 14,
      RatingSize.medium => 16,
      RatingSize.large => 20,
      RatingSize.xlarge => 24,
    };

    final TextStyle labelStyle = switch (size) {
      RatingSize.small => DSTypography.labelSmall,
      RatingSize.medium => DSTypography.labelMedium,
      RatingSize.large => DSTypography.labelLarge,
      RatingSize.xlarge => DSTypography.h5,
    };

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Étoiles
        ...List.generate(maxRating, (index) {
          return _buildStar(
            index: index,
            iconSize: iconSize,
          );
        }),

        // Label avec la note
        if (showLabel) ...[
          const SizedBox(width: DSSpacing.xs),
          Text(
            rating.toStringAsFixed(1),
            style: labelStyle.copyWith(
              color: DSColors.darkTextPrimary,
              fontWeight: DSTypography.semiBold,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStar({
    required int index,
    required double iconSize,
  }) {
    final double fillPercentage = (rating - index).clamp(0.0, 1.0);

    Widget star;

    if (fillPercentage == 0) {
      // Étoile vide
      star = Icon(
        Icons.star_border,
        size: iconSize,
        color: DSColors.amber600,
      );
    } else if (fillPercentage == 1) {
      // Étoile pleine
      star = Icon(
        Icons.star,
        size: iconSize,
        color: DSColors.amber600,
      );
    } else {
      // Étoile partiellement remplie
      star = Stack(
        children: [
          Icon(
            Icons.star_border,
            size: iconSize,
            color: DSColors.amber600,
          ),
          ClipRect(
            clipper: _StarClipper(fillPercentage),
            child: Icon(
              Icons.star,
              size: iconSize,
              color: DSColors.amber600,
            ),
          ),
        ],
      );
    }

    if (onRatingChanged != null) {
      return GestureDetector(
        onTap: () => onRatingChanged!(index + 1.0),
        child: star,
      );
    }

    return star;
  }
}

/// Taille du rating
enum RatingSize {
  small,
  medium,
  large,
  xlarge,
}

/// Clipper pour les étoiles partiellement remplies
class _StarClipper extends CustomClipper<Rect> {
  final double fillPercentage;

  _StarClipper(this.fillPercentage);

  @override
  Rect getClip(Size size) {
    return Rect.fromLTRB(
      0,
      0,
      size.width * fillPercentage,
      size.height,
    );
  }

  @override
  bool shouldReclip(_StarClipper oldClipper) {
    return oldClipper.fillPercentage != fillPercentage;
  }
}
