import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../environment/env.dart';
import '../logging/app_logger.dart';
import '../logging/console_logger.dart';
import '../storage/secure_storage.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/logging_interceptor.dart';
import 'interceptors/retry_interceptor.dart';

/// Client API configuré avec Dio
/// Utilisé par tous les remote datasources
class ApiClient {
  late final Dio _dio;

  ApiClient({
    required Env env,
    required AuthInterceptor authInterceptor,
    required LoggingInterceptor loggingInterceptor,
    required RetryInterceptor retryInterceptor,
  }) {
    _dio = Dio(
      BaseOptions(
        baseUrl: env.apiVersion.isEmpty
            ? env.apiBaseUrl
            : '${env.apiBaseUrl}/${env.apiVersion}',
        connectTimeout: Duration(milliseconds: env.apiTimeout),
        receiveTimeout: Duration(milliseconds: env.apiTimeout),
        sendTimeout: Duration(milliseconds: env.apiTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        validateStatus: (status) {
          // Jeter une exception pour les codes HTTP >= 300
          return status != null && status < 300;
        },
      ),
    );

    // Ordre des interceptors est important :
    // 1. Logging (log la requête avant modification)
    // 2. Auth (ajoute le token)
    // 3. Retry (retry en cas d'erreur)
    _dio.interceptors.addAll([
      loggingInterceptor,
      authInterceptor,
      retryInterceptor,
    ]);
  }

  /// Instance Dio pour les appels directs
  Dio get dio => _dio;

  /// GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// PATCH request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  /// Upload multipart/form-data
  Future<Response<T>> upload<T>(
    String path, {
    required FormData formData,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
  }) {
    return _dio.post<T>(
      path,
      data: formData,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
    );
  }

  /// Download file
  Future<Response> download(
    String urlPath,
    dynamic savePath, {
    ProgressCallback? onReceiveProgress,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    bool deleteOnError = true,
    String lengthHeader = Headers.contentLengthHeader,
    Options? options,
  }) {
    return _dio.download(
      urlPath,
      savePath,
      onReceiveProgress: onReceiveProgress,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      deleteOnError: deleteOnError,
      lengthHeader: lengthHeader,
      options: options,
    );
  }
}

// =============================================================================
// Riverpod Provider
// =============================================================================

/// Provider pour SecureStorage
final secureStorageProvider = Provider<SecureStorage>((ref) {
  return SecureStorage();
});

/// Provider pour AppLogger
final appLoggerProvider = Provider<AppLogger>((ref) {
  return ConsoleLogger();
});

/// Provider pour Env (à configurer dans main.dart)
final envProvider = Provider<Env>((ref) {
  throw UnimplementedError('Env must be overridden in main.dart');
});

/// Provider pour LoggingInterceptor
final loggingInterceptorProvider = Provider<LoggingInterceptor>((ref) {
  final logger = ref.watch(appLoggerProvider);
  final env = ref.watch(envProvider);
  return LoggingInterceptor(
    logger: logger,
    env: env,
  );
});

/// Provider pour RetryInterceptor
final retryInterceptorProvider = Provider<RetryInterceptor>((ref) {
  final logger = ref.watch(appLoggerProvider);
  return RetryInterceptor(
    logger: logger,
  );
});

/// Provider pour ApiClient
final apiClientProvider = Provider<ApiClient>((ref) {
  final env = ref.watch(envProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  final loggingInterceptor = ref.watch(loggingInterceptorProvider);
  final retryInterceptor = ref.watch(retryInterceptorProvider);

  // Créer Dio de base sans auth interceptor
  final dio = Dio(
    BaseOptions(
      baseUrl: env.apiVersion.isEmpty
          ? env.apiBaseUrl
          : '${env.apiBaseUrl}/${env.apiVersion}',
      connectTimeout: Duration(milliseconds: env.apiTimeout),
      receiveTimeout: Duration(milliseconds: env.apiTimeout),
      sendTimeout: Duration(milliseconds: env.apiTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      validateStatus: (status) {
        return status != null && status < 300;
      },
    ),
  );

  // Ajouter logging et retry
  dio.interceptors.addAll([
    loggingInterceptor,
    retryInterceptor,
  ]);

  // Créer l'auth interceptor avec ce Dio
  final authInterceptor = AuthInterceptor(
    secureStorage: secureStorage,
    dio: dio,
  );

  // Ajouter l'auth interceptor en dernier
  dio.interceptors.add(authInterceptor);

  return ApiClient(
    env: env,
    authInterceptor: authInterceptor,
    loggingInterceptor: loggingInterceptor,
    retryInterceptor: retryInterceptor,
  );
});

/// Provider pour Dio (retourne l'instance Dio directement)
/// Utilisé par les DataSources pour les appels API
final dioProvider = Provider<Dio>((ref) {
  return ref.watch(apiClientProvider).dio;
});
