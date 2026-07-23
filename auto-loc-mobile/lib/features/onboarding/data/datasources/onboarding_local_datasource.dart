import 'package:shared_preferences/shared_preferences.dart';

/// **OnboardingLocalDataSource** - DataSource local pour Onboarding
///
/// ## Responsabilité
/// Sauvegarder l'état de l'onboarding dans SharedPreferences.
abstract class OnboardingLocalDataSource {
  Future<void> markOnboardingComplete();
}

/// **OnboardingLocalDataSourceImpl** - Implémentation
class OnboardingLocalDataSourceImpl implements OnboardingLocalDataSource {
  OnboardingLocalDataSourceImpl({required this.sharedPreferences});

  final SharedPreferences sharedPreferences;

  @override
  Future<void> markOnboardingComplete() async {
    await sharedPreferences.setBool('hasSeenOnboarding', true);
  }
}
