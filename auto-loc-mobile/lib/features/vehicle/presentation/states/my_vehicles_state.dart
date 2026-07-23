import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/vehicle.dart';

part 'my_vehicles_state.freezed.dart';

/// Type alias pour l'état de la flotte du propriétaire
typedef MyVehiclesState = ViewState<MyVehiclesData>;

/// Données d'état pour les véhicules du propriétaire connecté
@freezed
class MyVehiclesData with _$MyVehiclesData {
  const factory MyVehiclesData({
    /// Liste des véhicules personnels
    @Default([]) List<Vehicle> vehicles,

    /// Résumé des performances (chiffre d'affaires, locations actives, etc.)
    Map<String, dynamic>? summary,
  }) = _MyVehiclesData;
}
