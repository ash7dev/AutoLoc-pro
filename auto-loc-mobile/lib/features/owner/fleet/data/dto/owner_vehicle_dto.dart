import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/owner_vehicle.dart';

part 'owner_vehicle_dto.freezed.dart';
part 'owner_vehicle_dto.g.dart';

/// DTO pour mapper les véhicules depuis l'API
///
/// Correspond à la réponse de l'endpoint GET /vehicles/me
@freezed
class OwnerVehicleDto with _$OwnerVehicleDto {
  const factory OwnerVehicleDto({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: 'marque') String? marque,
    @JsonKey(name: 'modele') String? modele,
    @JsonKey(name: 'annee') int? annee,
    @JsonKey(name: 'immatriculation') String? immatriculation,
    @JsonKey(name: 'couleur') String? couleur,
    @JsonKey(name: 'nombrePlaces') int? nombrePlaces,
    @JsonKey(name: 'typeCarburant') String? typeCarburant,
    @JsonKey(name: 'typeBoite') String? typeBoite,
    @JsonKey(name: 'prixParJour') double? prixParJour,
    @JsonKey(name: 'statut') String? statut,
    @JsonKey(name: 'estValide') bool? estValide,
    @JsonKey(name: 'photos') List<OwnerVehiclePhotoDto>? photos,
    @JsonKey(name: 'description') String? description,
    @JsonKey(name: 'totalReservations') int? totalReservations,
    @JsonKey(name: 'reservationsActives') int? reservationsActives,
    @JsonKey(name: 'createdAt') String? createdAt,
    @JsonKey(name: 'updatedAt') String? updatedAt,
  }) = _OwnerVehicleDto;

  const OwnerVehicleDto._();

  factory OwnerVehicleDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerVehicleDtoFromJson(json);

  /// Convertit le DTO en entité domain
  OwnerVehicle toEntity() {
    return OwnerVehicle(
      id: id ?? '',
      marque: marque ?? '',
      modele: modele ?? '',
      annee: annee ?? 0,
      immatriculation: immatriculation ?? '',
      couleur: couleur ?? '',
      nombrePlaces: nombrePlaces ?? 0,
      typeCarburant: typeCarburant ?? '',
      typeBoite: typeBoite ?? '',
      prixParJour: prixParJour ?? 0.0,
      statut: statut ?? 'DISPONIBLE',
      estValide: estValide ?? false,
      photos: photos?.map((p) => p.url ?? '').where((url) => url.isNotEmpty).toList() ?? [],
      description: description,
      totalReservations: totalReservations ?? 0,
      reservationsActives: reservationsActives ?? 0,
      createdAt: createdAt != null ? DateTime.tryParse(createdAt!) : null,
      updatedAt: updatedAt != null ? DateTime.tryParse(updatedAt!) : null,
    );
  }
}

/// DTO pour les photos de véhicule
@freezed
class OwnerVehiclePhotoDto with _$OwnerVehiclePhotoDto {
  const factory OwnerVehiclePhotoDto({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: 'url') String? url,
    @JsonKey(name: 'ordre') int? ordre,
    @JsonKey(name: 'estPrincipale') bool? estPrincipale,
  }) = _OwnerVehiclePhotoDto;

  factory OwnerVehiclePhotoDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerVehiclePhotoDtoFromJson(json);
}
