import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import '../logging/app_logger.dart';
import '../storage/preferences.dart';

/// Service pour gérer les notifications push (Firebase Cloud Messaging)
class NotificationService {
  final FirebaseMessaging? _messaging;
  final AppLogger _logger;
  final Preferences _preferences;

  final StreamController<RemoteMessage> _messageStreamController;
  final StreamController<String> _tokenStreamController;

  NotificationService({
    FirebaseMessaging? messaging,
    required AppLogger logger,
    required Preferences preferences,
  })  : _messaging = messaging,
        _logger = logger,
        _preferences = preferences,
        _messageStreamController = StreamController<RemoteMessage>.broadcast(),
        _tokenStreamController = StreamController<String>.broadcast();

  /// Stream des messages reçus
  Stream<RemoteMessage> get onMessage => _messageStreamController.stream;

  /// Stream du token FCM
  Stream<String> get onTokenRefresh => _tokenStreamController.stream;

  /// Token FCM actuel
  String? _currentToken;
  String? get currentToken => _currentToken;

  // =========================================================================
  // INITIALISATION
  // =========================================================================

  /// Initialise le service de notifications
  Future<void> initialize() async {
    // Si Firebase n'est pas initialisé ou s'il n'y a pas d'instance de messaging, ignorer proprement
    if (Firebase.apps.isEmpty || _messaging == null) {
      _logger.w('NotificationService non initialisé : Firebase n\'est pas configuré.');
      return;
    }

    try {
      // Demander la permission (iOS uniquement, Android l'a par défaut)
      await _requestPermission();

      // Récupérer le token FCM
      _currentToken = await _messaging?.getToken();
      if (_currentToken != null) {
        _logger.i('FCM Token: $_currentToken');
        await _preferences.setFcmToken(_currentToken!);
        _tokenStreamController.add(_currentToken!);
      }

      // Écouter les changements de token
      _messaging?.onTokenRefresh.listen((newToken) {
        _currentToken = newToken;
        _logger.i('FCM Token refreshed: $newToken');
        _preferences.setFcmToken(newToken);
        _tokenStreamController.add(newToken);
      });

      // Écouter les messages foreground
      FirebaseMessaging.onMessage.listen((message) {
        _logger.i('Message reçu en foreground: ${message.notification?.title}');
        _messageStreamController.add(message);
        _handleForegroundMessage(message);
      });

      // Écouter les taps sur notifications (background)
      FirebaseMessaging.onMessageOpenedApp.listen((message) {
        _logger.i('Notification tappée: ${message.notification?.title}');
        _handleNotificationTap(message);
      });

      // Vérifier si l'app a été ouverte depuis une notification
      final initialMessage = await _messaging?.getInitialMessage();
      if (initialMessage != null) {
        _logger.i('App ouverte depuis notification: ${initialMessage.notification?.title}');
        _handleNotificationTap(initialMessage);
      }

      _logger.i('NotificationService initialisé');
    } catch (e, stackTrace) {
      _logger.e('Erreur lors de l\'initialisation des notifications', e, stackTrace);
    }
  }

