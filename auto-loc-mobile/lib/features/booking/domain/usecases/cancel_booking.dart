import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Cancel Booking
///
/// Annule une réservation avec validation des conditions d'annulation.
///
/// Règles métier:
/// - Seules les réservations EN_ATTENTE_PAIEMENT ou CONFIRMEE peuvent être annulées
/// - Une raison d'annulation doit être fournie
class CancelBooking {
  final BookingRepository _repository;

  CancelBooking(this._repository);

  Future<Result<Booking>> call(CancelBookingParams params) {
    // Validation: raison d'annulation non vide
    if (params.raison.trim().isEmpty) {
      return Future.value(
        failure(
          const ValidationFailure(
            'Veuillez indiquer une raison d\'annulation',
          ),
        ),
      );
    }

    return _repository.cancelBooking(
      bookingId: params.bookingId,
      raison: params.raison,
    );
  }
}

/// Paramètres pour CancelBooking
class CancelBookingParams {
  final String bookingId;
  final String raison;

  const CancelBookingParams({
    required this.bookingId,
    required this.raison,
  });
}
