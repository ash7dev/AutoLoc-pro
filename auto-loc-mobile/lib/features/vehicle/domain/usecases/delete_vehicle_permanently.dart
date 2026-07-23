import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Delete Vehicle Permanently UseCase
///
/// Supprime définitivement un véhicule (BROUILLON / ARCHIVE uniquement).
class DeleteVehiclePermanently {
  final VehicleRepository repository;

  DeleteVehiclePermanently(this.repository);

  Future<Result<bool>> call(String vehicleId) {
    return repository.deleteVehiclePermanently(vehicleId);
  }
}
