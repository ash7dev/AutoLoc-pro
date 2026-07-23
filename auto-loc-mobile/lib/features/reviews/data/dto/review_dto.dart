import 'package:freezed_annotation/freezed_annotation.dart';

part 'review_dto.freezed.dart';
part 'review_dto.g.dart';

/// Review DTO - Data Transfer Object
///
/// Représente la structure JSON retournée par l'API backend.
/// Synchronisé avec le model Prisma Avis + les endpoints NestJS.
/// Utilise json_serializable pour la sérialisation automatique.
@freezed
class ReviewDto with _$ReviewDto {
  const factory ReviewDto({
    required String id,
    required String reservationId,
    required String auteurId,
    required String cibleId,
    required int note,
    String? commentaire,
    required String typeAvis,
    required DateTime creeLe,
  }) = _ReviewDto;

  factory ReviewDto.fromJson(Map<String, dynamic> json) =>
      _$ReviewDtoFromJson(json);
}
