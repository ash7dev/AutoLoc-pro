import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/penalty.dart';

part 'penalty_dto.freezed.dart';
part 'penalty_dto.g.dart';

/// DTO pour la réponse GET /wallet/penalites
@freezed
class PenaltiesResponseDto with _$PenaltiesResponseDto {
  const factory PenaltiesResponseDto({
    @JsonKey(name: 'penalites') required List<PenaltyDto> penalites,
    @JsonKey(name: 'totalDette') dynamic totalDette,
    @JsonKey(name: 'count') int? count,
  }) = _PenaltiesResponseDto;

  factory PenaltiesResponseDto.fromJson(Map<String, dynamic> json) =>
      _$PenaltiesResponseDtoFromJson(json);
}

/// DTO pour une pénalité
@freezed
class PenaltyDto with _$PenaltyDto {
  const factory PenaltyDto({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: 'montant') dynamic montant,
    @JsonKey(name: 'raison') String? raison,
    @JsonKey(name: 'creeLe') String? creeLe,
    @JsonKey(name: 'reservationId') String? reservationId,
    @JsonKey(name: 'vehicule') String? vehicule,
    @JsonKey(name: 'dateLocation') String? dateLocation,
  }) = _PenaltyDto;

  const PenaltyDto._();

  factory PenaltyDto.fromJson(Map<String, dynamic> json) =>
      _$PenaltyDtoFromJson(json);

  /// Conversion vers l'entité Domain
  Penalty toEntity() {
    return Penalty(
      id: id ?? '',
      montant: _parseDecimal(montant),
      raison: raison ?? 'Pénalité',
      creeLe: creeLe != null ? DateTime.parse(creeLe!) : DateTime.now(),
      reservationId: reservationId,
      vehicule: vehicule,
      dateLocation:
          dateLocation != null ? DateTime.parse(dateLocation!) : null,
    );
  }

  double _parseDecimal(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}
