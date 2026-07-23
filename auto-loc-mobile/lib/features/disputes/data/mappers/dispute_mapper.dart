import '../../../../shared/enums/dispute_resolution.dart';
import '../../../../shared/enums/dispute_status.dart';
import '../../domain/entities/dispute.dart';
import '../dto/dispute_dto.dart';

/// Dispute Mapper
///
/// Convertit entre DisputeDto (data layer) et Dispute (domain layer).
/// Responsabilités:
/// - Mapping DTO → Entity (fromJson → Domain)
/// - Mapping Entity → DTO (Domain → toJson)
/// - Conversion des enums String ↔ DisputeStatus, DisputeResolution
class DisputeMapper {
  /// Convertit un DisputeDto en Dispute (Entity)
  static Dispute toEntity(DisputeDto dto) {
    return Dispute(
      id: dto.id,
      reservationId: dto.reservationId,
      auteurId: dto.auteurId,
      motif: dto.motif,
      commentaire: dto.commentaire,
      statut: _mapDisputeStatus(dto.statut),
      resolution: dto.resolution != null ? _mapDisputeResolution(dto.resolution!) : null,
      resolutionCommentaire: dto.resolutionCommentaire,
      arbitreId: dto.arbitreId,
      creeLe: dto.creeLe,
      resoluLe: dto.resoluLe,
    );
  }

  /// Convertit un Dispute (Entity) en DisputeDto
  static DisputeDto toDto(Dispute entity) {
    return DisputeDto(
      id: entity.id,
      reservationId: entity.reservationId,
      auteurId: entity.auteurId,
      motif: entity.motif,
      commentaire: entity.commentaire,
      statut: entity.statut.toPrismaString(),
      resolution: entity.resolution?.toPrismaString(),
      resolutionCommentaire: entity.resolutionCommentaire,
      arbitreId: entity.arbitreId,
      creeLe: entity.creeLe,
      resoluLe: entity.resoluLe,
    );
  }

  // ===========================================================================
  // MAPPERS PRIVÉS - Enums
  // ===========================================================================

  static DisputeStatus _mapDisputeStatus(String value) {
    return DisputeStatus.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => DisputeStatus.enAttente,
    );
  }

  static DisputeResolution _mapDisputeResolution(String value) {
    return DisputeResolution.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => DisputeResolution.partage,
    );
  }
}
