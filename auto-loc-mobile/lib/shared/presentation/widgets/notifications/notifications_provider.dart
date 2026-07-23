import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Notification Model
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    this.isRead = false,
    this.type = NotificationType.info,
  });

  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final bool isRead;
  final NotificationType type;

  AppNotification copyWith({
    String? id,
    String? title,
    String? message,
    DateTime? timestamp,
    bool? isRead,
    NotificationType? type,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      type: type ?? this.type,
    );
  }
}

enum NotificationType {
  info,
  success,
  warning,
  error,
  booking,
  payment,
}

/// Notifications Notifier
class NotificationsNotifier extends StateNotifier<List<AppNotification>> {
  NotificationsNotifier() : super([]);

  /// Nombre de notifications non lues
  int get unreadCount => state.where((n) => !n.isRead).length;

  /// Marquer comme lu
  void markAsRead(String id) {
    state = [
      for (final notification in state)
        if (notification.id == id)
          notification.copyWith(isRead: true)
        else
          notification,
    ];
  }

  /// Marquer tout comme lu
  void markAllAsRead() {
    state = [
      for (final notification in state) notification.copyWith(isRead: true),
    ];
  }

  /// Ajouter une notification
  void add(AppNotification notification) {
    state = [notification, ...state];
  }

  /// Supprimer une notification
  void remove(String id) {
    state = state.where((n) => n.id != id).toList();
  }

  /// Charger les notifications (TODO: depuis API)
  Future<void> loadNotifications() async {
    // TODO: Fetch from API
    // Pour l'instant, on utilise des données de test
    state = [
      AppNotification(
        id: '1',
        title: 'Réservation confirmée',
        message: 'Votre réservation pour le Toyota RAV4 a été confirmée',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        type: NotificationType.booking,
      ),
      AppNotification(
        id: '2',
        title: 'Paiement reçu',
        message: 'Votre paiement de 50 000 FCFA a été traité avec succès',
        timestamp: DateTime.now().subtract(const Duration(hours: 5)),
        isRead: false,
        type: NotificationType.payment,
      ),
      AppNotification(
        id: '3',
        title: 'Nouveau véhicule disponible',
        message: 'Un nouveau Mercedes-Benz Classe E est disponible à Dakar',
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        isRead: false,
        type: NotificationType.info,
      ),
    ];
  }
}

/// Provider pour les notifications
final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, List<AppNotification>>((ref) {
  final notifier = NotificationsNotifier();
  notifier.loadNotifications(); // Charger au démarrage
  return notifier;
});

/// Provider pour le compteur de notifications non lues
final unreadNotificationsCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.where((n) => !n.isRead).length;
});
