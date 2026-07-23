import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Check Availability
///
/// Vérifie la disponibilité d'un véhicule pour une période donnée.
///
/// Utilisation:
/// - Avant de créer une réservation
/// - Lors de la sélection des dates dans le calendrier
/// - Pour afficher les créneaux disponibles
///
/// Règles métier:
/// - Date de début dans le futur
/// - Date de fin après date de début
/// - Durée minimale respectée (selon le véhicule)
/// - Pas de chevauchement avec d'autres réservations
class CheckAvailability {
  final BookingRepository _repository;

  CheckAvailability(this._repository);

  Future<Result<bool>> call(CheckAvailabilityParams params) async {
    final now = DateTime.now();

    // Validation: date de début dans le futur
    if (params.dateDebut.isBefore(now)) {
      return failure(
        const ValidationFailure(
          'La date de début doit être dans le futur',
        ),
      );
    }

    // Validation: date de fin après date de début
    if (params.dateFin.isBefore(params.dateDebut) ||
        params.dateFin.isAtSameMomentAs(params.dateDebut)) {
      return failure(
        const ValidationFailure(
          'La date de fin doit être après la date de début',
        ),
      );
    }

    // Validation: durée minimale (au moins 1 jour)
    final duree = params.dateFin.difference(params.dateDebut);
    if (duree.inHours < 24) {
      return failure(
        const ValidationFailure(
          'La durée minimale de location est de 1 jour',
        ),
      );
    }

    return _repository.checkAvailability(
      vehiculeId: params.vehiculeId,
      dateDebut: params.dateDebut,
      dateFin: params.dateFin,
    );
  }
}

/// Paramètres pour CheckAvailability
class CheckAvailabilityParams {
  final String vehiculeId;
  final DateTime dateDebut;
  final DateTime dateFin;

  const CheckAvailabilityParams({
    required this.vehiculeId,
    required this.dateDebut,
    required this.dateFin,
  });
}
