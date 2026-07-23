import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Get Mobile Feed UseCase
///
/// Récupère le feed mobile ultra-complet.
class GetMobileFeed {
  final VehicleRepository repository;

  GetMobileFeed(this.repository);

  Future<Result<Map<String, dynamic>>> call() {
    return repository.getMobileFeed();
  }
}
