import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/owner_reservation.dart';

part 'owner_reservation_dto.freezed.dart';
part 'owner_reservation_dto.g.dart';

@freezed
class OwnerReservationDto with _$OwnerReservationDto {
  const factory OwnerReservationDto({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: 'vehiculeId') String? vehiculeId,
    @JsonKey(name: 'locataireId') String? locataireId,
    @JsonKey(name: 'dateDebut') String? dateDebut,
    @JsonKey(name: 'dateFin') String? dateFin,
    @JsonKey(name: 'prixParJour') dynamic prixParJour,
    @JsonKey(name: 'totalBase') dynamic totalBase,
    @JsonKey(name: 'montantCommission') dynamic montantCommission,
    @JsonKey(name: 'netProprietaire') dynamic netProprietaire,
    @JsonKey(name: 'statut') String? statut,
    // Relations nested
    @JsonKey(name: 'vehicule') VehiculeNestedDto? vehicule,
    @JsonKey(name: 'locataire') LocataireNestedDto? locataire,
    // Dates
    @JsonKey(name: 'confirmeeLe') String? confirmeeLe,
    @JsonKey(name: 'checkinLe') String? checkinLe,
    @JsonKey(name: 'checkoutLe') String? checkoutLe,
    @JsonKey(name: 'annuleLe') String? annuleLe,
    @JsonKey(name: 'raisonAnnulation') String? raisonAnnulation,
    @JsonKey(name: 'adresseLivraison') String? adresseLivraison,
    @JsonKey(name: 'creeLe') String? creeLe,
  }) = _OwnerReservationDto;

  const OwnerReservationDto._();

  factory OwnerReservationDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerReservationDtoFromJson(json);

  /// Convertit le DTO en entité Domain
  OwnerReservation toEntity() {
    return OwnerReservation(
      id: id ?? '',
      vehiculeId: vehiculeId ?? '',
      locataireId: locataireId ?? '',
      dateDebut: dateDebut != null ? DateTime.parse(dateDebut!) : DateTime.now(),
      dateFin: dateFin != null ? DateTime.parse(dateFin!) : DateTime.now(),
      prixParJour: _parseDecimal(prixParJour),
      totalBase: _parseDecimal(totalBase),
      montantCommission: _parseDecimal(montantCommission),
      netProprietaire: _parseDecimal(netProprietaire),
      statut: statut ?? 'INCONNU',
      // Véhicule
      vehiculeMarque: vehicule?.marque,
      vehiculeModele: vehicule?.modele,
      vehiculeImmatriculation: vehicule?.immatriculation,
      vehiculePhoto: vehicule?.photos?.isNotEmpty == true ? vehicule!.photos!.first.url : null,
      // Locataire
      locataireNom: locataire?.utilisateur?.nom,
      locatairePrenom: locataire?.utilisateur?.prenom,
      locatairePhoto: locataire?.utilisateur?.avatarUrl,
      locataireTelephone: locataire?.utilisateur?.telephone,
      // Dates
      confirmeeLe: confirmeeLe != null ? DateTime.parse(confirmeeLe!) : null,
      checkinLe: checkinLe != null ? DateTime.parse(checkinLe!) : null,
      checkoutLe: checkoutLe != null ? DateTime.parse(checkoutLe!) : null,
      annuleLe: annuleLe != null ? DateTime.parse(annuleLe!) : null,
      raisonAnnulation: raisonAnnulation,
      adresseLivraison: adresseLivraison,
      creeLe: creeLe != null ? DateTime.parse(creeLe!) : null,
    );
  }

  double _parseDecimal(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}

@freezed
class VehiculeNestedDto with _$VehiculeNestedDto {
  const factory VehiculeNestedDto({
    @JsonKey(name: 'marque') String? marque,
    @JsonKey(name: 'modele') String? modele,
    @JsonKey(name: 'immatriculation') String? immatriculation,
    @JsonKey(name: 'photos') List<VehiculePhotoDto>? photos,
  }) = _VehiculeNestedDto;

  factory VehiculeNestedDto.fromJson(Map<String, dynamic> json) =>
      _$VehiculeNestedDtoFromJson(json);
}

@freezed
class VehiculePhotoDto with _$VehiculePhotoDto {
  const factory VehiculePhotoDto({
    @JsonKey(name: 'url') String? url,
  }) = _VehiculePhotoDto;

  factory VehiculePhotoDto.fromJson(Map<String, dynamic> json) =>
      _$VehiculePhotoDtoFromJson(json);
}

@freezed
class LocataireNestedDto with _$LocataireNestedDto {
  const factory LocataireNestedDto({
    @JsonKey(name: 'utilisateur') UtilisateurNestedDto? utilisateur,
  }) = _LocataireNestedDto;

  factory LocataireNestedDto.fromJson(Map<String, dynamic> json) =>
      _$LocataireNestedDtoFromJson(json);
}

@freezed
class UtilisateurNestedDto with _$UtilisateurNestedDto {
  const factory UtilisateurNestedDto({
    @JsonKey(name: 'nom') String? nom,
    @JsonKey(name: 'prenom') String? prenom,
    @JsonKey(name: 'avatarUrl') String? avatarUrl,
    @JsonKey(name: 'telephone') String? telephone,
  }) = _UtilisateurNestedDto;

  factory UtilisateurNestedDto.fromJson(Map<String, dynamic> json) =>
      _$UtilisateurNestedDtoFromJson(json);
}
