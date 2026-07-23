import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/datasources/auth_remote_datasource.dart';
import '../data/repositories/auth_repository_impl.dart';
import '../domain/repositories/auth_repository.dart';
import '../domain/usecases/check_availability.dart';
import '../domain/usecases/get_profile.dart';
import '../domain/usecases/logout.dart';
import '../domain/usecases/login_with_supabase.dart';
import '../domain/usecases/refresh_token.dart';
import '../domain/usecases/complete_profile.dart';
import '../domain/usecases/switch_role.dart';
import '../domain/usecases/send_phone_otp.dart';
import '../domain/usecases/update_phone.dart';
import '../domain/usecases/verify_phone_otp.dart';
import '../domain/usecases/send_phone_login_otp.dart';
import '../domain/usecases/verify_phone_login_otp.dart';

// =============================================================================
// DATA LAYER - DataSources
// =============================================================================

/// Provider pour AuthRemoteDataSource
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthRemoteDataSourceImpl(dio);
});

// =============================================================================
// DATA LAYER - Repository Implementation
// =============================================================================

/// Provider pour AuthRepository (implémentation)
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final remoteDataSource = ref.watch(authRemoteDataSourceProvider);
  return AuthRepositoryImpl(remoteDataSource);
});

// =============================================================================
// DOMAIN LAYER - UseCases
// =============================================================================

/// Provider pour CheckAvailability UseCase
final checkAvailabilityUseCaseProvider = Provider<CheckAvailability>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return CheckAvailability(repository);
});

/// Provider pour GetProfile UseCase
final getProfileUseCaseProvider = Provider<GetProfile>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return GetProfile(repository);
});

/// Provider pour Logout UseCase
final logoutUseCaseProvider = Provider<Logout>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return Logout(repository);
});

/// Provider pour LoginWithSupabase UseCase
final loginWithSupabaseUseCaseProvider = Provider<LoginWithSupabase>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return LoginWithSupabase(repository);
});

/// Provider pour RefreshToken UseCase
final refreshTokenUseCaseProvider = Provider<RefreshToken>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return RefreshToken(repository);
});

/// Provider pour CompleteProfile UseCase
final completeProfileUseCaseProvider = Provider<CompleteProfile>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return CompleteProfile(repository);
});

/// Provider pour SwitchRole UseCase
final switchRoleUseCaseProvider = Provider<SwitchRole>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return SwitchRole(repository);
});

/// Provider pour SendPhoneOtp UseCase
final sendPhoneOtpUseCaseProvider = Provider<SendPhoneOtp>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return SendPhoneOtp(repository);
});

/// Provider pour UpdatePhone UseCase
final updatePhoneUseCaseProvider = Provider<UpdatePhone>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return UpdatePhone(repository);
});

/// Provider pour VerifyPhoneOtp UseCase
final verifyPhoneOtpUseCaseProvider = Provider<VerifyPhoneOtp>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return VerifyPhoneOtp(repository);
});

/// Provider pour SendPhoneLoginOtp UseCase
final sendPhoneLoginOtpUseCaseProvider = Provider<SendPhoneLoginOtp>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return SendPhoneLoginOtp(repository);
});

/// Provider pour VerifyPhoneLoginOtp UseCase
final verifyPhoneLoginOtpUseCaseProvider = Provider<VerifyPhoneLoginOtp>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return VerifyPhoneLoginOtp(repository);
});
