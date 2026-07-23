import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../../../../../core/utils/result.dart';
import '../../domain/entities/owner_vehicle.dart';
import '../../domain/repositories/fleet_repository.dart';
import '../datasources/fleet_remote_datasource.dart';

/// Implémentation du FleetRepository
///
/// Gère les appels API et la conversion DTO → Entity
class FleetRepositoryImpl implements FleetRepository {
  final FleetRemoteDataSource remoteDataSource;

  const FleetRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<List<OwnerVehicle>>> getMyVehicles() async {
    try {
      final dtos = await remoteDataSource.getMyVehicles();
      final entities = dtos.map((dto) => dto.toEntity()).toList();

      return Right(entities);
    } on DioException catch (e) {
      final message = e.response?.data['message'] as String? ??
          'Erreur lors de la récupération des véhicules';

      return Left(ServerFailure(
        message: message,
        code: e.response?.statusCode.toString(),
        statusCode: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(UnexpectedFailure('Erreur inattendue: ${e.toString()}'));
    }
  }

  @override
  Future<Result<OwnerVehicle>> getVehicleById(String id) async {
    try {
      final dto = await remoteDataSource.getVehicleById(id);
      final entity = dto.toEntity();

      return Right(entity);
    } on DioException catch (e) {
      final message = e.response?.data['message'] as String? ??
          'Erreur lors de la récupération du véhicule';

      return Left(ServerFailure(
        message: message,
        code: e.response?.statusCode.toString(),
        statusCode: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(UnexpectedFailure('Erreur inattendue: ${e.toString()}'));
    }
  }

  @override
  Future<Result<void>> deleteVehicle(String id) async {
    try {
      await remoteDataSource.deleteVehicle(id);

      return const Right(null);
    } on DioException catch (e) {
      final message = e.response?.data['message'] as String? ??
          'Erreur lors de la suppression du véhicule';

      return Left(ServerFailure(
        message: message,
        code: e.response?.statusCode.toString(),
        statusCode: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(UnexpectedFailure('Erreur inattendue: ${e.toString()}'));
    }
  }
}
