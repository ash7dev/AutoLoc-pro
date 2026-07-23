import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_radius.dart';
import '../tokens/ds_elevation.dart';
import '../tokens/ds_spacing.dart';
import '../tokens/ds_duration.dart';

/// Design System - App Theme
/// Définit les thèmes dark (glassmorphism) et light de l'application
/// Le thème dark avec glassmorphism est le thème par défaut
class AppTheme {
  AppTheme._();

  // ===========================================================================
  // DARK THEME (GLASSMORPHISM) - Thème par défaut
  // ===========================================================================

  static ThemeData get darkTheme => ThemeData(
        // Material 3
        useMaterial3: true,

        // Brightness
        brightness: Brightness.dark,

        // Color Scheme
        colorScheme: const ColorScheme.dark(
          // Primary (Emerald)
          primary: DSColors.emerald600,
          onPrimary: Colors.white,
          primaryContainer: DSColors.emerald700,
          onPrimaryContainer: DSColors.emerald50,

          // Secondary (Amber)
          secondary: DSColors.amber600,
          onSecondary: Colors.black,
          secondaryContainer: DSColors.amber700,
          onSecondaryContainer: DSColors.amber50,

          // Error
          error: DSColors.red600,
          onError: Colors.white,
          errorContainer: DSColors.red700,
          onErrorContainer: DSColors.red50,

          // Background & Surface (Glassmorphism)
          surface: DSColors.darkBackground, // Noir profond
          onSurface: DSColors.darkTextPrimary,

          // Variants (TODO: Utiliser surfaceVariant pour Flutter 3.19.6)
          surfaceVariant: DSColors.darkSurfaceElevated,
          onSurfaceVariant: DSColors.darkTextSecondary,

          // Outline
          outline: DSColors.darkBorderGlass,
          outlineVariant: DSColors.darkBorder,

          // Shadow & Scrim
          shadow: Colors.black,
          scrim: DSColors.scrim,
        ),

        // Scaffold
        scaffoldBackgroundColor: DSColors.darkBackground,

        // App Bar Theme
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          foregroundColor: DSColors.darkTextPrimary,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeLg,
            fontWeight: DSTypography.semiBold,
            color: DSColors.darkTextPrimary,
          ),
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarBrightness: Brightness.dark,
            statusBarIconBrightness: Brightness.light,
            statusBarColor: Colors.transparent,
          ),
        ),

        // Text Theme
        textTheme: const TextTheme(
          // Display
          displayLarge: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXxxxxl,
            fontWeight: DSTypography.bold,
            color: DSColors.darkTextPrimary,
            height: DSTypography.lineHeightTight,
          ),
          displayMedium: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXxxxl,
            fontWeight: DSTypography.bold,
            color: DSColors.darkTextPrimary,
            height: DSTypography.lineHeightTight,
          ),
          displaySmall: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXxxl,
            fontWeight: DSTypography.bold,
            color: DSColors.darkTextPrimary,
            height: DSTypography.lineHeightTight,
          ),

          // Headline
          headlineLarge: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXxxl,
            fontWeight: DSTypography.bold,
            color: DSColors.darkTextPrimary,
          ),
          headlineMedium: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXxl,
            fontWeight: DSTypography.semiBold,
            color: DSColors.darkTextPrimary,
          ),
          headlineSmall: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXl,
            fontWeight: DSTypography.semiBold,
            color: DSColors.darkTextPrimary,
          ),

          // Title
          titleLarge: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeLg,
            fontWeight: DSTypography.semiBold,
            color: DSColors.darkTextPrimary,
          ),
          titleMedium: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeBase,
            fontWeight: DSTypography.medium,
            color: DSColors.darkTextPrimary,
          ),
          titleSmall: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            fontWeight: DSTypography.medium,
            color: DSColors.darkTextPrimary,
          ),

          // Body
          bodyLarge: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeBase,
            fontWeight: DSTypography.regular,
            color: DSColors.darkTextPrimary,
            height: DSTypography.lineHeightNormal,
          ),
          bodyMedium: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            fontWeight: DSTypography.regular,
            color: DSColors.darkTextPrimary,
            height: DSTypography.lineHeightNormal,
          ),
          bodySmall: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXs,
            fontWeight: DSTypography.regular,
            color: DSColors.darkTextSecondary,
            height: DSTypography.lineHeightNormal,
          ),

          // Label
          labelLarge: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeBase,
            fontWeight: DSTypography.medium,
            color: DSColors.darkTextPrimary,
          ),
          labelMedium: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            fontWeight: DSTypography.medium,
            color: DSColors.darkTextPrimary,
          ),
          labelSmall: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXs,
            fontWeight: DSTypography.medium,
            color: DSColors.darkTextSecondary,
          ),
        ),

        // Card Theme (Glassmorphism)
        cardTheme: CardTheme(
          color: DSColors.darkSurfaceGlass,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: DSRadius.borderRadiusCard,
            side: const BorderSide(
              color: DSColors.darkBorderGlass,
              width: 1,
            ),
          ),
          margin: EdgeInsets.zero,
        ),

        // Elevated Button Theme
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: DSColors.emerald600,
            foregroundColor: Colors.white,
            disabledBackgroundColor: DSColors.darkSurfaceGlass,
            disabledForegroundColor: DSColors.darkTextDisabled,
            elevation: 0,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: DSRadius.borderRadiusButton,
            ),
            padding: DSSpacing.buttonPadding,
            minimumSize: const Size(88, 48),
            textStyle: DSTypography.buttonMedium,
          ),
        ),

        // Outlined Button Theme
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: DSColors.emerald600,
            disabledForegroundColor: DSColors.darkTextDisabled,
            side: const BorderSide(
              color: DSColors.emerald600,
              width: 1.5,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: DSRadius.borderRadiusButton,
            ),
            padding: DSSpacing.buttonPadding,
            minimumSize: const Size(88, 48),
            textStyle: DSTypography.buttonMedium,
          ),
        ),

        // Text Button Theme
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: DSColors.emerald600,
            disabledForegroundColor: DSColors.darkTextDisabled,
            shape: RoundedRectangleBorder(
              borderRadius: DSRadius.borderRadiusButton,
            ),
            padding: DSSpacing.buttonPadding,
            minimumSize: const Size(88, 48),
            textStyle: DSTypography.buttonMedium,
          ),
        ),

        // Input Decoration Theme
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: DSColors.darkSurfaceGlass,
          contentPadding: DSSpacing.inputPadding,
          border: OutlineInputBorder(
            borderRadius: DSRadius.borderRadiusInput,
            borderSide: const BorderSide(
              color: DSColors.darkBorderGlass,
              width: 1,
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: DSRadius.borderRadiusInput,
            borderSide: const BorderSide(
              color: DSColors.darkBorderGlass,
              width: 1,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: DSRadius.borderRadiusInput,
            borderSide: const BorderSide(
              color: DSColors.emerald600,
              width: 2,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: DSRadius.borderRadiusInput,
            borderSide: const BorderSide(
              color: DSColors.red600,
              width: 1,
            ),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: DSRadius.borderRadiusInput,
            borderSide: const BorderSide(
              color: DSColors.red600,
              width: 2,
            ),
          ),
          labelStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            color: DSColors.darkTextSecondary,
          ),
          hintStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            color: DSColors.darkTextTertiary,
          ),
          errorStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXs,
            color: DSColors.red600,
          ),
        ),

        // Dialog Theme
        dialogTheme: DialogTheme(
          backgroundColor: DSColors.darkSurfaceElevated,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: DSRadius.borderRadiusDialog,
            side: const BorderSide(
              color: DSColors.darkBorderGlass,
              width: 1,
            ),
          ),
          titleTextStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXl,
            fontWeight: DSTypography.semiBold,
            color: DSColors.darkTextPrimary,
          ),
          contentTextStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            color: DSColors.darkTextPrimary,
          ),
        ),

        // Bottom Sheet Theme
        bottomSheetTheme: const BottomSheetThemeData(
          backgroundColor: DSColors.darkSurfaceElevated,
          modalBackgroundColor: DSColors.darkSurfaceElevated,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: DSRadius.borderRadiusBottomSheet,
            side: BorderSide(
              color: DSColors.darkBorderGlass,
              width: 1,
            ),
          ),
          clipBehavior: Clip.antiAlias,
        ),

        // Snackbar Theme
        snackBarTheme: SnackBarThemeData(
          backgroundColor: DSColors.darkSurfaceElevated,
          contentTextStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            color: DSColors.darkTextPrimary,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: DSRadius.borderRadiusMd,
          ),
          behavior: SnackBarBehavior.floating,
        ),

        // Chip Theme
        chipTheme: ChipThemeData(
          backgroundColor: DSColors.darkSurfaceGlass,
          selectedColor: DSColors.emerald600,
          disabledColor: DSColors.darkSurfaceGlass,
          labelStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXs,
            color: DSColors.darkTextPrimary,
          ),
          secondaryLabelStyle: const TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeXs,
            color: Colors.white,
          ),
          side: const BorderSide(
            color: DSColors.darkBorderGlass,
            width: 1,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: DSRadius.borderRadiusFull,
          ),
        ),

        // Divider Theme
        dividerTheme: const DividerThemeData(
          color: DSColors.darkBorder,
          thickness: 1,
          space: 1,
        ),

        // Icon Theme
        iconTheme: const IconThemeData(
          color: DSColors.darkTextPrimary,
          size: 24,
        ),

        // Navigation Bar Theme (Bottom Navigation)
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: DSColors.darkSurfaceGlass,
          indicatorColor: DSColors.emerald600,
          labelTextStyle: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return const TextStyle(
                fontFamily: DSTypography.fontFamilyPrimary,
                fontSize: DSTypography.fontSizeXxs,
                fontWeight: DSTypography.semiBold,
                color: DSColors.emerald600,
              );
            }
            return const TextStyle(
              fontFamily: DSTypography.fontFamilyPrimary,
              fontSize: DSTypography.fontSizeXxs,
              color: DSColors.darkTextSecondary,
            );
          }),
          iconTheme: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return const IconThemeData(
                color: Colors.white,
                size: 24,
              );
            }
            return const IconThemeData(
              color: DSColors.darkTextSecondary,
              size: 24,
            );
          }),
        ),

        // Switch Theme
        switchTheme: SwitchThemeData(
          thumbColor: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return Colors.white;
            }
            return DSColors.zinc400;
          }),
          trackColor: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return DSColors.emerald600;
            }
            return DSColors.zinc700;
          }),
        ),

        // Checkbox Theme
        checkboxTheme: CheckboxThemeData(
          fillColor: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return DSColors.emerald600;
            }
            return Colors.transparent;
          }),
          checkColor: MaterialStateProperty.all(Colors.white),
          side: const BorderSide(
            color: DSColors.darkBorderGlass,
            width: 2,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: DSRadius.borderRadiusXs,
          ),
        ),

        // Radio Theme
        radioTheme: RadioThemeData(
          fillColor: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return DSColors.emerald600;
            }
            return DSColors.darkBorderGlass;
          }),
        ),

        // Page Transitions
        pageTransitionsTheme: const PageTransitionsTheme(
          builders: {
            TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
            TargetPlatform.android: ZoomPageTransitionsBuilder(),
          },
        ),
      );

  // ===========================================================================
  // LIGHT THEME
  // ===========================================================================

  static ThemeData get lightTheme => ThemeData(
        // Material 3
        useMaterial3: true,

        // Brightness
        brightness: Brightness.light,

        // Color Scheme
        colorScheme: const ColorScheme.light(
          // Primary (Emerald)
          primary: DSColors.emerald600,
          onPrimary: Colors.white,
          primaryContainer: DSColors.emerald100,
          onPrimaryContainer: DSColors.emerald900,

          // Secondary (Amber)
          secondary: DSColors.amber600,
          onSecondary: Colors.white,
          secondaryContainer: DSColors.amber100,
          onSecondaryContainer: DSColors.amber900,

          // Error
          error: DSColors.red600,
          onError: Colors.white,
          errorContainer: DSColors.red100,
          onErrorContainer: DSColors.red900,

          // Background & Surface
          surface: DSColors.lightBackground,
          onSurface: DSColors.lightTextPrimary,

          // Variants (TODO: Utiliser surfaceVariant pour Flutter 3.19.6)
          surfaceVariant: DSColors.lightSurfaceElevated,
          onSurfaceVariant: DSColors.lightTextSecondary,

          // Outline
          outline: DSColors.lightBorder,

          // Shadow & Scrim
          shadow: Colors.black,
          scrim: DSColors.scrim,
        ),

        // Scaffold
        scaffoldBackgroundColor: DSColors.lightBackground,

        // App Bar Theme
        appBarTheme: const AppBarTheme(
          backgroundColor: DSColors.lightBackground,
          foregroundColor: DSColors.lightTextPrimary,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeLg,
            fontWeight: DSTypography.semiBold,
            color: DSColors.lightTextPrimary,
          ),
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarBrightness: Brightness.light,
            statusBarIconBrightness: Brightness.dark,
            statusBarColor: Colors.transparent,
          ),
        ),

        // Text Theme (même structure que dark mais avec couleurs light)
        textTheme: const TextTheme(
          bodyLarge: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeBase,
            fontWeight: DSTypography.regular,
            color: DSColors.lightTextPrimary,
            height: DSTypography.lineHeightNormal,
          ),
          bodyMedium: TextStyle(
            fontFamily: DSTypography.fontFamilyPrimary,
            fontSize: DSTypography.fontSizeSm,
            fontWeight: DSTypography.regular,
            color: DSColors.lightTextPrimary,
            height: DSTypography.lineHeightNormal,
          ),
          // ... autres styles similaires au dark theme
        ),

        // Card Theme
        cardTheme: CardTheme(
          color: DSColors.lightSurface,
          elevation: 0,
          shadowColor: Colors.black,
          shape: RoundedRectangleBorder(
            borderRadius: DSRadius.borderRadiusCard,
            side: const BorderSide(
              color: DSColors.lightBorder,
              width: 1,
            ),
          ),
          margin: EdgeInsets.zero,
        ),

        // Buttons similaires au dark theme avec couleurs adaptées
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: DSColors.emerald600,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: DSRadius.borderRadiusButton,
            ),
            padding: DSSpacing.buttonPadding,
            minimumSize: const Size(88, 48),
            textStyle: DSTypography.buttonMedium,
          ),
        ),

        // ... autres thèmes similaires
      );
}
