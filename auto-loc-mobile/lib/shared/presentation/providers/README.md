# Provider Strategy - Riverpod Architecture

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Règles d'or](#règles-dor)
- [Global vs Feature-Scoped](#global-vs-feature-scoped)
- [Types de Providers](#types-de-providers)
- [Naming Conventions](#naming-conventions)
- [Exemples Complets](#exemples-complets)
- [Anti-Patterns](#anti-patterns)

---

## Vue d'ensemble

Notre architecture Riverpod suit une stratégie stricte de **séparation Global vs Feature-Scoped** pour garantir:

- ✅ **Modularité** - Chaque feature est autonome
- ✅ **Testabilité** - Providers isolés, faciles à mocker
- ✅ **Maintenabilité** - Savoir où trouver quel provider
- ✅ **Performance** - Pas de rebuild inutiles

```
lib/
├── shared/
│   └── presentation/
│       └── providers/
│           ├── global_providers.dart    ← GLOBAL (session, auth, theme)
│           └── README.md                ← Ce fichier
└── features/
    ├── wallet/
    │   └── presentation/
    │       └── providers/
    │           └── wallet_providers.dart  ← FEATURE-SCOPED
    ├── booking/
    │   └── presentation/
    │       └── providers/
    │           └── booking_providers.dart ← FEATURE-SCOPED
    └── ...
```

---

## Règles d'or

### ✅ GLOBAL (`shared/presentation/providers/`)

Un provider est **global** si:

1. Il est utilisé par **2+ features**
2. Il représente un **état applicatif** (session, theme, connectivity)
3. Il est un **business logic guard** partagé (canMakeReservation, canCreateVehicle)
4. Il représente une **ressource système** (permissions, notifications)

**Exemples:**
- `currentUserProvider` - Utilisé par Wallet, Booking, Vehicle, Settings
- `isAuthenticatedProvider` - Utilisé par toutes les features protégées
- `themeProvider` - Thème de l'app
- `connectivityProvider` - État réseau
- `canMakeReservationProvider` - Guard utilisé par Booking & Vehicle

### ✅ FEATURE-SCOPED (`features/*/presentation/providers/`)

Un provider est **feature-scoped** si:

1. Il est utilisé par **UNE SEULE feature**
2. Il représente le **state d'un ViewModel spécifique**
3. Il représente les **effects d'un ViewModel spécifique**

**Exemples:**
- `walletViewModelProvider` - Uniquement dans Wallet
- `walletStateProvider` - Uniquement dans Wallet
- `walletEffectsProvider` - Uniquement dans Wallet
- `bookingListViewModelProvider` - Uniquement dans Booking
- `vehicleDetailsViewModelProvider` - Uniquement dans Vehicle

---

## Global vs Feature-Scoped

### GLOBAL - `shared/presentation/providers/global_providers.dart`

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ============================================================================
// SESSION & AUTH
// ============================================================================

final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) {
  return SessionNotifier(authRepository: ref.read(authRepositoryProvider));
});

final currentUserProvider = Provider<User?>((ref) {
  final session = ref.watch(sessionProvider);
  return session.maybeMap(
    authenticated: (s) => s.user,
    orElse: () => null,
  );
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});

// ============================================================================
// BUSINESS LOGIC GUARDS
// ============================================================================

final canMakeReservationProvider = Provider<bool>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return currentUser?.peutLouer ?? false;
});

final canCreateVehicleProvider = Provider<bool>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return currentUser?.peutLouer ?? false;
});

// ============================================================================
// UI STATE
// ============================================================================

final notificationBadgeProvider = Provider<int>((ref) {
  // Nombre de notifications non lues
  return 0;
});
```

**Utilisation:**
```dart
// N'importe quelle feature peut utiliser ces providers
class WalletScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.watch(currentUserProvider);
    final canWithdraw = ref.watch(canRequestWithdrawalProvider);

    // ...
  }
}

class BookingScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canBook = ref.watch(canMakeReservationProvider);

    // ...
  }
}
```

---

### FEATURE-SCOPED - `features/wallet/presentation/providers/wallet_providers.dart`

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/usecases/get_wallet.dart';
import '../viewmodels/wallet_view_model.dart';

// ============================================================================
// VIEWMODEL
// ============================================================================

final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>((ref) {
  return WalletViewModel(
    getWalletUseCase: ref.read(getWalletUseCaseProvider),
  );
});

// ============================================================================
// STATE (Alias pour lisibilité)
// ============================================================================

final walletStateProvider = Provider<ViewState<WalletData>>((ref) {
  return ref.watch(walletViewModelProvider);
});

// ============================================================================
// EFFECTS
// ============================================================================

final walletEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(walletViewModelProvider.notifier);
  return viewModel.effects;
});
```

