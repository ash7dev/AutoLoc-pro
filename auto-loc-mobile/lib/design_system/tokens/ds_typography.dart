import 'package:flutter/material.dart';
import 'ds_colors.dart';

/// Design System - Typography Tokens
/// Système typographique cohérent avec Inter comme font principale
/// Inspiré du frontend mais adapté pour mobile
class DSTypography {
  DSTypography._();

  // ===========================================================================
  // FONT FAMILIES
  // ===========================================================================

  /// Font family principale: Inter
  static const String fontFamilyPrimary = 'Inter';

  /// Font family monospace (pour les codes, numéros)
  static const String fontFamilyMono = 'SF Mono';

  // ===========================================================================
  // FONT WEIGHTS
  // ===========================================================================

  static const FontWeight light = FontWeight.w300;
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;
  static const FontWeight extraBold = FontWeight.w800;

  // ===========================================================================
  // FONT SIZES
  // ===========================================================================

  /// 10px - Très petit (captions, labels)
  static const double fontSizeXxs = 10.0;

  /// 12px - Extra small (captions, helper text)
  static const double fontSizeXs = 12.0;

  /// 14px - Small (body secondaire, labels)
  static const double fontSizeSm = 14.0;

  /// 16px - Base (body principal)
  static const double fontSizeBase = 16.0;

  /// 18px - Medium (sous-titres)
  static const double fontSizeMd = 18.0;

  /// 20px - Large (titres de sections)
  static const double fontSizeLg = 20.0;

  /// 24px - Extra large (titres H3)
  static const double fontSizeXl = 24.0;

  /// 28px - 2XL (titres H2)
  static const double fontSizeXxl = 28.0;

  /// 32px - 3XL (titres H1)
  static const double fontSizeXxxl = 32.0;

  /// 36px - 4XL (hero titles)
  static const double fontSizeXxxxl = 36.0;

  /// 40px - 5XL (display)
  static const double fontSizeXxxxxl = 40.0;

  // ===========================================================================
  // LINE HEIGHTS
  // ===========================================================================

  static const double lineHeightTight = 1.2;
  static const double lineHeightNormal = 1.5;
  static const double lineHeightRelaxed = 1.75;

  // ===========================================================================
  // LETTER SPACING
  // ===========================================================================

  static const double letterSpacingTight = -0.5;
  static const double letterSpacingNormal = 0.0;
  static const double letterSpacingWide = 0.5;
  static const double letterSpacingExtraWide = 1.0;

  // ===========================================================================
  // DISPLAY STYLES (Hero titles, onboarding)
  // ===========================================================================

  /// Display Large - Pour les hero sections
  static const TextStyle displayLarge = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXxxxxl, // 40px
    fontWeight: bold,
    height: lineHeightTight,
    letterSpacing: letterSpacingTight,
  );

  /// Display Medium
  static const TextStyle displayMedium = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXxxxl, // 36px
    fontWeight: bold,
    height: lineHeightTight,
    letterSpacing: letterSpacingTight,
  );

  /// Display Small
  static const TextStyle displaySmall = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXxxl, // 32px
    fontWeight: bold,
    height: lineHeightTight,
    letterSpacing: letterSpacingNormal,
  );

  // ===========================================================================
  // HEADINGS
  // ===========================================================================

  /// H1 - Titres de pages
  static const TextStyle h1 = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXxxl, // 32px
    fontWeight: bold,
    height: lineHeightTight,
    letterSpacing: letterSpacingNormal,
  );

  /// H2 - Titres de sections principales
  static const TextStyle h2 = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXxl, // 28px
    fontWeight: semiBold,
    height: lineHeightTight,
    letterSpacing: letterSpacingNormal,
  );

  /// H3 - Titres de sous-sections
  static const TextStyle h3 = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXl, // 24px
    fontWeight: semiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// H4 - Titres de cards, dialogs
  static const TextStyle h4 = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeLg, // 20px
    fontWeight: semiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// H5 - Petits titres
  static const TextStyle h5 = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeMd, // 18px
    fontWeight: semiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// H6 - Micro titres
  static const TextStyle h6 = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeBase, // 16px
    fontWeight: semiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  // ===========================================================================
  // BODY TEXT
  // ===========================================================================

  /// Body Large - Texte principal large
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeBase, // 16px
    fontWeight: regular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// Body Medium - Texte principal (le plus utilisé)
  static const TextStyle bodyMedium = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeSm, // 14px
    fontWeight: regular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// Body Small - Texte secondaire
  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXs, // 12px
    fontWeight: regular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  // ===========================================================================
  // LABELS
  // ===========================================================================

  /// Label Large - Labels de champs, boutons
  static const TextStyle labelLarge = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeBase, // 16px
    fontWeight: medium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// Label Medium - Labels standards
  static const TextStyle labelMedium = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeSm, // 14px
    fontWeight: medium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// Label Small - Petits labels
  static const TextStyle labelSmall = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXs, // 12px
    fontWeight: medium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
  );

  // ===========================================================================
  // BUTTONS
  // ===========================================================================

  /// Button Large
  static const TextStyle buttonLarge = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeBase, // 16px
    fontWeight: semiBold,
    height: 1.0,
    letterSpacing: letterSpacingWide,
  );

  /// Button Medium
  static const TextStyle buttonMedium = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeSm, // 14px
    fontWeight: semiBold,
    height: 1.0,
    letterSpacing: letterSpacingWide,
  );

  /// Button Small
  static const TextStyle buttonSmall = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXs, // 12px
    fontWeight: semiBold,
    height: 1.0,
    letterSpacing: letterSpacingWide,
  );

  // ===========================================================================
  // CAPTIONS & HELPERS
  // ===========================================================================

  /// Caption - Textes d'aide, timestamps
  static const TextStyle caption = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXs, // 12px
    fontWeight: regular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );

  /// Overline - Labels ALL CAPS
  static const TextStyle overline = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXxs, // 10px
    fontWeight: semiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingExtraWide,
  );

  // ===========================================================================
  // SPECIAL STYLES
  // ===========================================================================

  /// Price - Affichage des prix (bold, emerald)
  static const TextStyle price = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXl, // 24px
    fontWeight: bold,
    height: lineHeightTight,
    letterSpacing: letterSpacingNormal,
    color: DSColors.emerald600,
  );

  /// Price Large - Prix hero
  static const TextStyle priceLarge = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeXxxl, // 32px
    fontWeight: bold,
    height: lineHeightTight,
    letterSpacing: letterSpacingTight,
    color: DSColors.emerald600,
  );

  /// Price Small - Prix dans les cards
  static const TextStyle priceSmall = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeMd, // 18px
    fontWeight: bold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: DSColors.emerald600,
  );

  /// Code - Pour afficher codes OTP, références
  static const TextStyle code = TextStyle(
    fontFamily: fontFamilyMono,
    fontSize: fontSizeLg, // 20px
    fontWeight: semiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingExtraWide,
  );

  /// Link - Liens cliquables
  static const TextStyle link = TextStyle(
    fontFamily: fontFamilyPrimary,
    fontSize: fontSizeSm, // 14px
    fontWeight: medium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: DSColors.blue600,
    decoration: TextDecoration.underline,
  );

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /// Applique une couleur à un TextStyle
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  /// Applique un weight à un TextStyle
  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }

  /// Applique une taille à un TextStyle
  static TextStyle withSize(TextStyle style, double size) {
    return style.copyWith(fontSize: size);
  }

  /// Applique une hauteur de ligne à un TextStyle
  static TextStyle withHeight(TextStyle style, double height) {
    return style.copyWith(height: height);
  }
}
