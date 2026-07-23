import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/session_service.dart' as session_service;
import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/providers/session_providers.dart';
import '../../../auth/di/auth_injection.dart';
import '../../../user/di/user_injection.dart';
import '../viewmodels/profile_view_model.dart';

/// Provider pour ProfileViewModel
final profileViewModelProvider = StateNotifierProvider.autoDispose<
    ProfileViewModel, ViewState<session_service.UserSession?>>((ref) {
  final getProfile = ref.watch(getProfileProvider);
  final updateProfile = ref.watch(updateProfileProvider);
  final uploadAvatar = ref.watch(uploadAvatarProvider);
  final deleteAvatar = ref.watch(deleteAvatarProvider);
  final switchRole = ref.watch(switchRoleUseCaseProvider);
  final sessionService = ref.watch(sessionServiceProvider);

  return ProfileViewModel(
    getProfile: getProfile,
    updateProfile: updateProfile,
    uploadAvatar: uploadAvatar,
    deleteAvatar: deleteAvatar,
    switchRole: switchRole,
    sessionService: sessionService,
    ref: ref,
  );
});

/// Stream d'effects pour le profil
final profileEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(profileViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});
