import 'package:flutter/material.dart';

/// Design System - Colors Tokens
/// Source de vérité pour toutes les couleurs de l'application
/// Synchronisé avec le frontend web (auto-loc-frontend)
class DSColors {
  DSColors._();

  // ===========================================================================
  // EMERALD - Couleur primaire (identique au frontend)
  // ===========================================================================

  /// Emerald 50 - Background très clair
  static const Color emerald50 = Color(0xFFF0FDF4);

  /// Emerald 100 - Background clair
  static const Color emerald100 = Color(0xFFDCFCE7);

  /// Emerald 200 - Border clair
  static const Color emerald200 = Color(0xFFBBF7D0);

  /// Emerald 300 - Hover état clair
  static const Color emerald300 = Color(0xFF86EFAC);

  /// Emerald 400 - États interactifs
  static const Color emerald400 = Color(0xFF4ADE80);

  /// Emerald 500 - Brand secondaire
  static const Color emerald500 = Color(0xFF22C55E);

  /// Emerald 600 - BRAND PRINCIPAL (comme le frontend)
  static const Color emerald600 = Color(0xFF16A34A);

  /// Emerald 700 - Hover/Active states
  static const Color emerald700 = Color(0xFF15803D);

  /// Emerald 800 - États pressed
  static const Color emerald800 = Color(0xFF166534);

  /// Emerald 900 - Texte emerald foncé
  static const Color emerald900 = Color(0xFF14532D);

  /// Emerald 950 - Background emerald très foncé
  static const Color emerald950 = Color(0xFF052E16);

  // ===========================================================================
  // AMBER - Couleur secondaire (texte brand, focus)
  // ===========================================================================

  static const Color amber50 = Color(0xFFFFFBEB);
  static const Color amber100 = Color(0xFFFEF3C7);
  static const Color amber200 = Color(0xFFFDE68A);
  static const Color amber300 = Color(0xFFFCD34D);
  static const Color amber400 = Color(0xFFFBBF24);
  static const Color amber500 = Color(0xFFF59E0B);
  static const Color amber600 = Color(0xFFB45309); // Comme frontend
  static const Color amber700 = Color(0xFF92400E);
  static const Color amber800 = Color(0xFF78350F);
  static const Color amber900 = Color(0xFF451A03);

  // ===========================================================================
  // RED - Erreurs, danger, rejets
  // ===========================================================================

  static const Color red50 = Color(0xFFFEF2F2);
  static const Color red100 = Color(0xFFFEE2E2);
  static const Color red200 = Color(0xFFFECACA);
  static const Color red300 = Color(0xFFFCA5A5);
  static const Color red400 = Color(0xFFF87171);
  static const Color red500 = Color(0xFFEF4444);
  static const Color red600 = Color(0xFFF03E3E); // Comme frontend
  static const Color red700 = Color(0xFFB91C1C);
  static const Color red800 = Color(0xFF991B1B);
  static const Color red900 = Color(0xFF7F1D1D);

  // ===========================================================================
  // ORANGE - Warnings, en attente
  // ===========================================================================

  static const Color orange50 = Color(0xFFFFF7ED);
  static const Color orange100 = Color(0xFFFFEDD5);
  static const Color orange200 = Color(0xFFFED7AA);
  static const Color orange300 = Color(0xFFFDBA74);
  static const Color orange400 = Color(0xFFFB923C);
  static const Color orange500 = Color(0xFFF97316);
  static const Color orange600 = Color(0xFFFD7E14); // Comme frontend
  static const Color orange700 = Color(0xFFC2410C);
  static const Color orange800 = Color(0xFF9A3412);
  static const Color orange900 = Color(0xFF7C2D12);

  // ===========================================================================
  // BLUE - Info, liens
  // ===========================================================================

  static const Color blue50 = Color(0xFFEFF6FF);
  static const Color blue100 = Color(0xFFDBEAFE);
  static const Color blue200 = Color(0xFFBFDBFE);
  static const Color blue300 = Color(0xFF93C5FD);
  static const Color blue400 = Color(0xFF60A5FA);
  static const Color blue500 = Color(0xFF3B82F6);
  static const Color blue600 = Color(0xFF2563EB); // Comme frontend
  static const Color blue700 = Color(0xFF1D4ED8);
  static const Color blue800 = Color(0xFF1E40AF);
  static const Color blue900 = Color(0xFF1E3A8A);

  // ===========================================================================
  // VIOLET - Litiges, premium
  // ===========================================================================

  static const Color violet50 = Color(0xFFF5F3FF);
  static const Color violet100 = Color(0xFFEDE9FE);
  static const Color violet200 = Color(0xFFDDD6FE);
  static const Color violet300 = Color(0xFFC4B5FD);
  static const Color violet400 = Color(0xFFA78BFA);
  static const Color violet500 = Color(0xFF8B5CF6);
  static const Color violet600 = Color(0xFF7C3AED); // Comme frontend
  static const Color violet700 = Color(0xFF6D28D9);
  static const Color violet800 = Color(0xFF5B21B6);
  static const Color violet900 = Color(0xFF4C1D95);

  // ===========================================================================
  // ZINC - Neutres pour dark mode (glassmorphism)
  // ===========================================================================

  static const Color zinc50 = Color(0xFFFAFAFA);
  static const Color zinc100 = Color(0xFFF4F4F5);
  static const Color zinc200 = Color(0xFFE4E4E7);
  static const Color zinc300 = Color(0xFFD4D4D8);
  static const Color zinc400 = Color(0xFFA1A1AA);
  static const Color zinc500 = Color(0xFF71717A);
  static const Color zinc600 = Color(0xFF52525B);
  static const Color zinc700 = Color(0xFF3F3F46);
  static const Color zinc800 = Color(0xFF27272A);
  static const Color zinc900 = Color(0xFF18181B);
  static const Color zinc950 = Color(0xFF09090B);

