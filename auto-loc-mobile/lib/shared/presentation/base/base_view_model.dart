import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'view_effect.dart';
import 'view_state.dart';

/// **BaseViewModel<T>** - Classe de base pour TOUS les ViewModels
///
/// ## Responsabilités
/// 1. **Gérer le State** - Exposer `ViewState<T>` via Riverpod StateNotifier
/// 2. **Gérer les Effects** - Émettre des `ViewEffect` one-shot via Stream
/// 3. **Lifecycle** - Initialiser (`onInit`) et nettoyer (`dispose`)
/// 4. **Conventions** - Imposer les méthodes obligatoires (`load`, `refresh`, `retry`)
///
/// ## Convention STRICTE
///
/// **TOUS les ViewModels DOIVENT:**
/// 1. Étendre `BaseViewModel<T>` où T est le type de données
/// 2. Implémenter `load()` - Chargement initial (OBLIGATOIRE)
/// 3. Optionnellement surcharger `refresh()` - Pull-to-refresh
/// 4. Optionnellement surcharger `retry()` - Retry après erreur
///
/// ## Règles d'utilisation
///
/// ### ✅ BON PATTERN
/// ```dart
/// class WalletViewModel extends BaseViewModel<WalletData> {
///   WalletViewModel({required this.getWalletUseCase});
///
///   final GetWallet getWalletUseCase;
///
///   @override
///   Future<void> load() async {
///     state = const ViewState.loading();
///
///     final result = await getWalletUseCase();
///
///     result.fold(
///       (failure) => state = ViewState.failure(failure.message),
///       (wallet) => state = ViewState.success(wallet),
///     );
///   }
///
///   Future<void> requestWithdrawal(double amount) async {
///     // ... logic
///     showSuccess('Retrait demandé');
///   }
/// }
/// ```
///
/// ### ❌ MAUVAIS PATTERN
/// ```dart
/// // ❌ N'étend pas BaseViewModel
/// class WalletViewModel extends StateNotifier<WalletState> {
///   // Incohérent avec le reste de l'app!
/// }
///
/// // ❌ N'implémente pas load()
/// class WalletViewModel extends BaseViewModel<WalletData> {
///   // Manque load() - ne compile pas!
/// }
///
/// // ❌ Modifie directement le state (mutabilité)
/// @override
/// Future<void> load() async {
///   state.data = newData; // ❌ State est immutable!
/// }
/// ```
///
/// ## Lifecycle
///
/// ```
/// Constructor
///     ↓
/// onInit() [auto-appelé]
///     ↓
/// load() [auto-appelé par onInit]
///     ↓
/// [User interactions]
///     ↓
/// dispose() [auto-appelé par Riverpod]
/// ```
///
/// ## State Management
///
/// Le ViewModel expose un `ViewState<T>` qui suit ce cycle:
///
/// ```
/// Initial
///     ↓
/// Loading (load())
///     ↓
/// Success / Empty / Failure
///     ↓
/// Refreshing (refresh()) → Success / Empty / Failure
///     ↓
/// Loading (retry()) → Success / Empty / Failure
/// ```
///
/// ## Effect Management
///
/// Les effects sont des événements one-shot émis via un Stream:
///
/// ```dart
/// // Dans le ViewModel
/// emitEffect(ViewEffect.showSnackbar('Succès!'));
///
/// // Dans le Screen
/// listenToEffects(context, walletEffectsProvider);
/// ```
///
/// ## Exemple complet
///
/// ```dart
/// // ViewModel
/// class BookingViewModel extends BaseViewModel<List<Booking>> {
///   BookingViewModel({required this.getMyBookings});
///
///   final GetMyBookings getMyBookings;
///
///   @override
///   Future<void> load() async {
///     state = const ViewState.loading();
///
///     final result = await getMyBookings(page: 1);
///
///     result.fold(
///       (failure) => state = ViewState.failure(failure.message),
///       (bookings) {
///         if (bookings.isEmpty) {
///           state = const ViewState.empty(
///             message: 'Aucune réservation',
///           );
///         } else {
///           state = ViewState.success(bookings);
///         }
///       },
///     );
///   }
///
///   Future<void> cancelBooking(String bookingId) async {
///     // ... cancel logic
///     await load(); // Reload
///     showSuccess('Réservation annulée');
///   }
/// }
///
/// // Provider
/// final bookingViewModelProvider =
///     StateNotifierProvider<BookingViewModel, ViewState<List<Booking>>>((ref) {
///   final getMyBookings = ref.watch(getMyBookingsUseCaseProvider);
///   return BookingViewModel(getMyBookings: getMyBookings);
/// });
///
/// // Screen
/// class BookingScreen extends ConsumerWidget {
///   @override
///   Widget build(BuildContext context, WidgetRef ref) {
///     final state = ref.watch(bookingViewModelProvider);
///
///     return state.map(
///       initial: (_) => SizedBox(),
///       loading: (_) => LoadingView(),
///       refreshing: (s) => BookingList(bookings: s.data),
///       success: (s) => BookingList(bookings: s.data),
///       empty: (e) => EmptyView(message: e.message),
///       failure: (f) => ErrorView(message: f.message),
///     );
///   }
/// }
/// ```
abstract class BaseViewModel<T> extends StateNotifier<ViewState<T>> {
  /// Constructeur du BaseViewModel
  ///
  /// Initialise le state à `initial` et appelle automatiquement `onInit()`.
  ///
  /// **IMPORTANT**: Ne pas appeler `load()` dans le constructeur!
  /// C'est `onInit()` qui s'en charge.
  BaseViewModel() : super(const ViewState.initial()) {
    onInit();
  }

