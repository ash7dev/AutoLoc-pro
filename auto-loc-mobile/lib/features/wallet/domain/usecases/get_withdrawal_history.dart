import '../../../../core/utils/result.dart';
import '../entities/wallet.dart';
import '../repositories/wallet_repository.dart';

class GetWithdrawalHistory {
  final WalletRepository _repository;
  GetWithdrawalHistory(this._repository);
  
  Future<Result<List<Withdrawal>>> call([GetWithdrawalHistoryParams? params]) {
    return _repository.getWithdrawalHistory(
      page: params?.page,
      limit: params?.limit,
    );
  }
}

class GetWithdrawalHistoryParams {
  final int? page;
  final int? limit;
  const GetWithdrawalHistoryParams({this.page, this.limit});
}
