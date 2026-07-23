import 'package:flutter/foundation.dart';

import 'app_logger.dart';

/// Implémentation console du logger
/// Utilise debugPrint en développement
class ConsoleLogger implements AppLogger {
  final bool _enabled;

  ConsoleLogger({bool enabled = kDebugMode}) : _enabled = enabled;

  @override
  void d(String message, [dynamic error, StackTrace? stackTrace]) {
    log(LogLevel.debug, message, error: error, stackTrace: stackTrace);
  }

  @override
  void i(String message, [dynamic error, StackTrace? stackTrace]) {
    log(LogLevel.info, message, error: error, stackTrace: stackTrace);
  }

  @override
  void w(String message, [dynamic error, StackTrace? stackTrace]) {
    log(LogLevel.warning, message, error: error, stackTrace: stackTrace);
  }

  @override
  void e(String message, [dynamic error, StackTrace? stackTrace]) {
    log(LogLevel.error, message, error: error, stackTrace: stackTrace);
  }

  @override
  void f(String message, [dynamic error, StackTrace? stackTrace]) {
    log(LogLevel.fatal, message, error: error, stackTrace: stackTrace);
  }

  @override
  void log(
    LogLevel level,
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (!_enabled) return;

    final timestamp = DateTime.now().toIso8601String();
    final tagStr = tag != null ? '[$tag]' : '';
    final levelStr = level.emoji;

    final logMessage = '$levelStr $timestamp $tagStr $message';

    // Utiliser debugPrint pour éviter de saturer la console
    debugPrint(logMessage);

    if (error != null) {
      debugPrint('Error: $error');
    }

    if (stackTrace != null) {
      debugPrint('StackTrace: $stackTrace');
    }
  }
}
