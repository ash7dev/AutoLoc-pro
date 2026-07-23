import '../../../../core/utils/result.dart';
import '../repositories/onboarding_repository.dart';

/// **CompleteOnboarding** - UseCase pour compléter l'onboarding
///
/// ## Responsabilité
/// Marquer l'onboarding comme vu et naviguer vers /home.
class CompleteOnboarding {
  CompleteOnboarding({required this.repository});

  final OnboardingRepository repository;

  /// **Appeler le UseCase**
  ///
  /// Retourne `Result<void>`:
  /// - Success: Onboarding marqué comme vu
  /// - Failure: Erreur
  Future<Result<void>> call() async {
    return await repository.markOnboardingComplete();
  }
}
