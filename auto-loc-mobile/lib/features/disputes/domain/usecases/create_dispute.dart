import '../../../../core/utils/result.dart';
import '../entities/dispute.dart';
import '../repositories/dispute_repository.dart';

/// Create Dispute UseCase
///
/// Créer un litige pour une réservation.
class CreateDispute {
  final DisputeRepository repository;

  CreateDispute(this.repository);

  Future<Result<Dispute>> call(CreateDisputeParams params) {
    return repository.createDispute(
      reservationId: params.reservationId,
      motif: params.motif,
      commentaire: params.commentaire,
    );
  }
}

/// Paramètres pour la création d'un litige
class CreateDisputeParams {
  final String reservationId;
  final String motif;
  final String commentaire;

  CreateDisputeParams({
    required this.reservationId,
    required this.motif,
    required this.commentaire,
  });
}
