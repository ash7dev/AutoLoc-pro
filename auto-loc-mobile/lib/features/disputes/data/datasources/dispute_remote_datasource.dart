import 'package:dio/dio.dart';
import '../dto/dispute_dto.dart';

/// Dispute Remote DataSource
///
/// Responsable des appels API pour les litiges.
/// Synchronisé avec les endpoints du backend NestJS.
class DisputeRemoteDataSource {
  final Dio _dio;

  DisputeRemoteDataSource(this._dio);

  /// POST /reservations/:id/dispute
  /// Créer un litige pour une réservation.
  Future<DisputeDto> createDispute({
    required String reservationId,
    required String motif,
    required String commentaire,
  }) async {
    final response = await _dio.post(
      '/reservations/$reservationId/dispute',
      data: {
        'motif': motif,
        'commentaire': commentaire,
      },
    );

    return DisputeDto.fromJson(response.data as Map<String, dynamic>);
  }

  /// GET /admin/disputes
  /// Récupérer la liste des litiges (admin).
  Future<List<DisputeDto>> getDisputes() async {
    final response = await _dio.get('/admin/disputes');

    return (response.data as List)
        .map((json) => DisputeDto.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// GET /admin/disputes/:id
  /// Récupérer le détail d'un litige (admin).
  Future<DisputeDto> getDisputeDetail(String disputeId) async {
    final response = await _dio.get('/admin/disputes/$disputeId');

    return DisputeDto.fromJson(response.data as Map<String, dynamic>);
  }

  /// PATCH /admin/disputes/:id/resolve
  /// Résoudre un litige (admin).
  Future<DisputeDto> resolveDispute({
    required String disputeId,
    required String resolution,
    String? resolutionCommentaire,
  }) async {
    final response = await _dio.patch(
      '/admin/disputes/$disputeId/resolve',
      data: {
        'resolution': resolution,
        if (resolutionCommentaire != null) 'resolutionCommentaire': resolutionCommentaire,
      },
    );

    return DisputeDto.fromJson(response.data as Map<String, dynamic>);
  }
}
