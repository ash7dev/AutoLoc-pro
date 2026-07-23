import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Get Blocked Dates UseCase
///
/// Récupère les dates indisponibles d'un véhicule.
class GetBlockedDates {
  final VehicleRepository repository;

  GetBlockedDates(this.repository);

  Future<Result<List<Map<String, dynamic>>>> call(String vehicleId) {
    return repository.getBlockedDates(vehicleId);
  }
}
