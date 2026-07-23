import 'dart:async';

import 'package:supabase_flutter/supabase_flutter.dart' show OtpType;

import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../core/services/session_service.dart' as session;
import '../../../../core/services/supabase_service.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/usecases/check_availability.dart';
import '../../domain/usecases/complete_profile.dart';
import '../../domain/usecases/login_with_supabase.dart';
import '../effects/auth_effect.dart';
import '../states/auth_state.dart';

/// RegisterViewModel
///
/// Gère le flow d'inscription (aligné sur frontend):
/// 1. Saisie des informations (prenom, nom, email, password, phone)
/// 2. Vérification de disponibilité (email + phone)
/// 3. Supabase signUp
/// 4. Email OTP verification
/// 5. Complete profile
/// 6. Démarrage de la session
class RegisterViewModel extends BaseViewModel<AuthUser> {
  final CheckAvailability _checkAvailability;
  final CompleteProfile _completeProfile;
  final LoginWithSupabase _loginWithSupabase;
  final session.SessionService _sessionService;
  final SupabaseService _supabaseService;

  // Form state
  RegisterFormState _registerFormState = const RegisterFormState();
  RegisterFormState get registerFormState => _registerFormState;

  // OTP state
  OtpVerificationFormState _otpFormState = const OtpVerificationFormState();
  OtpVerificationFormState get otpFormState => _otpFormState;

  RegisterViewModel({
    required CheckAvailability checkAvailability,
    required CompleteProfile completeProfile,
    required LoginWithSupabase loginWithSupabase,
    required session.SessionService sessionService,
    required SupabaseService supabaseService,
  })  : _checkAvailability = checkAvailability,
        _completeProfile = completeProfile,
        _loginWithSupabase = loginWithSupabase,
        _sessionService = sessionService,
        _supabaseService = supabaseService,
        super();

  @override
  Future<void> load() async {
    // Pas de chargement initial pour le register
    // state = const ViewState.initial();
  }

  // ===========================================================================
  // FORM FIELDS
  // ===========================================================================

  /// Met à jour le prénom
  void updatePrenom(String prenom) {
    final isValid = prenom.trim().length >= 2;
    _registerFormState = _registerFormState.copyWith(
      prenom: prenom,
      isPrenomValid: isValid,
    );
    // notifyListeners(); // StateNotifier n'a pas notifyListeners
  }

  /// Met à jour le nom
  void updateNom(String nom) {
    final isValid = nom.trim().length >= 2;
    _registerFormState = _registerFormState.copyWith(
      nom: nom,
      isNomValid: isValid,
    );
    // notifyListeners();
  }

  /// Met à jour le numéro de téléphone
  void updatePhone(String phone) {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    final cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');

    // Validation simple: doit commencer par + et avoir au moins 10 chiffres
    final isValid = cleaned.startsWith('+') && cleaned.length >= 10;

    _registerFormState = _registerFormState.copyWith(
      phone: cleaned,
      isPhoneValid: isValid,
    );
    // notifyListeners();
  }

  /// Met à jour l'email
  void updateEmail(String email) {
    // Validation simple de l'email
    final isValid = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);

