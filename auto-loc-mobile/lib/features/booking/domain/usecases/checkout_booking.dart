import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Checkout Booking
///
/// Effectue le check-out d'une réservation (fin de location).
///
/// Règles métier:
/// - La réservation doit être EN_COURS
/// - Le check-in doit avoir été fait par les deux parties
/// - Des photos d'état des lieux de fin doivent être fournies
/// - Le check-out termine la location et permet les avis/notes
///
/// Workflow:
/// 1. Upload des photos d'état des lieux de fin
/// 2. Appel API de check-out avec les URLs des photos
/// 3. Mise à jour du statut de la réservation à TERMINEE
/// 4. Déclenchement des jobs backend (avis, notifications, etc.)
///
/// Note: Le paiement au propriétaire a déjà été fait lors du CHECK-IN finalisé,
/// pas au checkout. Le wallet du propriétaire a été crédité quand les deux parties
/// ont confirmé le check-in.
class CheckoutBooking {
  final BookingRepository _repository;

  CheckoutBooking(this._repository);

  Future<Result<Booking>> call(CheckoutBookingParams params) async {
    // Validation: au moins une photo requise
    if (params.photoUrls.isEmpty) {
      return failure(
        const ValidationFailure(
          'Vous devez prendre au moins une photo de l\'état du véhicule à la restitution',
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

    return _repository.checkout(
      bookingId: params.bookingId,
      photoUrls: params.photoUrls,
    );
  }
}

/// Paramètres pour CheckoutBooking
class CheckoutBookingParams {
  final String bookingId;
  final List<String> photoUrls;

  const CheckoutBookingParams({
    required this.bookingId,
    required this.photoUrls,
  });
}
