import 'package:shared_preferences/shared_preferences.dart';

/// **SplashLocalDataSource** - DataSource local pour Splash
///
/// ## Responsabilité
/// Vérifier l'état local de l'app (onboarding vu, etc.).
abstract class SplashLocalDataSource {
  Future<bool> hasSeenOnboarding();
  Future<bool> isAuthenticated();
}

/// **SplashLocalDataSourceImpl** - Implémentation du DataSource local
class SplashLocalDataSourceImpl implements SplashLocalDataSource {
  SplashLocalDataSourceImpl({required this.sharedPreferences});

  final SharedPreferences sharedPreferences;

  @override
  Future<bool> hasSeenOnboarding() async {
    return sharedPreferences.getBool('hasSeenOnboarding') ?? false;
  }

  @override
  Future<bool> isAuthenticated() async {
    // TODO: Vérifier le token dans SecureStorage
    // Pour l'instant, retourner false
    // final token = await secureStorage.read(key: 'accessToken');
    // return token != null;
    return false;
  }
}
