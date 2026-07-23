/// Interface pour les feature flags
/// Permet d'activer/désactiver des fonctionnalités à distance
abstract class FeatureFlags {
  /// Initialise les feature flags
  Future<void> initialize();

  /// Vérifie si une feature est activée
  bool isEnabled(String featureName);

  /// Récupère la valeur d'un flag (string)
  String getString(String key, {String defaultValue = ''});

  /// Récupère la valeur d'un flag (bool)
  bool getBool(String key, {bool defaultValue = false});

  /// Récupère la valeur d'un flag (int)
  int getInt(String key, {int defaultValue = 0});

  /// Récupère la valeur d'un flag (double)
  double getDouble(String key, {double defaultValue = 0.0});

  /// Force le rafraîchissement des flags
  Future<void> refresh();
}

/// Feature flags disponibles
class Features {
  Features._();

  // =========================================================================
  // WALLET
  // =========================================================================

  /// Active la fonctionnalité wallet
  static const String walletEnabled = 'wallet_enabled';

  /// Active le cashback
  static const String walletCashback = 'wallet_cashback';

  /// Active le parrainage
  static const String walletReferral = 'wallet_referral';

  // =========================================================================
  // PAYMENT
  // =========================================================================

  /// Active Wave
  static const String paymentWave = 'payment_wave';

  /// Active Orange Money
  static const String paymentOrangeMoney = 'payment_orange_money';

  /// Active InTouch
  static const String paymentIntouch = 'payment_intouch';

  /// Active le paiement par carte
  static const String paymentCard = 'payment_card';

  // =========================================================================
  // FEATURES
  // =========================================================================

  /// Active le chat support
  static const String chatSupport = 'chat_support';

  /// Active l'auth biométrique
  static const String biometricAuth = 'biometric_auth';

  /// Active le mode sombre auto
  static const String darkModeAuto = 'dark_mode_auto';

  /// Active les notifications push
  static const String pushNotifications = 'push_notifications';

  /// Active la géolocalisation
  static const String geolocation = 'geolocation';

  /// Active les avis
  static const String reviews = 'reviews';

  /// Active le signalement
  static const String reporting = 'reporting';

  // =========================================================================
  // EXPÉRIMENTAL
  // =========================================================================

  /// Active le mode hors ligne
  static const String offlineMode = 'offline_mode';

  /// Active la recherche vocale
  static const String voiceSearch = 'voice_search';

  /// Active la réalité augmentée (AR)
  static const String arFeature = 'ar_feature';

  // =========================================================================
  // BUSINESS
  // =========================================================================

  /// Montant minimum de retrait (FCFA)
  static const String minWithdrawalAmount = 'min_withdrawal_amount';

  /// Pourcentage de commission
  static const String commissionPercent = 'commission_percent';

  /// Jours minimum de location
  static const String minBookingDays = 'min_booking_days';

  /// Jours maximum de location
  static const String maxBookingDays = 'max_booking_days';
}
