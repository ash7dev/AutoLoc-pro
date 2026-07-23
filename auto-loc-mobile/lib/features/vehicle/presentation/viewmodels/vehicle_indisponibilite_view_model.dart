import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/usecases/get_indisponibilites.dart';
import '../../domain/usecases/create_indisponibilite.dart';
import '../../domain/usecases/delete_indisponibilite.dart';
import '../states/vehicle_indisponibilite_state.dart';

/// **VehicleIndisponibiliteViewModel** - ViewModel pour la gestion des indisponibilités d'un véhicule
class VehicleIndisponibiliteViewModel extends BaseViewModel<VehicleIndisponibiliteData> {
  final GetIndisponibilites getIndisponibilitesUseCase;
  final CreateIndisponibilite createIndisponibiliteUseCase;
  final DeleteIndisponibilite deleteIndisponibiliteUseCase;

  String? _vehicleId;

  VehicleIndisponibiliteViewModel({
    required this.getIndisponibilitesUseCase,
    required this.createIndisponibiliteUseCase,
    required this.deleteIndisponibiliteUseCase,
  }) : super();

  /// **Initialiser le ViewModel avec l'ID du véhicule**
  void initialize(String vehicleId) {
    _vehicleId = vehicleId;
    load();
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /// **Charger la liste des indisponibilités**
  @override
  Future<void> load() async {
    if (_vehicleId == null) return;
    state = const ViewState.loading();

    try {
      final result = await getIndisponibilitesUseCase(_vehicleId!);

      result.fold(
        (failure) => state = ViewState.failure(failure.message, code: failure.code),
        (indisponibilites) {
          if (indisponibilites.isEmpty) {
            state = ViewState.empty(message: "Aucune période d'indisponibilité pour ce véhicule");
          } else {
            state = ViewState.success(VehicleIndisponibiliteData(
              vehicleId: _vehicleId!,
              indisponibilites: indisponibilites,
            ));
          }
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
    }
  }

  // =========================================================================
  // INDISPONIBILITES OPERATIONS
  // =========================================================================

  /// **Ajouter une indisponibilité**
  Future<void> addIndisponibilite({
    required DateTime dateDebut,
    required DateTime dateFin,
    String? motif,
  }) async {
    if (_vehicleId == null) return;

    final result = await createIndisponibiliteUseCase(
      vehicleId: _vehicleId!,
      dateDebut: dateDebut,
      dateFin: dateFin,
      motif: motif,
    );

    result.fold(
      (failure) => showError(failure.message),
      (newIndispo) {
        showSuccess("Période d'indisponibilité ajoutée avec succès.");
        load(); // Recharger la liste
      },
    );
  }

  /// **Supprimer une indisponibilité**
  Future<void> removeIndisponibilite(String indispoId) async {
    if (_vehicleId == null) return;

    final result = await deleteIndisponibiliteUseCase(
      vehicleId: _vehicleId!,
      indispoId: indispoId,
    );

    result.fold(
      (failure) => showError(failure.message),
      (deleted) {
        if (deleted) {
          showSuccess("Période d'indisponibilité supprimée.");
          load(); // Recharger la liste
        } else {
          showError("Impossible de supprimer la période d'indisponibilité.");
        }
      },
    );
  }
}
