import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

/// Interface pour le crash reporter
/// Permet de changer facilement d'implémentation (Crashlytics, Sentry, etc.)
abstract class CrashReporter {
  /// Initialise le crash reporter
  Future<void> initialize();

  /// Log une erreur non fatale
  Future<void> recordError(
    dynamic error,
    StackTrace? stackTrace, {
    dynamic reason,
    Iterable<Object> information = const [],
    bool fatal = false,
  });

  /// Log une exception
  Future<void> recordException(
    dynamic exception,
    StackTrace? stackTrace, {
    dynamic reason,
    bool fatal = false,
  });

  /// Log un message
  void log(String message);

  /// Set user identifier
  Future<void> setUserIdentifier(String identifier);

  /// Set custom key
  Future<void> setCustomKey(String key, Object value);

  /// Clear user data
  Future<void> clearUserData();
}

/// Implémentation avec Firebase Crashlytics
class FirebaseCrashReporter implements CrashReporter {
  final FirebaseCrashlytics _crashlytics;
  final bool _enabled;

  FirebaseCrashReporter({
    FirebaseCrashlytics? crashlytics,
    bool enabled = true,
  })  : _crashlytics = crashlytics ?? FirebaseCrashlytics.instance,
        _enabled = enabled && !kDebugMode; // Désactivé en mode debug

  @override
  Future<void> initialize() async {
    if (!_enabled) {
      await _crashlytics.setCrashlyticsCollectionEnabled(false);
      return;
    }

    // Activer la collection automatique
    await _crashlytics.setCrashlyticsCollectionEnabled(true);

    // Capturer les erreurs Flutter
    FlutterError.onError = _crashlytics.recordFlutterFatalError;

    // Capturer les erreurs asynchrones
    PlatformDispatcher.instance.onError = (error, stack) {
      _crashlytics.recordError(error, stack, fatal: true);
      return true;
    };
  }

  @override
  Future<void> recordError(
    dynamic error,
    StackTrace? stackTrace, {
    dynamic reason,
    Iterable<Object> information = const [],
    bool fatal = false,
  }) async {
    if (!_enabled) return;

    await _crashlytics.recordError(
      error,
      stackTrace,
      reason: reason,
      information: information,
      fatal: fatal,
    );
  }

  @override
  Future<void> recordException(
    dynamic exception,
    StackTrace? stackTrace, {
    dynamic reason,
    bool fatal = false,
  }) async {
    if (!_enabled) return;

    await _crashlytics.recordError(
      exception,
      stackTrace,
      reason: reason,
      fatal: fatal,
    );
  }

  @override
  void log(String message) {
    if (!_enabled) return;
    _crashlytics.log(message);
  }

  @override
  Future<void> setUserIdentifier(String identifier) async {
    if (!_enabled) return;
    await _crashlytics.setUserIdentifier(identifier);
  }

  @override
  Future<void> setCustomKey(String key, Object value) async {
    if (!_enabled) return;
    await _crashlytics.setCustomKey(key, value);
  }

  @override
  Future<void> clearUserData() async {
    if (!_enabled) return;
    await _crashlytics.setUserIdentifier('');
  }

  /// Force un crash (pour tester)
  void forceCrash() {
    _crashlytics.crash();
  }

  /// Teste le crash reporting
  Future<void> testCrashReporting() async {
    try {
      throw Exception('Test crash reporting');
    } catch (e, stackTrace) {
      await recordError(e, stackTrace, reason: 'Test');
    }
  }
}
