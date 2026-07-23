import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../data/datasources/splash_local_datasource.dart';
import '../../data/repositories/splash_repository_impl.dart';
import '../../domain/entities/splash_data.dart';
import '../../domain/repositories/splash_repository.dart';
import '../../domain/usecases/determine_next_route.dart';
import '../viewmodels/splash_view_model.dart';

/// **SplashProviders** - Providers Riverpod pour Splash
///
/// ## Providers Disponibles
/// - `splashViewModelProvider`: Le ViewModel
/// - `splashStateProvider`: Le State (alias)
/// - `splashEffectsProvider`: Le Stream d'Effects

// ============================================================================
// VIEWMODEL
// ============================================================================

/// **SplashViewModel Provider**
final splashViewModelProvider =
    StateNotifierProvider<SplashViewModel, ViewState<SplashData>>((ref) {
  return SplashViewModel(
    determineNextRouteUseCase: ref.read(determineNextRouteUseCaseProvider),
  );
});

// ============================================================================
// STATE (Alias pour lisibilité)
// ============================================================================

/// **SplashState Provider**
final splashStateProvider = Provider<ViewState<SplashData>>((ref) {
  return ref.watch(splashViewModelProvider);
});

// ============================================================================
// EFFECTS
// ============================================================================

/// **SplashEffects Provider**
final splashEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(splashViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// USECASES
// ============================================================================

/// **DetermineNextRoute UseCase Provider**
final determineNextRouteUseCaseProvider = Provider<DetermineNextRoute>((ref) {
  return DetermineNextRoute(
    repository: ref.read(splashRepositoryProvider),
  );
});

// ============================================================================
// REPOSITORY
// ============================================================================

/// **SplashRepository Provider**
final splashRepositoryProvider = Provider<SplashRepository>((ref) {
  return SplashRepositoryImpl(
    localDataSource: ref.read(splashLocalDataSourceProvider),
  );
});

// ============================================================================
// DATASOURCES
// ============================================================================

/// **SplashLocalDataSource Provider**
final splashLocalDataSourceProvider = Provider<SplashLocalDataSource>((ref) {
  // TODO: Utiliser un provider global pour SharedPreferences
  // Pour l'instant, créer une instance
  return SplashLocalDataSourceImpl(
    sharedPreferences: ref.watch(sharedPreferencesProvider),
  );
});

// ============================================================================
// DEPENDENCIES
// ============================================================================

/// **SharedPreferences Provider**
///
/// TODO: Déplacer dans un provider global
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(
    'sharedPreferencesProvider must be overridden in main.dart',
  );
});
