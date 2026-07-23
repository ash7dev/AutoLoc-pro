import 'package:fpdart/fpdart.dart';

import '../../../../../core/errors/failures.dart';
import '../entities/owner_reservation.dart';

/// Repository interface pour les réservations du propriétaire
abstract class OwnerReservationsRepository {
  /// Récupère toutes les réservations du propriétaire
  Future<Either<Failure, List<OwnerReservation>>> getMyReservations({
    String? vehiculeId,
    int? page,
    int? limit,
  });

  /// Récupère une réservation par ID
  Future<Either<Failure, OwnerReservation>> getReservationById(String id);

  /// Confirme une réservation
  Future<Either<Failure, OwnerReservation>> confirmReservation(
    String id,
    String heureDebut,
  );

  /// Annule une réservation
  Future<Either<Failure, OwnerReservation>> cancelReservation(
    String id,
    String raison,
  );
}
