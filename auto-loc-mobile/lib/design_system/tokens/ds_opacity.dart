/// Design System - Opacity Tokens
/// Définit les niveaux d'opacité cohérents pour l'application
/// Utilisé pour les glassmorphism, overlays, disabled states
class DSOpacity {
  DSOpacity._();

  // ===========================================================================
  // OPACITY LEVELS (0.0 à 1.0)
  // ===========================================================================

  /// Opacité 0% - Transparent
  static const double transparent = 0.0;

  /// Opacité 5% - Très subtil (backgrounds glass)
  static const double opacity5 = 0.05;

  /// Opacité 10% - Subtil (glassmorphism surfaces)
  static const double opacity10 = 0.10;

  /// Opacité 15% - Léger (glassmorphism hover)
  static const double opacity15 = 0.15;

  /// Opacité 20% - Visible (overlays légers)
  static const double opacity20 = 0.20;

  /// Opacité 25%
  static const double opacity25 = 0.25;

  /// Opacité 30% - Moyen (borders glass, glows)
  static const double opacity30 = 0.30;

  /// Opacité 40% - Disabled state, secondary elements
  static const double opacity40 = 0.40;

  /// Opacité 50% - Semi-transparent (overlays, modals)
  static const double opacity50 = 0.50;

  /// Opacité 60% - Scrim medium
  static const double opacity60 = 0.60;

  /// Opacité 70% - Scrim fort
  static const double opacity70 = 0.70;

  /// Opacité 75%
  static const double opacity75 = 0.75;

  /// Opacité 80% - Presque opaque
  static const double opacity80 = 0.80;

  /// Opacité 90% - Très opaque
  static const double opacity90 = 0.90;

  /// Opacité 100% - Opaque
  static const double opaque = 1.0;

  // ===========================================================================
  // SEMANTIC OPACITY (usage spécifique)
  // ===========================================================================

  /// Glassmorphism - Surface principale
  static const double glassSurface = opacity10; // 10%

  /// Glassmorphism - Surface hover
  static const double glassSurfaceHover = opacity15; // 15%

  /// Glassmorphism - Surface pressed
  static const double glassSurfacePressed = opacity20; // 20%

  /// Glassmorphism - Border
  static const double glassBorder = opacity10; // 10%

  /// Disabled - Texte disabled
  static const double disabledText = opacity40; // 40%

  /// Disabled - Background disabled
  static const double disabledBackground = opacity10; // 10%

  /// Disabled - Icon disabled
  static const double disabledIcon = opacity40; // 40%

  /// Overlay - Léger (tooltips, dropdowns)
  static const double overlayLight = opacity20; // 20%

  /// Overlay - Moyen (modals, dialogs)
  static const double overlayMedium = opacity50; // 50%

  /// Overlay - Fort (full screen overlays)
  static const double overlayStrong = opacity70; // 70%

  /// Scrim - Pour les modals
  static const double scrimModal = opacity60; // 60%

  /// Scrim - Pour les bottom sheets
  static const double scrimBottomSheet = opacity50; // 50%

  /// Scrim - Pour les drawers
  static const double scrimDrawer = opacity70; // 70%

  /// Hover - Augmentation d'opacité au hover
  static const double hoverIncrease = opacity10; // +10%

  /// Pressed - Réduction d'opacité au press
  static const double pressedDecrease = opacity80; // 80% de l'opacité originale

  /// Focus - Opacité du focus ring
  static const double focusRing = opacity30; // 30%

  /// Ripple - Opacité de l'effet ripple
  static const double ripple = opacity20; // 20%

  /// Image placeholder - Pendant le chargement
  static const double imagePlaceholder = opacity10; // 10%

  /// Skeleton - Shimmer loading
  static const double skeleton = opacity10; // 10%

  /// Divider - Séparateurs
  static const double divider = opacity10; // 10%

  /// Badge notification - Petit point rouge
  static const double badgeNotification = opaque; // 100%

  /// Watermark - Filigrane
  static const double watermark = opacity5; // 5%

  // ===========================================================================
  // ANIMATION OPACITY (pour les transitions fade in/out)
  // ===========================================================================

  /// Fade out - État initial (invisible)
  static const double fadeOutStart = transparent; // 0%

  /// Fade in - État final (visible)
  static const double fadeInEnd = opaque; // 100%

  /// Fade partial - Semi-visible
  static const double fadePartial = opacity50; // 50%

  // ===========================================================================
  // ACCESSIBILITY
  // ===========================================================================

  /// Opacité minimale pour le texte (WCAG contrast)
  static const double textMinimum = opacity90; // 90%

  /// Opacité minimale pour les icons cliquables
  static const double interactiveMinimum = opacity80; // 80%
}
