import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/vehicle.dart';
import '../../domain/usecases/get_mobile_feed.dart';
import '../../domain/usecases/search_vehicles.dart';
import '../../domain/usecases/search_vehicles_with_filters.dart';
import '../../domain/usecases/get_vehicles.dart';
import '../states/vehicle_explore_state.dart';
import '../../data/mappers/vehicle_mapper.dart';
import '../../data/dto/vehicle_dto.dart';

/// **VehicleExploreViewModel** - ViewModel pour l'exploration et recherche de véhicules
class VehicleExploreViewModel extends BaseViewModel<VehicleExploreData> {
  final GetMobileFeed getMobileFeedUseCase;
  final SearchVehicles searchVehiclesUseCase;
  final SearchVehiclesWithFilters searchVehiclesWithFiltersUseCase;
  final GetVehicles getVehiclesUseCase;

  /// Cache privé des données d'exploration pour éviter la perte lors d'un état vide ou d'erreur
  VehicleExploreData? _cachedData;

  /// Flag pour empêcher les chargements concurrents/doublons au démarrage
  bool _isLoading = false;

  /// Timestamp du dernier chargement pour gérer le cache
  DateTime? _lastLoadTime;

  /// Durée de validité du cache (5 minutes)
  static const _cacheDuration = Duration(minutes: 5);

  VehicleExploreViewModel({
    required this.getMobileFeedUseCase,
    required this.searchVehiclesUseCase,
    required this.searchVehiclesWithFiltersUseCase,
    required this.getVehiclesUseCase,
  }) : super();

  // =========================================================================
  // CACHE MANAGEMENT
  // =========================================================================

  /// Vérifie si le cache est encore valide
  bool get _isCacheValid {
    if (_lastLoadTime == null) return false;
    final difference = DateTime.now().difference(_lastLoadTime!);
    return difference < _cacheDuration;
  }

  /// Vérifie si des données sont déjà chargées
  bool get hasData => state.dataOrNull != null || _cachedData != null;

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /// **Réinitialiser la recherche et restaurer les données du cache**
  void clearSearch() {
    if (_cachedData != null) {
      state = ViewState.success(_cachedData!);
    }
  }

