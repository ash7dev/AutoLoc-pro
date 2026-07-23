import '../../../../core/utils/result.dart';
import '../entities/review.dart';
import '../repositories/review_repository.dart';

/// Create Review UseCase
///
/// Créer un avis après checkout (réservation TERMINEE).
/// Endpoint: POST /reviews
class CreateReview {
  final ReviewRepository repository;

  CreateReview(this.repository);

  Future<Result<Review>> call(CreateReviewParams params) {
    return repository.createReview(
      reservationId: params.reservationId,
      note: params.note,
      commentaire: params.commentaire,
    );
  }
}

/// Paramètres pour la création d'un avis
class CreateReviewParams {
  final String reservationId;
  final int note;
  final String? commentaire;

  CreateReviewParams({
    required this.reservationId,
    required this.note,
    this.commentaire,
  });
}
