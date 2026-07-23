import '../../../../core/utils/result.dart';

/// **OnboardingRepository** - Interface du repository pour Onboarding
///
/// ## Responsabilité
/// Gérer la complétion de l'onboarding.
abstract class OnboardingRepository {
  /// **Marquer l'onboarding comme vu**
  ///
  /// Sauvegarde dans SharedPreferences: hasSeenOnboarding = true
  Future<Result<void>> markOnboardingComplete();
}
