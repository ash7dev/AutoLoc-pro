import '../../../../core/utils/result.dart';
import '../entities/dispute.dart';
import '../repositories/dispute_repository.dart';

/// Get Disputes UseCase
///
/// Récupérer la liste des litiges (admin).
class GetDisputes {
  final DisputeRepository repository;

  GetDisputes(this.repository);

  Future<Result<List<Dispute>>> call() {
    return repository.getDisputes();
  }
}
