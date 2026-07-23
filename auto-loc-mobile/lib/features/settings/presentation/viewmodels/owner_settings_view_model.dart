import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/session_service.dart' as session_service;
import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../auth/domain/usecases/switch_role.dart';
import '../../../user/domain/entities/user.dart';
import '../../../user/domain/usecases/delete_avatar.dart';
import '../../../user/domain/usecases/get_profile.dart';
import '../../../user/domain/usecases/update_profile.dart';
import '../../../user/domain/usecases/upload_avatar.dart';
import '../../../user/presentation/providers/user_profile_provider.dart';

/// **OwnerSettingsViewModel**
///
/// Gère la logique de l'écran des paramètres propriétaire (Owner).
/// Permet de consulter les informations du profil, de mettre à jour
/// l'identité et l'avatar, et de basculer d'espace (Mode locataire).
///
/// **IMPORTANT:** Ce ViewModel invalide le cache userProfileProvider
/// après chaque modification pour garder tout synchronisé.
class OwnerSettingsViewModel extends BaseViewModel<session_service.UserSession?> {
  OwnerSettingsViewModel({
    required GetProfile getProfile,
    required UpdateProfile updateProfile,
    required UploadAvatar uploadAvatar,
    required DeleteAvatar deleteAvatar,
    required SwitchRole switchRole,
    required session_service.SessionService sessionService,
    required Ref ref,
  })  : _getProfile = getProfile,
        _updateProfile = updateProfile,
        _uploadAvatar = uploadAvatar,
        _deleteAvatar = deleteAvatar,
        _switchRole = switchRole,
        _sessionService = sessionService,
        _ref = ref,
        super();

  final GetProfile _getProfile;
  final UpdateProfile _updateProfile;
  final UploadAvatar _uploadAvatar;
  final DeleteAvatar _deleteAvatar;
  final SwitchRole _switchRole;
  final session_service.SessionService _sessionService;
  final Ref _ref;

  @override
  Future<void> load() async {
    state = const ViewState.loading();
    await loadProfile();
  }

  /// Charge et synchronise le profil utilisateur avec l'API
  Future<void> loadProfile() async {
    final currentSession = _sessionService.currentSession;
    if (currentSession == null) {
      state = const ViewState.empty(message: 'Propriétaire non connecté');
      return;
    }

    final result = await _getProfile();

    await result.fold(
      (failure) {
        // En cas d'erreur de chargement API, on garde la session locale en fallback
        state = ViewState.success(currentSession);
        showWarning('Impossible de synchroniser avec le serveur: ${failure.message}');
      },
      (user) async {
        final updatedSession = _mapUserToSession(user, currentSession);
        await _sessionService.updateSession(updatedSession);
        state = ViewState.success(updatedSession);
      },
    );
  }

  /// Met à jour les informations d'identité
  Future<void> updateIdentity({
    String? prenom,
    String? nom,
    DateTime? dateNaissance,
  }) async {
    final currentSession = _sessionService.currentSession;
    if (currentSession == null) return;

    state = ViewState.refreshing(currentSession);

    final result = await _updateProfile(UpdateProfileParams(
      prenom: prenom ?? currentSession.prenom,
      nom: nom ?? currentSession.nom,
      dateNaissance: dateNaissance ?? currentSession.dateNaissance,
    ));

    await result.fold(
      (failure) {
        state = ViewState.success(currentSession);
        showError(failure.message);
      },
      (user) async {
        final updatedSession = _mapUserToSession(user, currentSession);
        await _sessionService.updateSession(updatedSession);
        state = ViewState.success(updatedSession);

        // Invalider le cache pour forcer un refresh
        _ref.read(userProfileProvider.notifier).refresh();

        showSuccess('Profil mis à jour avec succès');
      },
    );
  }

  /// Upload de la photo de profil
  Future<void> uploadAvatar(String imagePath) async {
    final currentSession = _sessionService.currentSession;
    if (currentSession == null) return;

    state = ViewState.refreshing(currentSession);

    final result = await _uploadAvatar(imagePath);

    await result.fold(
      (failure) {
        state = ViewState.success(currentSession);
        showError(failure.message);
      },
      (avatarUrl) async {
        final updatedSession = currentSession.copyWith(avatarUrl: avatarUrl);
        await _sessionService.updateSession(updatedSession);
        state = ViewState.success(updatedSession);

        // Invalider le cache pour forcer un refresh
        _ref.read(userProfileProvider.notifier).refresh();

        showSuccess('Photo de profil mise à jour');
      },
    );
  }

