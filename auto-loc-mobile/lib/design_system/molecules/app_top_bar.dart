import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../theme/glassmorphism.dart';

/// App Top Bar
/// Barre supérieure pour les écrans avec titre et actions
/// Version avec glassmorphism pour un effet moderne
class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({
    super.key,
    this.title,
    this.leading,
    this.actions,
    this.showBackButton = false,
    this.onBackPressed,
    this.centerTitle = false,
    this.backgroundColor,
    this.useGlassmorphism = true,
  });

  final String? title;
  final Widget? leading;
  final List<Widget>? actions;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final bool centerTitle;
  final Color? backgroundColor;
  final bool useGlassmorphism;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    if (useGlassmorphism) {
      return Glassmorphism.glassAppBar(
        title: title != null
            ? Text(
                title!,
                style: DSTypography.h4.copyWith(
                  color: DSColors.darkTextPrimary,
                ),
              )
            : null,
        leading: _buildLeading(context),
        actions: actions,
        automaticallyImplyLeading: !showBackButton,
      );
    }

    return AppBar(
      title: title != null
          ? Text(
              title!,
              style: DSTypography.h4.copyWith(
                color: DSColors.darkTextPrimary,
              ),
            )
          : null,
      leading: _buildLeading(context),
      actions: actions,
      centerTitle: centerTitle,
      backgroundColor: backgroundColor ?? Colors.transparent,
      elevation: 0,
      automaticallyImplyLeading: !showBackButton,
    );
  }

  Widget? _buildLeading(BuildContext context) {
    if (leading != null) {
      return leading;
    }

    if (showBackButton) {
      return IconButton(
        icon: const Icon(
          Icons.arrow_back,
          color: DSColors.darkTextPrimary,
        ),
        onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
      );
    }

    return null;
  }
}

/// App Top Bar avec search
/// Barre supérieure avec champ de recherche intégré
class AppTopBarWithSearch extends StatelessWidget
    implements PreferredSizeWidget {
  const AppTopBarWithSearch({
    super.key,
    required this.searchController,
    this.hint = 'Rechercher...',
    this.onSearchChanged,
    this.onSearchSubmitted,
    this.actions,
    this.showBackButton = false,
    this.onBackPressed,
  });

  final TextEditingController searchController;
  final String hint;
  final ValueChanged<String>? onSearchChanged;
  final ValueChanged<String>? onSearchSubmitted;
  final List<Widget>? actions;
  final bool showBackButton;
  final VoidCallback? onBackPressed;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: DSColors.darkSurfaceGlass,
      elevation: 0,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(
                Icons.arrow_back,
                color: DSColors.darkTextPrimary,
              ),
              onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
            )
          : null,
      title: TextField(
        controller: searchController,
        onChanged: onSearchChanged,
        onSubmitted: onSearchSubmitted,
        style: DSTypography.bodyMedium.copyWith(
          color: DSColors.darkTextPrimary,
        ),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: DSTypography.bodyMedium.copyWith(
            color: DSColors.darkTextTertiary,
          ),
          border: InputBorder.none,
          prefixIcon: const Icon(
            Icons.search,
            color: DSColors.darkTextSecondary,
            size: 20,
          ),
          suffixIcon: searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(
                    Icons.close,
                    size: 18,
                  ),
                  color: DSColors.darkTextSecondary,
                  onPressed: () {
                    searchController.clear();
                    onSearchChanged?.call('');
                  },
                )
              : null,
        ),
      ),
      actions: actions,
    );
  }
}
