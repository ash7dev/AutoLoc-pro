import '../../../../core/utils/result.dart';
import '../entities/splash_data.dart';

/// **SplashRepository** - Interface du repository pour Splash
///
/// ## Responsabilité
/// Définir le contrat pour vérifier l'état de l'app au démarrage.
abstract class SplashRepository {
  /// **Déterminer la prochaine route**
  ///
  /// Vérifie:
  /// - hasSeenOnboarding (SharedPreferences)
  /// - isAuthenticated (SecureStorage - token)
  ///
  /// Retourne `Result<SplashData>`:
  /// - Success: SplashData avec nextRoute
  /// - Failure: Erreur
  Future<Result<SplashData>> determineNextRoute();
}
