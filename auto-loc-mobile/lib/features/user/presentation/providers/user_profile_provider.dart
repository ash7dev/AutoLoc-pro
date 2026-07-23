import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/user.dart';
import '../../di/user_injection.dart';

/// Provider qui cache le profil utilisateur en mémoire
/// Évite de refaire des appels API à chaque fois qu'on a besoin du profil
/// Le cache est automatiquement invalidé après un certain temps
final userProfileProvider =
    StateNotifierProvider<UserProfileNotifier, ViewState<User>>((ref) {
  final getProfile = ref.watch(getProfileProvider);
  return UserProfileNotifier(getProfile);
});

class UserProfileNotifier extends StateNotifier<ViewState<User>> {
  UserProfileNotifier(this._getProfile) : super(const ViewState.initial());

  final dynamic _getProfile;
  DateTime? _lastFetchTime;

  /// Durée de validité du cache (5 minutes)
  static const Duration _cacheDuration = Duration(minutes: 5);

  /// Vérifie si le cache est encore valide
  bool get _isCacheValid {
    if (_lastFetchTime == null) return false;
    final elapsed = DateTime.now().difference(_lastFetchTime!);
    return elapsed < _cacheDuration;
  }

  /// Charge le profil utilisateur depuis l'API
  /// Si le cache est valide et qu'on a déjà le profil, ne fait rien
  Future<void> loadProfile({bool forceRefresh = false}) async {
    // Vérifier si on a déjà des données en succès
    final hasData = state.maybeWhen(
      success: (_) => true,
      orElse: () => false,
    );

    // Si déjà chargé avec succès et cache valide, ne rien faire
    if (!forceRefresh && hasData && _isCacheValid) {
      return;
    }

    // Si cache invalide, rafraîchir
    if (hasData && !_isCacheValid) {
      await refresh();
      return;
    }

    state = const ViewState.loading();

    final result = await _getProfile();

    result.fold(
      (failure) {
        state = ViewState.failure(failure.message, code: failure.code);
      },
      (user) {
        state = ViewState.success(user);
        _lastFetchTime = DateTime.now();
      },
    );
  }

  /// Rafraîchit le profil (force un rechargement)
  /// Utilisé après une modification du profil
  Future<void> refresh() async {
    // Garder les données pendant le refresh
    final currentData = state.maybeWhen(
      success: (user) => user,
      refreshing: (user) => user,
      orElse: () => null,
    );

    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    } else {
      state = const ViewState.loading();
    }

    final result = await _getProfile();

    result.fold(
      (failure) {
        state = ViewState.failure(failure.message, code: failure.code);
        _lastFetchTime = null;
      },
      (user) {
        state = ViewState.success(user);
        _lastFetchTime = DateTime.now();
      },
    );
  }

  /// Met à jour le profil en cache (après une modification locale)
  /// Utile quand on sait que le profil a changé sans faire un appel API
  void updateCache(User user) {
    state = ViewState.success(user);
    _lastFetchTime = DateTime.now();
  }

  /// Invalide le cache (le prochain loadProfile fera un appel API)
  void invalidateCache() {
    _lastFetchTime = null;
  }

  /// Réinitialise le cache (déconnexion par exemple)
  void clear() {
    state = const ViewState.initial();
    _lastFetchTime = null;
  }
}
