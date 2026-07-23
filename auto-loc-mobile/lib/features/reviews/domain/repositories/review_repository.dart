import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../entities/review.dart';

/// Review Repository Interface
///
/// Contract pour les opérations sur les avis.
/// Synchronisé avec les endpoints du backend:
/// - POST /reviews
/// - GET /reviews/user/:id
abstract class ReviewRepository {
  /// Créer un avis après checkout (réservation TERMINEE)
  /// Endpoint: POST /reviews
  Future<Result<Review>> createReview({
    required String reservationId,
    required int note,
    String? commentaire,
  });

  /// Récupérer les avis reçus par un utilisateur (public)
  /// Endpoint: GET /reviews/user/:id
  Future<Result<List<Review>>> getUserReviews(String userId);
}
