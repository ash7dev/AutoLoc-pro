import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/payment_status.dart';
import '../datasources/payment_remote_datasource.dart';
import '../../domain/entities/payment_initiation.dart';
import '../mappers/payment_mapper.dart';
import '../../domain/repositories/payment_repository.dart';

/// Payment Repository Implementation
///
/// Implémentation du repository pour les paiements.
/// Orchestre le DataSource + Mapper + Gestion des erreurs.
class PaymentRepositoryImpl implements PaymentRepository {
  final PaymentRemoteDataSource remoteDataSource;

  PaymentRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<Result<PaymentInitiation>> initiatePayment({
    required String reservationId,
    required PaymentProvider provider,
    required double montant,
    String? payerPhone,
  }) async {
    try {
      final dto = await remoteDataSource.initiatePayment(
        reservationId: reservationId,
        provider: provider.toPrismaString(),
        montant: montant,
        payerPhone: payerPhone,
      );
      return Right(PaymentMapper.toEntity(dto));
    } on DioException catch (e) {
      return Left(_handleDioException(e));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<PaymentStatus>> checkPaymentStatus(String reservationId) async {
    try {
      final dto = await remoteDataSource.checkPaymentStatus(reservationId);
      return Right(PaymentMapper.toEntity(dto).statut);
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
