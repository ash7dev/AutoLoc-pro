import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/usecases/get_vehicle_details.dart';
import '../../domain/usecases/get_blocked_dates.dart';
import '../../domain/usecases/get_pricing.dart';
import '../states/vehicle_details_state.dart';

/// **VehicleDetailsViewModel** - ViewModel pour l'affichage détaillé d'un véhicule
class VehicleDetailsViewModel extends BaseViewModel<VehicleDetailsData> {
  final GetVehicleDetails getVehicleDetailsUseCase;
  final GetBlockedDates getBlockedDatesUseCase;
  final GetPricing getPricingUseCase;

  String? _vehicleId;

  VehicleDetailsViewModel({
    required this.getVehicleDetailsUseCase,
    required this.getBlockedDatesUseCase,
    required this.getPricingUseCase,
  }) : super();

  /// **Initialiser le ViewModel avec l'ID du véhicule**
  void initialize(String id) {
    _vehicleId = id;
    load();
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /// **Charger le véhicule et ses dates bloquées**
  @override
  Future<void> load() async {
    if (_vehicleId == null) return;
    state = const ViewState.loading();

    try {
      final detailsResult = await getVehicleDetailsUseCase(_vehicleId!);
      final datesResult = await getBlockedDatesUseCase(_vehicleId!);

      detailsResult.fold(
        (failure) => state = ViewState.failure(failure.message, code: failure.code),
        (vehicle) {
          datesResult.fold(
            (failure) => state = ViewState.failure(failure.message, code: failure.code),
            (blockedDates) {
              state = ViewState.success(VehicleDetailsData(
                vehicle: vehicle,
                blockedDates: blockedDates,
              ));
            },
          );
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
    }
  }

  // =========================================================================
  // PRICING CALCULATION
  // =========================================================================

  /// **Calculer le tarif pour une durée de location**
  Future<void> calculatePricing({required int days, bool? horsDakar}) async {
    final currentData = state.dataOrNull;
    if (currentData == null || _vehicleId == null) return;

    state = ViewState.refreshing(currentData);

    final result = await getPricingUseCase(
      vehicleId: _vehicleId!,
      days: days,
      horsDakar: horsDakar,
    );

    result.fold(
      (failure) {
        showError(failure.message);
        state = ViewState.success(currentData); // Rétablir l'état de succès précédent
      },
      (pricing) {
        state = ViewState.success(currentData.copyWith(
          pricingPreview: pricing,
          pricingDays: days,
          pricingHorsDakar: horsDakar,
        ));
      },
    );
  }
}
