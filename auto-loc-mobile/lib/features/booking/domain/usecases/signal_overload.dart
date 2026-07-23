import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// Signal Overload UseCase
///
/// Signale un dépassement du nombre de voyageurs.
class SignalOverload {
  final BookingRepository repository;

  SignalOverload(this.repository);

  Future<Result<Booking>> call({
    required String bookingId,
    required String motif,
    required String commentaire,
  }) {
    return repository.signalOverload(
      bookingId: bookingId,
      motif: motif,
      commentaire: commentaire,
    );
  }
}
