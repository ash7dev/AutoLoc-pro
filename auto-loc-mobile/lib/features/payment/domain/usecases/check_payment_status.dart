import '../../../../core/utils/result.dart';
import '../../../../shared/enums/payment_status.dart';
import '../repositories/payment_repository.dart';

/// Check Payment Status UseCase
///
/// Vérifier le statut d'un paiement pour une réservation.
class CheckPaymentStatus {
  final PaymentRepository repository;

  CheckPaymentStatus(this.repository);

  Future<Result<PaymentStatus>> call(String reservationId) {
    return repository.checkPaymentStatus(reservationId);
  }
}
