import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/onboarding_data.dart';
import '../../domain/usecases/complete_onboarding.dart';

/// **OnboardingViewModel** - ViewModel pour Onboarding Screen
///
/// ## Responsabilité
/// - Gérer l'état de l'onboarding
/// - Marquer l'onboarding comme vu
/// - Naviguer vers /home après complétion
///
/// ## State
/// - `ViewState<OnboardingData>`: État de l'onboarding
class OnboardingViewModel extends BaseViewModel<OnboardingData> {
  OnboardingViewModel({
    required this.completeOnboardingUseCase,
  });

  final CompleteOnboarding completeOnboardingUseCase;

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /// **Charger l'état initial**
  ///
  /// Pour l'onboarding, on commence directement en success.
  @override
  Future<void> load() async {
    state = const ViewState.success(OnboardingData(isCompleted: false));
  }

  // =========================================================================
  // BUSINESS LOGIC
  // =========================================================================

  /// **Compléter l'onboarding**
  ///
  /// 1. Marquer comme vu dans SharedPreferences
  /// 2. Naviguer vers /home via Effect
  Future<void> completeOnboarding() async {
    final result = await completeOnboardingUseCase();

    result.fold(
      (failure) {
        // En cas d'erreur, afficher message mais naviguer quand même
        showError(failure.message);
        navigateTo('/home');
      },
      (_) {
        // Succès - Naviguer vers /home
        navigateTo('/home');
      },
    );
  }

  /// **Naviguer vers l'écran de connexion**
  void navigateToLogin() {
    navigateTo('/auth/login');
  }
}
