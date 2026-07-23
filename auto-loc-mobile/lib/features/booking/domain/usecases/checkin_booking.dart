import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Checkin Booking
///
/// Effectue le check-in d'une réservation (locataire ou propriétaire).
///
/// Règles métier:
/// - La réservation doit être CONFIRMEE
/// - Le check-in ne peut être fait qu'à partir de la date de début (avec marge)
/// - Des photos d'état des lieux doivent être fournies
/// - Les deux parties (locataire ET propriétaire) doivent faire le check-in
///
/// Workflow:
/// 1. Upload des photos d'état des lieux
/// 2. Appel API de check-in avec les URLs des photos
/// 3. Mise à jour du statut de la réservation (CONFIRMEE → EN_COURS)
/// 4. Quand les DEUX parties ont fait le check-in: le wallet du propriétaire
///    est automatiquement crédité du montant net (côté backend)
class CheckinBooking {
  final BookingRepository _repository;

  CheckinBooking(this._repository);

  Future<Result<Booking>> call(CheckinBookingParams params) async {
    // Validation: au moins une photo requise
    if (params.photoUrls.isEmpty) {
      return failure(
        const ValidationFailure(
          'Vous devez prendre au moins une photo de l\'état du véhicule',
        ),
      );
    }

    // Validation: maximum 10 photos
    if (params.photoUrls.length > 10) {
      return failure(
        const ValidationFailure(
          'Vous ne pouvez pas ajouter plus de 10 photos',
        ),
      );
    }

    return _repository.checkin(
      bookingId: params.bookingId,
      photoUrls: params.photoUrls,
    );
  }
}

/// Paramètres pour CheckinBooking
class CheckinBookingParams {
  final String bookingId;
  final List<String> photoUrls;

  const CheckinBookingParams({
    required this.bookingId,
    required this.photoUrls,
  });
}
