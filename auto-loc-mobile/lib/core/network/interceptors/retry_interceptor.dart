import 'dart:io';

import 'package:dio/dio.dart';

import '../../../core/logging/app_logger.dart';

/// Interceptor pour retry automatique des requêtes en cas d'erreur
/// Retry uniquement pour les erreurs réseau/timeout, pas pour les erreurs métier (4xx, 5xx)
class RetryInterceptor extends Interceptor {
  final AppLogger _logger;
  final int maxRetries;
  final Duration retryDelay;

  RetryInterceptor({
    required AppLogger logger,
    this.maxRetries = 3,
    this.retryDelay = const Duration(seconds: 1),
  }) : _logger = logger;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // Ne retry que pour certains types d'erreurs
    if (!_shouldRetry(err)) {
      return handler.next(err);
    }

    // Récupérer le nombre de retry déjà effectués
    final retryCount = err.requestOptions.extra['retryCount'] as int? ?? 0;

    if (retryCount >= maxRetries) {
      _logger.w('Max retries reached for ${err.requestOptions.uri}');
      return handler.next(err);
    }

    // Incrémenter le compteur
    err.requestOptions.extra['retryCount'] = retryCount + 1;

    _logger.i(
      'Retrying request (${retryCount + 1}/$maxRetries) to ${err.requestOptions.uri}',
    );

    // Attendre avant de retry (exponential backoff)
    final delay = retryDelay * (retryCount + 1);
    await Future.delayed(delay);

    // Retry la requête
    try {
      final response = await Dio().fetch(err.requestOptions);
      return handler.resolve(response);
    } on DioException catch (e) {
      return handler.next(e);
    }
  }

  /// Détermine si on doit retry la requête
  bool _shouldRetry(DioException err) {
    // Retry seulement pour GET requests (idempotent)
    if (err.requestOptions.method.toUpperCase() != 'GET') {
      return false;
    }

    // Retry pour les erreurs de connexion
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError) {
      return true;
    }

    // Retry pour les erreurs réseau (SocketException)
    if (err.error is SocketException) {
      return true;
    }

    // Retry pour certains status codes (502, 503, 504)
    if (err.response?.statusCode != null) {
      final statusCode = err.response!.statusCode!;
      return statusCode == 502 || statusCode == 503 || statusCode == 504;
    }

    return false;
  }
}
