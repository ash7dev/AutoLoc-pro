import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../../domain/entities/owner_reservation.dart';
import '../../domain/repositories/owner_reservations_repository.dart';
import '../datasources/owner_reservations_remote_datasource.dart';

/// Implémentation du repository pour les réservations Owner
class OwnerReservationsRepositoryImpl implements OwnerReservationsRepository {
  final OwnerReservationsRemoteDataSource remoteDataSource;

  const OwnerReservationsRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<Either<Failure, List<OwnerReservation>>> getMyReservations({
    String? vehiculeId,
    int? page,
    int? limit,
  }) async {
    try {
      final dtos = await remoteDataSource.getMyReservations(
        vehiculeId: vehiculeId,
        page: page,
        limit: limit,
      );

      final entities = dtos.map((dto) => dto.toEntity()).toList();
      return right(entities);
    } on DioException catch (e) {
      return left(_handleDioException(e));
    } catch (e) {
      return left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, OwnerReservation>> getReservationById(
    String id,
  ) async {
    try {
      final dto = await remoteDataSource.getReservationById(id);
      return right(dto.toEntity());
    } on DioException catch (e) {
      return left(_handleDioException(e));
    } catch (e) {
      return left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, OwnerReservation>> confirmReservation(
    String id,
    String heureDebut,
  ) async {
    try {
      final dto = await remoteDataSource.confirmReservation(id, heureDebut);
      return right(dto.toEntity());
    } on DioException catch (e) {
      return left(_handleDioException(e));
    } catch (e) {
      return left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, OwnerReservation>> cancelReservation(
    String id,
    String raison,
  ) async {
    try {
      final dto = await remoteDataSource.cancelReservation(id, raison);
      return right(dto.toEntity());
    } on DioException catch (e) {
      return left(_handleDioException(e));
    } catch (e) {
      return left(UnexpectedFailure(e.toString()));
    }
  }

  /// Gestion centralisée des erreurs Dio
  Failure _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkFailure.timeout();

      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final message = e.response?.data?['message'] as String?;

        if (statusCode == 404) {
          return NotFoundFailure(
            message: message ?? 'Réservation introuvable',
          );
        } else if (statusCode == 401 || statusCode == 403) {
          return UnauthorizedFailure(
            message ?? 'Non autorisé',
          );
        } else if (statusCode == 400) {
          return ValidationFailure(
            message ?? 'Requête invalide',
          );
        } else {
          return ServerFailure(
            message: message ?? 'Erreur serveur',
            statusCode: statusCode,
          );
        }

      case DioExceptionType.cancel:
        return NetworkFailure.unknown();

      case DioExceptionType.connectionError:
        return NetworkFailure.offline();

      default:
        return UnexpectedFailure(
          e.message ?? 'Erreur inattendue',
        );
    }
  }
}
