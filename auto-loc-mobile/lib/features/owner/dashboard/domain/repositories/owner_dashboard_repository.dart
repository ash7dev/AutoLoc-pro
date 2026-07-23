import '../../../../../core/utils/result.dart';
import '../entities/owner_dashboard_data.dart';

/// Owner Dashboard Repository
///
/// Interface pour récupérer les données du dashboard propriétaire.
abstract class OwnerDashboardRepository {
  /// Récupère les statistiques du dashboard propriétaire
  Future<Result<OwnerDashboardData>> getOwnerStats();
}
