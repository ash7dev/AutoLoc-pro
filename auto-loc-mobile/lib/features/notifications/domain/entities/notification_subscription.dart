import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_subscription.freezed.dart';

/// Notification Subscription Entity
///
/// Représente un abonnement aux notifications push (Web Push API).
/// Synchronisé avec le backend pour gérer les abonnements utilisateurs.
@freezed
class NotificationSubscription with _$NotificationSubscription {
  const factory NotificationSubscription({
    required String endpoint,
    required String keysP256dh,
    required String keysAuth,
    required DateTime creeLe,
  }) = _NotificationSubscription;

  const NotificationSubscription._();

  /// Est un abonnement valide
  bool get isValid => endpoint.isNotEmpty && keysP256dh.isNotEmpty && keysAuth.isNotEmpty;
}
