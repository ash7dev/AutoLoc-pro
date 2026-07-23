import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Delete Photo UseCase
///
/// Supprime une photo d'un véhicule.
class DeletePhoto {
  final VehicleRepository repository;

  DeletePhoto(this.repository);

  Future<Result<bool>> call({
    required String vehicleId,
    required String photoId,
  }) {
    return repository.deletePhoto(
      vehicleId: vehicleId,
      photoId: photoId,
    );
  }
}
