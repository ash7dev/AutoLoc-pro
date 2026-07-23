import 'package:firebase_remote_config/firebase_remote_config.dart';

import 'feature_flags.dart';
import '../logging/app_logger.dart';

/// Implémentation des feature flags avec Firebase Remote Config
class RemoteConfigFlags implements FeatureFlags {
  final FirebaseRemoteConfig _remoteConfig;
  final AppLogger _logger;

  RemoteConfigFlags({
    required FirebaseRemoteConfig remoteConfig,
    required AppLogger logger,
  })  : _remoteConfig = remoteConfig,
        _logger = logger;

  @override
  Future<void> initialize() async {
    try {
      // Configuration
      await _remoteConfig.setConfigSettings(
        RemoteConfigSettings(
          fetchTimeout: const Duration(seconds: 10),
          minimumFetchInterval: const Duration(hours: 1),
        ),
      );

      // Valeurs par défaut
      await _remoteConfig.setDefaults(_defaultValues);

      // Fetch et activate
      await _remoteConfig.fetchAndActivate();

      _logger.i('Feature flags initialisés');
    } catch (e, stackTrace) {
      _logger.e('Erreur lors de l\'initialisation des feature flags', e, stackTrace);
    }
  }

  @override
  bool isEnabled(String featureName) {
    return getBool(featureName);
  }

  @override
  String getString(String key, {String defaultValue = ''}) {
    try {
      return _remoteConfig.getString(key);
    } catch (e) {
      _logger.w('Erreur lors de la lecture du flag $key: $e');
      return defaultValue;
    }
  }

  @override
  bool getBool(String key, {bool defaultValue = false}) {
    try {
      return _remoteConfig.getBool(key);
    } catch (e) {
      _logger.w('Erreur lors de la lecture du flag $key: $e');
      return defaultValue;
    }
  }

  @override
  int getInt(String key, {int defaultValue = 0}) {
    try {
      return _remoteConfig.getInt(key);
    } catch (e) {
      _logger.w('Erreur lors de la lecture du flag $key: $e');
      return defaultValue;
    }
  }

  @override
  double getDouble(String key, {double defaultValue = 0.0}) {
    try {
      return _remoteConfig.getDouble(key);
    } catch (e) {
      _logger.w('Erreur lors de la lecture du flag $key: $e');
      return defaultValue;
    }
  }

  @override
  Future<void> refresh() async {
    try {
      await _remoteConfig.fetchAndActivate();
      _logger.i('Feature flags rafraîchis');
    } catch (e) {
      _logger.e('Erreur lors du rafraîchissement des feature flags', e);
    }
  }

  /// Valeurs par défaut des feature flags
  static final Map<String, dynamic> _defaultValues = {
    // Wallet
    Features.walletEnabled: true,
    Features.walletCashback: false,
    Features.walletReferral: false,

    // Payment
    Features.paymentWave: true,
    Features.paymentOrangeMoney: true,
    Features.paymentIntouch: true,
    Features.paymentCard: false,

    // Features
    Features.chatSupport: true,
    Features.biometricAuth: true,
    Features.darkModeAuto: true,
    Features.pushNotifications: true,
    Features.geolocation: true,
    Features.reviews: true,
    Features.reporting: true,

    // Expérimental
    Features.offlineMode: false,
    Features.voiceSearch: false,
    Features.arFeature: false,

    // Business
    Features.minWithdrawalAmount: 5000,
    Features.commissionPercent: 10.0,
    Features.minBookingDays: 1,
    Features.maxBookingDays: 90,
  };
}
