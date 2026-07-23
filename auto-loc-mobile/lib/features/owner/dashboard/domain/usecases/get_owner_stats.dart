import '../../../../../core/utils/result.dart';
import '../entities/owner_dashboard_data.dart';
import '../repositories/owner_dashboard_repository.dart';

/// Get Owner Stats UseCase
///
/// Récupère les statistiques du dashboard propriétaire depuis l'API.
class GetOwnerStats {
  final OwnerDashboardRepository repository;

  GetOwnerStats(this.repository);

  Future<Result<OwnerDashboardData>> call() {
    return repository.getOwnerStats();
  }
}
