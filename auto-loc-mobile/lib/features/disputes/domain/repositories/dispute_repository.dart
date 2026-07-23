import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../../../shared/enums/dispute_resolution.dart';
import '../entities/dispute.dart';

/// Dispute Repository Interface
///
/// Contract pour les opérations sur les litiges.
/// Synchronisé avec les endpoints du backend:
/// - POST /reservations/:id/dispute (créer un litige)
/// - GET /admin/disputes (liste admin)
/// - GET /admin/disputes/:id (détail admin)
/// - PATCH /admin/disputes/:id/resolve (résoudre un litige)
abstract class DisputeRepository {
  /// Créer un litige
  ///
  /// Endpoint: POST /reservations/:id/dispute
  ///
  /// Retourne:
  /// - Success: Dispute créé
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<Dispute>> createDispute({
    required String reservationId,
    required String motif,
    required String commentaire,
  });

  /// Récupérer les litiges (admin)
  ///
  /// Endpoint: GET /admin/disputes
  ///
  /// Retourne:
  /// - Success: Liste des litiges
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<List<Dispute>>> getDisputes();

  /// Récupérer le détail d'un litige (admin)
  ///
  /// Endpoint: GET /admin/disputes/:id
  ///
  /// Retourne:
  /// - Success: Dispute détaillé
  /// - Failure: NetworkFailure, NotFoundFailure, etc.
  Future<Result<Dispute>> getDisputeDetail(String disputeId);

  /// Résoudre un litige (admin)
  ///
  /// Endpoint: PATCH /admin/disputes/:id/resolve
  ///
  /// Retourne:
  /// - Success: Dispute résolu
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<Dispute>> resolveDispute({
    required String disputeId,
    required DisputeResolution resolution,
    String? resolutionCommentaire,
  });
}
