import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../../../shared/enums/dispute_resolution.dart';
import '../datasources/dispute_remote_datasource.dart';
import '../../domain/entities/dispute.dart';
import '../mappers/dispute_mapper.dart';
import '../../domain/repositories/dispute_repository.dart';

/// Dispute Repository Implementation
///
/// Implémentation du repository pour les litiges.
/// Orchestre le DataSource + Mapper + Gestion des erreurs.
class DisputeRepositoryImpl implements DisputeRepository {
  final DisputeRemoteDataSource remoteDataSource;

  DisputeRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<Result<Dispute>> createDispute({
    required String reservationId,
    required String motif,
    required String commentaire,
  }) async {
    try {
      final dto = await remoteDataSource.createDispute(
        reservationId: reservationId,
        motif: motif,
        commentaire: commentaire,
      );
      return Right(DisputeMapper.toEntity(dto));
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Dispute>>> getDisputes() async {
    try {
      final dtos = await remoteDataSource.getDisputes();
      final list = dtos.map(DisputeMapper.toEntity).toList();
      return Right(list);
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Dispute>> getDisputeDetail(String disputeId) async {
    try {
      final dto = await remoteDataSource.getDisputeDetail(disputeId);
      return Right(DisputeMapper.toEntity(dto));
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Dispute>> resolveDispute({
    required String disputeId,
    required DisputeResolution resolution,
    String? resolutionCommentaire,
  }) async {
    try {
      final dto = await remoteDataSource.resolveDispute(
        disputeId: disputeId,
        resolution: resolution.toPrismaString(),
        resolutionCommentaire: resolutionCommentaire,
      );
      return Right(DisputeMapper.toEntity(dto));
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  Failure _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkFailure(
          message: 'Connection timeout',
          userMessage: 'Délai d\'attente dépassé',
        );

      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          return const UnauthorizedFailure('Session expirée');
        } else if (statusCode == 404) {
          return const NotFoundFailure(
            message: 'Resource not found',
            userMessage: 'Ressource non trouvée',
          );
        } else if (statusCode == 403) {
          return const ForbiddenFailure('Accès interdit');
        } else if (statusCode == 400) {
          final message = e.response?.data['message'] ?? 'Données invalides';
          return ValidationFailure(message);
        } else if (statusCode != null && statusCode >= 500) {
          return const ServerFailure(
            message: 'Server error',
            userMessage: 'Erreur serveur',
          );
        }
        return ServerFailure(
          message: e.response?.data['message'] ?? 'Server error',
          userMessage: 'Erreur serveur',
        );

      case DioExceptionType.cancel:
        return const NetworkFailure(
          message: 'Request cancelled',
          userMessage: 'Requête annulée',
        );

      case DioExceptionType.connectionError:
      case DioExceptionType.unknown:
      default:
        return const NetworkFailure(
          message: 'Connection error',
          userMessage: 'Vérifiez votre connexion internet',
        );
    }
  }
}
