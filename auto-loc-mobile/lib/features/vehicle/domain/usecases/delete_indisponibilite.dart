import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Delete Indisponibilite UseCase
///
/// Supprime une période d'indisponibilité.
class DeleteIndisponibilite {
  final VehicleRepository repository;

  DeleteIndisponibilite(this.repository);

  Future<Result<bool>> call({
    required String vehicleId,
    required String indispoId,
  }) {
    return repository.deleteIndisponibilite(
      vehicleId: vehicleId,
      indispoId: indispoId,
    );
  }
}
