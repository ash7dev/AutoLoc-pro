import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState, AuthUser;

import '../../../../core/services/session_service.dart' as session;
import '../../../../core/services/supabase_service.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/providers/session_providers.dart';
import '../../di/auth_injection.dart';
import '../../domain/entities/auth_user.dart';
import '../effects/auth_effect.dart';
import '../states/auth_state.dart' as auth_states;
import '../viewmodels/phone_login_viewmodel.dart';
import '../viewmodels/register_viewmodel.dart';
import '../viewmodels/google_auth_viewmodel.dart';

// =============================================================================
// SUPABASE SERVICE
// =============================================================================

/// Provider pour SupabaseService
final supabaseServiceProvider = Provider<SupabaseService>((ref) {
  return SupabaseService(Supabase.instance.client);
});

// =============================================================================
// PHONE LOGIN VIEWMODEL
// =============================================================================

/// Provider pour PhoneLoginViewModel
final phoneLoginViewModelProvider =
    StateNotifierProvider.autoDispose<PhoneLoginViewModel, ViewState<AuthUser>>((ref) {
  final sendPhoneLoginOtp = ref.watch(sendPhoneLoginOtpUseCaseProvider);
  final verifyPhoneLoginOtp = ref.watch(verifyPhoneLoginOtpUseCaseProvider);
  final sessionService = ref.watch(sessionServiceProvider);

  return PhoneLoginViewModel(
    sendPhoneLoginOtp: sendPhoneLoginOtp,
    verifyPhoneLoginOtp: verifyPhoneLoginOtp,
    sessionService: sessionService,
  );
});

/// StateNotifier pour l'état du formulaire de téléphone
class PhoneLoginFormStateNotifier extends StateNotifier<auth_states.PhoneLoginFormState> {
  PhoneLoginFormStateNotifier() : super(const auth_states.PhoneLoginFormState());

  void updatePhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final isValid = cleaned.startsWith('+') && cleaned.length >= 10;
    state = state.copyWith(
      phone: cleaned,
      isPhoneValid: isValid,
    );
  }

  void toggleTermsAgreement() {
    state = state.copyWith(agreedToTerms: !state.agreedToTerms);
  }
}

/// Provider pour le StateNotifier du formulaire de téléphone
final phoneLoginFormStateNotifierProvider =
    StateNotifierProvider.autoDispose<PhoneLoginFormStateNotifier, auth_states.PhoneLoginFormState>((ref) {
  return PhoneLoginFormStateNotifier();
});

/// Provider pour l'état du formulaire OTP (login flow)
final phoneOtpFormStateProvider =
    Provider.autoDispose<auth_states.OtpVerificationFormState>((ref) {
  final viewModel = ref.watch(phoneLoginViewModelProvider.notifier);
  return viewModel.otpFormState;
});

/// Provider pour l'état du formulaire OTP (register flow)
final registerOtpFormStateProvider =
    Provider.autoDispose<auth_states.OtpVerificationFormState>((ref) {
  final viewModel = ref.watch(registerViewModelProvider.notifier);
  return viewModel.otpFormState;
});

// Note: Les effects sont accessibles directement via viewModel.effects
// Pas besoin de provider dédié

// =============================================================================
// REGISTER VIEWMODEL
// =============================================================================

/// Provider pour RegisterViewModel
final registerViewModelProvider =
    StateNotifierProvider.autoDispose<RegisterViewModel, ViewState<AuthUser>>((ref) {
  final checkAvailability = ref.watch(checkAvailabilityUseCaseProvider);
  final completeProfile = ref.watch(completeProfileUseCaseProvider);
  final loginWithSupabase = ref.watch(loginWithSupabaseUseCaseProvider);
  final sessionService = ref.watch(sessionServiceProvider);
  final supabaseService = ref.watch(supabaseServiceProvider);

  return RegisterViewModel(
    checkAvailability: checkAvailability,
    completeProfile: completeProfile,
    loginWithSupabase: loginWithSupabase,
    sessionService: sessionService,
    supabaseService: supabaseService,
  );
});

/// Provider pour l'état du formulaire de register
final registerFormStateProvider = Provider.autoDispose<auth_states.RegisterFormState>((ref) {
  final viewModel = ref.watch(registerViewModelProvider.notifier);
  return viewModel.registerFormState;
});

// Note: Les effects sont accessibles directement via viewModel.effects

// =============================================================================
// GOOGLE OAUTH VIEWMODEL
// =============================================================================

/// Provider pour GoogleAuthViewModel
final googleAuthViewModelProvider =
    StateNotifierProvider.autoDispose<GoogleAuthViewModel, ViewState<AuthUser>>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  final loginWithSupabase = ref.watch(loginWithSupabaseUseCaseProvider);
  final sessionService = ref.watch(sessionServiceProvider);

  return GoogleAuthViewModel(
    supabaseService: supabaseService,
    loginWithSupabase: loginWithSupabase,
    sessionService: sessionService,
  );
});

// Note: Les effects sont accessibles directement via viewModel.effects

// =============================================================================
// INITIALIZATION
// =============================================================================

/// Provider pour initialiser le SessionService au démarrage de l'app
final sessionInitializerProvider = FutureProvider<void>((ref) async {
  final sessionService = ref.watch(sessionServiceProvider);
  await sessionService.initialize();
});
