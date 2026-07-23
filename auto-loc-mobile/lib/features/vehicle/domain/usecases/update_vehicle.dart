import '../../../../core/utils/result.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Update Vehicle UseCase
///
/// Modifie un véhicule (PROPRIETAIRE).
class UpdateVehicle {
  final VehicleRepository repository;

  UpdateVehicle(this.repository);

  Future<Result<Vehicle>> call({
    required String vehicleId,
    String? marque,
    String? modele,
    int? annee,
    String? type,
    String? carburant,
    String? transmission,
    int? nombrePlaces,
    String? immatriculation,
    double? prixParJour,
    String? ville,
    String? adresse,
    double? latitude,
    double? longitude,
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
  }) {
    return repository.updateVehicle(
      vehicleId: vehicleId,
      marque: marque,
      modele: modele,
      annee: annee,
      type: type,
      carburant: carburant,
      transmission: transmission,
      nombrePlaces: nombrePlaces,
      immatriculation: immatriculation,
      prixParJour: prixParJour,
      ville: ville,
      adresse: adresse,
      latitude: latitude,
      longitude: longitude,
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
    );
  }
}
