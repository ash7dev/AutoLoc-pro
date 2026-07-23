import '../../../../core/utils/result.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Archive Vehicle UseCase
///
/// Archive un véhicule (statut → ARCHIVE).
class ArchiveVehicle {
  final VehicleRepository repository;

  ArchiveVehicle(this.repository);

  Future<Result<Vehicle>> call(String vehicleId) {
    return repository.archiveVehicle(vehicleId);
  }
}
