import 'package:freezed_annotation/freezed_annotation.dart';

part 'view_state.freezed.dart';

/// **ViewState<T>** - État générique pour TOUS les ViewModels
///
/// ## Philosophie
/// Un ViewModel expose **UN SEUL** `ViewState<T>` qui représente l'état complet
/// de la vue à un instant T. Le state est **immutable** (Freezed) et suit un
/// cycle de vie strict.
///
/// ## États disponibles
/// - **Initial**: État de départ (avant tout chargement)
/// - **Loading**: Chargement initial (première fois)
/// - **Refreshing**: Rafraîchissement (pull-to-refresh avec données existantes)
/// - **Success**: Données chargées avec succès
/// - **Empty**: Pas de données (ex: liste vide, recherche sans résultats)
/// - **Failure**: Erreur survenue (network, validation, serveur, etc.)
///
/// ## Règles d'utilisation
/// 1. **Un ViewModel = Un ViewState<T>**
///    ```dart
///    class WalletViewModel extends BaseViewModel<WalletData> {
///      // state est ViewState<WalletData>
///    }
///    ```
///
/// 2. **Transitions strictes**
///    - Initial → Loading → Success/Empty/Failure
///    - Success → Refreshing → Success/Empty/Failure
///    - Failure → Loading (retry) → Success/Empty/Failure
///
/// 3. **Success vs Empty**
///    - Success: Il y a des données à afficher
///    - Empty: Aucune donnée (mais ce n'est pas une erreur)
///
/// 4. **Ne jamais modifier directement**
///    ```dart
///    // ❌ INTERDIT
///    state.data = newData;
///
///    // ✅ CORRECT
///    state = ViewState.success(newData);
///    ```
///
/// ## Exemples
/// ```dart
/// // Initial state
/// ViewState<List<Vehicle>>.initial()
///
/// // Loading
/// ViewState<List<Vehicle>>.loading()
///
/// // Success avec données
/// ViewState<List<Vehicle>>.success([vehicle1, vehicle2])
///
/// // Empty (liste vide)
/// ViewState<List<Vehicle>>.empty(message: 'Aucun véhicule disponible')
///
/// // Failure
/// ViewState<List<Vehicle>>.failure('Erreur réseau', code: 'NETWORK_ERROR')
/// ```
@freezed
sealed class ViewState<T> with _$ViewState<T> {
  /// **État initial** - Avant tout chargement
  ///
  /// Utilisé au démarrage du ViewModel, avant que `load()` soit appelé.
  ///
  /// Exemple:
  /// ```dart
  /// class WalletViewModel extends BaseViewModel<WalletData> {
  ///   WalletViewModel() : super(const ViewState.initial());
  /// }
  /// ```
  const factory ViewState.initial() = _Initial<T>;

  /// **État de chargement initial** - Première requête en cours
  ///
  /// Utilisé lors du premier appel à `load()`. Afficher un spinner fullscreen.
  ///
  /// Exemple:
  /// ```dart
  /// @override
  /// Future<void> load() async {
  ///   state = const ViewState.loading();
  ///   // ... fetch data
  /// }
  /// ```
  const factory ViewState.loading() = _Loading<T>;

  /// **État de rafraîchissement** - Pull-to-refresh avec données existantes
  ///
  /// Utilisé lors d'un `refresh()` quand on a déjà des données.
  /// Permet d'afficher les anciennes données pendant le chargement des nouvelles.
  ///
  /// Exemple:
  /// ```dart
  /// @override
  /// Future<void> refresh() async {
  ///   if (state.dataOrNull != null) {
  ///     state = ViewState.refreshing(state.dataOrNull!);
  ///   }
  ///   // ... fetch new data
  /// }
  /// ```
  const factory ViewState.refreshing(T data) = _Refreshing<T>;

  /// **État de succès** - Données chargées avec succès
  ///
  /// Utilisé quand la requête réussit ET qu'il y a des données à afficher.
  ///
  /// Exemple:
  /// ```dart
  /// final result = await getWalletUseCase();
  /// result.fold(
  ///   (failure) => state = ViewState.failure(failure.message),
  ///   (wallet) => state = ViewState.success(wallet),
  /// );
  /// ```
  const factory ViewState.success(T data) = _Success<T>;

  /// **État vide** - Pas de données (mais ce n'est pas une erreur)
  ///
  /// Utilisé quand la requête réussit mais qu'il n'y a aucune donnée.
  /// Exemple: liste vide, recherche sans résultats, profil incomplet.
  ///
  /// Le message optionnel permet d'afficher une explication à l'utilisateur.
  ///
  /// Exemple:
  /// ```dart
  /// final vehicles = await getVehiclesUseCase();
  /// if (vehicles.isEmpty) {
  ///   state = const ViewState.empty(message: 'Aucun véhicule disponible');
  /// } else {
  ///   state = ViewState.success(vehicles);
  /// }
  /// ```
  const factory ViewState.empty({String? message}) = _Empty<T>;

