import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../datasources/review_remote_datasource.dart';
import '../mappers/review_mapper.dart';
import '../../domain/entities/review.dart';
import '../../domain/repositories/review_repository.dart';

/// Review Repository Implementation
///
/// Implémentation du repository pour les avis.
/// Orchestre le DataSource + Mapper + Gestion des erreurs.
class ReviewRepositoryImpl implements ReviewRepository {
  final ReviewRemoteDataSource remoteDataSource;

  ReviewRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<Result<Review>> createReview({
    required String reservationId,
    required int note,
    String? commentaire,
  }) async {
    try {
      final dto = await remoteDataSource.createReview(
        reservationId: reservationId,
        note: note,
        commentaire: commentaire,
      );
      return Right(ReviewMapper.toEntity(dto));
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Review>>> getUserReviews(String userId) async {
    try {
      final dtos = await remoteDataSource.getUserReviews(userId);
      final list = dtos.map(ReviewMapper.toEntity).toList();
      return Right(list);
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