  /// **Charger le feed et les premiers véhicules**
  ///
  /// Utilise un système de cache pour éviter de recharger les données trop souvent.
  /// Par défaut, si le cache est valide (< 5 minutes), les données ne sont pas rechargées.
  ///
  /// [forceRefresh] : Force le rechargement même si le cache est valide
  @override
  Future<void> load({bool forceRefresh = false}) async {
    // Si le cache est valide et qu'on ne force pas le refresh, on restore et on skip
    if (!forceRefresh && _cachedData != null && _isCacheValid) {
      state = ViewState.success(_cachedData!);
      return; // Utiliser le cache existant
    }

    if (_isLoading) return;
    _isLoading = true;

    // Si on a des données et qu'on refresh, utiliser refreshing au lieu de loading
    final currentData = state.dataOrNull ?? _cachedData;
    if (currentData != null && !forceRefresh) {
      state = ViewState.refreshing(currentData);
    } else {
      state = const ViewState.loading();
    }

    try {
      // Exécuter l'appel unique au feed mobile
      final result = await getMobileFeedUseCase();

      result.fold(
        (failure) {
          state = ViewState.failure(failure.message, code: failure.code);
        },
        (feedMap) {
          // Parser toutes les catégories pour rétrocompatibilité (liste globale à plat)
          List<Vehicle> parseCategory(String key) {
            final list = feedMap[key];
            if (list is List) {
              return list
                  .map((item) => VehicleMapper.toEntity(VehicleDto.fromJson(Map<String, dynamic>.from(item))))
                  .toList();
            }
            return [];
          }

          List<Vehicle> parseRecommended() {
            final recommended = feedMap['recommended'];
            if (recommended is Map) {
              final items = recommended['items'];
              if (items is List) {
                return items
                    .map((item) => VehicleMapper.toEntity(VehicleDto.fromJson(Map<String, dynamic>.from(item))))
                    .toList();
              }
            }
            return [];
          }

          final premium = parseCategory('premium');
          final nouveautes = parseCategory('nouveautes');
          final topNotes = parseCategory('topNotes');
          final economiques = parseCategory('economiques');
          final luxe = parseCategory('luxe');
          final dakar = parseCategory('dakar');
          final suvMoment = parseCategory('suvMoment');
          final berlinesPopulaires = parseCategory('berlinesPopulaires');
          final recommended = parseRecommended();

          // Concaténer tous les véhicules sans doublons
          final allVehicles = [
            ...premium,
            ...nouveautes,
            ...topNotes,
            ...economiques,
            ...luxe,
            ...dakar,
            ...suvMoment,
            ...berlinesPopulaires,
            ...recommended,
          ].toSet().toList();

          final loadedData = VehicleExploreData(
            mobileFeed: feedMap,
            vehicles: allVehicles,
            currentPage: 1,
            hasMore: allVehicles.length >= 10,
          );

          // Mettre à jour le cache et le state
          _cachedData = loadedData;
          state = ViewState.success(loadedData);

          // Mettre à jour le timestamp du cache
          _lastLoadTime = DateTime.now();
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
    } finally {
      _isLoading = false;
    }
  }

  // =========================================================================
  // PAGINATION
  // =========================================================================

  /// **Charger la page suivante des véhicules**
  Future<void> loadNextPage() async {
    final currentData = state.dataOrNull;
    if (currentData == null || !currentData.hasMore || state.isRefreshing) return;

    final nextPage = currentData.currentPage + 1;
    state = ViewState.refreshing(currentData);

    final result = await getVehiclesUseCase(
      GetVehiclesParams(
        page: nextPage,
        limit: 10,
        ville: currentData.villeFilter,
        type: currentData.typeFilter,
      ),
    );

    result.fold(
      (failure) => showError(failure.message),
      (newVehicles) {
        state = ViewState.success(currentData.copyWith(
          vehicles: [...currentData.vehicles, ...newVehicles],
          currentPage: nextPage,
          hasMore: newVehicles.length >= 10,
        ));
      },
    );
  }

  // =========================================================================
  // SEARCH & FILTERS
  // =========================================================================

  /// **Recherche textuelle**
  Future<void> search(String query) async {
    final currentData = state.dataOrNull ?? const VehicleExploreData();
    state = const ViewState.loading();

    final result = await searchVehiclesUseCase(
      SearchVehiclesParams(
        query: query,
        page: 1,
        limit: 20,
      ),
    );

    result.fold(
      (failure) => state = ViewState.failure(failure.message, code: failure.code),
      (results) {
        if (results.isEmpty) {
          state = ViewState.empty(message: 'Aucun véhicule pour "$query"');
        } else {
          state = ViewState.success(currentData.copyWith(
            searchResults: results,
            searchQuery: query,
          ));
        }
      },
    );
  }

  /// **Recherche avancée avec filtres**
  Future<void> applyFilters({
    String? ville,
    String? type,
    DateTime? dateDebut,
    DateTime? dateFin,
    int? joursMinimum,
    double? prixMin,
    double? prixMax,
    bool? horsDakar,
  }) async {
    final currentData = state.dataOrNull ?? const VehicleExploreData();
    state = const ViewState.loading();

    final result = await searchVehiclesWithFiltersUseCase(
      ville: ville,
      type: type,
      dateDebut: dateDebut,
      dateFin: dateFin,
      joursMinimum: joursMinimum,
      prixMin: prixMin,
      prixMax: prixMax,
      horsDakar: horsDakar,
      page: 1,
      limit: 20,
    );

    result.fold(
      (failure) => state = ViewState.failure(failure.message, code: failure.code),
      (results) {
        if (results.isEmpty) {
          state = const ViewState.empty(message: 'Aucun véhicule ne correspond à ces critères');
        } else {
          state = ViewState.success(currentData.copyWith(
            searchResults: results,
            villeFilter: ville,
            typeFilter: type,
            prixMinFilter: prixMin,
            prixMaxFilter: prixMax,
            dateDebutFilter: dateDebut,
            dateFinFilter: dateFin,
            joursMinimumFilter: joursMinimum,
            horsDakarFilter: horsDakar,
          ));
        }
      },
    );
  }

  /// **Réinitialiser tous les filtres et restaurer le cache**
  void clearFilters() {
    if (_cachedData != null) {
      state = ViewState.success(_cachedData!);
    }
  }

  /// **Mettre à jour le filtre de type de véhicule**
  Future<void> updateTypeFilter(String? type) async {
    final currentData = state.dataOrNull ?? const VehicleExploreData();

    // Si le type est null ou vide, on réinitialise et charge tous les véhicules
    if (type == null || type.isEmpty) {
      state = ViewState.refreshing(currentData);
      final result = await getVehiclesUseCase(const GetVehiclesParams(page: 1, limit: 10));

      result.fold(
        (failure) => state = ViewState.failure(failure.message, code: failure.code),
        (vehicles) {
          state = ViewState.success(currentData.copyWith(
            vehicles: vehicles,
            typeFilter: null,
            currentPage: 1,
            hasMore: vehicles.length >= 10,
          ));
        },
      );
      return;
    }

    // Sinon on applique le filtre de type
    state = ViewState.refreshing(currentData);

    final result = await getVehiclesUseCase(
      GetVehiclesParams(
        page: 1,
        limit: 10,
        type: type,
        ville: currentData.villeFilter,
      ),
    );

    result.fold(
      (failure) => state = ViewState.failure(failure.message, code: failure.code),
      (vehicles) {
        if (vehicles.isEmpty) {
          state = ViewState.empty(message: 'Aucun véhicule de ce type disponible');
        } else {
          state = ViewState.success(currentData.copyWith(
            vehicles: vehicles,
            typeFilter: type,
            currentPage: 1,
            hasMore: vehicles.length >= 10,
          ));
        }
      },
    );
  }
}
