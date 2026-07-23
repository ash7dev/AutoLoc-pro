import '../../../../shared/enums/vehicle_type.dart';
import '../../../../shared/enums/vehicle_status.dart';
import '../../../../shared/enums/fuel_type.dart';
import '../../../../shared/enums/transmission.dart';
import '../../domain/entities/vehicle.dart';
import '../dto/vehicle_dto.dart';

/// Vehicle Mapper
///
/// Convertit entre DTO (couche data) et Entity (couche domain).
/// Gère la conversion des enums String ↔ Enum.
/// Applique les règles métier lors de la conversion.
class VehicleMapper {
  /// Convertit VehicleDto → Vehicle Entity
  static Vehicle toEntity(VehicleDto dto) {
    // Gérer photoUrl du feed mobile (convertir en liste de photos)
    final photos = dto.photoUrl != null
        ? [PhotoVehicule(id: 'temp', url: dto.photoUrl!, estPrincipale: true)]
        : dto.photos.map(_mapPhoto).toList();

    return Vehicle(
      id: dto.id,
      proprietaireId: dto.proprietaireId ?? 'unknown',
      proprietaire: dto.proprietaire != null ? _mapOwner(dto.proprietaire!) : null,
      marque: dto.marque,
      modele: dto.modele,
      annee: dto.annee,
      type: _mapVehicleType(dto.type),
      carburant: dto.carburant != null ? _mapFuelType(dto.carburant!) : null,
      transmission:
          dto.transmission != null ? _mapTransmission(dto.transmission!) : null,
      nombrePlaces: dto.nombrePlaces,
      immatriculation: dto.immatriculation ?? 'UNKNOWN',
      prixParJour: dto.prixParJour,
      ville: dto.ville,
      adresse: dto.adresse ?? 'Adresse inconnue',
      latitude: dto.latitude,
      longitude: dto.longitude,
      joursMinimum: dto.joursMinimum,
      ageMinimum: dto.ageMinimum,
      statut: _mapVehicleStatus(dto.statut),
      note: dto.note,
      totalAvis: dto.totalAvis,
      totalLocations: dto.totalLocations,
      creeLe: dto.creeLe ?? DateTime.now(),
      misAJourLe: dto.misAJourLe ?? DateTime.now(),
      assurance: dto.assurance,
      reglesSpecifiques: dto.reglesSpecifiques,
      zoneConduite: dto.zoneConduite,
      assuranceDocUrl: dto.assuranceDocUrl,
      assuranceDocPublicId: dto.assuranceDocPublicId,
      carteGriseUrl: dto.carteGriseUrl,
      carteGrisePublicId: dto.carteGrisePublicId,
      fraisLivraison: dto.fraisLivraison,
      autoriseHorsDakar: dto.autoriseHorsDakar,
      supplementHorsDakarParJour: dto.supplementHorsDakarParJour,
      carburantCondition: dto.carburantCondition,
      archiveLe: dto.archiveLe,
      isFeatured: dto.isFeatured,
      featuredUntil: dto.featuredUntil,
      photos: photos,
      equipements: dto.equipements.map((e) => e.nom).toList(),
      tarifs: dto.tarifs.map(_mapTarif).toList(),
    );
  }

  /// Convertit Vehicle Entity → VehicleDto
  static VehicleDto toDto(Vehicle entity) {
    return VehicleDto(
      id: entity.id,
      proprietaireId: entity.proprietaireId,
      marque: entity.marque,
      modele: entity.modele,
      annee: entity.annee,
      type: entity.type.toPrismaString(),
      carburant: entity.carburant?.toPrismaString(),
      transmission: entity.transmission?.toPrismaString(),
      nombrePlaces: entity.nombrePlaces,
      immatriculation: entity.immatriculation,
      prixParJour: entity.prixParJour,
      ville: entity.ville,
      adresse: entity.adresse,
      latitude: entity.latitude,
      longitude: entity.longitude,
      joursMinimum: entity.joursMinimum,
      ageMinimum: entity.ageMinimum,
      statut: entity.statut.toPrismaString(),
      note: entity.note,
      totalAvis: entity.totalAvis,
      totalLocations: entity.totalLocations,
      creeLe: entity.creeLe,
      misAJourLe: entity.misAJourLe,
      assurance: entity.assurance,
      reglesSpecifiques: entity.reglesSpecifiques,
      zoneConduite: entity.zoneConduite,
      assuranceDocUrl: entity.assuranceDocUrl,
      assuranceDocPublicId: entity.assuranceDocPublicId,
      carteGriseUrl: entity.carteGriseUrl,
      carteGrisePublicId: entity.carteGrisePublicId,
      fraisLivraison: entity.fraisLivraison,
      autoriseHorsDakar: entity.autoriseHorsDakar,
      supplementHorsDakarParJour: entity.supplementHorsDakarParJour,
      carburantCondition: entity.carburantCondition,
      archiveLe: entity.archiveLe,
      isFeatured: entity.isFeatured,
      featuredUntil: entity.featuredUntil,
      photos: entity.photos.map(_mapPhotoToDto).toList(),
      equipements: entity.equipements.map((nom) => EquipementDto(id: '', nom: nom)).toList(),
      tarifs: entity.tarifs.map(_mapTarifToDto).toList(),
    );
  }

  // ===========================================================================
  // MAPPERS PRIVÉS - Enums
  // ===========================================================================

  static VehicleType _mapVehicleType(String value) {
    return VehicleType.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => VehicleType.berline,
    );
  }

  static VehicleStatus _mapVehicleStatus(String value) {
    return VehicleStatus.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => VehicleStatus.pendingValidation,
    );
  }

  static FuelType _mapFuelType(String value) {
    return FuelType.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => FuelType.essence,
    );
  }

  static Transmission _mapTransmission(String value) {
    return Transmission.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => Transmission.manuelle,
    );
  }

  // ===========================================================================
  // MAPPERS PRIVÉS - Nested Objects
  // ===========================================================================

  static VehicleOwner _mapOwner(VehicleOwnerDto dto) {
    return VehicleOwner(
      prenom: dto.prenom,
      nom: dto.nom,
      avatarUrl: dto.avatarUrl,
    );
  }

  static PhotoVehicule _mapPhoto(PhotoVehiculeDto dto) {
    return PhotoVehicule(
      id: dto.id,
      url: dto.url,
      position: dto.position,
      estPrincipale: dto.estPrincipale,
      publicId: dto.publicId,
    );
  }

  static PhotoVehiculeDto _mapPhotoToDto(PhotoVehicule entity) {
    return PhotoVehiculeDto(
      id: entity.id,
      url: entity.url,
      position: entity.position,
      estPrincipale: entity.estPrincipale,
      publicId: entity.publicId,
    );
  }

  static TarifDuree _mapTarif(TarifDureeDto dto) {
    return TarifDuree(
      id: dto.id,
      joursMin: dto.joursMin,
      joursMax: dto.joursMax,
      prix: dto.prix,
      position: dto.position,
    );
  }

  static TarifDureeDto _mapTarifToDto(TarifDuree entity) {
    return TarifDureeDto(
      id: entity.id,
      joursMin: entity.joursMin,
      joursMax: entity.joursMax,
      prix: entity.prix,
      position: entity.position,
    );
  }
}
