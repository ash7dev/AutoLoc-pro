import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../entities/penalty.dart';
import '../repositories/wallet_repository.dart';

/// UseCase pour récupérer les pénalités
class GetPenalties {
  final WalletRepository repository;

  const GetPenalties(this.repository);

  Future<Either<Failure, List<Penalty>>> call() {
    return repository.getPenalties();
  }
}
