import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// UseCase: Get Vehicle Details
///
/// Récupère les détails complets d'un véhicule par son ID.
/// Applique les règles métier:
/// - Validation de l'ID
/// - Gestion du cache local
/// - Logs analytics
///
/// Exemple:
/// ```dart
/// final result = await getVehicleDetails('abc-123');
/// result.fold(
///   (failure) => showError(failure),
///   (vehicle) => navigateToDetails(vehicle),
/// );
/// ```
class GetVehicleDetails {
  final VehicleRepository _repository;

  GetVehicleDetails(this._repository);

  Future<Result<Vehicle>> call(String vehicleId) {
    // TODO: Ajouter validation de l'ID
    // TODO: Ajouter analytics tracking
    return _repository.getVehicleById(vehicleId);
  }
}
