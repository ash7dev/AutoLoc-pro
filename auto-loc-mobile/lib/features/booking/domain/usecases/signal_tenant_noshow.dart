import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// Signal Tenant Noshow UseCase
///
/// Signale que le locataire n'est pas venu (no-show).
class SignalTenantNoshow {
  final BookingRepository repository;

  SignalTenantNoshow(this.repository);

  Future<Result<Booking>> call({
    required String bookingId,
    required String commentaire,
  }) {
    return repository.signalTenantNoshow(
      bookingId: bookingId,
      commentaire: commentaire,
    );
  }
}
