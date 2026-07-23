import '../../../../core/utils/result.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Get My Vehicles UseCase
///
/// Récupère les véhicules du propriétaire connecté.
class GetMyVehicles {
  final VehicleRepository repository;

  GetMyVehicles(this.repository);

  Future<Result<List<Vehicle>>> call({int? limit}) {
    return repository.getMyVehicles(limit: limit);
  }
}