    _registerFormState = _registerFormState.copyWith(
      email: email,
      isEmailValid: isValid,
    );
  }

  /// Met à jour le mot de passe
  void updatePassword(String password) {
    // Validation: au moins 8 caractères
    final isValid = password.length >= 8;

    _registerFormState = _registerFormState.copyWith(
      password: password,
      isPasswordValid: isValid,
    );
    // notifyListeners();
  }

  /// Toggle acceptation des CGU
  void toggleTermsAgreement() {
    _registerFormState = _registerFormState.copyWith(
      agreedToTerms: !_registerFormState.agreedToTerms,
    );
    // notifyListeners();
  }

  // ===========================================================================
  // REGISTRATION FLOW
  // ===========================================================================

  /// Vérifie la disponibilité puis enregistre via Supabase
  Future<void> register() async {
    if (!_registerFormState.canSubmit) return;

    state = const ViewState.loading();

    // 1. Vérifier disponibilité (email + phone)
    final result = await _checkAvailability(
      email: _registerFormState.email,
      phone: _registerFormState.phone,
    );

    result.fold(
      (failure) {
        state = ViewState.failure(failure.message);
        emitEffect(AuthEffect.showError(failure.message));
      },
      (isAvailable) async {
        if (!isAvailable) {
          state = const ViewState.failure('Email ou téléphone déjà utilisé');
          emitEffect(const AuthEffect.showError(
            'Email ou téléphone déjà utilisé',
          ));
          return;
        }

        // 2. Disponible, procéder au Supabase signUp
        await _performSupabaseSignUp();
      },
    );
  }

  /// Effectue le Supabase signUp
  Future<void> _performSupabaseSignUp() async {
    final response = await _supabaseService.signUpWithEmail(
      email: _registerFormState.email,
      password: _registerFormState.password,
      data: {
        'prenom': _registerFormState.prenom,
        'nom': _registerFormState.nom,
        'telephone': _registerFormState.phone,
      },
    );

    if (response == null) {
      emitEffect(const AuthEffect.showError('Erreur lors de l\'inscription'));
      return;
    }

    // Si la session est déjà créée (auto-confirm), synchroniser avec backend
    if (response.session != null) {
      await _syncWithBackend(response.session!.accessToken);
    } else {
      // Sinon, naviguer vers la vérification OTP
      emitEffect(AuthEffect.navigateToOtpVerification(
        email: _registerFormState.email,
        expiresIn: 300,
      ));
      emitEffect(const AuthEffect.showOtpSent());
    }
  }

  /// Synchronise avec le backend après Supabase auth
  Future<void> _syncWithBackend(String accessToken) async {
    state = const ViewState.loading();

    final loginResult = await _loginWithSupabase(accessToken: accessToken);

    loginResult.fold(
      (failure) {
        state = ViewState.failure(failure.message);
        emitEffect(AuthEffect.showError(failure.message));
      },
      (authUser) async {
        // Compléter le profil
        final completeProfileResult = await _completeProfile(
          prenom: _registerFormState.prenom,
          nom: _registerFormState.nom,
          telephone: _registerFormState.phone,
        );

        completeProfileResult.fold(
          (failure) {
            state = ViewState.failure(failure.message);
            emitEffect(AuthEffect.showError(failure.message));
          },
          (completedUser) async {
            state = ViewState.success(completedUser);
            await _startSession(completedUser);
            emitEffect(const AuthEffect.navigateToHome());
            emitEffect(const AuthEffect.showSuccess('Inscription réussie'));
          },
        );
      },
    );
  }

  /// Vérifie le code OTP email et complète l'inscription
  Future<void> verifyEmailOtp(String code) async {
    state = const ViewState.loading();

    try {
      // 1. Vérifier l'OTP avec Supabase
      final response = await _supabaseService.auth.verifyOTP(
        token: code,
        type: OtpType.signup,
        email: _registerFormState.email,
      );

      if (response.session == null) {
        throw Exception('Code OTP invalide ou expiré');
      }

      // 2. Sync avec le backend NestJS
      final result = await _loginWithSupabase(
        accessToken: response.session!.accessToken,
      );

      result.fold(
        (failure) {
          state = ViewState.failure(failure.message);
          emitEffect(AuthEffect.showError(failure.message));
        },
        (authUser) async {
          // 3. Démarrer la session
          await _startSession(authUser);

          // 4. Navigation
          state = ViewState.success(authUser);
          emitEffect(const AuthEffect.navigateToHome());
          emitEffect(const AuthEffect.showSuccess('Inscription réussie'));
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
      emitEffect(AuthEffect.showError(e.toString()));
    }
  }

  /// Renvoie l'OTP email
  Future<void> resendOtp() async {
    state = const ViewState.loading();

    try {
      final success = await _supabaseService.resendEmailOtp(
        email: _registerFormState.email,
        type: OtpType.signup,
      );

      if (success) {
        // state = const ViewState.initial();
        emitEffect(const AuthEffect.showSuccess('Code renvoyé par email'));
      } else {
        state = ViewState.failure('Impossible de renvoyer le code');
        emitEffect(const AuthEffect.showError('Impossible de renvoyer le code'));
      }
    } catch (e) {
      state = ViewState.failure(e.toString());
      emitEffect(AuthEffect.showError(e.toString()));
    }
  }

  // ===========================================================================
  // PHONE OTP METHODS (for phone-based registration)
  // ===========================================================================

  /// Met à jour le code OTP
  void updateOtpCode(String code) {
    _otpFormState = _otpFormState.copyWith(
      code: code,
    );
    // notifyListeners();
  }

  /// Vérifie l'OTP pour l'inscription par téléphone
  Future<void> verifyOtpForRegistration() async {
    if (!_otpFormState.canSubmit) {
      emitEffect(const AuthEffect.showError('Code OTP invalide'));
      return;
    }

    // TODO: Appeler le backend pour vérifier l'OTP
    // Pour l'instant, on simule un succès
    await Future.delayed(const Duration(seconds: 1));

    emitEffect(const AuthEffect.navigateToHome());
    emitEffect(const AuthEffect.showSuccess('Inscription réussie'));
  }

  // ===========================================================================
  // SESSION MANAGEMENT
  // ===========================================================================

  /// Démarre une session utilisateur après registration réussi
  Future<void> _startSession(AuthUser authUser) async {
    final sessionData = session.UserSession(
      userId: authUser.userId,
      email: authUser.email,
      phone: authUser.telephone,
      role: _mapRoleProfileToUserRole(authUser.role),
      accessToken: authUser.accessToken ?? '',
      refreshToken: authUser.refreshToken ?? '',
      profileCompleted: authUser.hasUtilisateur,
      phoneVerified: authUser.phoneVerified,
      kycStatus: _mapKycStatus(authUser.statutKyc),
      prenom: authUser.prenom,
      nom: authUser.nom,
      avatarUrl: authUser.avatarUrl,
      dateNaissance: authUser.dateNaissance,
    );

    await _sessionService.startSession(sessionData);
  }

  /// Map RoleProfile vers UserRole
  session.UserRole _mapRoleProfileToUserRole(dynamic roleProfile) {
    final roleStr = roleProfile.toString().toUpperCase();
    if (roleStr.contains('OWNER') || roleStr.contains('PROPRIETAIRE')) {
      return session.UserRole.owner;
    } else if (roleStr.contains('ADMIN')) {
      return session.UserRole.admin;
    }
    return session.UserRole.tenant;
  }

  /// Map KycStatus entity vers SessionService KycStatus
  session.KycStatus _mapKycStatus(dynamic kycStatus) {
    if (kycStatus == null) return session.KycStatus.notVerified;

    final statusStr = kycStatus.toString();
    if (statusStr.contains('verified') || statusStr.contains('VERIFIE')) {
      return session.KycStatus.verified;
    } else if (statusStr.contains('pending') || statusStr.contains('EN_ATTENTE')) {
      return session.KycStatus.pending;
    } else if (statusStr.contains('rejected') || statusStr.contains('REJETE')) {
      return session.KycStatus.rejected;
    }
    return session.KycStatus.notVerified;
  }
}
