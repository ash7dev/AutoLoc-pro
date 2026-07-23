import 'package:freezed_annotation/freezed_annotation.dart';

import '../../core/errors/failures.dart';

part 'view_state.freezed.dart';

/// View State
/// État d'une vue (screen) avec états de chargement, succès, erreur
///
/// Usage:
/// ```dart
/// @freezed
/// class LoginState with _$LoginState {
///   const factory LoginState.initial() = _Initial;
///   const factory LoginState.loading() = _Loading;
///   const factory LoginState.success(UserSession session) = _Success;
///   const factory LoginState.failure(Failure failure) = _Failure;
/// }
/// ```
///
/// Ou utilise ViewState<T> directement:
/// ```dart
/// typedef LoginState = ViewState<UserSession>;
/// ```
@freezed
class ViewState<T> with _$ViewState<T> {
  /// État initial (au démarrage)
  const factory ViewState.initial() = _Initial<T>;

  /// État de chargement
  const factory ViewState.loading() = _Loading<T>;

  /// État de succès avec données
  const factory ViewState.success(T data) = _Success<T>;

  /// État d'erreur avec failure
  const factory ViewState.failure(Failure failure) = _Failure<T>;
}

/// Extensions utiles pour ViewState
extension ViewStateX<T> on ViewState<T> {
  /// Vérifie si l'état est initial
  bool get isInitial => this is _Initial<T>;

  /// Vérifie si l'état est en chargement
  bool get isLoading => this is _Loading<T>;

  /// Vérifie si l'état est en succès
  bool get isSuccess => this is _Success<T>;

  /// Vérifie si l'état est en erreur
  bool get isFailure => this is _Failure<T>;

  /// Récupère les données si succès, null sinon
  T? get dataOrNull => maybeWhen(
        success: (data) => data,
        orElse: () => null,
      );

  /// Récupère le failure si erreur, null sinon
  Failure? get failureOrNull => maybeWhen(
        failure: (failure) => failure,
        orElse: () => null,
      );
}