**Utilisation:**
```dart
// UNIQUEMENT dans la feature Wallet
class WalletScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen>
    with EffectHandler {
  @override
  void initState() {
    super.initState();
    listenToEffects(walletEffectsProvider); // ← Feature-scoped effect stream
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(walletStateProvider); // ← Feature-scoped state

    return state.map(
      initial: (_) => SizedBox.shrink(),
      loading: (_) => Center(child: CircularProgressIndicator()),
      success: (s) => WalletContent(wallet: s.data),
      // ...
    );
  }
}
```

---

## Types de Providers

### 1. StateNotifierProvider (ViewModels)

**Usage:** ViewModels qui gèrent le state et la business logic.

```dart
final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>((ref) {
  return WalletViewModel(
    getWalletUseCase: ref.read(getWalletUseCaseProvider),
    requestWithdrawalUseCase: ref.read(requestWithdrawalUseCaseProvider),
  );
});
```

**Règles:**
- TOUJOURS étendre `BaseViewModel<T>`
- Le state est TOUJOURS un `ViewState<T>`
- Déclarer dans `features/*/presentation/providers/`

### 2. Provider (Computed Values)

**Usage:** Valeurs dérivées, guards, computed state.

```dart
// Global guard
final canMakeReservationProvider = Provider<bool>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return currentUser?.peutLouer ?? false;
});

// Feature-scoped state alias
final walletStateProvider = Provider<ViewState<WalletData>>((ref) {
  return ref.watch(walletViewModelProvider);
});
```

**Règles:**
- Pour les valeurs **calculées** (pas de state mutable)
- Pour les **guards** (canDoSomething)
- Pour les **alias** (améliorer la lisibilité)

### 3. StreamProvider (Effects)

**Usage:** Stream d'effects émis par les ViewModels.

```dart
final walletEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(walletViewModelProvider.notifier);
  return viewModel.effects;
});
```

**Règles:**
- UN StreamProvider par ViewModel
- Utilisé avec le mixin `EffectHandler`
- Toujours feature-scoped

### 4. FutureProvider (Async Data Loading)

**Usage:** Chargement ponctuel de données (rarement utilisé avec MVVM).

```dart
final vehicleDetailsProvider = FutureProvider.family<Vehicle, String>((ref, vehicleId) {
  final getVehicleUseCase = ref.read(getVehicleUseCaseProvider);
  return getVehicleUseCase(vehicleId);
});
```

**⚠️ Note:** Avec notre architecture MVVM, on préfère utiliser `StateNotifierProvider` + `BaseViewModel.load()` plutôt que `FutureProvider`.

---

## Naming Conventions

### Global Providers

| Type | Convention | Exemple |
|------|-----------|---------|
| Session | `sessionProvider` | `sessionProvider` |
| Current User | `currentUserProvider` | `currentUserProvider` |
| Auth State | `authStateProvider` | `authStateProvider` |
| Boolean Check | `is<Something>Provider` | `isAuthenticatedProvider` |
| Guard | `can<Action>Provider` | `canMakeReservationProvider` |
| Count/Badge | `<noun>BadgeProvider` | `notificationBadgeProvider` |
| UI State | `<feature>Provider` | `themeProvider`, `connectivityProvider` |

### Feature-Scoped Providers

| Type | Convention | Exemple |
|------|-----------|---------|
| ViewModel | `<feature>ViewModelProvider` | `walletViewModelProvider` |
| State | `<feature>StateProvider` | `walletStateProvider` |
| Effects | `<feature>EffectsProvider` | `walletEffectsProvider` |
| List ViewModel | `<feature>ListViewModelProvider` | `bookingListViewModelProvider` |
| Details ViewModel | `<feature>DetailsViewModelProvider` | `vehicleDetailsViewModelProvider` |

**Exemples complets:**

```dart
// ✅ CORRECT
final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>(...);
final walletStateProvider = Provider<ViewState<WalletData>>(...);
final walletEffectsProvider = StreamProvider<ViewEffect>(...);

final bookingListViewModelProvider = StateNotifierProvider<BookingListViewModel, ViewState<List<Booking>>>(...);
final bookingDetailsViewModelProvider = StateNotifierProvider<BookingDetailsViewModel, ViewState<BookingDetails>>(...);

// ❌ INCORRECT
final walletProvider = ... // Trop vague
final myWalletProvider = ... // 'my' inutile
final getWalletProvider = ... // Nom d'action (devrait être un UseCase)
final wallet_provider = ... // snake_case (Dart = camelCase)
```

---

## Exemples Complets

### Exemple 1: Feature Wallet

