import 'package:freezed_annotation/freezed_annotation.dart';

part 'dispute_dto.freezed.dart';
part 'dispute_dto.g.dart';

/// Dispute DTO - Data Transfer Object
///
/// Représente la structure JSON retournée par l'API backend.
/// Utilise json_serializable pour la sérialisation automatique.
@freezed
class DisputeDto with _$DisputeDto {
  const factory DisputeDto({
    required String id,
    @JsonKey(name: 'reservationId') required String reservationId,
    @JsonKey(name: 'auteurId') required String auteurId,
    required String motif,
    required String commentaire,
    required String statut,
    String? resolution,
    @JsonKey(name: 'resolutionCommentaire') String? resolutionCommentaire,
    @JsonKey(name: 'arbitreId') String? arbitreId,
    @JsonKey(name: 'creeLe') required DateTime creeLe,
    @JsonKey(name: 'resoluLe') DateTime? resoluLe,
  }) = _DisputeDto;

  factory DisputeDto.fromJson(Map<String, dynamic> json) =>
      _$DisputeDtoFromJson(json);
}
