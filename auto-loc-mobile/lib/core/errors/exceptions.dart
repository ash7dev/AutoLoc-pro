/// Exceptions techniques (couche data)
/// Les exceptions sont lancées par les datasources et capturées par les repositories

/// Exception réseau générique
class NetworkException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  const NetworkException({
    required this.message,
    this.statusCode,
    this.data,
  });

  @override
  String toString() => 'NetworkException: $message (code: $statusCode)';
}

/// Exception serveur (5xx)
class ServerException implements Exception {
  final String message;
  final int statusCode;

  const ServerException({
    required this.message,
    this.statusCode = 500,
  });

  @override
  String toString() => 'ServerException: $message (code: $statusCode)';
}

/// Exception d'authentification (401, 403)
class AuthException implements Exception {
  final String message;
  final int statusCode;

  const AuthException({
    required this.message,
    this.statusCode = 401,
  });

  @override
  String toString() => 'AuthException: $message';
}

/// Exception de validation (400)
class ValidationException implements Exception {
  final String message;
  final Map<String, dynamic>? errors;

  const ValidationException({
    required this.message,
    this.errors,
  });

  @override
  String toString() => 'ValidationException: $message';
}

/// Exception de ressource non trouvée (404)
class NotFoundException implements Exception {
  final String message;
  final String? resource;

  const NotFoundException({
    required this.message,
    this.resource,
  });

  @override
  String toString() => 'NotFoundException: $message';
}

/// Exception de cache
class CacheException implements Exception {
  final String message;

  const CacheException(this.message);

  @override
  String toString() => 'CacheException: $message';
}

/// Exception de stockage local
class StorageException implements Exception {
  final String message;

  const StorageException(this.message);

  @override
  String toString() => 'StorageException: $message';
}

/// Exception de timeout
class TimeoutException implements Exception {
  final String message;

  const TimeoutException([this.message = 'Request timeout']);

  @override
  String toString() => 'TimeoutException: $message';
}

/// Exception de connexion
class ConnectionException implements Exception {
  final String message;

  const ConnectionException([this.message = 'No internet connection']);

  @override
  String toString() => 'ConnectionException: $message';
}

/// Exception de parsing JSON
class ParseException implements Exception {
  final String message;
  final dynamic error;

  const ParseException({
    required this.message,
    this.error,
  });

  @override
  String toString() => 'ParseException: $message';
}

/// Exception de permission refusée
class PermissionException implements Exception {
  final String message;
  final String permission;

  const PermissionException({
    required this.message,
    required this.permission,
  });

  @override
  String toString() => 'PermissionException: $message (permission: $permission)';
}
