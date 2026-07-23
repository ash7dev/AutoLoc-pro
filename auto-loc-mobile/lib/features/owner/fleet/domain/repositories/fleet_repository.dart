import '../../../../../core/utils/result.dart';
import '../entities/owner_vehicle.dart';

/// Repository interface pour la gestion de la flotte
///
/// Définit les opérations disponibles pour gérer les véhicules du propriétaire.
abstract class FleetRepository {
  /// Récupère tous les véhicules du propriétaire connecté
  Future<Result<List<OwnerVehicle>>> getMyVehicles();

  /// Récupère un véhicule par son ID
  Future<Result<OwnerVehicle>> getVehicleById(String id);

  /// Supprime un véhicule
  Future<Result<void>> deleteVehicle(String id);
}