  /// Demande la permission pour les notifications (iOS)
  Future<void> _requestPermission() async {
    if (Firebase.apps.isEmpty || _messaging == null) return;

    final settings = await _messaging!.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    _logger.i('Permission notifications: ${settings.authorizationStatus}');

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      _logger.i('Notifications autorisées');
    } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
      _logger.i('Notifications provisoires autorisées');
    } else {
      _logger.w('Notifications refusées');
    }
  }

  // =========================================================================
  // GESTION DES MESSAGES
  // =========================================================================

  /// Gère un message reçu en foreground
  void _handleForegroundMessage(RemoteMessage message) {
    // TODO: Afficher une notification locale (flutter_local_notifications)
    // Pour l'instant, on émet juste le message dans le stream
  }

  /// Gère le tap sur une notification
  void _handleNotificationTap(RemoteMessage message) {
    // TODO: Router vers l'écran approprié selon les data
    final data = message.data;

    if (data.containsKey('type')) {
      final type = data['type'] as String;

      switch (type) {
        case 'booking':
          // Router vers détail réservation
          final bookingId = data['bookingId'] as String?;
          if (bookingId != null) {
            // TODO: Navigate to booking details
            _logger.i('Navigate to booking: $bookingId');
          }
          break;

        case 'vehicle':
          // Router vers détail véhicule
          final vehicleId = data['vehicleId'] as String?;
          if (vehicleId != null) {
            // TODO: Navigate to vehicle details
            _logger.i('Navigate to vehicle: $vehicleId');
          }
          break;

        case 'wallet':
          // Router vers wallet
          _logger.i('Navigate to wallet');
          break;

        default:
          _logger.w('Type de notification inconnu: $type');
      }
    }
  }

  // =========================================================================
  // TOPICS
  // =========================================================================

  /// S'abonne à un topic
  Future<void> subscribeToTopic(String topic) async {
    if (Firebase.apps.isEmpty || _messaging == null) return;
    try {
      await _messaging!.subscribeToTopic(topic);
      _logger.i('Abonné au topic: $topic');
    } catch (e) {
      _logger.e('Erreur lors de l\'abonnement au topic $topic', e);
    }
  }

  /// Se désabonne d'un topic
  Future<void> unsubscribeFromTopic(String topic) async {
    if (Firebase.apps.isEmpty || _messaging == null) return;
    try {
      await _messaging!.unsubscribeFromTopic(topic);
      _logger.i('Désabonné du topic: $topic');
    } catch (e) {
      _logger.e('Erreur lors du désabonnement du topic $topic', e);
    }
  }

  /// S'abonne aux topics selon le rôle utilisateur
  Future<void> subscribeToUserTopics(String userId, String role) async {
    // Topic général pour tous les utilisateurs
    await subscribeToTopic('all_users');

    // Topic par rôle
    if (role == 'LOCATAIRE') {
      await subscribeToTopic('tenants');
      await unsubscribeFromTopic('owners'); // Au cas où
    } else if (role == 'PROPRIETAIRE') {
      await subscribeToTopic('owners');
      await unsubscribeFromTopic('tenants'); // Au cas où
    }

    // Topic personnel
    await subscribeToTopic('user_$userId');
  }

  /// Se désabonne de tous les topics
  Future<void> unsubscribeFromAllTopics(String? userId, String? role) async {
    await unsubscribeFromTopic('all_users');

    if (role != null) {
      if (role == 'LOCATAIRE') {
        await unsubscribeFromTopic('tenants');
      } else if (role == 'PROPRIETAIRE') {
        await unsubscribeFromTopic('owners');
      }
    }

    if (userId != null) {
      await unsubscribeFromTopic('user_$userId');
    }
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  /// Envoie le token au serveur
  Future<void> sendTokenToServer(String token) async {
    // TODO: Appeler l'endpoint /notifications/subscribe
    _logger.i('Token à envoyer au serveur: $token');
  }

  /// Supprime le token du serveur
  Future<void> deleteTokenFromServer() async {
    // TODO: Appeler l'endpoint /notifications/unsubscribe
    _logger.i('Suppression du token du serveur');
  }

  /// Vérifie si les notifications sont activées dans les préférences
  bool areNotificationsEnabled() {
    return _preferences.areNotificationsEnabled();
  }

  /// Active/désactive les notifications
  Future<void> setNotificationsEnabled(bool enabled) async {
    await _preferences.setNotificationsEnabled(enabled);

    if (enabled) {
      await initialize();
    } else {
      // TODO: Se désabonner de tous les topics
    }
  }

  // =========================================================================
  // CLEANUP
  // =========================================================================

  /// Dispose le service
  void dispose() {
    _messageStreamController.close();
    _tokenStreamController.close();
  }
}

/// Background message handler (doit être top-level)
/// À appeler dans main.dart :
/// FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // TODO: Initialiser Firebase si nécessaire
  print('Message reçu en background: ${message.notification?.title}');
}
