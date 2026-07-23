import '../../../../core/utils/result.dart';
import '../entities/wallet.dart';
import '../repositories/wallet_repository.dart';

class GetTransactionHistory {
  final WalletRepository _repository;
  GetTransactionHistory(this._repository);
  
  Future<Result<List<WalletTransaction>>> call([GetTransactionHistoryParams? params]) {
    return _repository.getTransactionHistory(
      page: params?.page,
      limit: params?.limit,
    );
  }
}

class GetTransactionHistoryParams {
  final int? page;
  final int? limit;
  const GetTransactionHistoryParams({this.page, this.limit});
}
