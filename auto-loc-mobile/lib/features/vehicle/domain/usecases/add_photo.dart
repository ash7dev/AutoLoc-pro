import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Add Photo UseCase
///
/// Ajoute une photo à un véhicule.
class AddPhoto {
  final VehicleRepository repository;

  AddPhoto(this.repository);

  Future<Result<Map<String, dynamic>>> call({
    required String vehicleId,
    required String imagePath,
  }) {
    return repository.addPhoto(
      vehicleId: vehicleId,
      imagePath: imagePath,
    );
  }
}
