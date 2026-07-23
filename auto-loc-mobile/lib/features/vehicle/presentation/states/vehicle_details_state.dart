import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/vehicle.dart';

part 'vehicle_details_state.freezed.dart';

/// Type alias pour l'état des détails du véhicule
typedef VehicleDetailsState = ViewState<VehicleDetailsData>;

/// Données d'état pour la consultation d'un véhicule spécifique
@freezed
class VehicleDetailsData with _$VehicleDetailsData {
  const factory VehicleDetailsData({
    /// Véhicule affiché
    required Vehicle vehicle,

    /// Dates bloquées / réservées pour ce véhicule
    @Default([]) List<Map<String, dynamic>> blockedDates,

    /// Prévisualisation du prix calculé
    Map<String, dynamic>? pricingPreview,

    /// Nombre de jours spécifié pour le calcul du prix
    int? pricingDays,

    /// Option hors Dakar spécifiée pour le calcul du prix
    bool? pricingHorsDakar,
  }) = _VehicleDetailsData;
}
