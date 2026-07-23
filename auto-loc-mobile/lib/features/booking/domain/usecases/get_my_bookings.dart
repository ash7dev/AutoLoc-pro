import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Get My Bookings
///
/// Récupère les réservations du locataire connecté avec filtres optionnels.
class GetMyBookings {
  final BookingRepository _repository;

  GetMyBookings(this._repository);

  Future<Result<List<Booking>>> call([GetMyBookingsParams? params]) {
    return _repository.getMyBookings(
      page: params?.page,
      limit: params?.limit,
      statut: params?.statut,
    );
  }
}

/// Paramètres pour GetMyBookings
class GetMyBookingsParams {
  final int? page;
  final int? limit;
  final String? statut;

  const GetMyBookingsParams({
    this.page,
    this.limit,
    this.statut,
  });
}
