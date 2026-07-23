import '../../../../shared/enums/review_type.dart';
import '../../domain/entities/review.dart';
import '../dto/review_dto.dart';

/// Review Mapper
///
/// Convertit entre ReviewDto (data layer) et Review (domain layer).
/// Responsabilités:
/// - Mapping DTO → Entity (fromJson → Domain)
/// - Mapping Entity → DTO (Domain → toJson)
/// - Conversion des enums String ↔ ReviewType
class ReviewMapper {
  /// Convertit un ReviewDto en Review (Entity)
  static Review toEntity(ReviewDto dto) {
    return Review(
      id: dto.id,
      reservationId: dto.reservationId,
      auteurId: dto.auteurId,
      cibleId: dto.cibleId,
      note: dto.note,
      commentaire: dto.commentaire,
      typeAvis: _mapReviewType(dto.typeAvis),
      creeLe: dto.creeLe,
    );
  }

  /// Convertit un Review (Entity) en ReviewDto
  static ReviewDto toDto(Review entity) {
    return ReviewDto(
      id: entity.id,
      reservationId: entity.reservationId,
      auteurId: entity.auteurId,
      cibleId: entity.cibleId,
      note: entity.note,
      commentaire: entity.commentaire,
      typeAvis: entity.typeAvis.toPrismaString(),
      creeLe: entity.creeLe,
    );
  }

  // ===========================================================================
  // MAPPERS PRIVÉS - Enums
  // ===========================================================================

  static ReviewType _mapReviewType(String value) {
    return ReviewType.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => ReviewType.tenantNotesOwner,
    );
  }
}
