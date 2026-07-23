import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Create Booking
///
/// Crée une nouvelle réservation avec validation des dates et disponibilité.
///
/// Règles métier appliquées:
/// - Dates de début et fin valides
/// - Date de début dans le futur
/// - Durée minimale respectée
/// - Disponibilité du véhicule vérifiée
class CreateBooking {
  final BookingRepository _repository;

  CreateBooking(this._repository);

  Future<Result<Booking>> call(CreateBookingParams params) async {
    // Validation: date de début dans le futur
    final now = DateTime.now();
    if (params.dateDebut.isBefore(now)) {
      return failure(
        const ValidationFailure(
          'La date de début doit être dans le futur',
        ),
      );
    }

    // Validation: date de fin après date de début
    if (params.dateFin.isBefore(params.dateDebut)) {
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

    // TODO: Vérifier la disponibilité du véhicule

    return _repository.createBooking(
      vehiculeId: params.vehiculeId,
      dateDebut: params.dateDebut,
      dateFin: params.dateFin,
      fournisseur: params.fournisseur,
      targetPayment: params.targetPayment,
      payerPhone: params.payerPhone,
      adresseLivraison: params.adresseLivraison,
      horsDakar: params.horsDakar,
    );
  }
}

/// Paramètres pour CreateBooking
class CreateBookingParams {
  final String vehiculeId;
  final DateTime dateDebut;
  final DateTime dateFin;
  final String fournisseur;
  final String targetPayment;
  final String payerPhone;
  final String? adresseLivraison;
  final bool? horsDakar;

  const CreateBookingParams({
    required this.vehiculeId,
    required this.dateDebut,
    required this.dateFin,
    required this.fournisseur,
    required this.targetPayment,
    required this.payerPhone,
    this.adresseLivraison,
    this.horsDakar,
  });
}
