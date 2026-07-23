import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../../../../../core/utils/result.dart';
import '../../domain/entities/owner_dashboard_data.dart';
import '../../domain/repositories/owner_dashboard_repository.dart';
import '../datasources/owner_dashboard_remote_datasource.dart';

/// Implémentation du Owner Dashboard Repository
class OwnerDashboardRepositoryImpl implements OwnerDashboardRepository {
  final OwnerDashboardRemoteDataSource remoteDataSource;

  OwnerDashboardRepositoryImpl(this.remoteDataSource);

  @override
  Future<Result<OwnerDashboardData>> getOwnerStats() async {
    try {
      final dto = await remoteDataSource.getOwnerStats();
      final entity = dto.toEntity();
      return Right(entity);
    } on DioException catch (e) {
      return Left(
        ServerFailure(
          message: e.response?.data['message'] ??
                   'Erreur lors de la récupération des statistiques',
          code: e.response?.statusCode.toString(),
        ),
      );
    } catch (e) {
      return Left(
        UnexpectedFailure('Erreur inattendue: ${e.toString()}'),
      );
    }
  }
}
