import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../datasources/notification_remote_datasource.dart';
import '../../domain/entities/notification_subscription.dart';
import '../mappers/notification_mapper.dart';
import '../../domain/repositories/notification_repository.dart';

/// Notification Repository Implementation
///
/// Implémentation du repository pour les notifications.
/// Orchestre le DataSource + Mapper + Gestion des erreurs.
class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDataSource remoteDataSource;

  NotificationRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<Result<NotificationSubscription>> subscribe({
    required String endpoint,
    required String keysP256dh,
    required String keysAuth,
  }) async {
    try {
      final dto = await remoteDataSource.subscribe(
        endpoint: endpoint,
        keysP256dh: keysP256dh,
        keysAuth: keysAuth,
      );
      return Right(NotificationMapper.toEntity(dto));
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> unsubscribe(String endpoint) async {
    try {
      await remoteDataSource.unsubscribe(endpoint);
      return const Right(true);
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> sendTestNotification() async {
    try {
      await remoteDataSource.sendTestNotification();
      return const Right(true);
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
