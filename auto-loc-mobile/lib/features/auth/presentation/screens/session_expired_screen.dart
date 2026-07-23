import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';

/// Écran affiché quand la session utilisateur a expiré
///
/// Situations déclenchées:
/// - Token JWT expiré et refresh token invalide
/// - Token révoqué côté serveur
/// - Erreur 401 non récupérable
///
/// Actions possibles:
/// - Se reconnecter
/// - Continuer sans compte (exploration publique)
class SessionExpiredScreen extends StatelessWidget {
  /// Type d'expiration (optionnel pour personnaliser le message)
  final SessionExpirationType type;

  const SessionExpiredScreen({
    super.key,
    this.type = SessionExpirationType.expired,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Icône
              Icon(
                type == SessionExpirationType.expired
                    ? Icons.lock_clock
                    : Icons.no_accounts_outlined,
                size: 120,
                color: const Color(0xFF10B981), // Emerald
              ),
              const SizedBox(height: 32),

              // Titre
              Text(
                _getTitle(),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),

              // Message
              Text(
                _getMessage(),
                style: const TextStyle(
                  fontSize: 16,
                  color: Color(0xFF6B7280),
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              // Bouton principal: Se reconnecter
              ElevatedButton(
                onPressed: () => _handleLogin(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Se reconnecter',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Bouton secondaire: Continuer sans compte
              OutlinedButton(
                onPressed: () => _handleContinueAsGuest(context),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(
                    color: Color(0xFF10B981),
                    width: 2,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Continuer sans compte',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Retourne le titre selon le type d'expiration
  String _getTitle() {
    switch (type) {
      case SessionExpirationType.expired:
        return 'Session expirée';
      case SessionExpirationType.invalid:
        return 'Session invalide';
      case SessionExpirationType.revoked:
        return 'Accès révoqué';
    }
  }

  /// Retourne le message détaillé selon le type d'expiration
  String _getMessage() {
    switch (type) {
      case SessionExpirationType.expired:
        return 'Votre session a expiré pour des raisons de sécurité. '
            'Veuillez vous reconnecter pour continuer à utiliser AutoLoc.';
      case SessionExpirationType.invalid:
        return 'Votre session n\'est plus valide. '
            'Cela peut arriver si vous vous êtes connecté sur un autre appareil. '
            'Veuillez vous reconnecter.';
      case SessionExpirationType.revoked:
        return 'Votre accès a été révoqué. '
            'Si vous pensez qu\'il s\'agit d\'une erreur, '
            'veuillez contacter notre support.';
    }
  }

  /// Navigation vers l'écran de connexion
  void _handleLogin(BuildContext context) {
    context.go(Routes.phoneLogin);
  }

  /// Navigation vers l'accueil en mode invité
  void _handleContinueAsGuest(BuildContext context) {
    context.go(Routes.home);
  }
}

/// Types d'expiration de session
enum SessionExpirationType {
  /// Token expiré normalement
  expired,

  /// Token invalide (corrompu, modifié)
  invalid,

  /// Token révoqué côté serveur
  revoked,
}
