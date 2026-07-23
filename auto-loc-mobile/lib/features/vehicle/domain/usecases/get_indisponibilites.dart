import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Get Indisponibilites UseCase
///
/// Liste les périodes d'indisponibilité d'un véhicule.
class GetIndisponibilites {
  final VehicleRepository repository;

  GetIndisponibilites(this.repository);

  Future<Result<List<Map<String, dynamic>>>> call(String vehicleId) {
    return repository.getIndisponibilites(vehicleId);
  }
}