  /// Suppression de la photo de profil
  Future<void> deleteAvatar() async {
    final currentSession = _sessionService.currentSession;
    if (currentSession == null) return;

    state = ViewState.refreshing(currentSession);

    final result = await _deleteAvatar();

    await result.fold(
      (failure) {
        state = ViewState.success(currentSession);
        showError(failure.message);
      },
      (_) async {
        final updatedSession = currentSession.copyWith(avatarUrl: null);
        await _sessionService.updateSession(updatedSession);
        state = ViewState.success(updatedSession);

        // Invalider le cache pour forcer un refresh
        _ref.read(userProfileProvider.notifier).refresh();

        showSuccess('Photo de profil supprimée');
      },
    );
  }

  /// Change l'espace de travail (Mode propriétaire <=> Mode locataire)
  Future<void> switchWorkspace(session_service.UserRole targetRole) async {
    final currentSession = _sessionService.currentSession;
    if (currentSession == null) return;

    state = ViewState.refreshing(currentSession);

    final roleStr = targetRole == session_service.UserRole.owner ? 'PROPRIETAIRE' : 'LOCATAIRE';
    final result = await _switchRole(role: roleStr);

    await result.fold(
      (failure) {
        state = ViewState.success(currentSession);
        showError(failure.message);
      },
      (authUser) async {
        final sessionData = session_service.UserSession(
          userId: authUser.userId,
          email: authUser.email,
          phone: authUser.telephone,
          role: _mapRoleProfileToUserRole(authUser.role),
          accessToken: authUser.accessToken ?? currentSession.accessToken,
          refreshToken: authUser.refreshToken ?? currentSession.refreshToken,
          profileCompleted: authUser.hasUtilisateur,
          phoneVerified: authUser.phoneVerified,
          kycStatus: _mapKycStatus(authUser.statutKyc),
          prenom: authUser.prenom,
          nom: authUser.nom,
          avatarUrl: authUser.avatarUrl,
          dateNaissance: authUser.dateNaissance,
        );
        
        await _sessionService.startSession(sessionData);
        state = ViewState.success(sessionData);

        showSuccess('Changement d\'espace réussi');
        if (targetRole == session_service.UserRole.owner) {
          emitEffect(const ViewEffect.navigateReplace('/owner/dashboard'));
        } else {
          emitEffect(const ViewEffect.navigateReplace('/home'));
        }
      },
    );
  }

  // ===========================================================================
  // MAPPERS HELPERS
  // ===========================================================================

  session_service.UserSession _mapUserToSession(
    User user,
    session_service.UserSession current,
  ) {
    return current.copyWith(
      prenom: user.prenom,
      nom: user.nom,
      avatarUrl: user.avatarUrl,
      dateNaissance: user.dateNaissance,
      email: user.email,
      phone: user.telephone,
      phoneVerified: user.phoneVerified,
      profileCompleted: user.profileCompleted,
      kycStatus: _mapKycStatus(user.statutKyc),
      hasPermis: user.permisUrl != null,
    );
  }

  session_service.UserRole _mapRoleProfileToUserRole(dynamic roleProfile) {
    final roleStr = roleProfile.toString().toUpperCase();
    if (roleStr.contains('OWNER') || roleStr.contains('PROPRIETAIRE')) {
      return session_service.UserRole.owner;
    } else if (roleStr.contains('ADMIN')) {
      return session_service.UserRole.admin;
    }
    return session_service.UserRole.tenant;
  }

  session_service.KycStatus _mapKycStatus(dynamic kycStatus) {
    if (kycStatus == null) return session_service.KycStatus.notVerified;

    final statusStr = kycStatus.toString();
    if (statusStr.contains('verified') || statusStr.contains('VERIFIE')) {
      return session_service.KycStatus.verified;
    } else if (statusStr.contains('pending') || statusStr.contains('EN_ATTENTE')) {
      return session_service.KycStatus.pending;
    } else if (statusStr.contains('rejected') || statusStr.contains('REJETE')) {
      return session_service.KycStatus.rejected;
    }
    return session_service.KycStatus.notVerified;
  }
}
