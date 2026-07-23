import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../data/datasources/onboarding_local_datasource.dart';
import '../../data/repositories/onboarding_repository_impl.dart';
import '../../domain/entities/onboarding_data.dart';
import '../../domain/repositories/onboarding_repository.dart';
import '../../domain/usecases/complete_onboarding.dart';
import '../viewmodels/onboarding_view_model.dart';

/// **OnboardingProviders** - Providers Riverpod pour Onboarding

// ============================================================================
// VIEWMODEL
// ============================================================================

/// **OnboardingViewModel Provider**
final onboardingViewModelProvider =
    StateNotifierProvider<OnboardingViewModel, ViewState<OnboardingData>>(
        (ref) {
  return OnboardingViewModel(
    completeOnboardingUseCase: ref.read(completeOnboardingUseCaseProvider),
  );
});

// ============================================================================
// STATE (Alias)
// ============================================================================

/// **OnboardingState Provider**
final onboardingStateProvider = Provider<ViewState<OnboardingData>>((ref) {
  return ref.watch(onboardingViewModelProvider);
});

// ============================================================================
// EFFECTS
// ============================================================================

/// **OnboardingEffects Provider**
final onboardingEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(onboardingViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// USECASES
// ============================================================================

/// **CompleteOnboarding UseCase Provider**
final completeOnboardingUseCaseProvider = Provider<CompleteOnboarding>((ref) {
  return CompleteOnboarding(
    repository: ref.read(onboardingRepositoryProvider),
  );
});

// ============================================================================
// REPOSITORY
// ============================================================================

/// **OnboardingRepository Provider**
final onboardingRepositoryProvider = Provider<OnboardingRepository>((ref) {
  return OnboardingRepositoryImpl(
    localDataSource: ref.read(onboardingLocalDataSourceProvider),
  );
});

// ============================================================================
// DATASOURCES
// ============================================================================

/// **OnboardingLocalDataSource Provider**
final onboardingLocalDataSourceProvider =
    Provider<OnboardingLocalDataSource>((ref) {
  return OnboardingLocalDataSourceImpl(
    sharedPreferences: ref.watch(sharedPreferencesProvider),
  );
});

// ============================================================================
// DEPENDENCIES
// ============================================================================

/// **SharedPreferences Provider**
///
/// TODO: Utiliser le provider global de Splash
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(
    'sharedPreferencesProvider must be overridden in main.dart',
  );
});
