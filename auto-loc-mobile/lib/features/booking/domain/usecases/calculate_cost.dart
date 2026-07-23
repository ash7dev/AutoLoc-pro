import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Calculate Cost
///
/// Calcule le coût total d'une réservation avant la création.
///
/// Utilisation:
/// - Afficher l'estimé du prix avant confirmation
/// - Montrer le détail des coûts (base, frais, commission, etc.)
/// - Calculer les suppléments (livraison, hors Dakar, etc.)
///
/// Retourne un Map avec:
/// - prixParJour: Prix journalier du véhicule
/// - nombreJours: Nombre de jours de location
/// - totalBase: Prix de base (prixParJour × nombreJours)
/// - fraisLivraison: Frais de livraison (optionnel)
/// - supplementHorsDakar: Supplément hors Dakar (optionnel)
/// - montantCommission: Commission AutoLoc
/// - totalLocataire: Montant total à payer
/// - netProprietaire: Montant que recevra le propriétaire
class CalculateCost {
  final BookingRepository _repository;

  CalculateCost(this._repository);

  Future<Result<Map<String, dynamic>>> call(CalculateCostParams params) async {
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

    return _repository.calculateCost(
      vehiculeId: params.vehiculeId,
      dateDebut: params.dateDebut,
      dateFin: params.dateFin,
      horsDakar: params.horsDakar,
      avecLivraison: params.avecLivraison,
    );
  }
}

/// Paramètres pour CalculateCost
class CalculateCostParams {
  final String vehiculeId;
  final DateTime dateDebut;
  final DateTime dateFin;
  final bool? horsDakar;
  final bool? avecLivraison;

  const CalculateCostParams({
    required this.vehiculeId,
    required this.dateDebut,
    required this.dateFin,
    this.horsDakar,
    this.avecLivraison,
  });
}
