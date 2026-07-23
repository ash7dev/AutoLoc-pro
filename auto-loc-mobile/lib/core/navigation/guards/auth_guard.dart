import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

import '../../services/session_service.dart';
import '../routes.dart';

/// Guard pour protéger les routes nécessitant une authentification
class AuthGuard {
  final SessionService _sessionService;

  AuthGuard({required SessionService sessionService})
      : _sessionService = sessionService;

  /// Redirige vers login si non authentifié
  String? redirect(BuildContext context, GoRouterState state) {
    final isAuthenticated = _sessionService.isAuthenticated;
    final isGoingToAuth = state.matchedLocation.startsWith('/auth');

    // Si non authentifié et qu'on va vers une route protégée
    if (!isAuthenticated && !isGoingToAuth) {
      // Vérifier si la route nécessite l'auth
      if (Routes.requiresAuth(state.matchedLocation)) {
        // Sauvegarder l'URL de destination pour y retourner après login
        return '${Routes.login}?redirect=${Uri.encodeComponent(state.matchedLocation)}';
      }
    }

    // Si authentifié et qu'on va vers login, rediriger vers home
    if (isAuthenticated && isGoingToAuth) {
      return Routes.home;
    }

    return null; // Pas de redirection
  }
}
