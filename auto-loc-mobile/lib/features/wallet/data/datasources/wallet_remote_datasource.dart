import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/errors/exceptions.dart';
import '../dto/wallet_dto.dart';

abstract class WalletRemoteDataSource {
  Future<WalletDto> getWallet();
  Future<List<PenaltyDto>> getPendingPenalties();
  Future<WithdrawalDto> requestWithdrawal(double montant, String methode, String numeroDestinataire);
  Future<List<WalletTransactionDto>> getTransactionHistory(int? page, int? limit);
  Future<List<WithdrawalDto>> getWithdrawalHistory(int? page, int? limit);
}

class WalletRemoteDataSourceImpl implements WalletRemoteDataSource {
  final Dio _dio;
  WalletRemoteDataSourceImpl(this._dio);

  @override
  Future<WalletDto> getWallet() async {
    try {
      final response = await _dio.get(ApiEndpoints.walletMe);
      return WalletDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['message'] ?? 'Erreur wallet');
    }
  }

  @override
  Future<List<PenaltyDto>> getPendingPenalties() async {
    try {
      final response = await _dio.get(ApiEndpoints.walletPenalties);
      return (response.data as List).map((j) => PenaltyDto.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['message'] ?? 'Erreur pénalités');
    }
  }

  @override
  Future<WithdrawalDto> requestWithdrawal(double montant, String methode, String numeroDestinataire) async {
    try {
      final response = await _dio.post(ApiEndpoints.withdraw, data: {
        'montant': montant,
        'methode': methode,
        'numeroDestinataire': numeroDestinataire,
      });
      return WithdrawalDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['message'] ?? 'Erreur retrait');
    }
  }

  @override
  Future<List<WalletTransactionDto>> getTransactionHistory(int? page, int? limit) async {
    try {
      final response = await _dio.get('${ApiEndpoints.walletMe}/transactions', queryParameters: {
        if (page != null) 'page': page,
        if (limit != null) 'limit': limit,
      });
      return (response.data['data'] as List).map((j) => WalletTransactionDto.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['message'] ?? 'Erreur historique');
    }
  }

  @override
  Future<List<WithdrawalDto>> getWithdrawalHistory(int? page, int? limit) async {
    try {
      final response = await _dio.get('${ApiEndpoints.walletMe}/withdrawals', queryParameters: {
        if (page != null) 'page': page,
        if (limit != null) 'limit': limit,
      });
      return (response.data['data'] as List).map((j) => WithdrawalDto.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['message'] ?? 'Erreur retraits');
    }
  }
}
