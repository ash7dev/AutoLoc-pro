import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../environment/env.dart';
import '../logging/app_logger.dart';
import '../logging/console_logger.dart';
import '../network/api_client.dart';
import '../network/connectivity_service.dart';
import '../network/interceptors/auth_interceptor.dart';
import '../network/interceptors/logging_interceptor.dart';
import '../network/interceptors/retry_interceptor.dart';
import '../storage/local_database.dart';
import '../storage/preferences.dart';
import '../storage/secure_storage.dart';
import '../services/session_service.dart';
import '../services/notification_service.dart';
import '../services/deep_link_service.dart';
import '../permissions/permission_service.dart';
import '../navigation/guards/auth_guard.dart';
import '../navigation/guards/role_guard.dart';
import '../monitoring/crash_reporter.dart';
import '../monitoring/analytics_tracker.dart';
import '../feature_flags/feature_flags.dart';
import '../feature_flags/remote_config_flags.dart';

/// Enregistre toutes les dépendances du core
/// Cette classe ne connaît QUE les dépendances core, jamais les features
class CoreInjection {
  CoreInjection._();

  /// Instance GetIt
  static final GetIt sl = GetIt.instance;

  /// Vérifie si Firebase est initialisé dans l'application
  static bool get _isFirebaseInitialized {
    try {
      return Firebase.apps.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Enregistre toutes les dépendances core
  static Future<void> register() async {
    final hasFirebase = _isFirebaseInitialized;

    // =========================================================================
    // ENVIRONMENT
    // =========================================================================

    sl.registerSingleton<Env>(Env.instance);

    // =========================================================================
    // LOGGING
    // =========================================================================

    sl.registerLazySingleton<AppLogger>(() => ConsoleLogger());

    // =========================================================================
    // STORAGE
    // =========================================================================

    // SharedPreferences (doit être async)
    final sharedPreferences = await SharedPreferences.getInstance();
    sl.registerSingleton<SharedPreferences>(sharedPreferences);

    sl.registerLazySingleton<Preferences>(
      () => Preferences(prefs: sl<SharedPreferences>()),
    );

    sl.registerLazySingleton<SecureStorage>(() => SecureStorage());

    sl.registerLazySingleton<LocalDatabase>(() => LocalDatabase());

    // =========================================================================
    // NETWORK
    // =========================================================================

    // Dio instance (pour les interceptors)
    sl.registerLazySingleton<Dio>(() => Dio());

    // Interceptors
    sl.registerLazySingleton<AuthInterceptor>(
      () => AuthInterceptor(
        secureStorage: sl<SecureStorage>(),
        dio: sl<Dio>(),
      ),
    );

    sl.registerLazySingleton<LoggingInterceptor>(
      () => LoggingInterceptor(
        logger: sl<AppLogger>(),
        env: sl<Env>(),
      ),
    );

    sl.registerLazySingleton<RetryInterceptor>(
      () => RetryInterceptor(logger: sl<AppLogger>()),
    );

    // ApiClient
    sl.registerLazySingleton<ApiClient>(
      () => ApiClient(
        env: sl<Env>(),
        authInterceptor: sl<AuthInterceptor>(),
        loggingInterceptor: sl<LoggingInterceptor>(),
        retryInterceptor: sl<RetryInterceptor>(),
      ),
    );

    // Connectivity
    sl.registerLazySingleton<ConnectivityService>(() => ConnectivityService());

    // =========================================================================
    // SERVICES
    // =========================================================================

    sl.registerLazySingleton<SessionService>(
      () => SessionService(
        secureStorage: sl<SecureStorage>(),
        preferences: sl<Preferences>(),
      ),
    );

    sl.registerLazySingleton<NotificationService>(
      () => NotificationService(
        messaging: hasFirebase ? FirebaseMessaging.instance : null,
        logger: sl<AppLogger>(),
        preferences: sl<Preferences>(),
      ),
    );

    sl.registerLazySingleton<DeepLinkService>(
      () => DeepLinkService(logger: sl<AppLogger>()),
    );

    // =========================================================================
    // PERMISSIONS
    // =========================================================================

    sl.registerLazySingleton<PermissionService>(() => PermissionService());

    // =========================================================================
    // NAVIGATION
    // =========================================================================

    sl.registerLazySingleton<AuthGuard>(
      () => AuthGuard(sessionService: sl<SessionService>()),
    );

    sl.registerLazySingleton<RoleGuard>(
      () => RoleGuard(sessionService: sl<SessionService>()),
    );

    // =========================================================================
    // MONITORING
    // =========================================================================

    sl.registerLazySingleton<CrashReporter>(
      () => hasFirebase
          ? FirebaseCrashReporter(
              crashlytics: FirebaseCrashlytics.instance,
              enabled: sl<Env>().enableCrashReporting,
            )
          : ConsoleCrashReporter(),
    );

    sl.registerLazySingleton<AnalyticsTracker>(
      () => hasFirebase
          ? FirebaseAnalyticsTracker(
              analytics: FirebaseAnalytics.instance,
              enabled: sl<Env>().enableAnalytics,
            )
          : ConsoleAnalyticsTracker(),
    );

    // =========================================================================
    // FEATURE FLAGS
    // =========================================================================

    sl.registerLazySingleton<FeatureFlags>(
      () => hasFirebase
          ? RemoteConfigFlags(
              remoteConfig: FirebaseRemoteConfig.instance,
              logger: sl<AppLogger>(),
            )
          : LocalFeatureFlags(),
    );
  }

  /// Initialise les services qui nécessitent une initialisation async
  static Future<void> initializeServices() async {
    // Initialiser la base de données locale
    await sl<LocalDatabase>().initialize();

    // Initialiser le session service
    await sl<SessionService>().initialize();

    // Initialiser le connectivity service
    await sl<ConnectivityService>().initialize();

    // Initialiser les feature flags
    try {
      await sl<FeatureFlags>().initialize();
    } catch (e) {
      debugPrint('Warning: Impossible d\'initialiser les feature flags: $e');
    }

    // Initialiser le crash reporter
    try {
      await sl<CrashReporter>().initialize();
    } catch (e) {
      debugPrint('Warning: Impossible d\'initialiser le crash reporter: $e');
    }

    // Initialiser l'analytics
    try {
      await sl<AnalyticsTracker>().initialize();
    } catch (e) {
      debugPrint('Warning: Impossible d\'initialiser l\'analytics: $e');
    }

    // Initialiser les notifications (en dernier, nécessite les permissions)
    // await sl<NotificationService>().initialize(); // À appeler après permissions

    // Initialiser les deep links
    await sl<DeepLinkService>().initialize();
  }
}

// =============================================================================
// FALLBACK / MOCK IMPLEMENTATIONS (Quand Firebase n'est pas configuré)
// =============================================================================

/// Implémentation locale de FeatureFlags en secours
class LocalFeatureFlags implements FeatureFlags {
  @override
  Future<void> initialize() async {}

  @override
  bool isEnabled(String featureName) => true;

  @override
  String getString(String key, {String defaultValue = ''}) => defaultValue;

  @override
  bool getBool(String key, {bool defaultValue = false}) {
    // Activer par défaut les modes de paiement Wave et Orange Money en local dev
    if (key == Features.paymentWave || key == Features.paymentOrangeMoney) {
      return true;
    }
    return defaultValue;
  }

  @override
  int getInt(String key, {int defaultValue = 0}) => defaultValue;

  @override
  double getDouble(String key, {double defaultValue = 0.0}) => defaultValue;

  @override
  Future<void> refresh() async {}
}

/// Implémentation de secours pour CrashReporter
class ConsoleCrashReporter implements CrashReporter {
  @override
  Future<void> initialize() async {}

  @override
  Future<void> recordError(
    dynamic error,
    StackTrace? stackTrace, {
    dynamic reason,
    Iterable<Object> information = const [],
    bool fatal = false,
  }) async {
    debugPrint('ConsoleCrashReporter: Erreur capturée: $error\n$stackTrace');
  }

  @override
  Future<void> recordException(
    dynamic exception,
    StackTrace? stackTrace, {
    dynamic reason,
    bool fatal = false,
  }) async {
    debugPrint('ConsoleCrashReporter: Exception capturée: $exception\n$stackTrace');
  }

  @override
  void log(String message) {
    debugPrint('ConsoleCrashReporter: Log: $message');
  }

  @override
  Future<void> setUserIdentifier(String identifier) async {}

  @override
  Future<void> setCustomKey(String key, Object value) async {}

  @override
  Future<void> clearUserData() async {}
}

/// Implémentation de secours pour AnalyticsTracker
class ConsoleAnalyticsTracker implements AnalyticsTracker {
  @override
  Future<void> initialize() async {}

  @override
  Future<void> logEvent(String name, {Map<String, Object?>? parameters}) async {
    debugPrint('ConsoleAnalyticsTracker: Événement loggué: $name, paramètres: $parameters');
  }

  @override
  Future<void> logScreenView(String screenName, {String? screenClass}) async {
    debugPrint('ConsoleAnalyticsTracker: Écran vu: $screenName');
  }

  @override
  Future<void> setUserProperty(String name, String? value) async {}

  @override
  Future<void> setUserId(String? id) async {}

  @override
  Future<void> resetAnalyticsData() async {}
}
