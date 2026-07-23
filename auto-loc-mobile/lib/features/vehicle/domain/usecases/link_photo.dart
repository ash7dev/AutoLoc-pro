import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Link Photo UseCase
///
/// Lie une photo uploadée directement vers Cloudinary.
class LinkPhoto {
  final VehicleRepository repository;

  LinkPhoto(this.repository);

  Future<Result<Map<String, dynamic>>> call({
    required String vehicleId,
    required String url,
    required String publicId,
  }) {
    return repository.linkPhoto(
      vehicleId: vehicleId,
      url: url,
      publicId: publicId,
    );
  }
}
