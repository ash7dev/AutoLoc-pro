import 'package:dio/dio.dart';
import '../dto/review_dto.dart';

/// Review Remote DataSource
///
/// Responsable des appels API pour les avis.
/// Synchronisé avec les endpoints du backend NestJS.
class ReviewRemoteDataSource {
  final Dio _dio;

  ReviewRemoteDataSource(this._dio);

  /// POST /reviews
  /// Créer un avis après checkout (réservation TERMINEE)
  Future<ReviewDto> createReview({
    required String reservationId,
    required int note,
    String? commentaire,
  }) async {
    final response = await _dio.post(
      '/reviews',
      data: {
        'reservationId': reservationId,
        'note': note,
        if (commentaire != null) 'commentaire': commentaire,
      },
    );

    return ReviewDto.fromJson(response.data as Map<String, dynamic>);
  }

  /// GET /reviews/user/:id
  /// Récupérer les avis reçus par un utilisateur (public)
  Future<List<ReviewDto>> getUserReviews(String userId) async {
    final response = await _dio.get('/reviews/user/$userId');

    return (response.data as List)
        .map((json) => ReviewDto.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
