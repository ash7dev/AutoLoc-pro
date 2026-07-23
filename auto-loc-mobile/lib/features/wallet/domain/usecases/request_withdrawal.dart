import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../../../shared/enums/withdrawal_method.dart';
import '../entities/wallet.dart';
import '../repositories/wallet_repository.dart';

class RequestWithdrawal {
  final WalletRepository _repository;
  RequestWithdrawal(this._repository);
  
  Future<Result<Withdrawal>> call(RequestWithdrawalParams params) {
    if (params.montant < 5000) {
      return Future.value(failure(const ValidationFailure('Montant minimum: 5000 FCFA')));
    }
    return _repository.requestWithdrawal(
      montant: params.montant,
      methode: params.methode,
      numeroDestinataire: params.numeroDestinataire,
    );
  }
}

class RequestWithdrawalParams {
  final double montant;
  final WithdrawalMethod methode;
  final String numeroDestinataire;
  const RequestWithdrawalParams({
    required this.montant,
    required this.methode,
    required this.numeroDestinataire,
  });
}
