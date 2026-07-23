import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/splash_data.dart';
import '../../domain/repositories/splash_repository.dart';
import '../datasources/splash_local_datasource.dart';

/// **SplashRepositoryImpl** - Implémentation du repository Splash
///
/// ## Responsabilité
/// - Vérifier l'état local
/// - Déterminer la route suivante
class SplashRepositoryImpl implements SplashRepository {
  SplashRepositoryImpl({
    required this.localDataSource,
  });

  final SplashLocalDataSource localDataSource;

  @override
  Future<Result<SplashData>> determineNextRoute() async {
    try {
      final hasSeenOnboarding = await localDataSource.hasSeenOnboarding();
      final isAuthenticated = await localDataSource.isAuthenticated();

      // Logique de navigation
      String nextRoute;

      if (!hasSeenOnboarding) {
        // Pas encore vu l'onboarding → /onboarding
        nextRoute = '/onboarding';
      } else if (!isAuthenticated) {
        // Vu l'onboarding mais pas authentifié → /login (TODO)
        // Pour l'instant, redirect vers /onboarding
        nextRoute = '/onboarding';
      } else {
        // Authentifié → /home
        nextRoute = '/home';
      }

      return success(
        SplashData(
          nextRoute: nextRoute,
          hasSeenOnboarding: hasSeenOnboarding,
          isAuthenticated: isAuthenticated,
        ),
      );
    } catch (e) {
      return failure(
        UnknownFailure(e.toString()),
      );
    }
  }
}
