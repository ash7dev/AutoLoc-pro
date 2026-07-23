import '../../../../core/utils/result.dart';
import '../repositories/notification_repository.dart';

/// Send Test Notification UseCase
///
/// Envoyer une notification de test à l'utilisateur actuel.
class SendTestNotification {
  final NotificationRepository repository;

  SendTestNotification(this.repository);

  Future<Result<bool>> call() {
    return repository.sendTestNotification();
  }
}
