import 'package:flutter/material.dart';

/// Extensions sur BuildContext pour un accès facile aux propriétés communes
extension ContextExtensions on BuildContext {
  // =========================================================================
  // THEME
  // =========================================================================

  /// Accès au ThemeData
  ThemeData get theme => Theme.of(this);

  /// Accès au ColorScheme
  ColorScheme get colorScheme => theme.colorScheme;

  /// Accès au TextTheme
  TextTheme get textTheme => theme.textTheme;

  /// Vérifie si le thème est sombre
  bool get isDarkMode => theme.brightness == Brightness.dark;

  // =========================================================================
  // MEDIA QUERY
  // =========================================================================

  /// Accès au MediaQueryData
  MediaQueryData get mediaQuery => MediaQuery.of(this);

  /// Largeur de l'écran
  double get screenWidth => mediaQuery.size.width;

  /// Hauteur de l'écran
  double get screenHeight => mediaQuery.size.height;

  /// Padding du système (notch, status bar, navigation bar)
  EdgeInsets get systemPadding => mediaQuery.padding;

  /// ViewInsets (keyboard)
  EdgeInsets get viewInsets => mediaQuery.viewInsets;

  /// Vérifie si le clavier est visible
  bool get isKeyboardVisible => viewInsets.bottom > 0;

  /// Hauteur du clavier
  double get keyboardHeight => viewInsets.bottom;

  /// Device pixel ratio
  double get devicePixelRatio => mediaQuery.devicePixelRatio;

  // =========================================================================
  // RESPONSIVE
  // =========================================================================

  /// Vérifie si c'est un petit écran (< 600dp)
  bool get isSmallScreen => screenWidth < 600;

  /// Vérifie si c'est un écran moyen (600-900dp)
  bool get isMediumScreen => screenWidth >= 600 && screenWidth < 900;

  /// Vérifie si c'est un grand écran (>= 900dp)
  bool get isLargeScreen => screenWidth >= 900;

  /// Vérifie si c'est un téléphone
  bool get isPhone => screenWidth < 600;

  /// Vérifie si c'est une tablette
  bool get isTablet => screenWidth >= 600;

  /// Orientation portrait
  bool get isPortrait => mediaQuery.orientation == Orientation.portrait;

  /// Orientation paysage
  bool get isLandscape => mediaQuery.orientation == Orientation.landscape;

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  /// Accès au Navigator
  NavigatorState get navigator => Navigator.of(this);

  /// Vérifie si on peut pop
  bool get canPop => navigator.canPop();

  /// Pop la route courante
  void pop<T>([T? result]) => navigator.pop(result);

  /// Push une nouvelle route
  Future<T?> push<T>(Route<T> route) => navigator.push(route);

  /// Push avec remplacement
  Future<T?> pushReplacement<T, TO>(Route<T> route, {TO? result}) {
    return navigator.pushReplacement(route, result: result);
  }

  /// Push et supprime toutes les routes précédentes
  Future<T?> pushAndRemoveUntil<T>(
    Route<T> route,
    bool Function(Route<dynamic>) predicate,
  ) {
    return navigator.pushAndRemoveUntil(route, predicate);
  }

  // =========================================================================
  // SCAFFOLD
  // =========================================================================

  /// Accès au ScaffoldMessenger
  ScaffoldMessengerState get scaffoldMessenger => ScaffoldMessenger.of(this);

  /// Affiche un SnackBar
  ScaffoldFeatureController<SnackBar, SnackBarClosedReason> showSnackBar(
    SnackBar snackBar,
  ) {
    return scaffoldMessenger.showSnackBar(snackBar);
  }

  /// Affiche un SnackBar simple avec message
  void showMessage(
    String message, {
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    showSnackBar(
      SnackBar(
        content: Text(message),
        duration: duration,
        action: action,
      ),
    );
  }

  /// Affiche un SnackBar d'erreur
  void showError(String message) {
    showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: colorScheme.error,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  /// Affiche un SnackBar de succès
  void showSuccess(String message) {
    showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Cache le SnackBar courant
  void hideSnackBar() {
    scaffoldMessenger.hideCurrentSnackBar();
  }

  // =========================================================================
  // DIALOG
  // =========================================================================

  /// Affiche un dialog
  Future<T?> showCustomDialog<T>(Widget dialog) {
    return showDialog<T>(
      context: this,
      builder: (_) => dialog,
    );
  }

  /// Affiche un bottom sheet
  Future<T?> showBottomSheet<T>(Widget sheet) {
    return showModalBottomSheet<T>(
      context: this,
      builder: (_) => sheet,
    );
  }

  // =========================================================================
  // FOCUS
  // =========================================================================

  /// Accès au FocusScope
  FocusScopeNode get focusScope => FocusScope.of(this);

  /// Unfocus (ferme le clavier)
  void unfocus() {
    focusScope.unfocus();
  }

  /// Request focus
  void requestFocus(FocusNode node) {
    focusScope.requestFocus(node);
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  /// Hauteur disponible (screen height - system padding)
  double get availableHeight =>
      screenHeight - systemPadding.top - systemPadding.bottom;

  /// Largeur disponible (screen width - system padding)
  double get availableWidth =>
      screenWidth - systemPadding.left - systemPadding.right;

  /// Safe area top
  double get safeAreaTop => systemPadding.top;

  /// Safe area bottom
  double get safeAreaBottom => systemPadding.bottom;
}
