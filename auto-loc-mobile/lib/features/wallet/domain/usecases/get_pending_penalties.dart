import '../../../../core/utils/result.dart';
import '../entities/wallet.dart';
import '../repositories/wallet_repository.dart';

class GetPendingPenalties {
  final WalletRepository _repository;
  GetPendingPenalties(this._repository);
  Future<Result<List<Penalty>>> call() => _repository.getPendingPenalties();
}
