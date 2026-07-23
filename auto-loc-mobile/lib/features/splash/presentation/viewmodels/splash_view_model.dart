import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/splash_data.dart';
import '../../domain/usecases/determine_next_route.dart';

/// **SplashViewModel** - ViewModel pour Splash Screen
///
/// ## Responsabilité
/// - Charger les données initiales
/// - Déterminer la route suivante
/// - Émettre un effet de navigation après le délai
///
/// ## State
/// - `ViewState<SplashData>`: État du splash
///
/// ## Flow
/// 1. load() - Déterminer nextRoute
/// 2. Attendre 2.5s (géré par le Screen via Future.delayed)
/// 3. Émettre navigateTo(nextRoute) - Effect
class SplashViewModel extends BaseViewModel<SplashData> {
  SplashViewModel({
    required this.determineNextRouteUseCase,
  });

  final DetermineNextRoute determineNextRouteUseCase;

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /// **Charger les données du Splash**
  ///
  /// Détermine la route suivante sans naviguer.
  /// La navigation est gérée par le Screen après le délai.
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await determineNextRouteUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (splashData) => state = ViewState.success(splashData),
    );
  }

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  /// **Naviguer vers la route suivante**
  ///
  /// Appelé par le Screen après le délai de 2.5s.
  /// Émet un effet de navigation.
  void navigateToNext() {
    final splashData = state.dataOrNull;

    if (splashData != null) {
      // Émettre un effet de navigation
      navigateTo(splashData.nextRoute);
    } else {
      // Fallback: Onboarding
      navigateTo('/onboarding');
    }
  }
}
