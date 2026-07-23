import '../../../../core/utils/result.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Create Vehicle UseCase
///
/// Crée un nouveau véhicule (PROPRIETAIRE).
class CreateVehicle {
  final VehicleRepository repository;

  CreateVehicle(this.repository);

  Future<Result<Vehicle>> call({
    required String marque,
    required String modele,
    required int annee,
    required String type,
    required String immatriculation,
    required double prixParJour,
    required String ville,
    required String adresse,
    String? carburant,
    String? transmission,
    int? nombrePlaces,
    int? joursMinimum,
    int? ageMinimum,
    String? assurance,
    String? reglesSpecifiques,
    String? zoneConduite,
    String? assuranceDocUrl,
    String? assuranceDocPublicId,
    String? carteGriseUrl,
    String? carteGrisePublicId,
    double? fraisLivraison,
    bool? autoriseHorsDakar,
    double? supplementHorsDakarParJour,
    String? carburantCondition,
    List<String>? equipements,
    List<Map<String, dynamic>>? tarifs,
    List<Map<String, dynamic>>? photos,
  }) {
    return repository.createVehicle(
      marque: marque,
      modele: modele,
      annee: annee,
      type: type,
      immatriculation: immatriculation,
      prixParJour: prixParJour,
      ville: ville,
      adresse: adresse,
      carburant: carburant,
      transmission: transmission,
      nombrePlaces: nombrePlaces,
      joursMinimum: joursMinimum,
      ageMinimum: ageMinimum,
      assurance: assurance,
      reglesSpecifiques: reglesSpecifiques,
      zoneConduite: zoneConduite,
      assuranceDocUrl: assuranceDocUrl,
      assuranceDocPublicId: assuranceDocPublicId,
      carteGriseUrl: carteGriseUrl,
      carteGrisePublicId: carteGrisePublicId,
      fraisLivraison: fraisLivraison,
      autoriseHorsDakar: autoriseHorsDakar,
      supplementHorsDakarParJour: supplementHorsDakarParJour,
      carburantCondition: carburantCondition,
      equipements: equipements,
      tarifs: tarifs,
      photos: photos,
    );
  }
}
