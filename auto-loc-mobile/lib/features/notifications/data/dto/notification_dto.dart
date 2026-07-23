import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_dto.freezed.dart';
part 'notification_dto.g.dart';

/// Notification Subscription DTO - Data Transfer Object
///
/// Représente la structure JSON pour l'abonnement aux notifications.
/// Utilise json_serializable pour la sérialisation automatique.
@freezed
class NotificationSubscriptionDto with _$NotificationSubscriptionDto {
  const factory NotificationSubscriptionDto({
    required String endpoint,
    @JsonKey(name: 'keysP256dh') required String keysP256dh,
    @JsonKey(name: 'keysAuth') required String keysAuth,
    @JsonKey(name: 'creeLe') required DateTime creeLe,
  }) = _NotificationSubscriptionDto;

  factory NotificationSubscriptionDto.fromJson(Map<String, dynamic> json) =>
      _$NotificationSubscriptionDtoFromJson(json);
}
