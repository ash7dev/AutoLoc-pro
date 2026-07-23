import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/services/session_service.dart' as session_service;
import '../../core/di/core_injection.dart';
import '../../shared/enums/user_role.dart';
import '../../shared/enums/kyc_status.dart';
import '../../features/user/presentation/providers/user_profile_provider.dart';

/// Provider pour le SessionService (singleton)
final sessionServiceProvider = Provider<session_service.SessionService>((ref) {
  return CoreInjection.sl<session_service.SessionService>();
});

/// Provider pour le stream de session
final sessionStreamProvider = StreamProvider<session_service.UserSession?>((ref) {
  final sessionService = ref.watch(sessionServiceProvider);
  return sessionService.sessionStream;
});

/// Provider pour savoir si l'utilisateur est authentifié
final isAuthenticatedProvider = Provider<bool>((ref) {
  final session = ref.watch(currentSessionProvider);
  return session != null;
});

/// Provider pour récupérer la session actuelle
final currentSessionProvider = Provider<session_service.UserSession?>((ref) {
  final sessionAsync = ref.watch(sessionStreamProvider);
  final sessionService = ref.watch(sessionServiceProvider);
  return sessionAsync.maybeWhen(
    data: (session) => session,
    orElse: () => sessionService.currentSession,
  );
});

/// Provider pour récupérer l'utilisateur actuel
final currentUserProvider = Provider<String?>((ref) {
  final session = ref.watch(currentSessionProvider);
  return session?.userId;
});

/// Provider pour récupérer le rôle actuel mapped vers le global UserRole
final currentRoleProvider = Provider<UserRole?>((ref) {
  final session = ref.watch(currentSessionProvider);
  if (session == null) return null;
  return switch (session.role) {
    session_service.UserRole.tenant => UserRole.locataire,
    session_service.UserRole.owner => UserRole.proprietaire,
    session_service.UserRole.admin => UserRole.admin,
  };
});

/// Provider pour vérifier si l'utilisateur est propriétaire
final isOwnerProvider = Provider<bool>((ref) {
  final role = ref.watch(currentRoleProvider);
  return role == UserRole.proprietaire;
});

/// Provider pour vérifier si l'utilisateur est locataire
final isTenantProvider = Provider<bool>((ref) {
  final role = ref.watch(currentRoleProvider);
  return role == UserRole.locataire;
});

/// Provider pour vérifier si l'utilisateur peut faire une réservation
final canMakeReservationProvider = Provider<bool>((ref) {
  final session = ref.watch(currentSessionProvider);
  if (session == null) return false;
  return session.profileCompleted &&
      session.phoneVerified &&
      session.hasPermis;
});

/// Provider pour vérifier si l'utilisateur peut créer un véhicule
final canCreateVehicleProvider = Provider<bool>((ref) {
  final session = ref.watch(currentSessionProvider);
  if (session == null) return false;
  return session.role == session_service.UserRole.owner &&
      session.profileCompleted &&
      session.phoneVerified;
});

/// Provider pour vérifier si l'utilisateur peut demander un retrait
final canRequestWithdrawalProvider = Provider<bool>((ref) {
  final session = ref.watch(currentSessionProvider);
  if (session == null) return false;
  return session.role == session_service.UserRole.owner &&
      session.kycStatus == session_service.KycStatus.verified;
});

/// Provider pour récupérer le statut KYC mapped vers le global KycStatus
final kycStatusProvider = Provider<KycStatus?>((ref) {
  final session = ref.watch(currentSessionProvider);
  if (session == null) return null;
  return switch (session.kycStatus) {
    session_service.KycStatus.notVerified => KycStatus.notVerified,
    session_service.KycStatus.pending => KycStatus.pending,
    session_service.KycStatus.verified => KycStatus.verified,
    session_service.KycStatus.rejected => KycStatus.rejected,
  };
});

/// Provider pour vérifier si le KYC est vérifié
final isKycVerifiedProvider = Provider<bool>((ref) {
  final kycStatus = ref.watch(kycStatusProvider);
  return kycStatus == KycStatus.verified;
});

/// Provider pour initialiser le SessionService au démarrage de l'app
/// Charge également le profil utilisateur en cache si connecté
final sessionInitializerProvider = FutureProvider<void>((ref) async {
  final sessionService = ref.watch(sessionServiceProvider);
  await sessionService.initialize();

  // Si l'utilisateur est connecté, charger son profil en cache en arrière-plan
  if (sessionService.isAuthenticated) {
    // ignore: discarded_futures
    ref.read(userProfileProvider.notifier).loadProfile();
  }
});
