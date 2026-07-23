import '../../../../core/utils/result.dart';
import '../entities/notification_subscription.dart';
import '../repositories/notification_repository.dart';

/// Subscribe Notifications UseCase
///
/// S'abonner aux notifications push Web Push API.
class SubscribeNotifications {
  final NotificationRepository repository;

  SubscribeNotifications(this.repository);

  Future<Result<NotificationSubscription>> call(SubscribeNotificationsParams params) {
    return repository.subscribe(
      endpoint: params.endpoint,
      keysP256dh: params.keysP256dh,
      keysAuth: params.keysAuth,
    );
  }
}

/// Paramètres pour l'abonnement aux notifications
class SubscribeNotificationsParams {
  final String endpoint;
  final String keysP256dh;
  final String keysAuth;

  SubscribeNotificationsParams({
    required this.endpoint,
    required this.keysP256dh,
    required this.keysAuth,
  });
}
