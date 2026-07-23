import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/payment_status.dart';
import '../../domain/entities/payment_initiation.dart';
import '../dto/payment_dto.dart';

/// Payment Mapper
///
/// Convertit entre PaymentInitiationDto (data layer) et PaymentInitiation (domain layer).
/// Responsabilités:
/// - Mapping DTO → Entity (fromJson → Domain)
/// - Mapping Entity → DTO (Domain → toJson)
/// - Conversion des enums String ↔ PaymentProvider, PaymentStatus
class PaymentMapper {
  /// Convertit un PaymentInitiationDto en PaymentInitiation (Entity)
  static PaymentInitiation toEntity(PaymentInitiationDto dto) {
    return PaymentInitiation(
      reservationId: dto.reservationId,
      paymentReference: dto.paymentReference,
      provider: _mapPaymentProvider(dto.provider),
      montant: double.tryParse(dto.montant) ?? 0,
      devise: dto.devise,
      statut: _mapPaymentStatus(dto.statut),
      paymentUrl: dto.paymentUrl,
      qrCode: dto.qrCode,
      creeLe: dto.creeLe,
    );
  }

  /// Convertit un PaymentInitiation (Entity) en PaymentInitiationDto
  static PaymentInitiationDto toDto(PaymentInitiation entity) {
    return PaymentInitiationDto(
      reservationId: entity.reservationId,
      paymentReference: entity.paymentReference,
      provider: entity.provider.toPrismaString(),
      montant: entity.montant.toString(),
      devise: entity.devise,
      statut: entity.statut.toPrismaString(),
      paymentUrl: entity.paymentUrl,
      qrCode: entity.qrCode,
      creeLe: entity.creeLe,
    );
  }

  // ===========================================================================
  // MAPPERS PRIVÉS - Enums
  // ===========================================================================

  static PaymentProvider _mapPaymentProvider(String value) {
    return PaymentProvider.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => PaymentProvider.wave,
    );
  }

  static PaymentStatus _mapPaymentStatus(String value) {
    return PaymentStatus.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => PaymentStatus.pending,
    );
  }
}
