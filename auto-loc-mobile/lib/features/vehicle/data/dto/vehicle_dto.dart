import 'package:freezed_annotation/freezed_annotation.dart';

part 'vehicle_dto.freezed.dart';
part 'vehicle_dto.g.dart';

/// Vehicle DTO - Data Transfer Object
///
/// Représente la structure JSON retournée par l'API backend.
/// Synchronisé avec le model Prisma Vehicule + les endpoints NestJS.
/// Utilise json_serializable pour la sérialisation automatique.
@freezed
class VehicleDto with _$VehicleDto {
  const factory VehicleDto({
    required String id,
    String? proprietaireId, // Optionnel pour feed mobile
    VehicleOwnerDto? proprietaire, // Optionnel - infos publiques du propriétaire
    required String marque,
    required String modele,
    required int annee,
    required String type,
    String? carburant,
    String? transmission,
    int? nombrePlaces,
    String? immatriculation, // Optionnel pour feed mobile
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double prixParJour,
    required String ville,
    String? adresse, // Optionnel pour feed mobile
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimalNullable) double? latitude,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimalNullable) double? longitude,
    @Default(1) int joursMinimum,
    @Default(18) int ageMinimum,
    required String statut,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal) @Default(0.0) double note,
    @Default(0) int totalAvis,
    @Default(0) int totalLocations,
    DateTime? creeLe, // Optionnel pour feed mobile
    DateTime? misAJourLe, // Optionnel pour feed mobile
    String? assurance,
    String? reglesSpecifiques,
    String? zoneConduite,
    String? assuranceDocUrl,
    String? assuranceDocPublicId,
    String? carteGriseUrl,
    String? carteGrisePublicId,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimalNullable) double? fraisLivraison,
    @Default(false) bool autoriseHorsDakar,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimalNullable)
    double? supplementHorsDakarParJour,
    String? carburantCondition,
    DateTime? archiveLe,
    @Default(false) bool isFeatured,
    DateTime? featuredUntil,
    @Default([]) List<PhotoVehiculeDto> photos,
    String? photoUrl, // Pour le feed mobile qui retourne une URL directe
    @JsonKey(fromJson: _parseEquipementList)
    @Default([]) List<EquipementDto> equipements,
    @JsonKey(name: 'tarifsProgressifs') @Default([]) List<TarifDureeDto> tarifs,
  }) = _VehicleDto;

  factory VehicleDto.fromJson(Map<String, dynamic> json) =>
      _$VehicleDtoFromJson(json);
}

/// Photo DTO
@freezed
class PhotoVehiculeDto with _$PhotoVehiculeDto {
  const factory PhotoVehiculeDto({
    required String id,
    required String url,
    @Default(0) int position,
    @Default(false) bool estPrincipale,
    String? publicId,
  }) = _PhotoVehiculeDto;

  factory PhotoVehiculeDto.fromJson(Map<String, dynamic> json) =>
      _$PhotoVehiculeDtoFromJson(json);
}

/// Équipement DTO
@freezed
class EquipementDto with _$EquipementDto {
  const factory EquipementDto({
    required String id,
    required String nom,
  }) = _EquipementDto;

  factory EquipementDto.fromJson(Map<String, dynamic> json) =>
      _$EquipementDtoFromJson(json);
}

/// Tarif par durée DTO
@freezed
class TarifDureeDto with _$TarifDureeDto {
  const factory TarifDureeDto({
    required String id,
    required int joursMin,
    int? joursMax,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal) required double prix,
    @Default(0) int position,
  }) = _TarifDureeDto;

  factory TarifDureeDto.fromJson(Map<String, dynamic> json) =>
      _$TarifDureeDtoFromJson(json);
}

/// Vehicle Owner DTO - Informations publiques du propriétaire
@freezed
class VehicleOwnerDto with _$VehicleOwnerDto {
  const factory VehicleOwnerDto({
    String? prenom,
    String? nom,
    String? avatarUrl,
  }) = _VehicleOwnerDto;

  factory VehicleOwnerDto.fromJson(Map<String, dynamic> json) =>
      _$VehicleOwnerDtoFromJson(json);
}

// =============================================================================
// HELPERS pour Prisma Decimal → Dart double
// =============================================================================

/// Convertit un Decimal Prisma (peut être String ou num) en double
double _decimalToDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}

/// Convertit un double en String pour Prisma Decimal
String _doubleToDecimal(double value) {
  return value.toStringAsFixed(2);
}

/// Convertit un double nullable en String nullable pour Prisma Decimal
String? _doubleToDecimalNullable(double? value) {
  if (value == null) return null;
  return value.toStringAsFixed(2);
}

/// Parse la liste des équipements de manière résiliente aux objets imbriqués
List<EquipementDto> _parseEquipementList(dynamic json) {
  if (json == null) return [];
  if (json is! List) return [];
  return json.map((item) {
    if (item is Map<String, dynamic>) {
      final data = item.containsKey('equipement') && item['equipement'] is Map<String, dynamic>
          ? item['equipement'] as Map<String, dynamic>
          : item;
      return EquipementDto.fromJson(data);
    }
    throw FormatException('Invalid equipement item: $item');
  }).toList();
}
