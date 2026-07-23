import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Get Home Feed UseCase
///
/// Récupère le feed home (premium, nouveautés, recommandé).
class GetHomeFeed {
  final VehicleRepository repository;

  GetHomeFeed(this.repository);

  Future<Result<Map<String, dynamic>>> call() {
    return repository.getHomeFeed();
  }
}
