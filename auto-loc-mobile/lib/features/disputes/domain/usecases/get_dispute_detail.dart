import '../../../../core/utils/result.dart';
import '../entities/dispute.dart';
import '../repositories/dispute_repository.dart';

/// Get Dispute Detail UseCase
///
/// Récupérer le détail d'un litige (admin).
class GetDisputeDetail {
  final DisputeRepository repository;

  GetDisputeDetail(this.repository);

  Future<Result<Dispute>> call(String disputeId) {
    return repository.getDisputeDetail(disputeId);
  }
}
