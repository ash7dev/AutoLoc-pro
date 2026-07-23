import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Create Indisponibilite UseCase
///
/// Crée une période d'indisponibilité.
class CreateIndisponibilite {
  final VehicleRepository repository;

  CreateIndisponibilite(this.repository);

  Future<Result<Map<String, dynamic>>> call({
    required String vehicleId,
    required DateTime dateDebut,
    required DateTime dateFin,
    String? motif,
  }) {
    return repository.createIndisponibilite(
      vehicleId: vehicleId,
      dateDebut: dateDebut,
      dateFin: dateFin,
      motif: motif,
    );
  }
}
