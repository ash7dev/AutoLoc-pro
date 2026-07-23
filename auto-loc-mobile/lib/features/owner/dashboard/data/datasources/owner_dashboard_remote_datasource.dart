import 'package:dio/dio.dart';

import '../../../../../core/constants/api_endpoints.dart';
import '../dto/owner_dashboard_dto.dart';

/// Owner Dashboard Remote DataSource
///
/// Gère les appels API pour les statistiques du dashboard propriétaire.
abstract class OwnerDashboardRemoteDataSource {
  Future<OwnerDashboardDto> getOwnerStats();
}

/// Implémentation de OwnerDashboardRemoteDataSource
class OwnerDashboardRemoteDataSourceImpl
    implements OwnerDashboardRemoteDataSource {
  final Dio _dio;

  OwnerDashboardRemoteDataSourceImpl(this._dio);

  @override
  Future<OwnerDashboardDto> getOwnerStats() async {
    final response = await _dio.get(ApiEndpoints.ownerReservationStats);
    return OwnerDashboardDto.fromJson(response.data);
  }
}
