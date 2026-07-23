import '../../../../core/utils/result.dart';
import '../../../../shared/enums/payment_provider.dart';
import '../entities/payment_initiation.dart';
import '../repositories/payment_repository.dart';

/// Initiate Payment UseCase
///
/// Initier un paiement pour une réservation avec Wave ou Orange Money.
class InitiatePayment {
  final PaymentRepository repository;

  InitiatePayment(this.repository);

  Future<Result<PaymentInitiation>> call(InitiatePaymentParams params) {
    return repository.initiatePayment(
      reservationId: params.reservationId,
      provider: params.provider,
      montant: params.montant,
      payerPhone: params.payerPhone,
    );
  }
}

/// Paramètres pour l'initiation de paiement
class InitiatePaymentParams {
  final String reservationId;
  final PaymentProvider provider;
  final double montant;
  final String? payerPhone;

  InitiatePaymentParams({
    required this.reservationId,
    required this.provider,
    required this.montant,
    this.payerPhone,
  });
}
