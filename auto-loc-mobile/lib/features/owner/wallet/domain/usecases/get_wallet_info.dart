import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../entities/wallet.dart';
import '../repositories/wallet_repository.dart';

/// UseCase pour récupérer les informations du wallet
class GetWalletInfo {
  final WalletRepository repository;

  const GetWalletInfo(this.repository);

  Future<Either<Failure, Wallet>> call() {
    return repository.getWalletInfo();
  }
}
