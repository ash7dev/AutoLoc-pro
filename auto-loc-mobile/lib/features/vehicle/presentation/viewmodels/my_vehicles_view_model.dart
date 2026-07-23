import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/usecases/get_my_vehicles.dart';
import '../../domain/usecases/get_my_vehicles_summary.dart';
import '../../domain/usecases/archive_vehicle.dart';
import '../../domain/usecases/delete_vehicle_permanently.dart';
import '../states/my_vehicles_state.dart';

/// **MyVehiclesViewModel** - ViewModel pour la flotte de véhicules du propriétaire
class MyVehiclesViewModel extends BaseViewModel<MyVehiclesData> {
  final GetMyVehicles getMyVehiclesUseCase;
  final GetMyVehiclesSummary getMyVehiclesSummaryUseCase;
  final ArchiveVehicle archiveVehicleUseCase;
  final DeleteVehiclePermanently deleteVehiclePermanentlyUseCase;

  MyVehiclesViewModel({
    required this.getMyVehiclesUseCase,
    required this.getMyVehiclesSummaryUseCase,
    required this.archiveVehicleUseCase,
    required this.deleteVehiclePermanentlyUseCase,
  }) : super();

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /// **Charger la liste des véhicules et le résumé**
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    try {
      final vehiclesResult = await getMyVehiclesUseCase();
      final summaryResult = await getMyVehiclesSummaryUseCase();

      vehiclesResult.fold(
        (failure) => state = ViewState.failure(failure.message, code: failure.code),
        (vehicles) {
          summaryResult.fold(
            (failure) => state = ViewState.failure(failure.message, code: failure.code),
            (summary) {
              if (vehicles.isEmpty) {
                state = const ViewState.empty(message: "Vous n'avez enregistré aucun véhicule");
              } else {
                state = ViewState.success(MyVehiclesData(
                  vehicles: vehicles,
                  summary: summary,
                ));
              }
            },
          );
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
    }
  }

  // =========================================================================
  // VEHICLE MANAGEMENT
  // =========================================================================

  /// **Archiver un véhicule**
  Future<void> archive(String id) async {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    final result = await archiveVehicleUseCase(id);

    result.fold(
      (failure) => showError(failure.message),
      (updatedVehicle) {
        showSuccess('Véhicule archivé avec succès');
        load(); // Recharger pour rafraîchir les stats et la liste
      },
    );
  }

  /// **Supprimer définitivement un véhicule (BROUILLON ou ARCHIVE uniquement)**
  Future<void> deletePermanently(String id) async {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    final result = await deleteVehiclePermanentlyUseCase(id);

    result.fold(
      (failure) => showError(failure.message),
      (deleted) {
        if (deleted) {
          showSuccess('Véhicule supprimé définitivement');
          load(); // Recharger pour rafraîchir les stats et la liste
        } else {
          showError('Impossible de supprimer le véhicule');
        }
      },
    );
  }
}
