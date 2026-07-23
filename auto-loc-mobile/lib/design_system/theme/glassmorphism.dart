import 'dart:ui';
import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_radius.dart';
import '../tokens/ds_elevation.dart';
import '../tokens/ds_opacity.dart';

/// Glassmorphism Utilities
/// Helpers pour créer facilement des effets glassmorphism (glass blur)
/// Utilisé dans tout le design system pour créer l'effet "fluide noir" moderne
class Glassmorphism {
  Glassmorphism._();

  // ===========================================================================
  // GLASS CONTAINERS
  // ===========================================================================

  /// Crée un Container avec effet glass (blur + border + shadow)
  static Widget glassContainer({
    required Widget child,
    BorderRadius? borderRadius,
    Color? backgroundColor,
    Color? borderColor,
    double? borderWidth,
    List<BoxShadow>? shadows,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? width,
    double? height,
    double blurStrength = 10.0,
  }) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        borderRadius: borderRadius ?? DSRadius.borderRadiusCard,
        border: Border.all(
          color: borderColor ?? DSColors.darkBorderGlass,
          width: borderWidth ?? 1.0,
        ),
        boxShadow: shadows ?? DSElevation.shadowDarkSm,
      ),
      child: ClipRRect(
        borderRadius: borderRadius ?? DSRadius.borderRadiusCard,
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: blurStrength,
            sigmaY: blurStrength,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: backgroundColor ?? DSColors.darkSurfaceGlass,
              borderRadius: borderRadius ?? DSRadius.borderRadiusCard,
            ),
            child: child,
          ),
        ),
      ),
    );
  }

  /// Card glassmorphism simple
  static Widget glassCard({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? width,
    double? height,
    VoidCallback? onTap,
  }) {
    final content = glassContainer(
      padding: padding,
      margin: margin,
      width: width,
      height: height,
      borderRadius: DSRadius.borderRadiusCard,
      child: child,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: DSRadius.borderRadiusCard,
        child: content,
      );
    }

    return content;
  }

  /// Surface glassmorphism pour les grandes sections
  static Widget glassSurface({
    required Widget child,
    BorderRadius? borderRadius,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
  }) {
    return glassContainer(
      borderRadius: borderRadius ?? DSRadius.borderRadiusLg,
      backgroundColor: DSColors.darkSurfaceCard,
      borderColor: DSColors.darkBorderGlass,
      shadows: DSElevation.shadowDarkXs,
      padding: padding,
      margin: margin,
      blurStrength: 20.0,
      child: child,
    );
  }

  /// Button glassmorphism
  static Widget glassButton({
    required Widget child,
    required VoidCallback onPressed,
    Color? backgroundColor,
    Color? borderColor,
    EdgeInsetsGeometry? padding,
    double? width,
    double? height,
  }) {
    return glassContainer(
      width: width,
      height: height,
      borderRadius: DSRadius.borderRadiusButton,
      backgroundColor: backgroundColor ?? DSColors.darkSurfaceGlass,
      borderColor: borderColor ?? DSColors.darkBorderGlass,
      shadows: DSElevation.shadowDarkSm,
      blurStrength: 10.0,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: DSRadius.borderRadiusButton,
          child: Container(
            padding: padding,
            alignment: Alignment.center,
            child: child,
          ),
        ),
      ),
    );
  }

  /// Bottom Sheet glassmorphism
  static Widget glassBottomSheet({
    required Widget child,
    EdgeInsetsGeometry? padding,
  }) {
    return glassContainer(
      borderRadius: DSRadius.borderRadiusBottomSheet,
      backgroundColor: DSColors.darkSurfaceElevated,
      borderColor: DSColors.darkBorderGlass,
      shadows: DSElevation.shadowDarkXl,
      padding: padding,
      blurStrength: 30.0,
      child: child,
    );
  }

  /// Dialog glassmorphism
  static Widget glassDialog({
    required Widget child,
    EdgeInsetsGeometry? padding,
    double? width,
  }) {
    return glassContainer(
      width: width,
      borderRadius: DSRadius.borderRadiusDialog,
      backgroundColor: DSColors.darkSurfaceElevated,
      borderColor: DSColors.darkBorderGlass,
      shadows: DSElevation.shadowDarkLg,
      padding: padding,
      blurStrength: 30.0,
      child: child,
    );
  }

  /// AppBar glassmorphism (floating, transparent avec blur)
  static PreferredSizeWidget glassAppBar({
    Widget? title,
    List<Widget>? actions,
    Widget? leading,
    bool automaticallyImplyLeading = true,
    double elevation = 0,
  }) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(kToolbarHeight),
      child: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: AppBar(
            title: title,
            actions: actions,
            leading: leading,
            automaticallyImplyLeading: automaticallyImplyLeading,
            backgroundColor: DSColors.darkSurfaceGlass,
            elevation: elevation,
            scrolledUnderElevation: 0,
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // GLASS EFFECTS (pour widgets existants)
  // ===========================================================================

  /// Applique un effet blur à n'importe quel widget
  static Widget blur({
    required Widget child,
    double sigmaX = 10.0,
    double sigmaY = 10.0,
    BorderRadius? borderRadius,
  }) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: sigmaX, sigmaY: sigmaY),
        child: child,
      ),
    );
  }

  /// Crée une overlay glass pour les modals
  static Widget glassOverlay({
    required Widget child,
    Color? backgroundColor,
    double opacity = 0.5,
  }) {
    return Stack(
      children: [
        // Backdrop blur
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
            child: Container(
              color: (backgroundColor ?? Colors.black).withOpacity(opacity),
            ),
          ),
        ),
        // Content
        child,
      ],
    );
  }

  // ===========================================================================
  // GRADIENT GLASS (pour les boutons primaires avec glow)
  // ===========================================================================

  /// Button primaire avec gradient emerald + glow
  static Widget glowButton({
    required Widget child,
    required VoidCallback onPressed,
    EdgeInsetsGeometry? padding,
    double? width,
    double? height,
    bool enabled = true,
  }) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: DSRadius.borderRadiusButton,
        gradient: DSColors.emeraldGradient,
        boxShadow: DSElevation.glowEmerald,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: enabled ? onPressed : null,
          borderRadius: DSRadius.borderRadiusButton,
          child: Container(
            padding: padding,
            alignment: Alignment.center,
            child: child,
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // NAVIGATION BAR GLASS
  // ===========================================================================

  /// Bottom Navigation Bar avec glassmorphism
  static Widget glassNavigationBar({
    required int currentIndex,
    required List<BottomNavigationBarItem> items,
    required ValueChanged<int> onTap,
  }) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: DSColors.darkSurfaceGlass,
            border: const Border(
              top: BorderSide(
                color: DSColors.darkBorderGlass,
                width: 1,
              ),
            ),
          ),
          child: BottomNavigationBar(
            currentIndex: currentIndex,
            items: items,
            onTap: onTap,
            backgroundColor: Colors.transparent,
            elevation: 0,
            selectedItemColor: DSColors.emerald600,
            unselectedItemColor: DSColors.darkTextSecondary,
            type: BottomNavigationBarType.fixed,
            showSelectedLabels: true,
            showUnselectedLabels: true,
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // SHIMMER LOADING GLASS (pour les skeletons)
  // ===========================================================================

  /// Container avec shimmer effect pour loading states
  static Widget shimmerGlass({
    double? width,
    double? height,
    BorderRadius? borderRadius,
  }) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: borderRadius ?? DSRadius.borderRadiusMd,
        gradient: DSColors.shimmerGradient,
      ),
    );
  }

  // ===========================================================================
  // SCRIM (pour les overlays de modals/bottom sheets)
  // ===========================================================================

  /// Scrim avec blur pour modal
  static Widget scrim({
    required VoidCallback onTap,
    Color? color,
    double opacity = 0.6,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Container(
          color: (color ?? Colors.black).withOpacity(opacity),
        ),
      ),
    );
  }
}
