import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// Confirm Booking UseCase
///
/// Confirme une réservation (PAYEE → CONFIRMEE).
class ConfirmBooking {
  final BookingRepository repository;

  ConfirmBooking(this.repository);

  Future<Result<Booking>> call({
    required String bookingId,
    required String heureDebut,
  }) {
    return repository.confirm(bookingId: bookingId, heureDebut: heureDebut);
  }
}
