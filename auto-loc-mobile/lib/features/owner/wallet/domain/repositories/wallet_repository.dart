import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../entities/penalty.dart';
import '../entities/wallet.dart';
import '../entities/withdrawal.dart';

/// Repository interface pour le Wallet
abstract class WalletRepository {
  /// Récupère les informations du wallet
  /// GET /wallet/me
  Future<Either<Failure, Wallet>> getWalletInfo();

  /// Récupère la liste des pénalités en attente
  /// GET /wallet/penalites
  Future<Either<Failure, List<Penalty>>> getPenalties();

  /// Demande un retrait
  /// POST /wallet/withdraw
  Future<Either<Failure, void>> requestWithdrawal(WithdrawalRequest request);
}
