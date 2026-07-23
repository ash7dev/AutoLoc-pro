import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../../domain/entities/penalty.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/entities/withdrawal.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../datasources/wallet_remote_datasource.dart';

/// Implémentation du repository pour le Wallet
class WalletRepositoryImpl implements WalletRepository {
  final WalletRemoteDataSource remoteDataSource;

  const WalletRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<Either<Failure, Wallet>> getWalletInfo() async {
    try {
      final dto = await remoteDataSource.getWalletInfo();
      return right(dto.toEntity());
    } on DioException catch (e) {
      return left(_handleDioException(e));
    } catch (e) {
      return left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Penalty>>> getPenalties() async {
    try {
      final dto = await remoteDataSource.getPenalties();
      final penalties = dto.penalites.map((p) => p.toEntity()).toList();
      return right(penalties);
    } on DioException catch (e) {
      return left(_handleDioException(e));
    } catch (e) {
      return left(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> requestWithdrawal(
    WithdrawalRequest request,
  ) async {
    try {
      await remoteDataSource.requestWithdrawal(
        montant: request.montant,
        methode: request.methode,
        numeroDestinataire: request.numeroDestinataire,
      );
      return right(null);
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
          // Cas spécial: profil incomplet
          final isProfileIncomplete = message?.toLowerCase().contains('profil') ?? false;
          return NotFoundFailure(
            message: message ?? 'Wallet introuvable',
            userMessage: isProfileIncomplete
              ? 'Veuillez compléter votre profil propriétaire pour accéder au portefeuille. '
                'Ajoutez vos informations personnelles et vérifiez votre identité.'
              : message ?? 'Wallet introuvable',
          );
        } else if (statusCode == 401 || statusCode == 403) {
          return UnauthorizedFailure(
            message ?? 'Non autorisé',
          );
        } else if (statusCode == 400) {
          // Erreur spécifique au wallet (solde insuffisant, montant invalide, etc.)
          return WalletFailure(
            message: message ?? 'Requête invalide',
            userMessage: message,
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
