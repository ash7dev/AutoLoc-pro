import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Get Booking Details
///
/// Récupère les détails complets d'une réservation par son ID.
///
/// Utilisation:
/// - Afficher la page de détails d'une réservation
/// - Charger les informations complètes (paiement, photos, etc.)
///
/// Retourne:
/// - Success: Réservation avec toutes les relations chargées
/// - Failure: NotFoundFailure si réservation inexistante
class GetBookingDetails {
  final BookingRepository _repository;

  GetBookingDetails(this._repository);

  Future<Result<Booking>> call(String bookingId) {
    // TODO: Ajouter analytics tracking
    return _repository.getBookingById(bookingId);
  }
}
