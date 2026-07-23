import '../../domain/entities/notification_subscription.dart';
import '../dto/notification_dto.dart';

/// Notification Mapper
///
/// Convertit entre NotificationSubscriptionDto (data layer) et NotificationSubscription (domain layer).
/// Responsabilités:
/// - Mapping DTO → Entity (fromJson → Domain)
/// - Mapping Entity → DTO (Domain → toJson)
class NotificationMapper {
  /// Convertit un NotificationSubscriptionDto en NotificationSubscription (Entity)
  static NotificationSubscription toEntity(NotificationSubscriptionDto dto) {
    return NotificationSubscription(
      endpoint: dto.endpoint,
      keysP256dh: dto.keysP256dh,
      keysAuth: dto.keysAuth,
      creeLe: dto.creeLe,
    );
  }

  /// Convertit un NotificationSubscription (Entity) en NotificationSubscriptionDto
  static NotificationSubscriptionDto toDto(NotificationSubscription entity) {
    return NotificationSubscriptionDto(
      endpoint: entity.endpoint,
      keysP256dh: entity.keysP256dh,
      keysAuth: entity.keysAuth,
      creeLe: entity.creeLe,
    );
  }
}
