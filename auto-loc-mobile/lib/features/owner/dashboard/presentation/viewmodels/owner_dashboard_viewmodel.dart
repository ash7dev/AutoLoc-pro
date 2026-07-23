import '../../../../../shared/presentation/base/base_view_model.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/owner_dashboard_data.dart';
import '../../domain/usecases/get_owner_stats.dart';

/// Owner Dashboard ViewModel
///
/// Gère l'état et la logique du dashboard propriétaire.
/// Récupère les statistiques depuis l'API et expose les données à la vue.
/// Implémente un cache intelligent pour éviter les requêtes réseau superflues
/// lors des bascules d'onglets, tout en supportant les rafraîchissements forcés.
class OwnerDashboardViewModel extends BaseViewModel<OwnerDashboardData> {
  final GetOwnerStats _getOwnerStats;

  OwnerDashboardViewModel({
    required GetOwnerStats getOwnerStats,
  })  : _getOwnerStats = getOwnerStats,
        super();

  /// Cache privé des données du dashboard
  OwnerDashboardData? _cachedData;

  /// Horodatage du dernier chargement réussi
  DateTime? _lastLoadTime;

  /// Durée de validité du cache (5 minutes)
  static const _cacheDuration = Duration(minutes: 5);

  /// Vérifie si les données du cache sont encore valides
  bool get _isCacheValid {
    if (_lastLoadTime == null) return false;
    final difference = DateTime.now().difference(_lastLoadTime!);
    return difference < _cacheDuration;
  }

  @override
  Future<void> load({bool forceRefresh = false}) async {
    // Si le cache est encore valide et qu'on ne force pas le rechargement,
    // on sert immédiatement les données du cache sans faire d'appel réseau.
    if (!forceRefresh && _cachedData != null && _isCacheValid) {
      state = ViewState.success(_cachedData!);
      return;
    }

    final currentData = state.dataOrNull ?? _cachedData;

    // Si on a déjà des données (stale), on passe en mode rafraîchissement
    // en tâche de fond (stale-while-revalidate) au lieu d'afficher un shimmer.
    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    } else {
      state = const ViewState.loading();
    }

    final result = await _getOwnerStats();

    result.fold(
      (failure) {
        // En cas d'erreur de rechargement en tâche de fond, on préserve les anciennes données
        if (currentData != null) {
          state = ViewState.success(currentData);
          showError(failure.message);
        } else {
          state = ViewState.failure(failure.message);
        }
      },
      (data) {
        // Mettre à jour le cache et le timestamp
        _cachedData = data;
        _lastLoadTime = DateTime.now();

        if (!data.hasData) {
          state = const ViewState.empty();
        } else {
          state = ViewState.success(data);
        }
      },
    );
  }

  @override
  Future<void> refresh() async {
    // Force la revalidation réseau (invalidation du cache)
    await load(forceRefresh: true);
  }

  /// Retry après une erreur
  @override
  Future<void> retry() async {
    await load(forceRefresh: true);
  }
}
