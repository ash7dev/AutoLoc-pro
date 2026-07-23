import 'package:dio/dio.dart';

import '../../../core/logging/app_logger.dart';
import '../../environment/env.dart';

/// Interceptor pour logger les requêtes et réponses HTTP
/// Active uniquement en développement
class LoggingInterceptor extends Interceptor {
  final AppLogger _logger;
  final Env _env;

  LoggingInterceptor({
    required AppLogger logger,
    required Env env,
  })  : _logger = logger,
        _env = env;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (_env.isDevelopment) {
      _logger.d('');
      _logger.d('╔════════════════════════════════════════════════════════════════');
      _logger.d('║ 🚀 REQUEST');
      _logger.d('╠════════════════════════════════════════════════════════════════');
      _logger.d('║ Method: ${options.method}');
      _logger.d('║ URL: ${options.uri}');

      if (options.queryParameters.isNotEmpty) {
        _logger.d('║ Query Parameters:');
        options.queryParameters.forEach((key, value) {
          _logger.d('║   $key: $value');
        });
      }

      if (options.headers.isNotEmpty) {
        _logger.d('║ Headers:');
        options.headers.forEach((key, value) {
          // Masquer le token pour la sécurité
          if (key.toLowerCase() == 'authorization') {
            _logger.d('║   $key: Bearer ***');
          } else {
            _logger.d('║   $key: $value');
          }
        });
      }

      if (options.data != null) {
        _logger.d('║ Body:');
        _logger.d('║ ${_formatData(options.data)}');
      }

      _logger.d('╚════════════════════════════════════════════════════════════════');
      _logger.d('');
    }

    return handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (_env.isDevelopment) {
      _logger.d('');
      _logger.d('╔════════════════════════════════════════════════════════════════');
      _logger.d('║ ✅ RESPONSE');
      _logger.d('╠════════════════════════════════════════════════════════════════');
      _logger.d('║ Status Code: ${response.statusCode}');
      _logger.d('║ URL: ${response.requestOptions.uri}');

      if (response.headers.map.isNotEmpty) {
        _logger.d('║ Headers:');
        response.headers.map.forEach((key, value) {
          _logger.d('║   $key: ${value.join(', ')}');
        });
      }

      if (response.data != null) {
        _logger.d('║ Body:');
        _logger.d('║ ${_formatData(response.data)}');
      }

      _logger.d('╚════════════════════════════════════════════════════════════════');
      _logger.d('');
    }

    return handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (_env.isDevelopment) {
      _logger.e('');
      _logger.e('╔════════════════════════════════════════════════════════════════');
      _logger.e('║ ❌ ERROR');
      _logger.e('╠════════════════════════════════════════════════════════════════');
      _logger.e('║ Type: ${err.type}');
      _logger.e('║ Message: ${err.message}');
      _logger.e('║ URL: ${err.requestOptions.uri}');

      if (err.response != null) {
        _logger.e('║ Status Code: ${err.response?.statusCode}');
        _logger.e('║ Response:');
        _logger.e('║ ${_formatData(err.response?.data)}');
      }

      if (err.stackTrace != null) {
        _logger.e('║ Stack Trace:');
        _logger.e('║ ${err.stackTrace}');
      }

      _logger.e('╚════════════════════════════════════════════════════════════════');
      _logger.e('');
    }

    return handler.next(err);
  }

  /// Formate les données pour l'affichage
  String _formatData(dynamic data) {
    if (data == null) return 'null';

    try {
      // Si c'est un FormData, afficher les champs
      if (data is FormData) {
        final fields = data.fields.map((e) => '${e.key}: ${e.value}').join(', ');
        final files = data.files.map((e) => '${e.key}: ${e.value.filename}').join(', ');
        return 'FormData(fields: [$fields], files: [$files])';
      }

      // Si c'est une Map, formatter en JSON
      if (data is Map) {
        // Masquer les champs sensibles
        final sanitized = Map<String, dynamic>.from(data);
        _sanitizeSensitiveData(sanitized);
        return sanitized.toString();
      }

      return data.toString();
    } catch (e) {
      return data.toString();
    }
  }

  /// Masque les données sensibles (mots de passe, tokens, etc.)
  void _sanitizeSensitiveData(Map<String, dynamic> data) {
    final sensitiveKeys = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'otp',
      'pin',
    ];

    data.forEach((key, value) {
      if (sensitiveKeys.any((k) => key.toLowerCase().contains(k))) {
        data[key] = '***';
      } else if (value is Map<String, dynamic>) {
        _sanitizeSensitiveData(value);
      }
    });
  }
}
