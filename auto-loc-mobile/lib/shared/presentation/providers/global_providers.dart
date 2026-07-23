import 'package:flutter_riverpod/flutter_riverpod.dart';

// import '../../../features/auth/domain/entities/user.dart';

/// **Global Providers** - Providers partagés à travers toute l'application
///
/// ## Responsabilité
/// Centraliser les providers qui sont utilisés par **plusieurs features**
/// ou qui représentent un état **global** de l'application.
///
/// ## Règle d'or: Global vs Feature-Scoped
///
/// ### ✅ GLOBAL (ce fichier)
/// - Session utilisateur (auth state, current user)
/// - Thème de l'app
/// - Connectivité réseau
/// - Permissions système
/// - Notifications globales
/// - Business logic guards (canMakeReservation, canCreateVehicle, etc.)
///
/// ### ✅ FEATURE-SCOPED (features/*/presentation/providers/)
/// - WalletViewModel & WalletState
/// - BookingListViewModel & BookingListState
/// - VehicleDetailsViewModel & VehicleDetailsState
/// - Tout provider spécifique à UNE feature
///
/// ## Providers Globaux Disponibles
///
/// ### 1. Session & Auth
/// - `sessionProvider`: État de la session (SessionState)
/// - `authStateProvider`: État d'authentification (AuthState)
/// - `currentUserProvider`: Utilisateur actuellement connecté
/// - `isAuthenticatedProvider`: Boolean - est-ce que l'user est connecté?
///
/// ### 2. Business Logic Guards
/// - `canMakeReservationProvider`: L'user peut-il louer? (user.peutLouer)
/// - `canCreateVehicleProvider`: L'user peut-il publier un véhicule?
/// - `canRequestWithdrawalProvider`: L'user peut-il demander un retrait? (balance >= 5000 FCFA)
///
/// ### 3. UI State
/// - `notificationBadgeProvider`: Nombre de notifications non lues
/// - `themeProvider`: Thème de l'application (déjà défini ailleurs)
/// - `connectivityProvider`: État de la connectivité (déjà défini ailleurs)
///
/// ## Exemples d'utilisation
///
/// ### Vérifier si l'user est connecté
/// ```dart
/// class HomeScreen extends ConsumerWidget {
///   @override
///   Widget build(BuildContext context, WidgetRef ref) {
///     final isAuthenticated = ref.watch(isAuthenticatedProvider);
///
///     if (!isAuthenticated) {
///       return LoginPrompt();
///     }
///
///     return HomeContent();
///   }
/// }
/// ```
///
/// ### Afficher le profil de l'user
/// ```dart
/// final currentUser = ref.watch(currentUserProvider);
///
/// return currentUser?.when(
///   data: (user) => Text('Bonjour ${user.prenom}'),
///   loading: () => CircularProgressIndicator(),
///   error: (e, _) => Text('Erreur'),
/// );
/// ```
///
/// ### Guard pour réservation
/// ```dart
/// final canBook = ref.watch(canMakeReservationProvider);
///
/// ElevatedButton(
///   onPressed: canBook ? () => _makeBooking() : null,
///   child: Text('Réserver'),
/// );
/// ```
///
/// ### Badge de notifications
/// ```dart
/// final unreadCount = ref.watch(notificationBadgeProvider);
///
/// Badge(
///   label: Text('$unreadCount'),
///   child: Icon(Icons.notifications),
/// );
/// ```

// ============================================================================
// SESSION & AUTH
// ============================================================================

/// **État de la session** (SessionState)
///
/// Représente l'état global de la session utilisateur.
/// - Authenticated: User connecté avec ses données
/// - Unauthenticated: User non connecté
/// - Loading: Vérification de la session en cours
///
/// TODO: Définir SessionState et le connecter au AuthRepository
/// ```dart
/// final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) {
///   return SessionNotifier(authRepository: ref.read(authRepositoryProvider));
/// });
/// ```
// final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) {
//   throw UnimplementedError('À implémenter lors de la feature Auth');
// });

/// **État d'authentification** (AuthState)
///
/// État simplifié de l'authentification.
/// Dérivé du sessionProvider.
///
/// TODO: Implémenter
// final authStateProvider = Provider<AuthState>((ref) {
//   throw UnimplementedError('À implémenter lors de la feature Auth');
// });

/// **Utilisateur actuellement connecté**
///
/// Retourne l'User si connecté, sinon null.
///
/// Exemple:
/// ```dart
/// final currentUser = ref.watch(currentUserProvider);
/// if (currentUser != null) {
///   print('Connecté: ${currentUser.email}');
/// }
/// ```
///
/// TODO: Implémenter
// final currentUserProvider = Provider<User?>((ref) {
//   final session = ref.watch(sessionProvider);
//   return session.maybeMap(
//     authenticated: (s) => s.user,
//     orElse: () => null,
//   );
// });

/// **Vérifier si l'utilisateur est authentifié**
///
/// Retourne `true` si l'user est connecté, `false` sinon.
///
/// Exemple:
/// ```dart
/// final isAuthenticated = ref.watch(isAuthenticatedProvider);
/// if (isAuthenticated) {
///   navigateTo('/home');
/// } else {
///   navigateTo('/login');
/// }
/// ```
///
/// TODO: Implémenter
// final isAuthenticatedProvider = Provider<bool>((ref) {
//   return ref.watch(currentUserProvider) != null;
// });

// ============================================================================
// BUSINESS LOGIC GUARDS
// ============================================================================

