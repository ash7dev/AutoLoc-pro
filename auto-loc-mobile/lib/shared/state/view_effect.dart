/// View Effect
/// Événements one-shot pour les side-effects (navigation, snackbars, dialogs...)
///
/// Pattern: Les effects sont séparés des states pour éviter les rebuilds inutiles
///
/// Usage dans un ViewModel:
/// ```dart
/// class LoginViewModel extends StateNotifier<LoginState> {
///   final _effectController = StreamController<LoginEffect>();
///   Stream<LoginEffect> get effects => _effectController.stream;
///
///   void _emitEffect(LoginEffect effect) {
///     _effectController.add(effect);
///   }
///
///   Future<void> login(String email, String password) async {
///     state = const LoginState.loading();
///
///     final result = await _authRepository.login(email, password);
///
///     result.fold(
///       (failure) {
///         state = LoginState.failure(failure);
///         _emitEffect(LoginEffect.showError(failure.displayMessage));
///       },
///       (session) {
///         state = LoginState.success(session);
///         _emitEffect(const LoginEffect.navigateToHome());
///       },
///     );
///   }
/// }
/// ```
///
/// Usage dans un Widget:
/// ```dart
/// @override
/// void initState() {
///   super.initState();
///   _effectsSubscription = ref.read(loginViewModelProvider.notifier)
///     .effects.listen((effect) {
///       effect.when(
///         showError: (message) => _showSnackbar(message),
///         navigateToHome: () => context.go(Routes.home),
///       );
///     });
/// }
/// ```

/// Base class pour les effects
/// Tous les effects de features doivent implémenter cette classe
abstract class ViewEffect {
  const ViewEffect();
}

/// Effect pour afficher un message (snackbar, toast)
class ShowMessageEffect extends ViewEffect {
  const ShowMessageEffect(this.message, {this.isError = false});

  final String message;
  final bool isError;
}

/// Effect pour afficher une erreur
class ShowErrorEffect extends ViewEffect {
  const ShowErrorEffect(this.message);

  final String message;
}

/// Effect pour afficher un succès
class ShowSuccessEffect extends ViewEffect {
  const ShowSuccessEffect(this.message);

  final String message;
}

/// Effect pour naviguer vers une route
class NavigateToEffect extends ViewEffect {
  const NavigateToEffect(this.route);

  final String route;
}

/// Effect pour naviguer en arrière
class NavigateBackEffect extends ViewEffect {
  const NavigateBackEffect();
}

/// Effect pour remplacer la route actuelle
class ReplaceWithEffect extends ViewEffect {
  const ReplaceWithEffect(this.route);

  final String route;
}

/// Effect pour afficher un dialog
class ShowDialogEffect extends ViewEffect {
  const ShowDialogEffect({
    required this.title,
    required this.message,
    this.confirmLabel,
    this.cancelLabel,
  });

  final String title;
  final String message;
  final String? confirmLabel;
  final String? cancelLabel;
}

/// Effect pour afficher un bottom sheet
class ShowBottomSheetEffect extends ViewEffect {
  const ShowBottomSheetEffect();
}

/// Effect pour demander une permission
class RequestPermissionEffect extends ViewEffect {
  const RequestPermissionEffect(this.permission);

  final String permission;
}
