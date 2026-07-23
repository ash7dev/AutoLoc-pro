import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/vehicle.dart';
import '../../data/mappers/vehicle_mapper.dart';
import '../../data/dto/vehicle_dto.dart';

part 'vehicle_explore_state.freezed.dart';

/// Type alias pour l'état d'exploration des véhicules
typedef VehicleExploreState = ViewState<VehicleExploreData>;

/// Données d'état pour la recherche et l'exploration des véhicules
@freezed
class VehicleExploreData with _$VehicleExploreData {
  const factory VehicleExploreData({
    /// Flux home contenant premium, nouveautés, recommandé
    Map<String, dynamic>? homeFeed,

    /// Flux mobile complet contenant les 10 sections
    Map<String, dynamic>? mobileFeed,

    /// Liste générale des véhicules chargés (ex: par défaut ou recommandés)
    @Default([]) List<Vehicle> vehicles,

    /// Résultats de recherche correspondants aux filtres courants
    @Default([]) List<Vehicle> searchResults,

    /// Requête textuelle de recherche courante
    @Default('') String searchQuery,

    /// Filtre par Ville
    String? villeFilter,

    /// Filtre par Type (BERLINE, SUV, etc.)
    String? typeFilter,

    /// Filtre par prix minimum
    double? prixMinFilter,

    /// Filtre par prix maximum
    double? prixMaxFilter,

    /// Date de début de réservation souhaitée
    DateTime? dateDebutFilter,

    /// Date de fin de réservation souhaitée
    DateTime? dateFinFilter,

    /// Nombre de jours minimum
    int? joursMinimumFilter,

    /// Demande de conduite hors Dakar
    bool? horsDakarFilter,

    /// Page courante pour la pagination
    @Default(1) int currentPage,

    /// Indique s'il reste d'autres pages à charger
    @Default(true) bool hasMore,
  }) = _VehicleExploreData;
}

/// Extension pour parser et mapper les sections du mobileFeed
extension VehicleExploreDataX on VehicleExploreData {
  /// Section "À la une" - Catégorie premium
  List<Vehicle> get featuredVehicles => _getCategory('premium');

  /// Section "À proximité" - Catégorie recommended
  List<Vehicle> get nearbyVehicles => _getRecommended();

  /// Section "Sélection Premium" - Catégorie luxe
  List<Vehicle> get premiumVehicles => _getCategory('luxe');

  List<Vehicle> _getCategory(String key) {
    final feed = mobileFeed;
    if (feed == null) return [];
    final list = feed[key];
    if (list is List) {
      try {
        return list
            .map((item) => VehicleMapper.toEntity(VehicleDto.fromJson(Map<String, dynamic>.from(item))))
            .toList();
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  List<Vehicle> _getRecommended() {
    final feed = mobileFeed;
    if (feed == null) return [];
    final recommended = feed['recommended'];
    if (recommended is Map) {
      final items = recommended['items'];
      if (items is List) {
        try {
          return items
              .map((item) => VehicleMapper.toEntity(VehicleDto.fromJson(Map<String, dynamic>.from(item))))
              .toList();
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  }
}
