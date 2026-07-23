import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_radius.dart';
import '../tokens/ds_elevation.dart';

/// Avatar
/// Affiche une photo de profil ou les initiales de l'utilisateur
/// Supporte plusieurs tailles et un badge de notification
class Avatar extends StatelessWidget {
  const Avatar({
    super.key,
    this.imageUrl,
    this.initials,
    this.size = AvatarSize.medium,
    this.hasBadge = false,
    this.badgeColor,
    this.onTap,
  });

  final String? imageUrl;
  final String? initials;
  final AvatarSize size;
  final bool hasBadge;
  final Color? badgeColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final double dimension = switch (size) {
      AvatarSize.xsmall => 24,
      AvatarSize.small => 32,
      AvatarSize.medium => 40,
      AvatarSize.large => 56,
      AvatarSize.xlarge => 80,
      AvatarSize.xxlarge => 120,
    };

    final double badgeSize = switch (size) {
      AvatarSize.xsmall => 6,
      AvatarSize.small => 8,
      AvatarSize.medium => 10,
      AvatarSize.large => 12,
      AvatarSize.xlarge => 16,
      AvatarSize.xxlarge => 20,
    };

    final TextStyle initialsStyle = switch (size) {
      AvatarSize.xsmall => DSTypography.labelSmall,
      AvatarSize.small => DSTypography.labelMedium,
      AvatarSize.medium => DSTypography.labelLarge,
      AvatarSize.large => DSTypography.h5,
      AvatarSize.xlarge => DSTypography.h3,
      AvatarSize.xxlarge => DSTypography.h1,
    };

    final content = Stack(
      children: [
        // Avatar
        Container(
          width: dimension,
          height: dimension,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: DSColors.emerald600,
            image: imageUrl != null
                ? DecorationImage(
                    image: NetworkImage(imageUrl!),
                    fit: BoxFit.cover,
                  )
                : null,
            boxShadow: DSElevation.shadowDarkXs,
          ),
          child: imageUrl == null
              ? Center(
                  child: Text(
                    _getInitials(),
                    style: initialsStyle.copyWith(
                      color: Colors.white,
                      fontWeight: DSTypography.semiBold,
                    ),
                  ),
                )
              : null,
        ),

        // Badge
        if (hasBadge)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: badgeSize,
              height: badgeSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: badgeColor ?? DSColors.emerald600,
                border: Border.all(
                  color: DSColors.darkBackground,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: content,
      );
    }

    return content;
  }

  String _getInitials() {
    if (initials != null && initials!.isNotEmpty) {
      return initials!;
    }
    return '?';
  }
}

/// Taille de l'avatar
enum AvatarSize {
  xsmall, // 24x24
  small, // 32x32
  medium, // 40x40
  large, // 56x56
  xlarge, // 80x80
  xxlarge, // 120x120
}
