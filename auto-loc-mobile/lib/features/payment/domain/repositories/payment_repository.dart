import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/payment_status.dart';
import '../entities/payment_initiation.dart';

/// Payment Repository Interface
///
/// Contract pour les opérations de paiement.
/// Synchronisé avec les endpoints du backend:
/// - POST /reservations (initiation de paiement lors de la création de réservation)
/// - Webhooks gérés par le backend (Wave, Orange Money)
abstract class PaymentRepository {
  /// Initier un paiement pour une réservation
  ///
  /// Cette méthode est appelée lors de la création de réservation.
  /// Le backend initie le paiement avec le provider choisi (Wave ou Orange Money).
  ///
  /// Retourne:
  /// - Success: PaymentInitiation avec les détails du paiement
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<PaymentInitiation>> initiatePayment({
    required String reservationId,
    required PaymentProvider provider,
    required double montant,
    String? payerPhone,
  });

  /// Vérifier le statut d'un paiement
  ///
  /// Permet de vérifier si un paiement a été confirmé.
  /// Utilisé pour le polling ou la vérification manuelle.
  ///
  /// Retourne:
  /// - Success: PaymentStatus actuel
  /// - Failure: NetworkFailure, NotFoundFailure, etc.
  Future<Result<PaymentStatus>> checkPaymentStatus(String reservationId);
}
