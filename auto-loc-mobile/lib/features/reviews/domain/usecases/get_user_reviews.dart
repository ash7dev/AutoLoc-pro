import '../../../../core/utils/result.dart';
import '../entities/review.dart';
import '../repositories/review_repository.dart';

/// Get User Reviews UseCase
///
/// Récupérer les avis reçus par un utilisateur (public).
/// Endpoint: GET /reviews/user/:id
class GetUserReviews {
  final ReviewRepository repository;

  GetUserReviews(this.repository);

  Future<Result<List<Review>>> call(String userId) {
    return repository.getUserReviews(userId);
  }
}
