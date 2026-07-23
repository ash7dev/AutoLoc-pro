import '../../../../core/utils/result.dart';
import '../../../../shared/enums/dispute_resolution.dart';
import '../entities/dispute.dart';
import '../repositories/dispute_repository.dart';

/// Resolve Dispute UseCase
///
/// Résoudre un litige (admin).
class ResolveDispute {
  final DisputeRepository repository;

  ResolveDispute(this.repository);

  Future<Result<Dispute>> call(ResolveDisputeParams params) {
    return repository.resolveDispute(
      disputeId: params.disputeId,
      resolution: params.resolution,
      resolutionCommentaire: params.resolutionCommentaire,
    );
  }
}

/// Paramètres pour la résolution d'un litige
class ResolveDisputeParams {
  final String disputeId;
  final DisputeResolution resolution;
  final String? resolutionCommentaire;

  ResolveDisputeParams({
    required this.disputeId,
    required this.resolution,
    this.resolutionCommentaire,
  });
}
