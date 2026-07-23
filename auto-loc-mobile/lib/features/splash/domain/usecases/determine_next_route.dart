import '../../../../core/utils/result.dart';
import '../entities/splash_data.dart';
import '../repositories/splash_repository.dart';

/// **DetermineNextRoute** - UseCase pour déterminer la route suivante
///
/// ## Responsabilité
/// Vérifier l'état de l'app et retourner la route appropriée.
///
/// ## Logique
/// 1. Vérifier hasSeenOnboarding
/// 2. Vérifier isAuthenticated
/// 3. Retourner la route appropriée:
///    - /onboarding (si pas vu)
///    - /login (si pas authentifié)
///    - /home (si authentifié)
class DetermineNextRoute {
  DetermineNextRoute({required this.repository});

  final SplashRepository repository;

  /// **Appeler le UseCase**
  ///
  /// Retourne `Result<SplashData>`:
  /// - Success: SplashData avec nextRoute
  /// - Failure: Erreur
  Future<Result<SplashData>> call() async {
    return await repository.determineNextRoute();
  }
}
