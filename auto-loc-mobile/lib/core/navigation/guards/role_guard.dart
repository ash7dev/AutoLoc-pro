import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

import '../../services/session_service.dart';
import '../routes.dart';

/// Guard pour protéger les routes par rôle
class RoleGuard {
  final SessionService _sessionService;

  RoleGuard({required SessionService sessionService})
      : _sessionService = sessionService;

  /// Redirige si le rôle ne correspond pas
  String? redirect(BuildContext context, GoRouterState state) {
    final currentRole = _sessionService.currentRole;
    final route = state.matchedLocation;

    // Routes propriétaires
    if (Routes.requiresOwnerRole(route)) {
      if (currentRole != UserRole.owner) {
        // Rediriger vers home si pas propriétaire
        return Routes.home;
      }
    }

    // Routes KYC
    if (Routes.requiresKyc(route)) {
      if (!_sessionService.isKycVerified) {
        // Rediriger vers KYC
        return Routes.kyc;
      }
    }

    // Routes profil complété
    if (Routes.requiresCompletedProfile(route)) {
      if (!_sessionService.hasCompletedProfile) {
        // Rediriger vers complétion de profil
        return Routes.completeProfile;
      }
    }

    // Routes téléphone vérifié
    if (Routes.requiresPhoneVerified(route)) {
      if (!_sessionService.isPhoneVerified) {
        // Rediriger vers vérification téléphone
        return Routes.phoneLogin;
      }
    }

    return null; // Pas de redirection
  }
}
