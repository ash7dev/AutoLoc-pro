import '../../../../../shared/presentation/base/base_view_model.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/owner_vehicle.dart';
import '../../domain/usecases/get_my_vehicles.dart';

/// ViewModel pour la gestion de la flotte de véhicules
///
/// Suit les règles MVVM strictes:
/// - Étend BaseViewModel<List<OwnerVehicle>>
/// - Implémente load() obligatoire
/// - Gère les états: initial, loading, success, empty, failure
/// - Communique via ViewState et ViewEffects
class FleetViewModel extends BaseViewModel<List<OwnerVehicle>> {
  final GetMyVehicles _getMyVehicles;

  FleetViewModel({
    required GetMyVehicles getMyVehicles,
  }) : _getMyVehicles = getMyVehicles;

  DateTime? _lastFetchTime;
  static const Duration _cacheDuration = Duration(minutes: 5);

  /// Vérifie si le cache est encore valide
  bool get _isCacheValid {
    if (_lastFetchTime == null) return false;
    final elapsed = DateTime.now().difference(_lastFetchTime!);
    return elapsed < _cacheDuration;
  }

  /// Invalide le cache
  void invalidateCache() {
    _lastFetchTime = null;
  }

  // ============================================================================
  // LIFECYCLE - Méthodes obligatoires
  // ============================================================================

  @override
  Future<void> load({bool forceRefresh = false}) async {
    // Sauvegarder les données actuelles si existantes (SWR - Stale-While-Revalidate)
    final currentData = state.maybeWhen(
      success: (data) => data,
      refreshing: (data) => data,
      orElse: () => null,
    );

    // Si on a des données valides en cache et qu'on ne force pas le refresh, on s'arrête
    if (!forceRefresh && currentData != null && _isCacheValid) {
      return;
    }

    // Si le cache est invalide mais qu'on a déjà des données, on passe en mode rafraîchissement silencieux
    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    } else {
      state = const ViewState.loading();
    }

    final result = await _getMyVehicles();

    result.fold(
      (failure) {
        if (currentData != null) {
          state = ViewState.success(currentData);
          showError(failure.message);
        } else {
          state = ViewState.failure(failure.message, code: failure.code);
        }
      },
      (vehicles) {
        _lastFetchTime = DateTime.now();
        if (vehicles.isEmpty) {
          state = const ViewState.empty(
            message: 'Aucun véhicule dans votre flotte',
          );
        } else {
          state = ViewState.success(vehicles);
        }
      },
    );
  }

  @override
  Future<void> refresh() async {
    await load(forceRefresh: true);
  }

  @override
  Future<void> retry() async {
    await load(forceRefresh: true);
  }

  // ============================================================================
  // ACTIONS SPÉCIFIQUES
  // ============================================================================

  /// Navigue vers la page de détails d'un véhicule
  void viewVehicleDetails(String vehicleId) {
    navigateTo('/vehicle-details/$vehicleId');
  }

  /// Navigue vers la page de modification d'un véhicule
  void editVehicle(String vehicleId) {
    navigateTo('/vehicle/edit/$vehicleId');
  }

  /// Navigue vers la page de création d'un nouveau véhicule
  void createVehicle() {
    navigateTo('/vehicle/create');
  }

  /// Supprime un véhicule (à implémenter plus tard)
  Future<void> deleteVehicle(String vehicleId) async {
    // TODO: Implémenter la suppression avec confirmation
    showSnackbar('Fonctionnalité à venir');
  }

  // ============================================================================
  // FILTRES ET TRI
  // ============================================================================

  /// Filtre les véhicules par statut
  void filterByStatus(String? status) {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    if (status == null || status.isEmpty) {
      // Réinitialiser le filtre
      state = ViewState.success(currentData);
    } else {
      final filtered = currentData.where((v) => v.statut == status).toList();
      state = ViewState.success(filtered);
    }
  }

  /// Recherche dans les véhicules
  void searchVehicles(String query) {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    if (query.isEmpty) {
      // Réinitialiser la recherche
      state = ViewState.success(currentData);
    } else {
      final queryLower = query.toLowerCase();
      final filtered = currentData.where((v) {
        return v.marque.toLowerCase().contains(queryLower) ||
            v.modele.toLowerCase().contains(queryLower) ||
            v.immatriculation.toLowerCase().contains(queryLower);
      }).toList();

      if (filtered.isEmpty) {
        state = ViewState.empty(message: 'Aucun véhicule trouvé pour "$query"');
      } else {
        state = ViewState.success(filtered);
      }
    }
  }
}
