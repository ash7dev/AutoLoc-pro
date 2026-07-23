import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_effect.freezed.dart';

/// Auth Effects
///
/// One-shot events émis pendant le flow d'authentification.
/// AuthEffect est indépendant de ViewEffect car ViewEffect est sealed.
@freezed
class AuthEffect with _$AuthEffect {
  // Navigation
  const factory AuthEffect.navigateToOtpVerification({
    required String email,
    required int expiresIn,
  }) = NavigateToOtpVerification;

  const factory AuthEffect.navigateToCompleteProfile() = NavigateToCompleteProfile;

  const factory AuthEffect.navigateToHome() = NavigateToHome;

  // Messages
  const factory AuthEffect.showError(String message) = ShowErrorMessage;

  const factory AuthEffect.showSuccess(String message) = ShowSuccessMessage;

  const factory AuthEffect.showOtpSent() = ShowOtpSent;

  const factory AuthEffect.showOtpResent() = ShowOtpResent;

  // Actions
  const factory AuthEffect.startOtpTimer(int seconds) = StartOtpTimer;
}
