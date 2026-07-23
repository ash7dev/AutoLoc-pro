import 'dart:async';

import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../core/services/session_service.dart' as session;
import '../../domain/entities/auth_user.dart' as auth;
import '../../domain/usecases/send_phone_login_otp.dart';
import '../../domain/usecases/verify_phone_login_otp.dart';
import '../effects/auth_effect.dart';
import '../states/auth_state.dart';

/// PhoneLoginViewModel
///
/// Gère le flow d'authentification par téléphone:
/// 1. Saisie du numéro de téléphone
/// 2. Envoi de l'OTP
/// 3. Vérification de l'OTP
/// 4. Démarrage de la session
class PhoneLoginViewModel extends BaseViewModel<auth.AuthUser> {
  final SendPhoneLoginOtp _sendPhoneLoginOtp;
  final VerifyPhoneLoginOtp _verifyPhoneLoginOtp;
  final session.SessionService _sessionService;

  // Form states
  PhoneLoginFormState _phoneFormState = const PhoneLoginFormState();
  PhoneLoginFormState get phoneFormState => _phoneFormState;

  OtpVerificationFormState _otpFormState = const OtpVerificationFormState();
  OtpVerificationFormState get otpFormState => _otpFormState;

  // OTP Timer
  Timer? _otpTimer;
  String? _currentPhone;

  PhoneLoginViewModel({
    required SendPhoneLoginOtp sendPhoneLoginOtp,
    required VerifyPhoneLoginOtp verifyPhoneLoginOtp,
    required session.SessionService sessionService,
  })  : _sendPhoneLoginOtp = sendPhoneLoginOtp,
        _verifyPhoneLoginOtp = verifyPhoneLoginOtp,
        _sessionService = sessionService,
        super();

  @override
  Future<void> load() async {
    // Pas de chargement initial pour le login
    // state = const ViewState.initial();
  }

  @override
  void dispose() {
    _otpTimer?.cancel();
    super.dispose();
  }

  // ===========================================================================
  // PHONE FORM
  // ===========================================================================

  /// Met à jour le numéro de téléphone
  void updatePhone(String phone) {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    final cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');

    // Validation simple: doit commencer par + et avoir au moins 10 chiffres
    final isValid = cleaned.startsWith('+') && cleaned.length >= 10;

    _phoneFormState = _phoneFormState.copyWith(
      phone: cleaned,
      isPhoneValid: isValid,
    );
    // notifyListeners(); // StateNotifier n'a pas notifyListeners, utiliser state = state si nécessaire
  }

  /// Toggle acceptation des conditions
  void toggleTermsAgreement() {
    _phoneFormState = _phoneFormState.copyWith(
      agreedToTerms: !_phoneFormState.agreedToTerms,
    );
    // notifyListeners(); // StateNotifier n'a pas notifyListeners
  }

  /// Envoie l'OTP au numéro de téléphone
  Future<void> sendOtp(String phone, bool agreedToTerms) async {
    // Validation locale
    final cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final isValid = cleaned.startsWith('+') && cleaned.length >= 10;
    
    if (!isValid || !agreedToTerms) return;

    state = const ViewState.loading();

    try {
      final result = await _sendPhoneLoginOtp(phone: cleaned);

      result.fold(
        (failure) {
          state = ViewState.failure(failure.message);
          emitEffect(AuthEffect.showError(failure.message));
        },
        (expiresIn) {
          state = const ViewState.initial();
          _currentPhone = cleaned;

          // Initialiser l'OTP form state
          _otpFormState = OtpVerificationFormState(
            expiresIn: expiresIn,
            canResend: false,
          );

          // Démarrer le timer
          _startOtpTimer(expiresIn);

          // Émettre l'effet de navigation (email pour register, phone pour login)
          // Pour le login par téléphone, on utilise le phone comme identifiant
          emitEffect(AuthEffect.navigateToOtpVerification(
            email: cleaned, // Utilisé comme identifiant
            expiresIn: expiresIn,
          ));

          emitEffect(const AuthEffect.showOtpSent());
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
      emitEffect(AuthEffect.showError(e.toString()));
    }
  }

  // ===========================================================================
  // OTP VERIFICATION
  // ===========================================================================

  /// Met à jour le code OTP
  void updateOtpCode(String code) {
    _otpFormState = _otpFormState.copyWith(code: code);
    // notifyListeners(); // StateNotifier n'a pas notifyListeners
  }

  /// Vérifie le code OTP et authentifie l'utilisateur
  Future<void> verifyOtp() async {
    if (!_otpFormState.canSubmit || _currentPhone == null) return;

    state = const ViewState.loading();

    try {
      final result = await _verifyPhoneLoginOtp(
        phone: _currentPhone!,
        code: _otpFormState.code,
      );

      await result.fold(
        (failure) {
          state = ViewState.failure(failure.message);
          emitEffect(AuthEffect.showError(failure.message));

          // Reset le code en cas d'erreur
          _otpFormState = _otpFormState.copyWith(code: '');
        },
        (authUser) async {
          state = ViewState.success(authUser);

          // Démarrer la session
          await _startSession(authUser);

          // Vérifier si le profil est complet
          if (!authUser.isProfileComplete) {
            emitEffect(const AuthEffect.navigateToCompleteProfile());
          } else {
            emitEffect(const AuthEffect.navigateToHome());
          }

          emitEffect(const AuthEffect.showSuccess('Connexion réussie'));
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
      emitEffect(AuthEffect.showError(e.toString()));
    }
  }

  /// Renvoie l'OTP
  Future<void> resendOtp() async {
    if (_currentPhone == null || !_otpFormState.canResend) return;

    // Reset le code
    _otpFormState = _otpFormState.copyWith(
      code: '',
      canResend: false,
    );

    state = const ViewState.loading();

    try {
      final result = await _sendPhoneLoginOtp(phone: _currentPhone!);

      result.fold(
        (failure) {
          state = ViewState.failure(failure.message);
          emitEffect(AuthEffect.showError(failure.message));
        },
        (expiresIn) {
          state = const ViewState.initial();
          _otpFormState = _otpFormState.copyWith(
            expiresIn: expiresIn,
            canResend: false,
          );

          _startOtpTimer(expiresIn);

          emitEffect(const AuthEffect.showOtpResent());
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
      emitEffect(AuthEffect.showError(e.toString()));
    }
  }

  // ===========================================================================
  // SESSION MANAGEMENT
  // ===========================================================================

  /// Démarre une session utilisateur après login réussi
  Future<void> _startSession(auth.AuthUser authUser) async {
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

  // ===========================================================================
  // OTP TIMER
  // ===========================================================================

  /// Démarre le timer du code OTP
  void _startOtpTimer(int seconds) {
    _otpTimer?.cancel();

    _otpTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final remaining = _otpFormState.expiresIn - 1;

      if (remaining <= 0) {
        timer.cancel();
        _otpFormState = _otpFormState.copyWith(
          expiresIn: 0,
          canResend: true,
        );
      } else {
        _otpFormState = _otpFormState.copyWith(
          expiresIn: remaining,
          canResend: remaining <= 0,
        );
      }

      // notifyListeners(); // StateNotifier n'a pas notifyListeners
    });
  }
}
