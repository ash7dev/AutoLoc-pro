import 'package:supabase_flutter/supabase_flutter.dart';

/// SupabaseService
///
/// Service pour gérer l'authentification Supabase (Google OAuth, Email, etc.)
class SupabaseService {
  final SupabaseClient _client;

  SupabaseService(this._client);

  /// Client Supabase
  SupabaseClient get client => _client;

  /// Auth client
  GoTrueClient get auth => _client.auth;

  // ===========================================================================
  // GOOGLE OAUTH
  // ===========================================================================

  /// Démarre le flow Google OAuth
  Future<bool> signInWithGoogle() async {
    try {
      final response = await _client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'autoloc://auth-callback',
        authScreenLaunchMode: LaunchMode.externalApplication,
      );

      return response;
    } catch (e) {
      return false;
    }
  }

  // ===========================================================================
  // EMAIL AUTH
  // ===========================================================================

  /// Connexion par email/password
  Future<AuthResponse?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );

      return response;
    } catch (e) {
      return null;
    }
  }

  /// Inscription par email/password
  Future<AuthResponse?> signUpWithEmail({
    required String email,
    required String password,
    Map<String, dynamic>? data,
  }) async {
    try {
      final response = await _client.auth.signUp(
        email: email,
        password: password,
        data: data,
      );

      return response;
    } catch (e) {
      return null;
    }
  }

  /// Renvoie l'OTP email
  Future<bool> resendEmailOtp({
    required String email,
    OtpType type = OtpType.signup,
  }) async {
    try {
      await _client.auth.resend(
        type: type,
        email: email,
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  // ===========================================================================
  // SESSION
  // ===========================================================================

  /// Récupère la session courante
  Future<Session?> getSession() async {
    try {
      return _client.auth.currentSession;
    } catch (e) {
      return null;
    }
  }

  /// Récupère l'utilisateur courant
  User? get currentUser => _client.auth.currentUser;

  /// Stream de changements d'auth state
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  /// Déconnexion
  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  // ===========================================================================
  // TOKENS
  // ===========================================================================

  /// Récupère l'access token Supabase
  Future<String?> getAccessToken() async {
    final session = await getSession();
    return session?.accessToken;
  }

  /// Refresh le token
  Future<AuthResponse?> refreshSession() async {
    try {
      final response = await _client.auth.refreshSession();
      return response;
    } catch (e) {
      return null;
    }
  }
}
