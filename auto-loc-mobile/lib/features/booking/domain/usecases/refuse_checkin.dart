import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// Refuse Checkin UseCase
///
/// Refuse le check-in (non-conformité véhicule).
class RefuseCheckin {
  final BookingRepository repository;

  RefuseCheckin(this.repository);

  Future<Result<Booking>> call({
    required String bookingId,
    required String motif,
    required String commentaire,
  }) {
    return repository.refuseCheckin(
      bookingId: bookingId,
      motif: motif,
      commentaire: commentaire,
    );
  }
}
