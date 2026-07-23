import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/auth_user.dart';

part 'auth_state.freezed.dart';

/// Auth State following ViewState<T> pattern
///
/// Utilisé pour les écrans de login/register.
/// Le succès contient l'AuthUser authentifié.
typedef AuthState = ViewState<AuthUser>;

/// Phone Login State
///
/// État pour le formulaire de saisie du numéro de téléphone.
@freezed
class PhoneLoginFormState with _$PhoneLoginFormState {
  const factory PhoneLoginFormState({
    @Default('') String phone,
    @Default(false) bool isPhoneValid,
    @Default(false) bool agreedToTerms,
  }) = _PhoneLoginFormState;

  const PhoneLoginFormState._();

  bool get canSubmit => isPhoneValid && agreedToTerms;
}

/// OTP Verification State
///
/// État pour la vérification du code OTP.
@freezed
class OtpVerificationFormState with _$OtpVerificationFormState {
  const factory OtpVerificationFormState({
    @Default('') String code,
    @Default(0) int expiresIn, // secondes restantes
    @Default(false) bool canResend,
  }) = _OtpVerificationFormState;

  const OtpVerificationFormState._();

  bool get canSubmit => code.length == 6;

  bool get hasExpired => expiresIn <= 0;
}

/// Register Form State
///
/// État pour le formulaire d'inscription complet (aligné sur frontend).
@freezed
class RegisterFormState with _$RegisterFormState {
  const factory RegisterFormState({
    // Informations personnelles
    @Default('') String prenom,
    @Default('') String nom,

    // Contact
    @Default('') String phone,
    @Default(false) bool isPhoneValid,
    @Default('') String email,
    @Default(false) bool isEmailValid,
    @Default('') String password,
    @Default(false) bool isPasswordValid,

    // CGU
    @Default(false) bool agreedToTerms,

    // Validation
    @Default(false) bool isPrenomValid,
    @Default(false) bool isNomValid,
  }) = _RegisterFormState;

  const RegisterFormState._();

  bool get canSubmit =>
      isPrenomValid &&
      isNomValid &&
      isPhoneValid &&
      isEmailValid &&
      isPasswordValid &&
      agreedToTerms;
}
