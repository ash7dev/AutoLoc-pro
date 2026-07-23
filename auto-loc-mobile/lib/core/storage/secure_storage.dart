import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/app_constants.dart';

/// Service de stockage sécurisé pour les données sensibles (tokens, PIN...)
/// Utilise flutter_secure_storage qui utilise :
/// - Keychain sur iOS
/// - EncryptedSharedPreferences sur Android
class SecureStorage {
  final FlutterSecureStorage _storage;

  SecureStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
              ),
            );

  // =========================================================================
  // AUTH TOKENS
  // =========================================================================

  /// Sauvegarde le token d'accès
  Future<void> saveAccessToken(String token) async {
    await _storage.write(
      key: AppConstants.accessTokenKey,
      value: token,
    );
  }

  /// Récupère le token d'accès
  Future<String?> getAccessToken() async {
    return await _storage.read(key: AppConstants.accessTokenKey);
  }

  /// Sauvegarde le refresh token
  Future<void> saveRefreshToken(String token) async {
    await _storage.write(
      key: AppConstants.refreshTokenKey,
      value: token,
    );
  }

  /// Récupère le refresh token
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: AppConstants.refreshTokenKey);
  }

  /// Sauvegarde les deux tokens en même temps
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      saveAccessToken(accessToken),
      saveRefreshToken(refreshToken),
    ]);
  }

  /// Supprime tous les tokens
  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: AppConstants.accessTokenKey),
      _storage.delete(key: AppConstants.refreshTokenKey),
      _storage.delete(key: AppConstants.userIdKey),
      _storage.delete(key: AppConstants.userRoleKey),
    ]);
  }

  // =========================================================================
  // USER DATA
  // =========================================================================

  /// Sauvegarde l'ID utilisateur
  Future<void> saveUserId(String userId) async {
    await _storage.write(
      key: AppConstants.userIdKey,
      value: userId,
    );
  }

  /// Récupère l'ID utilisateur
  Future<String?> getUserId() async {
    return await _storage.read(key: AppConstants.userIdKey);
  }

  /// Sauvegarde le rôle utilisateur
  Future<void> saveUserRole(String role) async {
    await _storage.write(
      key: AppConstants.userRoleKey,
      value: role,
    );
  }

  /// Récupère le rôle utilisateur
  Future<String?> getUserRole() async {
    return await _storage.read(key: AppConstants.userRoleKey);
  }

  // =========================================================================
  // BIOMETRIC / PIN
  // =========================================================================

  /// Sauvegarde le PIN (hashé)
  Future<void> savePin(String hashedPin) async {
    await _storage.write(
      key: 'user_pin',
      value: hashedPin,
    );
  }

  /// Récupère le PIN (hashé)
  Future<String?> getPin() async {
    return await _storage.read(key: 'user_pin');
  }

  /// Supprime le PIN
  Future<void> clearPin() async {
    await _storage.delete(key: 'user_pin');
  }

  /// Active/désactive l'auth biométrique
  Future<void> setBiometricEnabled(bool enabled) async {
    await _storage.write(
      key: AppConstants.biometricEnabledKey,
      value: enabled.toString(),
    );
  }

  /// Vérifie si l'auth biométrique est activée
  Future<bool> isBiometricEnabled() async {
    final value = await _storage.read(key: AppConstants.biometricEnabledKey);
    return value == 'true';
  }

  // =========================================================================
  // PAYMENT METHODS
  // =========================================================================

  /// Sauvegarde une méthode de paiement (ex: numéro Wave)
  Future<void> savePaymentMethod(String provider, String identifier) async {
    await _storage.write(
      key: 'payment_$provider',
      value: identifier,
    );
  }

  /// Récupère une méthode de paiement
  Future<String?> getPaymentMethod(String provider) async {
    return await _storage.read(key: 'payment_$provider');
  }

  /// Supprime une méthode de paiement
  Future<void> clearPaymentMethod(String provider) async {
    await _storage.delete(key: 'payment_$provider');
  }

  // =========================================================================
  // UTILITY
  // =========================================================================

  /// Vérifie si l'utilisateur est connecté (a un access token)
  Future<bool> isAuthenticated() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  /// Supprime toutes les données stockées
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  /// Récupère toutes les clés stockées (debug uniquement)
  Future<Map<String, String>> getAll() async {
    return await _storage.readAll();
  }

  /// Écrit une valeur custom
  Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  /// Lit une valeur custom
  Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  /// Supprime une valeur custom
  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }
}
