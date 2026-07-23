import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/presentation/base/view_state.dart';

part 'vehicle_indisponibilite_state.freezed.dart';

/// Type alias pour l'état des indisponibilités
typedef VehicleIndisponibiliteState = ViewState<VehicleIndisponibiliteData>;

/// Données d'état pour les indisponibilités d'un véhicule spécifique
@freezed
class VehicleIndisponibiliteData with _$VehicleIndisponibiliteData {
  const factory VehicleIndisponibiliteData({
    /// ID du véhicule concerné
    required String vehicleId,

    /// Liste des indisponibilités configurées
    @Default([]) List<Map<String, dynamic>> indisponibilites,
  }) = _VehicleIndisponibiliteData;
}
