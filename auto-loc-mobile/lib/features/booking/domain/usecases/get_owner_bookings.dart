import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Get Owner Bookings
///
/// Récupère les réservations en tant que propriétaire avec filtres optionnels.
///
/// Utilisation:
/// - Afficher les réservations pour les véhicules du propriétaire
/// - Filtrer par statut (EN_COURS, TERMINEE, etc.)
/// - Pagination pour les listes longues
class GetOwnerBookings {
  final BookingRepository _repository;

  GetOwnerBookings(this._repository);

  Future<Result<List<Booking>>> call([GetOwnerBookingsParams? params]) {
    return _repository.getOwnerBookings(
      page: params?.page,
      limit: params?.limit,
      statut: params?.statut,
    );
  }
}

/// Paramètres pour GetOwnerBookings
class GetOwnerBookingsParams {
  final int? page;
  final int? limit;
  final String? statut;

  const GetOwnerBookingsParams({
    this.page,
    this.limit,
    this.statut,
  });
}
