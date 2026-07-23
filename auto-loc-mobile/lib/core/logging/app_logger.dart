/// Interface pour le logger de l'application
/// Permet de changer facilement d'implémentation (console, file, remote...)
abstract class AppLogger {
  /// Log de debug (développement uniquement)
  void d(String message, [dynamic error, StackTrace? stackTrace]);

  /// Log d'information
  void i(String message, [dynamic error, StackTrace? stackTrace]);

  /// Log d'avertissement
  void w(String message, [dynamic error, StackTrace? stackTrace]);

  /// Log d'erreur
  void e(String message, [dynamic error, StackTrace? stackTrace]);

  /// Log fatal (erreur critique)
  void f(String message, [dynamic error, StackTrace? stackTrace]);

  /// Log avec tag custom
  void log(
    LogLevel level,
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  });
}

/// Niveaux de log
enum LogLevel {
  debug,
  info,
  warning,
  error,
  fatal,
}

extension LogLevelExtension on LogLevel {
  String get name {
    switch (this) {
      case LogLevel.debug:
        return 'DEBUG';
      case LogLevel.info:
        return 'INFO';
      case LogLevel.warning:
        return 'WARNING';
      case LogLevel.error:
        return 'ERROR';
      case LogLevel.fatal:
        return 'FATAL';
    }
  }

  String get emoji {
    switch (this) {
      case LogLevel.debug:
        return '🐛';
      case LogLevel.info:
        return 'ℹ️';
      case LogLevel.warning:
        return '⚠️';
      case LogLevel.error:
        return '❌';
      case LogLevel.fatal:
        return '💀';
    }
  }
}
