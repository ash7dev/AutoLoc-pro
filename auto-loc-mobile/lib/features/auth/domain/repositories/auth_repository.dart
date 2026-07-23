import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';

/// Auth Repository Interface (Domain)
///
/// Définit le contrat pour l'authentification.
abstract class AuthRepository {
  /// Vérifie la disponibilité d'un email ou téléphone
  ///
  /// Endpoint: GET /auth/check-availability
  Future<Result<bool>> checkAvailability({
    String? email,
    String? phone,
  });

  /// Récupère le profil de l'utilisateur connecté
  ///
  /// Endpoint: GET /auth/me
  Future<Result<AuthUser>> getProfile();

  /// Déconnecte l'utilisateur
  ///
  /// Endpoint: POST /auth/logout
  Future<Result<bool>> logout();

  /// Login avec Supabase
  ///
  /// Endpoint: POST /auth/login
  Future<Result<AuthUser>> loginWithSupabase({
    required String accessToken,
  });

  /// Rafraîchit le token
  ///
  /// Endpoint: POST /auth/refresh
  Future<Result<AuthUser>> refreshToken({
    required String refreshToken,
  });

  /// Complète le profil utilisateur
  ///
  /// Endpoint: POST /auth/complete-profile
  Future<Result<AuthUser>> completeProfile({
    required String prenom,
    required String nom,
    String? telephone,
    DateTime? dateNaissance,
  });

  /// Change le rôle actif (LOCATAIRE ↔ PROPRIETAIRE)
  ///
  /// Endpoint: PATCH /auth/switch-role
  Future<Result<AuthUser>> switchRole({
    required String role,
  });

  /// Envoie un OTP pour vérification téléphone
  ///
  /// Endpoint: POST /auth/phone/send-otp
  Future<Result<int>> sendPhoneOtp();

  /// Met à jour le numéro de téléphone
  ///
  /// Endpoint: POST /auth/phone/update
  Future<Result<AuthUser>> updatePhone({
    required String telephone,
  });

  /// Vérifie le code OTP du téléphone
  ///
  /// Endpoint: POST /auth/phone/verify-otp
  Future<Result<AuthUser>> verifyPhoneOtp({
    required String code,
  });

  /// Envoie un OTP pour login par téléphone (non authentifié)
  ///
  /// Endpoint: POST /auth/phone-login/send-otp
  Future<Result<int>> sendPhoneLoginOtp({
    required String phone,
  });

  /// Vérifie l'OTP et login par téléphone
  ///
  /// Endpoint: POST /auth/phone-login/verify-otp
  Future<Result<AuthUser>> verifyPhoneLoginOtp({
    required String phone,
    required String code,
  });
}
