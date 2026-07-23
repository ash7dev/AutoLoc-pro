import '../../../../core/utils/result.dart';
import '../repositories/notification_repository.dart';

/// Unsubscribe Notifications UseCase
///
/// Se désabonner des notifications push.
class UnsubscribeNotifications {
  final NotificationRepository repository;

  UnsubscribeNotifications(this.repository);

  Future<Result<bool>> call(String endpoint) {
    return repository.unsubscribe(endpoint);
  }
}
