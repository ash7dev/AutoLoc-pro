import 'package:flutter/material.dart';
import 'ds_colors.dart';

/// Design System - Elevation Tokens
/// Définit les ombres et élévations pour l'effet de profondeur
/// Adapté pour le dark mode avec glassmorphism
class DSElevation {
  DSElevation._();

  // ===========================================================================
  // ELEVATION LEVELS (valeurs Material Design)
  // ===========================================================================

  /// Aucune élévation
  static const double none = 0.0;

  /// Élévation minimale (1dp)
  static const double minimal = 1.0;

  /// Élévation XS (2dp) - Cartes au repos
  static const double xs = 2.0;

  /// Élévation SM (4dp) - Cartes hover
  static const double sm = 4.0;

  /// Élévation MD (8dp) - Boutons, FAB au repos
  static const double md = 8.0;

  /// Élévation LG (16dp) - Dialogs, modales
  static const double lg = 16.0;

  /// Élévation XL (24dp) - Bottom sheets, navigation drawer
  static const double xl = 24.0;

  // ===========================================================================
  // BOX SHADOWS POUR LIGHT MODE
  // ===========================================================================

  /// Aucune ombre
  static const List<BoxShadow> shadowNone = [];

  /// Ombre XS - Cartes subtiles
  static const List<BoxShadow> shadowXs = [
    BoxShadow(
      color: Color(0x0D000000), // Black 5%
      offset: Offset(0, 1),
      blurRadius: 2,
      spreadRadius: 0,
    ),
  ];

  /// Ombre SM - Cartes standards
  static const List<BoxShadow> shadowSm = [
    BoxShadow(
      color: Color(0x1A000000), // Black 10%
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x0D000000), // Black 5%
      offset: Offset(0, 1),
      blurRadius: 2,
      spreadRadius: 0,
    ),
  ];

  /// Ombre MD - Boutons, FAB
  static const List<BoxShadow> shadowMd = [
    BoxShadow(
      color: Color(0x1A000000), // Black 10%
      offset: Offset(0, 4),
      blurRadius: 8,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x0D000000), // Black 5%
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: 0,
    ),
  ];

  /// Ombre LG - Dialogs, modales
  static const List<BoxShadow> shadowLg = [
    BoxShadow(
      color: Color(0x26000000), // Black 15%
      offset: Offset(0, 8),
      blurRadius: 16,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x1A000000), // Black 10%
      offset: Offset(0, 4),
      blurRadius: 8,
      spreadRadius: 0,
    ),
  ];

  /// Ombre XL - Bottom sheets, drawers
  static const List<BoxShadow> shadowXl = [
    BoxShadow(
      color: Color(0x33000000), // Black 20%
      offset: Offset(0, 16),
      blurRadius: 32,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x1A000000), // Black 10%
      offset: Offset(0, 8),
      blurRadius: 16,
      spreadRadius: 0,
    ),
  ];

  // ===========================================================================
  // BOX SHADOWS POUR DARK MODE (glassmorphism)
  // En dark mode, on utilise des ombres plus subtiles avec un mix de noir et de glow
  // ===========================================================================

  /// Ombre dark XS - Cartes glass subtiles
  static const List<BoxShadow> shadowDarkXs = [
    BoxShadow(
      color: Color(0x33000000), // Black 20%
      offset: Offset(0, 1),
      blurRadius: 2,
      spreadRadius: 0,
    ),
  ];

  /// Ombre dark SM - Cartes glass standards
  static const List<BoxShadow> shadowDarkSm = [
    BoxShadow(
      color: Color(0x4D000000), // Black 30%
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x1AFFFFFF), // White 10% pour le glow
      offset: Offset(0, 1),
      blurRadius: 2,
      spreadRadius: 0,
    ),
  ];

  /// Ombre dark MD - Boutons glass, FAB
  static const List<BoxShadow> shadowDarkMd = [
    BoxShadow(
      color: Color(0x66000000), // Black 40%
      offset: Offset(0, 4),
      blurRadius: 8,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x1AFFFFFF), // White 10% pour le glow
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: 0,
    ),
  ];

  /// Ombre dark LG - Dialogs glass, modales
  static const List<BoxShadow> shadowDarkLg = [
    BoxShadow(
      color: Color(0x80000000), // Black 50%
      offset: Offset(0, 8),
      blurRadius: 16,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x26FFFFFF), // White 15% pour le glow
      offset: Offset(0, 4),
      blurRadius: 8,
      spreadRadius: 0,
    ),
  ];

  /// Ombre dark XL - Bottom sheets glass, drawers
  static const List<BoxShadow> shadowDarkXl = [
    BoxShadow(
      color: Color(0x99000000), // Black 60%
      offset: Offset(0, 16),
      blurRadius: 32,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x33FFFFFF), // White 20% pour le glow
      offset: Offset(0, 8),
      blurRadius: 16,
      spreadRadius: 0,
    ),
  ];

  // ===========================================================================
  // GLOW EFFECTS (pour les boutons primaires, éléments interactifs)
  // ===========================================================================

  /// Glow emerald - Pour les boutons primaires
  static const List<BoxShadow> glowEmerald = [
    BoxShadow(
      color: Color(0x4D16A34A), // Emerald 600 avec 30% opacity
      offset: Offset(0, 4),
      blurRadius: 12,
      spreadRadius: 0,
    ),
  ];

  /// Glow emerald hover - Pour les boutons primaires au hover
  static const List<BoxShadow> glowEmeraldHover = [
    BoxShadow(
      color: Color(0x6616A34A), // Emerald 600 avec 40% opacity
      offset: Offset(0, 6),
      blurRadius: 16,
      spreadRadius: 0,
    ),
  ];

  /// Glow amber - Pour les éléments avec focus
  static const List<BoxShadow> glowAmber = [
    BoxShadow(
      color: Color(0x4DF59E0B), // Amber 500 avec 30% opacity
      offset: Offset(0, 4),
      blurRadius: 12,
      spreadRadius: 0,
    ),
  ];

  /// Glow error - Pour les erreurs
  static const List<BoxShadow> glowError = [
    BoxShadow(
      color: Color(0x4DF03E3E), // Red 600 avec 30% opacity
      offset: Offset(0, 4),
      blurRadius: 12,
      spreadRadius: 0,
    ),
  ];

  // ===========================================================================
  // INNER SHADOWS (pour les inputs, surfaces enfoncées)
  // ===========================================================================

  /// Inner shadow light - Pour les inputs en light mode
  static const List<BoxShadow> innerShadowLight = [
    BoxShadow(
      color: Color(0x0D000000), // Black 5%
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: -2,
    ),
  ];

  /// Inner shadow dark - Pour les inputs en dark mode
  static const List<BoxShadow> innerShadowDark = [
    BoxShadow(
      color: Color(0x33000000), // Black 20%
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: -2,
    ),
  ];
}
