import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';

/// Interface pour l'analytics
abstract class AnalyticsTracker {
  /// Initialise l'analytics
  Future<void> initialize();

  /// Log un événement
  Future<void> logEvent(String name, {Map<String, Object?>? parameters});

  /// Log un écran vu
  Future<void> logScreenView(String screenName, {String? screenClass});

  /// Set user property
  Future<void> setUserProperty(String name, String? value);

  /// Set user ID
  Future<void> setUserId(String? id);

  /// Reset analytics data
  Future<void> resetAnalyticsData();
}

/// Implémentation avec Firebase Analytics
class FirebaseAnalyticsTracker implements AnalyticsTracker {
  final FirebaseAnalytics _analytics;
  final bool _enabled;

  FirebaseAnalyticsTracker({
    FirebaseAnalytics? analytics,
    bool enabled = true,
  })  : _analytics = analytics ?? FirebaseAnalytics.instance,
        _enabled = enabled && !kDebugMode; // Désactivé en mode debug

  @override
  Future<void> initialize() async {
    if (!_enabled) {
      await _analytics.setAnalyticsCollectionEnabled(false);
      return;
    }

    await _analytics.setAnalyticsCollectionEnabled(true);
  }

  @override
  Future<void> logEvent(
    String name, {
    Map<String, Object?>? parameters,
  }) async {
    if (!_enabled) return;

    await _analytics.logEvent(
      name: name,
      parameters: parameters,
    );
  }

  @override
  Future<void> logScreenView(
    String screenName, {
    String? screenClass,
  }) async {
    if (!_enabled) return;

    await _analytics.logScreenView(
      screenName: screenName,
      screenClass: screenClass,
    );
  }

  @override
  Future<void> setUserProperty(String name, String? value) async {
    if (!_enabled) return;

    await _analytics.setUserProperty(
      name: name,
      value: value,
    );
  }

  @override
  Future<void> setUserId(String? id) async {
    if (!_enabled) return;

    await _analytics.setUserId(id: id);
  }

  @override
  Future<void> resetAnalyticsData() async {
    if (!_enabled) return;

    await _analytics.resetAnalyticsData();
  }

  // =========================================================================
  // ÉVÉNEMENTS MÉTIER
  // =========================================================================

  /// Log une recherche
  Future<void> logSearch(String query, {String? category}) async {
    await logEvent('search', parameters: {
      'search_term': query,
      if (category != null) 'category': category,
    });
  }

  /// Log une vue de véhicule
  Future<void> logVehicleView(String vehicleId, {String? vehicleName}) async {
    await logEvent('view_item', parameters: {
      'item_id': vehicleId,
      if (vehicleName != null) 'item_name': vehicleName,
      'item_category': 'vehicle',
    });
  }

  /// Log un début de réservation
  Future<void> logBeginCheckout(
    String vehicleId,
    double price,
  ) async {
    await logEvent('begin_checkout', parameters: {
      'item_id': vehicleId,
      'value': price,
      'currency': 'XOF',
    });
  }

  /// Log une réservation complétée
  Future<void> logBookingCompleted(
    String bookingId,
    String vehicleId,
    double amount,
    int days,
  ) async {
    await logEvent('purchase', parameters: {
      'transaction_id': bookingId,
      'item_id': vehicleId,
      'value': amount,
      'currency': 'XOF',
      'booking_days': days,
    });
  }

  /// Log un ajout à la wishlist (favori)
  Future<void> logAddToWishlist(String vehicleId) async {
    await logEvent('add_to_wishlist', parameters: {
      'item_id': vehicleId,
    });
  }

  /// Log un partage
  Future<void> logShare(String contentType, String itemId) async {
    await logEvent('share', parameters: {
      'content_type': contentType,
      'item_id': itemId,
    });
  }

  /// Log une inscription
  Future<void> logSignUp(String method) async {
    await logEvent('sign_up', parameters: {
      'method': method, // 'phone', 'google', 'facebook'
    });
  }

  /// Log une connexion
  Future<void> logLogin(String method) async {
    await logEvent('login', parameters: {
      'method': method,
    });
  }

  /// Log un changement de rôle
  Future<void> logSwitchRole(String fromRole, String toRole) async {
    await logEvent('switch_role', parameters: {
      'from_role': fromRole,
      'to_role': toRole,
    });
  }

  /// Log une création de véhicule
  Future<void> logVehicleCreated(
    String vehicleId,
    String vehicleType,
  ) async {
    await logEvent('vehicle_created', parameters: {
      'vehicle_id': vehicleId,
      'vehicle_type': vehicleType,
    });
  }

  /// Log une demande de retrait
  Future<void> logWithdrawalRequested(double amount) async {
    await logEvent('withdrawal_requested', parameters: {
      'amount': amount,
      'currency': 'XOF',
    });
  }

  /// Log un KYC complété
  Future<void> logKycCompleted() async {
    await logEvent('kyc_completed');
  }

  /// Log une erreur
  Future<void> logError(String errorType, String errorMessage) async {
    await logEvent('error', parameters: {
      'error_type': errorType,
      'error_message': errorMessage,
    });
  }
}

/// Noms d'événements standards
class AnalyticsEvents {
  AnalyticsEvents._();

  // App
  static const String appOpened = 'app_opened';
  static const String appBackgrounded = 'app_backgrounded';

  // User
  static const String signUp = 'sign_up';
  static const String login = 'login';
  static const String logout = 'logout';
  static const String profileCompleted = 'profile_completed';
  static const String kycCompleted = 'kyc_completed';

  // Navigation
  static const String screenView = 'screen_view';
  static const String search = 'search';

  // Booking
  static const String bookingStarted = 'booking_started';
  static const String bookingCompleted = 'booking_completed';
  static const String bookingCancelled = 'booking_cancelled';

  // Payment
  static const String paymentInitiated = 'payment_initiated';
  static const String paymentSuccess = 'payment_success';
  static const String paymentFailed = 'payment_failed';

  // Vehicle
  static const String vehicleViewed = 'vehicle_viewed';
  static const String vehicleCreated = 'vehicle_created';
  static const String vehicleFavorited = 'vehicle_favorited';

  // Wallet
  static const String withdrawalRequested = 'withdrawal_requested';
  static const String withdrawalCompleted = 'withdrawal_completed';

  // Share
  static const String share = 'share';

  // Error
  static const String error = 'error';
}
