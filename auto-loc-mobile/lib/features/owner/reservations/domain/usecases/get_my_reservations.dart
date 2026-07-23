import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../entities/owner_reservation.dart';
import '../repositories/owner_reservations_repository.dart';

/// UseCase pour récupérer les réservations du propriétaire
class GetMyReservations {
  final OwnerReservationsRepository repository;

  const GetMyReservations(this.repository);

  Future<Either<Failure, List<OwnerReservation>>> call({
    String? vehiculeId,
    int? page,
    int? limit,
  }) {
    return repository.getMyReservations(
      vehiculeId: vehiculeId,
      page: page,
      limit: limit,
    );
  }
}
