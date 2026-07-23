import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../entities/withdrawal.dart';
import '../repositories/wallet_repository.dart';

/// UseCase pour demander un retrait
class RequestWithdrawal {
  final WalletRepository repository;

  const RequestWithdrawal(this.repository);

  Future<Either<Failure, void>> call(WithdrawalRequest request) {
    return repository.requestWithdrawal(request);
  }
}