  // ===========================================================================
  // BACKGROUNDS GLASSMORPHISM (Dark Mode)
  // ===========================================================================

  /// Background principal - Noir profond
  static const Color darkBackground = Color(0xFF000000);

  /// Background secondaire - Noir zinc
  static const Color darkBackgroundSecondary = Color(0xFF09090B); // zinc-950

  /// Surface glass - Noir semi-transparent avec blur
  static const Color darkSurfaceGlass = Color(0x1AFFFFFF); // White 10% opacity

  /// Surface glass hover
  static const Color darkSurfaceGlassHover = Color(0x26FFFFFF); // White 15% opacity

  /// Surface elevated
  static const Color darkSurfaceElevated = Color(0xFF18181B); // zinc-900

  /// Surface card
  static const Color darkSurfaceCard = Color(0x0DFFFFFF); // White 5% opacity

  /// Border glass
  static const Color darkBorderGlass = Color(0x1AFFFFFF); // White 10% opacity

  /// Border subtle
  static const Color darkBorder = Color(0xFF27272A); // zinc-800

  // ===========================================================================
  // BACKGROUNDS LIGHT MODE
  // ===========================================================================

  static const Color lightBackground = Color(0xFFFFFFFF);
  static const Color lightBackgroundSecondary = Color(0xFFFAFAFA); // zinc-50
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceElevated = Color(0xFFF4F4F5); // zinc-100
  static const Color lightBorder = Color(0xFFE4E4E7); // zinc-200

  // ===========================================================================
  // TEXT COLORS (Dark Mode)
  // ===========================================================================

  static const Color darkTextPrimary = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFFA1A1AA); // zinc-400
  static const Color darkTextTertiary = Color(0xFF71717A); // zinc-500
  static const Color darkTextDisabled = Color(0xFF52525B); // zinc-600

  // ===========================================================================
  // TEXT COLORS (Light Mode)
  // ===========================================================================

  static const Color lightTextPrimary = Color(0xFF18181B); // zinc-900
  static const Color lightTextSecondary = Color(0xFF52525B); // zinc-600
  static const Color lightTextTertiary = Color(0xFF71717A); // zinc-500
  static const Color lightTextDisabled = Color(0xFFA1A1AA); // zinc-400

  // ===========================================================================
  // STATUTS RÉSERVATIONS (comme le frontend)
  // ===========================================================================

  /// EN_ATTENTE
  static const Color statusPending = orange600;

  /// PAYEE
  static const Color statusPaid = blue600;

  /// CONFIRMEE
  static const Color statusConfirmed = emerald600;

  /// EN_COURS
  static const Color statusOngoing = violet600;

  /// TERMINEE
  static const Color statusCompleted = emerald700;

  /// ANNULEE
  static const Color statusCancelled = red600;

  /// LITIGE
  static const Color statusDispute = violet600;

  // ===========================================================================
  // STATUTS KYC
  // ===========================================================================

  static const Color kycNotVerified = zinc400;
  static const Color kycPending = orange600;
  static const Color kycVerified = emerald600;
  static const Color kycRejected = red600;

  // ===========================================================================
  // AUTRES COULEURS SÉMANTIQUES
  // ===========================================================================

  /// Success (général)
  static const Color success = emerald600;
  static const Color successLight = emerald100;
  static const Color successDark = emerald700;

  /// Error
  static const Color error = red600;
  static const Color errorLight = red100;
  static const Color errorDark = red700;

  /// Warning
  static const Color warning = orange600;
  static const Color warningLight = orange100;
  static const Color warningDark = orange700;

  /// Info
  static const Color info = blue600;
  static const Color infoLight = blue100;
  static const Color infoDark = blue700;

  // ===========================================================================
  // OVERLAY & SCRIM
  // ===========================================================================

  static const Color overlay = Color(0x80000000); // Black 50% opacity
  static const Color scrim = Color(0xB3000000); // Black 70% opacity
  static const Color backdrop = Color(0x99000000); // Black 60% opacity

  // ===========================================================================
  // TRANSPARENT
  // ===========================================================================

  static const Color transparent = Color(0x00000000);

  /// White semi-transparent (pour glassmorphism)
  static const Color whiteAlpha10 = Color(0x1AFFFFFF);
  static const Color whiteAlpha20 = Color(0x33FFFFFF);
  static const Color whiteAlpha30 = Color(0x4DFFFFFF);
  static const Color whiteAlpha40 = Color(0x66FFFFFF);
  static const Color whiteAlpha50 = Color(0x80FFFFFF);

  /// Black semi-transparent
  static const Color blackAlpha10 = Color(0x1A000000);
  static const Color blackAlpha20 = Color(0x33000000);
  static const Color blackAlpha30 = Color(0x4D000000);
  static const Color blackAlpha40 = Color(0x66000000);
  static const Color blackAlpha50 = Color(0x80000000);

  // ===========================================================================
  // GRADIENTS
  // ===========================================================================

  /// Gradient emeraude (pour boutons primaires)
  static const LinearGradient emeraldGradient = LinearGradient(
    colors: [emerald600, emerald700],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Gradient glass (pour surfaces glassmorphism)
  static const LinearGradient glassGradient = LinearGradient(
    colors: [whiteAlpha10, whiteAlpha20],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Gradient shimmer (pour loading)
  static const LinearGradient shimmerGradient = LinearGradient(
    colors: [
      Color(0x00FFFFFF),
      Color(0x1AFFFFFF),
      Color(0x00FFFFFF),
    ],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment(-1.0, 0.0),
    end: Alignment(1.0, 0.0),
  );
}
