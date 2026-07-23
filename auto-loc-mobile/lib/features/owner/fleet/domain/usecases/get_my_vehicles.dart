import '../../../../../core/utils/result.dart';
import '../entities/owner_vehicle.dart';
import '../repositories/fleet_repository.dart';

/// UseCase pour récupérer les véhicules du propriétaire
///
/// Suit le pattern Clean Architecture:
/// - Input: Aucun (utilise le token d'auth)
/// - Output: Result<List<OwnerVehicle>>
class GetMyVehicles {
  final FleetRepository repository;

  const GetMyVehicles(this.repository);

  /// Exécute le use case
  Future<Result<List<OwnerVehicle>>> call() {
    return repository.getMyVehicles();
  }
}