  // ============================================================================
  // EFFECTS MANAGEMENT
  // ============================================================================

  /// Stream controller pour les effects one-shot
  final _effectsController = StreamController<Object>.broadcast();

  /// Stream des effects exposé aux Screens
  ///
  /// Les Screens écoutent ce stream via `listenToEffects(effectsProvider)`.
  Stream<Object> get effects => _effectsController.stream;

  /// Émet un effect one-shot
  ///
  /// Utilisé pour les actions ponctuelles: navigation, snackbars, dialogs, etc.
  ///
  /// Exemple:
  /// ```dart
  /// emitEffect(ViewEffect.navigateTo('/details'));
  /// emitEffect(ViewEffect.showSnackbar('Succès!'));
  /// emitEffect(AuthEffect.showError('Erreur'));
  /// ```
  ///
  /// **IMPORTANT**: Ne pas émettre d'effects dans le state!
  /// Les effects ne persistent pas.
  void emitEffect<E>(E effect) {
    if (!_effectsController.isClosed) {
      _effectsController.add(effect as Object);
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  /// **Hook d'initialisation** - Appelé automatiquement au démarrage
  ///
  /// Par défaut, appelle `load()` pour charger les données initiales.
  ///
  /// Vous pouvez surcharger cette méthode si vous avez besoin de faire
  /// des actions supplémentaires avant le chargement:
  ///
  /// ```dart
  /// @override
  /// void onInit() {
  ///   _setupListeners();
  ///   super.onInit(); // Appelle load()
  /// }
  /// ```
  void onInit() {
    load();
  }

  /// **Chargement initial** - OBLIGATOIRE
  ///
  /// Cette méthode DOIT être implémentée par tous les ViewModels.
  /// C'est ici que vous chargez les données initiales.
  ///
  /// **Convention:**
  /// 1. Mettre le state à `loading`
  /// 2. Appeler le(s) UseCase(s)
  /// 3. Mettre le state à `success` / `empty` / `failure`
  ///
  /// Exemple:
  /// ```dart
  /// @override
  /// Future<void> load() async {
  ///   state = const ViewState.loading();
  ///
  ///   final result = await getDataUseCase();
  ///
  ///   result.fold(
  ///     (failure) => state = ViewState.failure(failure.message),
  ///     (data) => state = ViewState.success(data),
  ///   );
  /// }
  /// ```
  Future<void> load();

  /// **Rafraîchissement** - Pull-to-refresh
  ///
  /// Appelé quand l'utilisateur tire vers le bas pour rafraîchir.
  ///
  /// Par défaut, met le state en `refreshing` (si des données existent)
  /// puis rappelle `load()`.
  ///
  /// Vous pouvez surcharger si vous avez besoin d'une logique différente:
  ///
  /// ```dart
  /// @override
  /// Future<void> refresh() async {
  ///   // Custom refresh logic
  ///   await loadPage(page: 1, clearCache: true);
  /// }
  /// ```
  Future<void> refresh() async {
    final currentData = state.dataOrNull;
    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    }
    await load();
  }

  /// **Retry après erreur**
  ///
  /// Appelé quand l'utilisateur appuie sur "Réessayer" dans l'ErrorView.
  ///
  /// Par défaut, rappelle simplement `load()`.
  ///
  /// Vous pouvez surcharger si vous avez besoin d'une logique spécifique:
  ///
  /// ```dart
  /// @override
  /// Future<void> retry() async {
  ///   await _checkConnectivity();
  ///   await super.retry();
  /// }
  /// ```
  Future<void> retry() => load();

  /// **Nettoyage** - Appelé automatiquement par Riverpod
  ///
  /// Ferme le stream controller des effects.
  ///
  /// Si vous avez des ressources à nettoyer (timers, subscriptions, etc.),
  /// surchargez cette méthode:
  ///
  /// ```dart
  /// @override
  /// void dispose() {
  ///   _timer.cancel();
  ///   _subscription.cancel();
  ///   super.dispose();
  /// }
  /// ```
  @override
  void dispose() {
    _effectsController.close();
    super.dispose();
  }

  // ============================================================================
  // EXECUTION HELPERS
  // ============================================================================

  /// Exécute une action async avec gestion automatique du state
  ///
  /// Utilisé pour les actions qui ne modifient pas le state principal
  /// mais qui doivent gérer loading/success/failure.
  ///
  /// Exemple:
  /// ```dart
  /// await execute(
  ///   action: () => sendOtpUseCase(phone: '+221771234567'),
  ///   onSuccess: (expiresIn) {
  ///     emitEffect(AuthEffect.navigateToOtpVerification(...));
  ///   },
  ///   onFailure: (failure) {
  ///     emitEffect(AuthEffect.showError(failure.message));
  ///   },
  /// );
  /// ```
  Future<void> execute<T>({
    required Future<T> Function() action,
    required void Function(T) onSuccess,
    required void Function(dynamic) onFailure,
  }) async {
    try {
      final result = await action();
      onSuccess(result);
    } catch (e) {
      onFailure(e);
    }
  }

  // ============================================================================
  // NAVIGATION HELPERS
  // ============================================================================

  /// Naviguer vers une route
  ///
  /// Exemple:
  /// ```dart
  /// navigateTo('/vehicle/details', arguments: {'vehicleId': id});
  /// ```
  void navigateTo(String route, {Object? arguments}) {
    emitEffect(ViewEffect.navigateTo(route, arguments: arguments));
  }

  /// Revenir à la page précédente
  ///
  /// Exemple:
  /// ```dart
  /// navigateBack(result: selectedVehicle);
  /// ```
  void navigateBack({Object? result}) {
    emitEffect(ViewEffect.navigateBack(result: result));
  }

  /// Remplacer la page actuelle
  ///
  /// Exemple:
  /// ```dart
  /// navigateReplace('/home'); // Après login
  /// ```
  void navigateReplace(String route, {Object? arguments}) {
    emitEffect(ViewEffect.navigateReplace(route, arguments: arguments));
  }

  // ============================================================================
  // MESSAGE HELPERS
  // ============================================================================

  /// Afficher un snackbar
  ///
  /// Exemple:
  /// ```dart
  /// showSnackbar('Opération réussie', type: SnackbarType.success);
  /// ```
  void showSnackbar(String message, {SnackbarType type = SnackbarType.info}) {
    emitEffect(ViewEffect.showSnackbar(message, type: type));
  }

  /// Afficher un snackbar de succès
  ///
  /// Raccourci pour `showSnackbar(..., type: SnackbarType.success)`.
  ///
  /// Exemple:
  /// ```dart
  /// showSuccess('Réservation confirmée');
  /// ```
  void showSuccess(String message) {
    emitEffect(ViewEffect.showSnackbar(message, type: SnackbarType.success));
  }

  /// Afficher un snackbar d'erreur
  ///
  /// Raccourci pour `showSnackbar(..., type: SnackbarType.error)`.
  ///
  /// Exemple:
  /// ```dart
  /// showError('Erreur réseau');
  /// ```
  void showError(String message) {
    emitEffect(ViewEffect.showSnackbar(message, type: SnackbarType.error));
  }

  /// Afficher un snackbar d'avertissement
  ///
  /// Raccourci pour `showSnackbar(..., type: SnackbarType.warning)`.
  ///
  /// Exemple:
  /// ```dart
  /// showWarning('Connexion instable');
  /// ```
  void showWarning(String message) {
    emitEffect(ViewEffect.showSnackbar(message, type: SnackbarType.warning));
  }

  /// Afficher un toast
  ///
  /// Message court qui disparaît rapidement.
  ///
  /// Exemple:
  /// ```dart
  /// showToast('Copié');
  /// ```
  void showToast(String message) {
    emitEffect(ViewEffect.showToast(message));
  }

  /// Afficher un dialog
  ///
  /// Exemple:
  /// ```dart
  /// showDialog(
  ///   title: 'Supprimer?',
  ///   message: 'Cette action est irréversible',
  ///   confirmText: 'Supprimer',
  ///   cancelText: 'Annuler',
  /// );
  /// ```
  void showDialog({
    required String title,
    required String message,
    String? confirmText,
    String? cancelText,
  }) {
    emitEffect(ViewEffect.showDialog(
      title: title,
      message: message,
      confirmText: confirmText,
      cancelText: cancelText,
    ));
  }

  // ============================================================================
  // SYSTEM ACTION HELPERS
  // ============================================================================

  /// Copier dans le presse-papier
  ///
  /// Exemple:
  /// ```dart
  /// copyToClipboard(bookingReference);
  /// showToast('Référence copiée');
  /// ```
  void copyToClipboard(String text) {
    emitEffect(ViewEffect.copyToClipboard(text));
  }

  /// Ouvrir une URL
  ///
  /// Exemple:
  /// ```dart
  /// openUrl('https://autoloc.sn/terms');
  /// ```
  void openUrl(String url) {
    emitEffect(ViewEffect.openUrl(url));
  }

  /// Partager du texte
  ///
  /// Exemple:
  /// ```dart
  /// shareText('Découvre ce véhicule: https://autoloc.sn/v/123');
  /// ```
  void shareText(String text) {
    emitEffect(ViewEffect.shareText(text));
  }

  /// Lancer un appel
  ///
  /// Exemple:
  /// ```dart
  /// launchCall(owner.telephone);
  /// ```
  void launchCall(String phone) {
    emitEffect(ViewEffect.launchCall(phone));
  }

  /// Demander une permission
  ///
  /// Exemple:
  /// ```dart
  /// requestPermission('camera');
  /// ```
  void requestPermission(String permission) {
    emitEffect(ViewEffect.requestPermission(permission));
  }
}
