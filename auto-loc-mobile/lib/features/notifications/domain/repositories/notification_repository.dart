import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../entities/notification_subscription.dart';

/// Notification Repository Interface
///
/// Contract pour les opérations sur les abonnements de notifications.
/// Synchronisé avec les endpoints du backend:
/// - POST /notifications/subscribe
/// - DELETE /notifications/unsubscribe
/// - POST /notifications/test
abstract class NotificationRepository {
  /// S'abonner aux notifications push
  ///
  /// Endpoint: POST /notifications/subscribe
  ///
  /// Retourne:
  /// - Success: NotificationSubscription créé
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<NotificationSubscription>> subscribe({
    required String endpoint,
    required String keysP256dh,
    required String keysAuth,
  });

  /// Se désabonner des notifications push
  ///
  /// Endpoint: DELETE /notifications/unsubscribe?endpoint=xxx
  ///
  /// Retourne:
  /// - Success: true si désabonnement réussi
  /// - Failure: NetworkFailure, NotFoundFailure, etc.
  Future<Result<bool>> unsubscribe(String endpoint);

  /// Envoyer une notification de test
  ///
  /// Endpoint: POST /notifications/test
  ///
  /// Retourne:
  /// - Success: true si notification envoyée
  /// - Failure: NetworkFailure, etc.
  Future<Result<bool>> sendTestNotification();
}
