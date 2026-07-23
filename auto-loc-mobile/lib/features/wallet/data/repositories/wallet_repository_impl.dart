import 'package:dio/dio.dart';
import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../../../shared/enums/withdrawal_method.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../datasources/wallet_remote_datasource.dart';
import '../mappers/wallet_mapper.dart';

class WalletRepositoryImpl implements WalletRepository {
  final WalletRemoteDataSource _remoteDataSource;
  WalletRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<Wallet>> getWallet() async {
    try {
      final dto = await _remoteDataSource.getWallet();
      final wallet = WalletMapper.toEntity(dto, 'wallet-id', 'user-id', DateTime.now(), DateTime.now());
      return success(wallet);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Penalty>>> getPendingPenalties() async {
    try {
      final dtos = await _remoteDataSource.getPendingPenalties();
      return success(dtos.map(WalletMapper.mapPenalty).toList());
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Withdrawal>> requestWithdrawal({
    required double montant,
    required WithdrawalMethod methode,
    required String numeroDestinataire,
  }) async {
    try {
      final dto = await _remoteDataSource.requestWithdrawal(montant, methode.toPrismaString(), numeroDestinataire);
      return success(WalletMapper.mapWithdrawal(dto));
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<WalletTransaction>>> getTransactionHistory({int? page, int? limit}) async {
    try {
      final dtos = await _remoteDataSource.getTransactionHistory(page, limit);
      return success(dtos.map((d) => WalletMapper.mapTransaction(d, 'wallet-id')).toList());
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Withdrawal>>> getWithdrawalHistory({int? page, int? limit}) async {
    try {
      final dtos = await _remoteDataSource.getWithdrawalHistory(page, limit);
      return success(dtos.map(WalletMapper.mapWithdrawal).toList());
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  Failure _handleDioException(DioException e) {
    if (e.response?.statusCode == 401) return const UnauthorizedFailure('Session expirée');
    if (e.response?.statusCode == 400) return ValidationFailure(e.response?.data['message'] ?? 'Erreur');
    return const NetworkFailure(message: 'Network error', userMessage: 'Erreur réseau');
  }
}
