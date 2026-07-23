import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';

import '../../storage/secure_storage.dart';
import '../../constants/api_endpoints.dart';
import '../../navigation/routes.dart';

/// Interceptor pour l'authentification
/// - Injecte le token JWT dans les headers
/// - Refresh automatique du token si 401
/// - Redirige vers l'écran de session expirée si impossible de refresh
class AuthInterceptor extends Interceptor {
  final SecureStorage _secureStorage;
  final Dio _dio;
  GoRouter? _router;

  // Flag pour éviter les boucles infinies lors du refresh
  bool _isRefreshing = false;
  final List<RequestOptions> _requestsQueue = [];

  AuthInterceptor({
    required SecureStorage secureStorage,
    required Dio dio,
  })  : _secureStorage = secureStorage,
        _dio = dio;

  /// Définit le router (appelé après la création du GoRouter)
  void setRouter(GoRouter router) {
    _router = router;
  }

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Ne pas ajouter le token pour les routes publiques
    if (_isPublicRoute(options)) {
      return handler.next(options);
    }

    // Récupérer le token
    final token = await _secureStorage.getAccessToken();

    if (token != null) {
      // Ajouter le token dans les headers
      options.headers['Authorization'] = 'Bearer $token';
    }

    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // Si erreur 401 (Unauthorized) et qu'on n'est pas déjà en train de refresh
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      // Vérifier qu'on n'est pas déjà sur la route de refresh
      if (err.requestOptions.path.contains(ApiEndpoints.refreshToken)) {
        // Le refresh token est invalide, on ne peut plus se reconnecter
        await _handleSessionExpired(type: 'invalid');
        return handler.next(err);
      }

      // Tenter de refresh le token
      final refreshed = await _refreshToken();

      if (refreshed) {
        // Retry la requête originale avec le nouveau token
        final response = await _retryRequest(err.requestOptions);
        return handler.resolve(response);
      } else {
        // Impossible de refresh, session expirée
        await _handleSessionExpired(type: 'expired');
        return handler.next(err);
      }
    }

    return handler.next(err);
  }

  /// Vérifie si la route est publique (ne nécessite pas de token)
  bool _isPublicRoute(RequestOptions options) {
    final path = options.path;
    final method = options.method.toUpperCase();

    // Les endpoints sous /vehicles/me sont toujours privés (nécessitent le token)
    if (path.contains('/vehicles/me')) {
      return false;
    }

    // Seul le GET d'un détail de véhicule est public
    if (path.contains('/vehicles/') && method != 'GET') {
      return false;
    }

    final publicRoutes = [
      ApiEndpoints.login,
      ApiEndpoints.phoneLoginSendOtp,
      ApiEndpoints.phoneLoginVerifyOtp,
      ApiEndpoints.refreshToken,
      ApiEndpoints.checkAvailability,
      ApiEndpoints.vehiclesSearch,
      ApiEndpoints.vehiclesFeed,
      ApiEndpoints.vehiclesFeedMobile,
      '/vehicles/', // Détail véhicule public
      ApiEndpoints.health,
    ];

    return publicRoutes.any((route) => path.contains(route));
  }

  /// Refresh le token
  Future<bool> _refreshToken() async {
    if (_isRefreshing) {
      // Déjà en train de refresh, attendre
      return false;
    }

    _isRefreshing = true;

    try {
      final refreshToken = await _secureStorage.getRefreshToken();

      if (refreshToken == null) {
        return false;
      }

      // Appeler l'endpoint de refresh
      final response = await _dio.post(
        ApiEndpoints.refreshToken,
        data: {'refreshToken': refreshToken},
        options: Options(
          headers: {'Authorization': null}, // Pas de token pour le refresh
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final newAccessToken = data['accessToken'] as String?;
        final newRefreshToken = data['refreshToken'] as String?;

        if (newAccessToken != null && newRefreshToken != null) {
          // Sauvegarder les nouveaux tokens
          await _secureStorage.saveAccessToken(newAccessToken);
          await _secureStorage.saveRefreshToken(newRefreshToken);

          // Process les requêtes en attente
          await _processQueuedRequests(newAccessToken);

          return true;
        }
      }

      return false;
    } catch (e) {
      return false;
    } finally {
      _isRefreshing = false;
    }
  }

  /// Retry une requête avec le nouveau token
  Future<Response> _retryRequest(RequestOptions requestOptions) async {
    final token = await _secureStorage.getAccessToken();

    // Créer une nouvelle requête avec le nouveau token
    final options = Options(
      method: requestOptions.method,
      headers: {
        ...requestOptions.headers,
        'Authorization': 'Bearer $token',
      },
    );

    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  /// Process les requêtes mises en attente pendant le refresh
  Future<void> _processQueuedRequests(String newToken) async {
    for (final request in _requestsQueue) {
      request.headers['Authorization'] = 'Bearer $newToken';
      await _dio.fetch(request);
    }
    _requestsQueue.clear();
  }

  /// Gère l'expiration de la session
  ///
  /// - Nettoie les tokens
  /// - Redirige vers l'écran de session expirée avec le type approprié
  Future<void> _handleSessionExpired({required String type}) async {
    // Nettoyer les tokens
    await _secureStorage.clearTokens();

    // Rediriger vers l'écran de session expirée si le router est disponible
    if (_router != null) {
      // On utilise go() au lieu de push() pour remplacer toute la pile de navigation
      _router!.go(
        Routes.sessionExpired,
        extra: {'type': type},
      );
    }
  }
}