**Structure:**
```
features/wallet/
├── domain/
│   ├── entities/wallet_data.dart
│   ├── repositories/wallet_repository.dart
│   └── usecases/
│       ├── get_wallet.dart
│       └── request_withdrawal.dart
├── data/
│   └── ...
└── presentation/
    ├── providers/
    │   └── wallet_providers.dart    ← Feature-scoped providers
    ├── viewmodels/
    │   └── wallet_view_model.dart
    └── screens/
        └── wallet_screen.dart
```

**wallet_providers.dart:**
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/presentation/base/view_effect.dart';
import '../../domain/entities/wallet_data.dart';
import '../../domain/usecases/get_wallet.dart';
import '../../domain/usecases/request_withdrawal.dart';
import '../viewmodels/wallet_view_model.dart';

// ============================================================================
// VIEWMODEL
// ============================================================================

final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>((ref) {
  return WalletViewModel(
    getWalletUseCase: ref.read(getWalletUseCaseProvider),
    requestWithdrawalUseCase: ref.read(requestWithdrawalUseCaseProvider),
  );
});

// ============================================================================
// STATE (Alias pour lisibilité)
// ============================================================================

final walletStateProvider = Provider<ViewState<WalletData>>((ref) {
  return ref.watch(walletViewModelProvider);
});

// ============================================================================
// EFFECTS
// ============================================================================

final walletEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(walletViewModelProvider.notifier);
  return viewModel.effects;
});
```

**wallet_screen.dart:**
```dart
class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen>
    with EffectHandler {
  @override
  void initState() {
    super.initState();
    // Écouter les effects du ViewModel
    listenToEffects(walletEffectsProvider);
  }

  @override
  Widget build(BuildContext context) {
    // Watcher le state du ViewModel
    final state = ref.watch(walletStateProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mon Wallet')),
      body: state.map(
        initial: (_) => const SizedBox.shrink(),
        loading: (_) => const Center(child: CircularProgressIndicator()),
        refreshing: (s) => WalletContent(wallet: s.data), // Afficher les anciennes données pendant refresh
        success: (s) => WalletContent(wallet: s.data),
        empty: (e) => EmptyState(message: e.message ?? 'Aucune donnée'),
        failure: (f) => ErrorState(message: f.message),
      ),
    );
  }
}
```

---

### Exemple 2: Feature Booking (avec List + Details)

**Structure:**
```
features/booking/
└── presentation/
    ├── providers/
    │   └── booking_providers.dart
    ├── viewmodels/
    │   ├── booking_list_view_model.dart
    │   └── booking_details_view_model.dart
    └── screens/
        ├── booking_list_screen.dart
        └── booking_details_screen.dart
```

**booking_providers.dart:**
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ============================================================================
// BOOKING LIST
// ============================================================================

final bookingListViewModelProvider = StateNotifierProvider<BookingListViewModel, ViewState<List<Booking>>>((ref) {
  return BookingListViewModel(
    getBookingsUseCase: ref.read(getBookingsUseCaseProvider),
  );
});

final bookingListStateProvider = Provider<ViewState<List<Booking>>>((ref) {
  return ref.watch(bookingListViewModelProvider);
});

final bookingListEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(bookingListViewModelProvider.notifier);
  return viewModel.effects;
});

// ============================================================================
// BOOKING DETAILS
// ============================================================================

final bookingDetailsViewModelProvider = StateNotifierProvider<BookingDetailsViewModel, ViewState<BookingDetails>>((ref) {
  return BookingDetailsViewModel(
    getBookingDetailsUseCase: ref.read(getBookingDetailsUseCaseProvider),
    cancelBookingUseCase: ref.read(cancelBookingUseCaseProvider),
  );
});

final bookingDetailsStateProvider = Provider<ViewState<BookingDetails>>((ref) {
  return ref.watch(bookingDetailsViewModelProvider);
});

final bookingDetailsEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(bookingDetailsViewModelProvider.notifier);
  return viewModel.effects;
});
```

---

## Anti-Patterns

### ❌ 1. Provider Global pour du state feature-specific

```dart
// ❌ MAUVAIS - walletState n'est utilisé QUE par Wallet
// lib/shared/presentation/providers/global_providers.dart
final walletStateProvider = Provider<ViewState<WalletData>>((ref) {
  return ref.watch(walletViewModelProvider);
});
```

**✅ Solution:**
```dart
// ✅ BON - walletState dans features/wallet/presentation/providers/
final walletStateProvider = Provider<ViewState<WalletData>>((ref) {
  return ref.watch(walletViewModelProvider);
});
```

---

### ❌ 2. Dupliquer la logique au lieu d'utiliser un Provider global

