import 'package:dio/dio.dart';
import '../dto/notification_dto.dart';

/// Notification Remote DataSource
///
/// Responsable des appels API pour les notifications.
/// Synchronisé avec les endpoints du backend NestJS.
class NotificationRemoteDataSource {
  final Dio _dio;

  NotificationRemoteDataSource(this._dio);

  /// POST /notifications/subscribe
  /// S'abonner aux notifications push.
  Future<NotificationSubscriptionDto> subscribe({
    required String endpoint,
    required String keysP256dh,
    required String keysAuth,
  }) async {
    final response = await _dio.post(
      '/notifications/subscribe',
      data: {
        'endpoint': endpoint,
        'keysP256dh': keysP256dh,
        'keysAuth': keysAuth,
      },
    );

    return NotificationSubscriptionDto.fromJson(response.data as Map<String, dynamic>);
  }

  /// DELETE /notifications/unsubscribe?endpoint=xxx
  /// Se désabonner des notifications push.
  Future<bool> unsubscribe(String endpoint) async {
    await _dio.delete('/notifications/unsubscribe', queryParameters: {
      'endpoint': endpoint,
    });
    return true;
  }

  /// POST /notifications/test
  /// Envoyer une notification de test.
  Future<bool> sendTestNotification() async {
    await _dio.post('/notifications/test');
    return true;
  }
}
