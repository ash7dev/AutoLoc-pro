import 'package:flutter/material.dart';

/// Service de navigation global
///
/// Permet de naviguer sans BuildContext (utilisé par les intercepteurs, services, etc.)
/// Nécessite d'être initialisé avec une GlobalKey<NavigatorState> dans main.dart
class NavigationService {
  static final NavigationService _instance = NavigationService._internal();

  factory NavigationService() => _instance;

  NavigationService._internal();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  /// Accès au contexte de navigation global
  BuildContext? get context => navigatorKey.currentContext;

  /// Accès au NavigatorState
  NavigatorState? get navigator => navigatorKey.currentState;

  /// Navigation vers une route nommée
  Future<dynamic>? navigateTo(String routeName, {Object? arguments}) {
    return navigator?.pushNamed(routeName, arguments: arguments);
  }

  /// Navigation avec remplacement
  Future<dynamic>? navigateReplaceTo(String routeName, {Object? arguments}) {
    return navigator?.pushReplacementNamed(routeName, arguments: arguments);
  }

  /// Navigation avec suppression de toutes les routes précédentes
  Future<dynamic>? navigateAndRemoveUntil(
    String routeName, {
    Object? arguments,
    bool Function(Route<dynamic>)? predicate,
  }) {
    return navigator?.pushNamedAndRemoveUntil(
      routeName,
      predicate ?? (route) => false,
      arguments: arguments,
    );
  }

  /// Retour à la route précédente
  void goBack([dynamic result]) {
    if (navigator?.canPop() ?? false) {
      navigator?.pop(result);
    }
  }

  /// Affiche un SnackBar global
  void showSnackBar(String message, {
    Duration duration = const Duration(seconds: 3),
    Color? backgroundColor,
    Color? textColor,
  }) {
    final ctx = context;
    if (ctx == null) return;

    ScaffoldMessenger.of(ctx).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: TextStyle(color: textColor ?? Colors.white),
        ),
        duration: duration,
        backgroundColor: backgroundColor ?? const Color(0xFF1F2937),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  /// Affiche un SnackBar d'erreur
  void showErrorSnackBar(String message) {
    showSnackBar(
      message,
      backgroundColor: const Color(0xFFEF4444),
      textColor: Colors.white,
    );
  }

  /// Affiche un SnackBar de succès
  void showSuccessSnackBar(String message) {
    showSnackBar(
      message,
      backgroundColor: const Color(0xFF10B981),
      textColor: Colors.white,
    );
  }

  /// Affiche un Dialog global
  Future<T?>? showDialogGlobal<T>({
    required Widget Function(BuildContext) builder,
    bool barrierDismissible = true,
  }) {
    final ctx = context;
    if (ctx == null) return null;

    return showDialog<T>(
      context: ctx,
      barrierDismissible: barrierDismissible,
      builder: builder,
    );
  }
}
