import 'package:dio/dio.dart';

import '../../../../../core/constants/api_endpoints.dart';
import '../../domain/entities/withdrawal.dart';
import '../dto/penalty_dto.dart';
import '../dto/wallet_dto.dart';

/// Remote DataSource pour le Wallet
abstract class WalletRemoteDataSource {
  Future<WalletResponseDto> getWalletInfo();
  Future<PenaltiesResponseDto> getPenalties();
  Future<void> requestWithdrawal({
    required double montant,
    required WithdrawalMethod methode,
    required String numeroDestinataire,
  });
}

class WalletRemoteDataSourceImpl implements WalletRemoteDataSource {
  final Dio _dio;

  WalletRemoteDataSourceImpl(this._dio);

  @override
  Future<WalletResponseDto> getWalletInfo() async {
    final response = await _dio.get(ApiEndpoints.walletMe);

    if (response.data is! Map<String, dynamic>) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: 'Expected Map but got ${response.data.runtimeType}',
      );
    }

    return WalletResponseDto.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<PenaltiesResponseDto> getPenalties() async {
    final response = await _dio.get(ApiEndpoints.walletPenalties);

    if (response.data is! Map<String, dynamic>) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: 'Expected Map but got ${response.data.runtimeType}',
      );
    }

    return PenaltiesResponseDto.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<void> requestWithdrawal({
    required double montant,
    required WithdrawalMethod methode,
    required String numeroDestinataire,
  }) async {
    await _dio.post(
      ApiEndpoints.withdraw,
      data: {
        'montant': montant,
        'methode': methode.apiValue,
        'numeroDestinataire': numeroDestinataire,
      },
    );
  }
}
