/// Design System - Breakpoints Tokens
/// Définit les breakpoints pour le responsive design
/// Même si c'est une app mobile, on gère les tablettes et orientations
class DSBreakpoints {
  DSBreakpoints._();

  // ===========================================================================
  // BREAKPOINTS (largeur en pixels)
  // ===========================================================================

  /// Mobile petit (iPhone SE, petits Android)
  static const double mobileSmall = 320.0;

  /// Mobile standard (iPhone 12/13, Android standards)
  static const double mobile = 375.0;

  /// Mobile large (iPhone Plus, grands Android)
  static const double mobileLarge = 428.0;

  /// Tablet petit (iPad mini portrait)
  static const double tabletSmall = 768.0;

  /// Tablet standard (iPad portrait)
  static const double tablet = 834.0;

  /// Tablet large (iPad Pro portrait)
  static const double tabletLarge = 1024.0;

  /// Desktop (iPad landscape, foldables)
  static const double desktop = 1280.0;

  // ===========================================================================
  // DEVICE CATEGORIES
  // ===========================================================================

  /// Vérifie si l'écran est un petit mobile
  static bool isSmallMobile(double width) => width < mobile;

  /// Vérifie si l'écran est un mobile standard
  static bool isMobile(double width) => width >= mobile && width < tabletSmall;

  /// Vérifie si l'écran est un grand mobile
  static bool isLargeMobile(double width) =>
      width >= mobileLarge && width < tabletSmall;

  /// Vérifie si l'écran est une tablette
  static bool isTablet(double width) =>
      width >= tabletSmall && width < desktop;

  /// Vérifie si l'écran est un petit tablet
  static bool isSmallTablet(double width) =>
      width >= tabletSmall && width < tablet;

  /// Vérifie si l'écran est une grande tablette
  static bool isLargeTablet(double width) =>
      width >= tablet && width < desktop;

  /// Vérifie si l'écran est desktop (ou tablette landscape)
  static bool isDesktop(double width) => width >= desktop;

  // ===========================================================================
  // HELPERS POUR RESPONSIVE
  // ===========================================================================

  /// Retourne le nombre de colonnes selon la largeur
  static int getColumns(double width) {
    if (width < mobile) return 1;
    if (width < tabletSmall) return 1;
    if (width < tablet) return 2;
    if (width < desktop) return 2;
    return 3;
  }

  /// Retourne le padding horizontal selon la largeur
  static double getHorizontalPadding(double width) {
    if (width < mobile) return 16.0;
    if (width < tabletSmall) return 16.0;
    if (width < tablet) return 24.0;
    if (width < desktop) return 32.0;
    return 48.0;
  }

  /// Retourne la largeur maximale du contenu
  static double getMaxContentWidth(double width) {
    if (width < tabletSmall) return width;
    if (width < desktop) return 768.0;
    return 1280.0;
  }

  /// Retourne l'espacement entre les cards selon la largeur
  static double getCardSpacing(double width) {
    if (width < tabletSmall) return 16.0;
    if (width < desktop) return 24.0;
    return 32.0;
  }

  /// Retourne si on doit afficher la navigation mobile ou desktop
  static bool shouldShowMobileNav(double width) {
    return width < tabletSmall;
  }

  /// Retourne si on doit afficher le drawer ou pas
  static bool shouldShowDrawer(double width) {
    return width >= tablet;
  }

  /// Retourne le nombre d'items visibles dans un carousel
  static int getCarouselVisibleItems(double width) {
    if (width < mobile) return 1;
    if (width < mobileLarge) return 1;
    if (width < tabletSmall) return 1;
    if (width < tablet) return 2;
    if (width < desktop) return 2;
    return 3;
  }

  /// Retourne la taille de police adaptée
  static double getAdaptiveFontSize(double width, double baseSize) {
    if (width < mobile) return baseSize * 0.9;
    if (width < tabletSmall) return baseSize;
    if (width < desktop) return baseSize * 1.1;
    return baseSize * 1.2;
  }

  /// Retourne l'espacement adapté
  static double getAdaptiveSpacing(double width, double baseSpacing) {
    if (width < tabletSmall) return baseSpacing;
    if (width < desktop) return baseSpacing * 1.25;
    return baseSpacing * 1.5;
  }
}
