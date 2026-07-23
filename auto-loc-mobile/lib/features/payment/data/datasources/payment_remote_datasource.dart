import 'package:dio/dio.dart';
import '../dto/payment_dto.dart';

/// Payment Remote DataSource
///
/// Responsable des appels API pour les paiements.
/// Synchronisé avec les endpoints du backend NestJS.
class PaymentRemoteDataSource {
  final Dio _dio;

  PaymentRemoteDataSource(this._dio);

  /// POST /reservations
  /// Initier un paiement lors de la création de réservation.
  /// Cette méthode est appelée par le repository pour initier le paiement.
  Future<PaymentInitiationDto> initiatePayment({
    required String reservationId,
    required String provider,
    required double montant,
    String? payerPhone,
  }) async {
    final response = await _dio.post(
      '/reservations',
      data: {
        'reservationId': reservationId,
        'fournisseur': provider,
        'payerPhone': payerPhone,
      },
    );

    return PaymentInitiationDto.fromJson(response.data as Map<String, dynamic>);
  }

  /// GET /reservations/:id
  /// Récupérer les détails d'une réservation pour vérifier le statut de paiement.
  Future<PaymentInitiationDto> checkPaymentStatus(String reservationId) async {
    final response = await _dio.get('/reservations/$reservationId');

    return PaymentInitiationDto.fromJson(response.data as Map<String, dynamic>);
  }
}
