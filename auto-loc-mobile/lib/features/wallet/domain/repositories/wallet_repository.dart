import '../../../../core/utils/result.dart';
import '../../../../shared/enums/withdrawal_method.dart';
import '../entities/wallet.dart';

/// Wallet Repository Interface (Domain)
///
/// Définit le contrat pour accéder aux données du wallet.
/// Ne connaît RIEN de l'implémentation (Dio, API, cache, etc.).
/// L'implémentation se trouve dans la couche data.
///
/// Synchronisé avec: WalletController (wallet.controller.ts)
abstract class WalletRepository {
  /// Récupère le wallet du propriétaire connecté
  ///
  /// Endpoint: GET /wallet/me
  /// Retourne:
  /// - Success: Wallet avec balance détaillée + 10 dernières transactions
  /// - Failure: UnauthorizedFailure, NetworkFailure, etc.
  Future<Result<Wallet>> getWallet();

  /// Récupère les pénalités en attente du propriétaire
  ///
  /// Endpoint: GET /wallet/penalites
  /// Retourne:
  /// - Success: Liste des pénalités non prélevées
  /// - Failure: UnauthorizedFailure, NetworkFailure, etc.
  Future<Result<List<Penalty>>> getPendingPenalties();

  /// Demande un retrait du wallet
  ///
  /// Endpoint: POST /wallet/withdraw
  /// Le montant est immédiatement débité du wallet et la demande
  /// passe en statut EN_ATTENTE pour validation admin.
  ///
  /// Règles métier (backend wallet.service.ts requestWithdrawal):
  /// - Montant minimum: 5000 FCFA
  /// - Solde retirable suffisant (après pénalités)
  /// - Le wallet est immédiatement débité
  /// - Un admin doit ensuite approuver le retrait
  ///
  /// Retourne:
  /// - Success: Withdrawal créé avec statut EN_ATTENTE
  /// - Failure: WalletFailure si solde insuffisant, ValidationFailure, etc.
  Future<Result<Withdrawal>> requestWithdrawal({
    required double montant,
    required WithdrawalMethod methode,
    required String numeroDestinataire,
  });

  /// Récupère l'historique complet des transactions
  ///
  /// Note: GET /wallet/me retourne seulement les 10 dernières.
  /// Cette méthode permet d'avoir l'historique complet avec pagination.
  ///
  /// Retourne:
  /// - Success: Liste paginée de transactions
  /// - Failure: NetworkFailure, etc.
  Future<Result<List<WalletTransaction>>> getTransactionHistory({
    int? page,
    int? limit,
  });

  /// Récupère l'historique des retraits du propriétaire
  ///
  /// Retourne:
  /// - Success: Liste des retraits (tous statuts)
  /// - Failure: NetworkFailure, etc.
  Future<Result<List<Withdrawal>>> getWithdrawalHistory({
    int? page,
    int? limit,
  });
}
