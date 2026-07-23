import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Get My Vehicles Summary UseCase
///
/// Récupère le résumé des véhicules du propriétaire.
class GetMyVehiclesSummary {
  final VehicleRepository repository;

  GetMyVehiclesSummary(this.repository);

  Future<Result<Map<String, dynamic>>> call() {
    return repository.getMyVehiclesSummary();
  }
}
