import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/session_service.dart' as session_service;
import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/providers/session_providers.dart';
import '../../../auth/di/auth_injection.dart';
import '../../../user/di/user_injection.dart';
import '../viewmodels/owner_settings_view_model.dart';

/// Provider pour OwnerSettingsViewModel
final ownerSettingsViewModelProvider = StateNotifierProvider.autoDispose<
    OwnerSettingsViewModel, ViewState<session_service.UserSession?>>((ref) {
  final getProfile = ref.watch(getProfileProvider);
  final updateProfile = ref.watch(updateProfileProvider);
  final uploadAvatar = ref.watch(uploadAvatarProvider);
  final deleteAvatar = ref.watch(deleteAvatarProvider);
  final switchRole = ref.watch(switchRoleUseCaseProvider);
  final sessionService = ref.watch(sessionServiceProvider);

  return OwnerSettingsViewModel(
    getProfile: getProfile,
    updateProfile: updateProfile,
    uploadAvatar: uploadAvatar,
    deleteAvatar: deleteAvatar,
    switchRole: switchRole,
    sessionService: sessionService,
    ref: ref,
  );
});

/// Stream d'effects pour les paramètres propriétaire
final ownerSettingsEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(ownerSettingsViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});
