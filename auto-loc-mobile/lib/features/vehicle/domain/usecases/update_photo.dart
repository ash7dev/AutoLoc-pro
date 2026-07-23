import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Update Photo UseCase
///
/// Modifie une photo (position / photo principale).
class UpdatePhoto {
  final VehicleRepository repository;

  UpdatePhoto(this.repository);

  Future<Result<Map<String, dynamic>>> call({
    required String vehicleId,
    required String photoId,
    int? position,
    bool? estPrincipale,
  }) {
    return repository.updatePhoto(
      vehicleId: vehicleId,
      photoId: photoId,
      position: position,
      estPrincipale: estPrincipale,
    );
  }
}
