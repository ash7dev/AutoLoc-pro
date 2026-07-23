import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Get Upload Signature UseCase
///
/// Obtient une signature Cloudinary pour upload direct.
class GetUploadSignature {
  final VehicleRepository repository;

  GetUploadSignature(this.repository);

  Future<Result<Map<String, dynamic>>> call() {
    return repository.getUploadSignature();
  }
}