  /// **État d'erreur** - Une erreur est survenue
  ///
  /// Utilisé quand la requête échoue (network, serveur, validation, etc.).
  ///
  /// - `message`: Message d'erreur à afficher à l'utilisateur
  /// - `code`: Code d'erreur optionnel pour le debugging
  ///
  /// Exemple:
  /// ```dart
  /// result.fold(
  ///   (failure) => state = ViewState.failure(
  ///     failure.userMessage,
  ///     code: failure.code,
  ///   ),
  ///   (data) => state = ViewState.success(data),
  /// );
  /// ```
  const factory ViewState.failure(String message, {String? code}) = _Failure<T>;
}

/// **Extensions sur ViewState<T>**
///
/// Helpers pratiques pour vérifier l'état et récupérer les données.
extension ViewStateX<T> on ViewState<T> {
  // ============================================================================
  // VÉRIFICATIONS D'ÉTAT (is...)
  // ============================================================================

  /// Vérifie si l'état est `initial`
  bool get isInitial => this is _Initial<T>;

  /// Vérifie si l'état est `loading` (chargement initial)
  bool get isLoading => this is _Loading<T>;

  /// Vérifie si l'état est `refreshing` (rafraîchissement avec données)
  bool get isRefreshing => this is _Refreshing<T>;

  /// Vérifie si l'état est `success` (données chargées)
  bool get isSuccess => this is _Success<T>;

  /// Vérifie si l'état est `empty` (pas de données)
  bool get isEmpty => this is _Empty<T>;

  /// Vérifie si l'état est `failure` (erreur)
  bool get isFailure => this is _Failure<T>;

  // ============================================================================
  // HELPERS POUR L'UI
  // ============================================================================

  /// Retourne `true` si on doit afficher un indicateur de chargement
  ///
  /// Vrai pour `loading` OU `refreshing`.
  ///
  /// Exemple:
  /// ```dart
  /// if (state.showLoading) {
  ///   return CircularProgressIndicator();
  /// }
  /// ```
  bool get showLoading => isLoading || isRefreshing;

  /// Retourne les données si disponibles, sinon `null`
  ///
  /// Données disponibles dans les états: `success` et `refreshing`.
  ///
  /// Exemple:
  /// ```dart
  /// final wallet = state.dataOrNull;
  /// if (wallet != null) {
  ///   return WalletView(wallet: wallet);
  /// }
  /// ```
  T? get dataOrNull => maybeMap(
        success: (s) => s.data,
        refreshing: (r) => r.data,
        orElse: () => null,
      );

  /// Retourne les données ou lance une exception si indisponibles
  ///
  /// **ATTENTION**: À utiliser uniquement quand vous êtes CERTAIN que
  /// les données sont présentes (ex: après vérification avec `isSuccess`).
  ///
  /// Exemple:
  /// ```dart
  /// if (state.isSuccess) {
  ///   final wallet = state.dataOrThrow; // Safe
  ///   return WalletView(wallet: wallet);
  /// }
  /// ```
  T get dataOrThrow {
    final data = dataOrNull;
    if (data == null) {
      throw StateError('Cannot access data in state: $this');
    }
    return data;
  }

  /// Retourne le message d'erreur si l'état est `failure`, sinon `null`
  ///
  /// Exemple:
  /// ```dart
  /// final errorMessage = state.errorMessageOrNull;
  /// if (errorMessage != null) {
  ///   ScaffoldMessenger.of(context).showSnackBar(
  ///     SnackBar(content: Text(errorMessage)),
  ///   );
  /// }
  /// ```
  String? get errorMessageOrNull => maybeMap(
        failure: (f) => f.message,
        orElse: () => null,
      );

  /// Retourne le code d'erreur si l'état est `failure`, sinon `null`
  String? get errorCodeOrNull => maybeMap(
        failure: (f) => f.code,
        orElse: () => null,
      );

  /// Retourne le message Empty si l'état est `empty`, sinon `null`
  String? get emptyMessageOrNull => maybeMap(
        empty: (e) => e.message,
        orElse: () => null,
      );

  // ============================================================================
  // TRANSFORMATIONS
  // ============================================================================

  /// Transforme les données si l'état est `success` ou `refreshing`
  ///
  /// Exemple:
  /// ```dart
  /// final countState = state.map((vehicles) => vehicles.length);
  /// // ViewState<List<Vehicle>> → ViewState<int>
  /// ```
  ViewState<R> mapData<R>(R Function(T data) transform) {
    return map(
      initial: (_) => const ViewState.initial(),
      loading: (_) => const ViewState.loading(),
      refreshing: (s) => ViewState.refreshing(transform(s.data)),
      success: (s) => ViewState.success(transform(s.data)),
      empty: (e) => ViewState.empty(message: e.message),
      failure: (f) => ViewState.failure(f.message, code: f.code),
    );
  }
}
