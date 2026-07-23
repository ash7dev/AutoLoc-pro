import 'package:flutter/painting.dart';

/// Design System - Spacing Tokens
/// Échelle d'espacement cohérente basée sur 4px
/// Synchronisé avec le système de spacing du frontend (Tailwind)
class DSSpacing {
  DSSpacing._();

  // ===========================================================================
  // BASE UNIT
  // ===========================================================================

  /// Base unit: 4px
  static const double baseUnit = 4.0;

  // ===========================================================================
  // SPACING SCALE (multiples de 4)
  // ===========================================================================

  /// 0px
  static const double none = 0.0;

  /// 2px - Très petit espacement (borders, dividers)
  static const double xxxs = 2.0;

  /// 4px - Extra extra small
  static const double xxs = 4.0;

  /// 8px - Extra small (padding minimal dans les badges)
  static const double xs = 8.0;

  /// 12px - Small (padding dans les petits boutons)
  static const double sm = 12.0;

  /// 16px - Medium (padding standard des boutons, cards)
  static const double md = 16.0;

  /// 20px - Medium-Large
  static const double ml = 20.0;

  /// 24px - Large (padding des sections, margins entre éléments)
  static const double lg = 24.0;

  /// 32px - Extra large (padding des screens, grandes sections)
  static const double xl = 32.0;

  /// 40px - 2XL
  static const double xxl = 40.0;

  /// 48px - 3XL
  static const double xxxl = 48.0;

  /// 64px - 4XL (grandes marges entre sections)
  static const double xxxxl = 64.0;

  /// 80px - 5XL
  static const double xxxxxl = 80.0;

  /// 96px - 6XL
  static const double xxxxxxl = 96.0;

  // ===========================================================================
  // SEMANTIC SPACING (usage spécifique)
  // ===========================================================================

  /// Padding horizontal des screens
  static const double screenPaddingHorizontal = md; // 16px

  /// Padding vertical des screens
  static const double screenPaddingVertical = lg; // 24px

  /// Padding des cards
  static const double cardPadding = md; // 16px

  /// Padding des cards larges
  static const double cardPaddingLarge = lg; // 24px

  /// Espace entre les éléments d'une liste
  static const double listItemSpacing = md; // 16px

  /// Espace entre les sections
  static const double sectionSpacing = xl; // 32px

  /// Espace entre les grandes sections
  static const double largeSectionSpacing = xxxxl; // 64px

  /// Padding des boutons (horizontal)
  static const double buttonPaddingHorizontal = lg; // 24px

  /// Padding des boutons (vertical)
  static const double buttonPaddingVertical = sm; // 12px

  /// Padding des petits boutons (horizontal)
  static const double buttonSmallPaddingHorizontal = md; // 16px

  /// Padding des petits boutons (vertical)
  static const double buttonSmallPaddingVertical = xs; // 8px

  /// Padding des grands boutons (horizontal)
  static const double buttonLargePaddingHorizontal = xl; // 32px

  /// Padding des grands boutons (vertical)
  static const double buttonLargePaddingVertical = md; // 16px

  /// Padding des inputs (horizontal)
  static const double inputPaddingHorizontal = md; // 16px

  /// Padding des inputs (vertical)
  static const double inputPaddingVertical = sm; // 12px

  /// Gap entre les éléments d'une row/column
  static const double gap = xs; // 8px

  /// Gap medium
  static const double gapMd = md; // 16px

  /// Gap large
  static const double gapLg = lg; // 24px

  /// Padding des badges
  static const double badgePaddingHorizontal = xs; // 8px

  /// Padding des badges (vertical)
  static const double badgePaddingVertical = xxs; // 4px

  /// Espace entre l'icon et le texte dans un bouton
  static const double iconTextSpacing = xs; // 8px

  /// Padding des bottom sheets
  static const double bottomSheetPadding = lg; // 24px

  /// Padding des dialogs
  static const double dialogPadding = lg; // 24px

  /// Padding des snackbars
  static const double snackbarPadding = md; // 16px

  /// Marge autour des images dans les cards
  static const double imageMargin = sm; // 12px

  // ===========================================================================
  // INSETS (EdgeInsets helpers)
  // ===========================================================================

  /// Padding pour les screens (horizontal + vertical)
  static const screenPadding = EdgeInsets.symmetric(
    horizontal: screenPaddingHorizontal,
    vertical: screenPaddingVertical,
  );

  /// Padding pour les screens (horizontal seulement)
  static const screenPaddingH = EdgeInsets.symmetric(
    horizontal: screenPaddingHorizontal,
  );

  /// Padding pour les cards
  static const cardPaddingAll = EdgeInsets.all(cardPadding);

  /// Padding pour les cards larges
  static const cardPaddingLargeAll = EdgeInsets.all(cardPaddingLarge);

  /// Padding pour les boutons
  static const buttonPadding = EdgeInsets.symmetric(
    horizontal: buttonPaddingHorizontal,
    vertical: buttonPaddingVertical,
  );

  /// Padding pour les petits boutons
  static const buttonSmallPadding = EdgeInsets.symmetric(
    horizontal: buttonSmallPaddingHorizontal,
    vertical: buttonSmallPaddingVertical,
  );

  /// Padding pour les grands boutons
  static const buttonLargePadding = EdgeInsets.symmetric(
    horizontal: buttonLargePaddingHorizontal,
    vertical: buttonLargePaddingVertical,
  );

  /// Padding pour les inputs
  static const inputPadding = EdgeInsets.symmetric(
    horizontal: inputPaddingHorizontal,
    vertical: inputPaddingVertical,
  );

  /// Padding pour les badges
  static const badgePadding = EdgeInsets.symmetric(
    horizontal: badgePaddingHorizontal,
    vertical: badgePaddingVertical,
  );

  /// Padding pour les bottom sheets
  static const bottomSheetPaddingAll = EdgeInsets.all(bottomSheetPadding);

  /// Padding pour les dialogs
  static const dialogPaddingAll = EdgeInsets.all(dialogPadding);

  /// Padding pour les snackbars
  static const snackbarPaddingAll = EdgeInsets.all(snackbarPadding);
}