/// **Guard: Peut faire une réservation?**
///
/// Retourne `true` si l'utilisateur peut louer un véhicule.
///
/// Critères:
/// - User authentifié
/// - user.peutLouer == true (KYC validé + aucune réservation en cours non payée)
///
/// Exemple:
/// ```dart
/// final canBook = ref.watch(canMakeReservationProvider);
///
/// ElevatedButton(
///   onPressed: canBook ? () => _bookVehicle() : null,
///   child: Text(canBook ? 'Réserver' : 'KYC requis'),
/// );
/// ```
///
/// TODO: Implémenter
// final canMakeReservationProvider = Provider<bool>((ref) {
//   final currentUser = ref.watch(currentUserProvider);
//   return currentUser?.peutLouer ?? false;
// });

/// **Guard: Peut créer un véhicule?**
///
/// Retourne `true` si l'utilisateur peut publier un véhicule.
///
/// Critères:
/// - User authentifié
/// - user.peutLouer == true (KYC validé)
///
/// Exemple:
/// ```dart
/// final canPublish = ref.watch(canCreateVehicleProvider);
///
/// FloatingActionButton(
///   onPressed: canPublish ? () => _createVehicle() : null,
///   child: Icon(Icons.add),
/// );
/// ```
///
/// TODO: Implémenter
// final canCreateVehicleProvider = Provider<bool>((ref) {
//   final currentUser = ref.watch(currentUserProvider);
//   return currentUser?.peutLouer ?? false;
// });

/// **Guard: Peut demander un retrait?**
///
/// Retourne `true` si l'utilisateur peut demander un retrait de fonds.
///
/// Critères:
/// - User authentifié
/// - Solde du wallet >= 5000 FCFA (montant minimum de retrait)
///
/// Exemple:
/// ```dart
/// final canWithdraw = ref.watch(canRequestWithdrawalProvider);
///
/// ElevatedButton(
///   onPressed: canWithdraw ? () => _requestWithdrawal() : null,
///   child: Text('Retirer'),
/// );
///
/// if (!canWithdraw) {
///   Text('Minimum 5000 FCFA requis');
/// }
/// ```
///
/// TODO: Implémenter (nécessite WalletState global ou provider dédié)
// final canRequestWithdrawalProvider = Provider<bool>((ref) {
//   final currentUser = ref.watch(currentUserProvider);
//   if (currentUser == null) return false;
//
//   // Récupérer le wallet balance depuis un provider global ou WalletState
//   // final wallet = ref.watch(walletProvider);
//   // return wallet?.solde >= 5000;
//
//   return false; // Placeholder
// });

// ============================================================================
// UI STATE
// ============================================================================

/// **Badge de notifications**
///
/// Retourne le nombre de notifications non lues.
///
/// Exemple:
/// ```dart
/// final unreadCount = ref.watch(notificationBadgeProvider);
///
/// Badge(
///   label: Text('$unreadCount'),
///   isLabelVisible: unreadCount > 0,
///   child: Icon(Icons.notifications),
/// );
/// ```
///
/// TODO: Implémenter (nécessite NotificationRepository)
// final notificationBadgeProvider = Provider<int>((ref) {
//   // Compter les notifications non lues
//   // final notifications = ref.watch(notificationsProvider);
//   // return notifications.where((n) => !n.estLue).length;
//
//   return 0; // Placeholder
// });

// ============================================================================
// THEME & CONNECTIVITY
// ============================================================================

/// **Provider du thème de l'application**
///
/// Géré dans `lib/shared/presentation/theme/theme_provider.dart`
///
/// Exemple:
/// ```dart
/// final themeMode = ref.watch(themeProvider);
/// ```
///
/// NOTE: Ce provider existe déjà dans votre codebase.
/// Importez-le depuis son fichier dédié.

/// **Provider de connectivité réseau**
///
/// Géré dans `lib/shared/presentation/providers/connectivity_provider.dart`
///
/// Exemple:
/// ```dart
/// final isOnline = ref.watch(connectivityProvider);
///
/// if (!isOnline) {
///   return OfflineBanner();
/// }
/// ```
///
/// NOTE: Ce provider existe déjà dans votre codebase.
/// Importez-le depuis son fichier dédié.

// ============================================================================
// NOTES D'IMPLÉMENTATION
// ============================================================================

/// ## Quand implémenter ces providers?
///
/// ### Phase 1: Foundation (AUJOURD'HUI)
/// - ✅ Définir la structure
/// - ✅ Documenter les providers
/// - ✅ Marquer les TODOs
///
/// ### Phase 2: Feature Auth (PROCHAINEMENT)
/// - Implémenter sessionProvider
/// - Implémenter authStateProvider
/// - Implémenter currentUserProvider
/// - Implémenter isAuthenticatedProvider
///
/// ### Phase 3: Feature Wallet
/// - Implémenter canRequestWithdrawalProvider
///
/// ### Phase 4: Feature Notifications
/// - Implémenter notificationBadgeProvider
///
/// ### Phase 5: Features Booking & Vehicle
/// - canMakeReservationProvider et canCreateVehicleProvider déjà basés sur currentUser.peutLouer
///
/// ## Pattern de migration
///
/// Quand vous êtes prêt à implémenter un provider, dé-commentez le code
/// et retirez le `throw UnimplementedError()`.
///
/// Exemple:
/// ```dart
/// // AVANT (Foundation)
/// // final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) {
/// //   throw UnimplementedError('À implémenter lors de la feature Auth');
/// // });
///
/// // APRÈS (Feature Auth implémentée)
/// final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) {
///   return SessionNotifier(
///     authRepository: ref.read(authRepositoryProvider),
///     secureStorage: ref.read(secureStorageProvider),
///   );
/// });
/// ```
