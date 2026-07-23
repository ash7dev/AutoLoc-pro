import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../data/datasources/notification_remote_datasource.dart';
import '../data/repositories/notification_repository_impl.dart';
import '../domain/repositories/notification_repository.dart';
import '../domain/usecases/send_test_notification.dart';
import '../domain/usecases/subscribe_notifications.dart';
import '../domain/usecases/unsubscribe_notifications.dart';

/// Notification Dependency Injection
///
/// Providers Riverpod pour la feature Notifications.
/// Structure DI complète: DataSource → Repository → UseCases
final notificationRemoteDataSourceProvider = Provider<NotificationRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationRemoteDataSource(dio);
});

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  final remoteDataSource = ref.watch(notificationRemoteDataSourceProvider);
  return NotificationRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

final subscribeNotificationsProvider = Provider<SubscribeNotifications>((ref) {
  final repository = ref.watch(notificationRepositoryProvider);
  return SubscribeNotifications(repository);
});

final unsubscribeNotificationsProvider = Provider<UnsubscribeNotifications>((ref) {
  final repository = ref.watch(notificationRepositoryProvider);
  return UnsubscribeNotifications(repository);
});

final sendTestNotificationProvider = Provider<SendTestNotification>((ref) {
  final repository = ref.watch(notificationRepositoryProvider);
  return SendTestNotification(repository);
});
