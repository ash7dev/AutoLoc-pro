import 'package:flutter/material.dart';

/// Design System - Border Radius Tokens
/// Définit les rayons de bordure cohérents pour l'application
/// Synchronisé avec le frontend (Tailwind)
class DSRadius {
  DSRadius._();

  // ===========================================================================
  // RADIUS VALUES
  // ===========================================================================

  /// Aucun rayon (carré)
  static const double none = 0.0;

  /// 2px - Très petit
  static const double xxs = 2.0;

  /// 4px - Extra small
  static const double xs = 4.0;

  /// 6px - Small
  static const double sm = 6.0;

  /// 8px - Medium (radius par défaut pour les cards, inputs)
  static const double md = 8.0;

  /// 12px - Large (boutons, cards)
  static const double lg = 12.0;

  /// 16px - Extra large (dialogs, bottom sheets)
  static const double xl = 16.0;

  /// 20px - 2XL
  static const double xxl = 20.0;

  /// 24px - 3XL (grandes modales)
  static const double xxxl = 24.0;

  /// 999px - Full (boutons pill, badges ronds)
  static const double full = 999.0;

  // ===========================================================================
  // SEMANTIC RADIUS (usage spécifique)
  // ===========================================================================

  /// Radius pour les boutons
  static const double button = lg; // 12px

  /// Radius pour les boutons pill
  static const double buttonPill = full; // 999px

  /// Radius pour les inputs
  static const double input = md; // 8px

  /// Radius pour les cards
  static const double card = lg; // 12px

  /// Radius pour les cards larges
  static const double cardLarge = xl; // 16px

  /// Radius pour les badges
  static const double badge = sm; // 6px

  /// Radius pour les badges pill
  static const double badgePill = full; // 999px

  /// Radius pour les avatars (plein cercle)
  static const double avatar = full; // 999px

  /// Radius pour les dialogs
  static const double dialog = xl; // 16px

  /// Radius pour les bottom sheets
  static const double bottomSheet = xxxl; // 24px (top corners seulement)

  /// Radius pour les images dans les cards
  static const double image = md; // 8px

  /// Radius pour les chips
  static const double chip = full; // 999px

  /// Radius pour les switches
  static const double switchRadius = full; // 999px

  /// Radius pour les checkboxes
  static const double checkbox = xs; // 4px

  /// Radius pour les snackbars
  static const double snackbar = md; // 8px

  /// Radius pour les tooltips
  static const double tooltip = sm; // 6px

  // ===========================================================================
  // BORDER RADIUS (pour widgets)
  // ===========================================================================

  /// BorderRadius none
  static const BorderRadius borderRadiusNone = BorderRadius.zero;

  /// BorderRadius XXS
  static const BorderRadius borderRadiusXxs = BorderRadius.all(
    Radius.circular(xxs),
  );

  /// BorderRadius XS
  static const BorderRadius borderRadiusXs = BorderRadius.all(
    Radius.circular(xs),
  );

  /// BorderRadius SM
  static const BorderRadius borderRadiusSm = BorderRadius.all(
    Radius.circular(sm),
  );

  /// BorderRadius MD
  static const BorderRadius borderRadiusMd = BorderRadius.all(
    Radius.circular(md),
  );

  /// BorderRadius LG
  static const BorderRadius borderRadiusLg = BorderRadius.all(
    Radius.circular(lg),
  );

  /// BorderRadius XL
  static const BorderRadius borderRadiusXl = BorderRadius.all(
    Radius.circular(xl),
  );

  /// BorderRadius XXL
  static const BorderRadius borderRadiusXxl = BorderRadius.all(
    Radius.circular(xxl),
  );

  /// BorderRadius XXXL
  static const BorderRadius borderRadiusXxxl = BorderRadius.all(
    Radius.circular(xxxl),
  );

  /// BorderRadius Full
  static const BorderRadius borderRadiusFull = BorderRadius.all(
    Radius.circular(full),
  );

  /// BorderRadius Button
  static const BorderRadius borderRadiusButton = BorderRadius.all(
    Radius.circular(button),
  );

  /// BorderRadius Input
  static const BorderRadius borderRadiusInput = BorderRadius.all(
    Radius.circular(input),
  );

  /// BorderRadius Card
  static const BorderRadius borderRadiusCard = BorderRadius.all(
    Radius.circular(card),
  );

  /// BorderRadius Dialog
  static const BorderRadius borderRadiusDialog = BorderRadius.all(
    Radius.circular(dialog),
  );

  /// BorderRadius Bottom Sheet (top corners seulement)
  static const BorderRadius borderRadiusBottomSheet = BorderRadius.only(
    topLeft: Radius.circular(bottomSheet),
    topRight: Radius.circular(bottomSheet),
  );

  /// BorderRadius Image
  static const BorderRadius borderRadiusImage = BorderRadius.all(
    Radius.circular(image),
  );

  // ===========================================================================
  // CIRCULAR BORDER RADIUS (pour Container avec decoration)
  // ===========================================================================

  /// Circular radius none
  static const Radius circularNone = Radius.circular(none);

  /// Circular radius XXS
  static const Radius circularXxs = Radius.circular(xxs);

  /// Circular radius XS
  static const Radius circularXs = Radius.circular(xs);

  /// Circular radius SM
  static const Radius circularSm = Radius.circular(sm);

  /// Circular radius MD
  static const Radius circularMd = Radius.circular(md);

  /// Circular radius LG
  static const Radius circularLg = Radius.circular(lg);

  /// Circular radius XL
  static const Radius circularXl = Radius.circular(xl);

  /// Circular radius XXL
  static const Radius circularXxl = Radius.circular(xxl);

  /// Circular radius XXXL
  static const Radius circularXxxl = Radius.circular(xxxl);

  /// Circular radius Full
  static const Radius circularFull = Radius.circular(full);
}