```dart
// ❌ MAUVAIS - Dupliquer la vérification dans chaque feature
class BookingViewModel extends BaseViewModel<List<Booking>> {
  Future<void> createBooking() async {
    final user = ref.read(currentUserProvider);
    if (user?.peutLouer != true) {
      showError('KYC non validé');
      return;
    }
    // ...
  }
}

class VehicleViewModel extends BaseViewModel<Vehicle> {
  Future<void> rentVehicle() async {
    final user = ref.read(currentUserProvider);
    if (user?.peutLouer != true) { // Duplication!
      showError('KYC non validé');
      return;
    }
    // ...
  }
}
```

**✅ Solution:**
```dart
// ✅ BON - Guard global
final canMakeReservationProvider = Provider<bool>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return currentUser?.peutLouer ?? false;
});

// Usage dans les ViewModels
class BookingViewModel extends BaseViewModel<List<Booking>> {
  Future<void> createBooking() async {
    final canBook = ref.read(canMakeReservationProvider);
    if (!canBook) {
      showError('KYC non validé');
      return;
    }
    // ...
  }
}
```

---

### ❌ 3. Utiliser FutureProvider au lieu de StateNotifier

```dart
// ❌ MAUVAIS - FutureProvider ne permet pas refresh/retry
final walletProvider = FutureProvider<WalletData>((ref) async {
  final getWallet = ref.read(getWalletUseCaseProvider);
  final result = await getWallet();
  return result.fold(
    (failure) => throw failure,
    (wallet) => wallet,
  );
});
```

**✅ Solution:**
```dart
// ✅ BON - StateNotifier avec BaseViewModel
final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>((ref) {
  return WalletViewModel(getWalletUseCase: ref.read(getWalletUseCaseProvider));
});
```

---

### ❌ 4. Naming incohérent

```dart
// ❌ MAUVAIS
final wallet = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>(...);
final getWalletState = Provider<ViewState<WalletData>>(...);
final wallet_effects = StreamProvider<ViewEffect>(...);
```

**✅ Solution:**
```dart
// ✅ BON
final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>(...);
final walletStateProvider = Provider<ViewState<WalletData>>(...);
final walletEffectsProvider = StreamProvider<ViewEffect>(...);
```

---

### ❌ 5. Provider sans documentation

```dart
// ❌ MAUVAIS
final canMakeReservationProvider = Provider<bool>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return currentUser?.peutLouer ?? false;
});
```

**✅ Solution:**
```dart
// ✅ BON
/// **Guard: Peut faire une réservation?**
///
/// Retourne `true` si l'utilisateur peut louer un véhicule.
///
/// Critères:
/// - User authentifié
/// - user.peutLouer == true (KYC validé)
///
/// Exemple:
/// ```dart
/// final canBook = ref.watch(canMakeReservationProvider);
/// ElevatedButton(
///   onPressed: canBook ? () => _bookVehicle() : null,
///   child: Text('Réserver'),
/// );
/// ```
final canMakeReservationProvider = Provider<bool>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return currentUser?.peutLouer ?? false;
});
```

---

## Checklist de Validation

Avant de créer un provider, posez-vous ces questions:

### 1. Portée (Scope)
- [ ] Ce provider est-il utilisé par 2+ features? → **Global**
- [ ] Ce provider est-il utilisé par 1 seule feature? → **Feature-Scoped**

### 2. Type
- [ ] State mutable + business logic? → `StateNotifierProvider<ViewModel, ViewState<T>>`
- [ ] Valeur dérivée/computed? → `Provider<T>`
- [ ] Stream d'events? → `StreamProvider<ViewEffect>`

### 3. Naming
- [ ] Le nom suit-il la convention? (`<feature>ViewModelProvider`, `<feature>StateProvider`, etc.)
- [ ] Le nom est-il en camelCase?
- [ ] Le nom est-il descriptif et explicite?

### 4. Documentation
- [ ] Le provider a-t-il un commentaire doc?
- [ ] Le commentaire explique-t-il ce que fait le provider?
- [ ] Le commentaire contient-il un exemple d'usage?

### 5. Organisation
- [ ] Le provider est-il dans le bon dossier? (`global_providers.dart` vs `features/*/providers/`)
- [ ] Le provider respecte-t-il la structure de la feature?

---

## Conclusion

La stratégie de providers est **critique** pour la maintenabilité de l'app. En suivant ces règles, vous garantissez:

- ✅ **Modularité** - Features indépendantes
- ✅ **Lisibilité** - Savoir où chercher quel provider
- ✅ **Testabilité** - Isolation des providers
- ✅ **Performance** - Pas de dépendances inutiles
- ✅ **Consistance** - Toutes les features suivent le même pattern

**Règle finale:** En cas de doute, demandez-vous: "Ce provider sera-t-il utilisé par 2+ features?" Si oui → Global. Sinon → Feature-Scoped.
