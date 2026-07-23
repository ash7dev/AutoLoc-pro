# State Lifecycle - Cycles de vie et Transitions

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Les 6 États](#les-6-états)
- [Transitions de State](#transitions-de-state)
- [Flow: Premier Chargement](#flow-premier-chargement)
- [Flow: Pull-to-Refresh](#flow-pull-to-refresh)
- [Flow: Retry après Erreur](#flow-retry-après-erreur)
- [Flow: Empty → Success](#flow-empty--success)
- [Exemples Complets](#exemples-complets)
- [Best Practices](#best-practices)

---

## Vue d'ensemble

Le **State Lifecycle** définit les **transitions strictes** entre les différents états (`ViewState<T>`).

**Pourquoi des transitions strictes?**
- ✅ Comportement prévisible
- ✅ UI cohérente (loading indicators, error states)
- ✅ Pas de "flash" d'états incohérents
- ✅ Facile à débugger

---

## Les 6 États

```dart
sealed class ViewState<T> {
  const factory ViewState.initial() = _Initial<T>;
  const factory ViewState.loading() = _Loading<T>;
  const factory ViewState.refreshing(T data) = _Refreshing<T>;
  const factory ViewState.success(T data) = _Success<T>;
  const factory ViewState.empty({String? message}) = _Empty<T>;
  const factory ViewState.failure(String message, {String? code}) = _Failure<T>;
}
```

### 1. Initial

**Description:** État de départ avant tout chargement.

**Quand?**
- Au constructor du ViewModel
- Jamais après le premier `load()`

**UI:**
- Afficher `SizedBox.shrink()` ou un placeholder
- Pas de loading indicator (le loading va arriver juste après)

**Exemple:**
```dart
class WalletViewModel extends BaseViewModel<WalletData> {
  WalletViewModel() : super(); // state = initial par défaut
}
```

---

### 2. Loading

**Description:** Chargement initial (première fois ou retry).

**Quand?**
- Première fois que `load()` est appelé
- Après `retry()` (suite à une erreur)

**UI:**
- Afficher un loading indicator fullscreen
- Pas de données visibles

**Exemple:**
```dart
@override
Future<void> load() async {
  state = const ViewState.loading(); // ← Loading

  final result = await getWalletUseCase();

  // ...
}
```

---

### 3. Refreshing

**Description:** Rafraîchissement avec données existantes visibles.

**Quand?**
- `refresh()` appelé depuis un état `success`
- Pull-to-refresh

**UI:**
- Afficher les **anciennes données**
- Afficher un refresh indicator (en haut de la liste)

**Exemple:**
```dart
@override
Future<void> refresh() async {
  final currentData = state.dataOrNull;

  if (currentData != null) {
    state = ViewState.refreshing(currentData); // ← Refreshing (avec anciennes données)
  }

  final result = await getWalletUseCase();

  // ...
}
```

---

### 4. Success

**Description:** Données chargées avec succès.

**Quand?**
- UseCase réussit ET il y a des données à afficher

**UI:**
- Afficher le contenu

**Exemple:**
```dart
result.fold(
  (failure) => state = ViewState.failure(failure.message),
  (wallet) => state = ViewState.success(wallet), // ← Success
);
```

---

### 5. Empty

**Description:** Aucune donnée (mais ce n'est pas une erreur).

**Quand?**
- Liste vide
- Recherche sans résultats
- Profil incomplet (mais pas d'erreur)

**UI:**
- Afficher un EmptyState avec message + illustration

**Exemple:**
```dart
result.fold(
  (failure) => state = ViewState.failure(failure.message),
  (bookings) {
    if (bookings.isEmpty) {
      state = const ViewState.empty(message: 'Aucune réservation'); // ← Empty
    } else {
      state = ViewState.success(bookings);
    }
  },
);
```

---

### 6. Failure

**Description:** Une erreur est survenue.

**Quand?**
- Erreur réseau
- Erreur serveur
- Erreur de validation

**UI:**
- Afficher un ErrorState avec message + bouton "Réessayer"

**Exemple:**
```dart
result.fold(
  (failure) => state = ViewState.failure(failure.message, code: failure.code), // ← Failure
  (wallet) => state = ViewState.success(wallet),
);
```

---

## Transitions de State

### Diagramme de Transitions

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                          INITIAL                                 │
│                             │                                     │
│                             │ load()                              │
│                             ▼                                     │
│                         LOADING ────────────┐                    │
│                             │                │                    │
│                             │                │ UseCase fails      │
│                             │                │                    │
│                   UseCase   │                ▼                    │
│                   succeeds  │            FAILURE                  │
│                             │                │                    │
│                             │                │ retry()            │
│                             │                │                    │
│                             ▼                │                    │
│                 ┌──────────────────┐         │                    │
│                 │                  │         │                    │
│           ┌─────┤  SUCCESS/EMPTY   │◄────────┘                    │
│           │     │                  │                              │
│           │     └──────────────────┘                              │
│           │              │                                         │
│           │              │ refresh()                               │
│           │              ▼                                         │
│           │         REFRESHING ─────────┐                         │
│           │              │               │                         │
│           │              │               │ UseCase fails           │
│           │    UseCase   │               │                         │
│           │    succeeds  │               ▼                         │
│           │              │           FAILURE                       │
│           │              │               │                         │
│           │              │               │ retry()                 │
│           │              │               │                         │
│           │              ▼               │                         │
│           └──────▶ SUCCESS/EMPTY ◄───────┘                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Transitions autorisées

| De          | Vers                         | Méthode      |
|-------------|------------------------------|--------------|
| Initial     | Loading                      | `load()`     |
| Loading     | Success                      | UseCase OK   |
| Loading     | Empty                        | UseCase OK   |
| Loading     | Failure                      | UseCase FAIL |
| Success     | Refreshing                   | `refresh()`  |
| Empty       | Refreshing                   | `refresh()`  |
| Refreshing  | Success                      | UseCase OK   |
| Refreshing  | Empty                        | UseCase OK   |
| Refreshing  | Failure                      | UseCase FAIL |
| Failure     | Loading                      | `retry()`    |

### Transitions INTERDITES

| De          | Vers        | Pourquoi?                                    |
|-------------|-------------|----------------------------------------------|
| Initial     | Success     | Doit passer par Loading pour montrer l'UI    |
| Success     | Loading     | Utiliser Refreshing pour garder les données  |
| Empty       | Loading     | Utiliser Refreshing                          |
| Failure     | Success     | Doit passer par Loading (retry)              |

---

## Flow: Premier Chargement

### Scénario: Charger le wallet au démarrage

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  1. INITIAL STATE                                                │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = initial  │                                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│              │ onInit() → load()                                 │
│              ▼                                                    │
│                                                                   │
│  2. LOADING STATE                                                │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = loading  │                                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: 🔄 Spinner  │                                         │
│     └──────────────────┘                                         │
│              │                                                    │
│              │ await getWalletUseCase()                          │
│              ▼                                                    │
│                                                                   │
│  3a. SUCCESS STATE (si UseCase OK)                               │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = success  │                                         │
│     │ data = WalletData│                                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: Afficher    │                                         │
│     │      le wallet   │                                         │
│     └──────────────────┘                                         │
│                                                                   │
│  3b. FAILURE STATE (si UseCase FAIL)                             │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = failure  │                                         │
│     │ message = error  │                                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: ❌ Error    │                                         │
│     │      + Retry btn │                                         │
│     └──────────────────┘                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Code

```dart
// ViewModel
class WalletViewModel extends BaseViewModel<WalletData> {
  WalletViewModel({required this.getWalletUseCase});

  final GetWallet getWalletUseCase;

  // onInit() automatiquement appelé → load()
  @override
  Future<void> load() async {
    // 1. Initial → Loading
    state = const ViewState.loading();

    // 2. Appeler le UseCase
    final result = await getWalletUseCase();

    // 3. Loading → Success/Failure
    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (wallet) => state = ViewState.success(wallet),
    );
  }
}

// View
class WalletScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(walletStateProvider);

    return Scaffold(
      body: state.map(
        initial: (_) => const SizedBox.shrink(), // Jamais visible en pratique
        loading: (_) => const Center(child: CircularProgressIndicator()), // 🔄
        refreshing: (s) => _buildContent(s.data),
        success: (s) => _buildContent(s.data), // ✅ Afficher le wallet
        empty: (e) => EmptyState(message: e.message),
        failure: (f) => ErrorState(message: f.message, onRetry: _retry), // ❌ + Retry
      ),
    );
  }
}
```

---

## Flow: Pull-to-Refresh

### Scénario: User fait un pull-to-refresh

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  1. SUCCESS STATE (données existantes)                          │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = success  │                                         │
│     │ data = WalletData│ (solde: 50000)                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: Afficher    │                                         │
│     │      50000 FCFA  │                                         │
│     └──────────────────┘                                         │
│              │                                                    │
│              │ User pulls down                                   │
│              ▼                                                    │
│                                                                   │
│  2. REFRESHING STATE                                             │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state=refreshing │                                         │
│     │ data = WalletData│ (solde: 50000) ← Anciennes données    │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: 🔄 Refresh  │                                         │
│     │      indicator   │                                         │
│     │      + 50000 FCFA│ ← Visible pendant refresh              │
│     └──────────────────┘                                         │
│              │                                                    │
│              │ await getWalletUseCase()                          │
│              ▼                                                    │
│                                                                   │
│  3. SUCCESS STATE (nouvelles données)                            │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = success  │                                         │
│     │ data = WalletData│ (solde: 75000) ← Nouvelles données    │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: Afficher    │                                         │
│     │      75000 FCFA  │ ← Solde mis à jour                     │
│     └──────────────────┘                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Code

```dart
// ViewModel
@override
Future<void> refresh() async {
  final currentData = state.dataOrNull;

  // 1. Success → Refreshing (garder les anciennes données)
  if (currentData != null) {
    state = ViewState.refreshing(currentData);
  }

  // 2. Appeler le UseCase
  final result = await getWalletUseCase();

  // 3. Refreshing → Success/Failure
  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (wallet) => state = ViewState.success(wallet), // Nouvelles données
  );
}

// View
Widget _buildContent(WalletData wallet) {
  return RefreshIndicator(
    onRefresh: _onRefresh, // User pull down
    child: Column(
      children: [
        Text('Solde: ${wallet.solde} FCFA'), // Visible pendant refresh
      ],
    ),
  );
}

Future<void> _onRefresh() async {
  final viewModel = ref.read(walletViewModelProvider.notifier);
  await viewModel.refresh(); // Success → Refreshing → Success
}
```

---

## Flow: Retry après Erreur

### Scénario: Erreur réseau → User appuie sur Retry

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  1. FAILURE STATE                                                │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = failure  │                                         │
│     │ message = "Erreur réseau"                                 │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: ❌ "Erreur  │                                         │
│     │      réseau"     │                                         │
│     │      [Réessayer] │                                         │
│     └──────────────────┘                                         │
│              │                                                    │
│              │ User appuie sur "Réessayer"                       │
│              ▼                                                    │
│                                                                   │
│  2. LOADING STATE                                                │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = loading  │                                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: 🔄 Spinner  │                                         │
│     └──────────────────┘                                         │
│              │                                                    │
│              │ await getWalletUseCase()                          │
│              ▼                                                    │
│                                                                   │
│  3. SUCCESS STATE                                                │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │ state = success  │                                         │
│     │ data = WalletData│                                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │  WalletScreen    │                                         │
│     │  UI: Afficher    │                                         │
│     │      le wallet   │                                         │
│     └──────────────────┘                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Code

```dart
// ViewModel
@override
Future<void> retry() async {
  // 1. Failure → Loading
  state = const ViewState.loading();

  // 2. Appeler le UseCase
  final result = await getWalletUseCase();

  // 3. Loading → Success/Failure
  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (wallet) => state = ViewState.success(wallet),
  );
}

// View
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(walletStateProvider);

  return state.map(
    // ...
    failure: (f) => ErrorState(
      message: f.message,
      onRetry: _onRetry, // ← Bouton Retry
    ),
  );
}

Future<void> _onRetry() async {
  final viewModel = ref.read(walletViewModelProvider.notifier);
  await viewModel.retry(); // Failure → Loading → Success
}
```

---

## Flow: Empty → Success

### Scénario: Liste vide → User ajoute un item

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  1. EMPTY STATE (liste vide)                                    │
│     ┌──────────────────┐                                         │
│     │BookingListVM     │                                         │
│     │ state = empty    │                                         │
│     │ message = "Aucune réservation"                            │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │BookingListScreen │                                         │
│     │  UI: 📭 Empty    │                                         │
│     │      "Aucune     │                                         │
│     │      réservation"│                                         │
│     └──────────────────┘                                         │
│              │                                                    │
│              │ User navigue vers VehicleScreen et crée booking   │
│              │ puis revient                                       │
│              ▼                                                    │
│                                                                   │
│  2. REFRESHING STATE (pull-to-refresh)                          │
│     ┌──────────────────┐                                         │
│     │BookingListVM     │                                         │
│     │ state=refreshing │                                         │
│     │ data = []        │ ← Liste vide                           │
│     └────────┬─────────┘                                         │
│              │                                                    │
│              │ await getBookingsUseCase()                        │
│              ▼                                                    │
│                                                                   │
│  3. SUCCESS STATE (liste avec données)                          │
│     ┌──────────────────┐                                         │
│     │BookingListVM     │                                         │
│     │ state = success  │                                         │
│     │ data = [booking1]│ ← Nouveau booking                      │
│     └────────┬─────────┘                                         │
│              │                                                    │
│     ┌────────┴─────────┐                                         │
│     │BookingListScreen │                                         │
│     │  UI: Afficher    │                                         │
│     │      liste       │                                         │
│     └──────────────────┘                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Code

```dart
// ViewModel
@override
Future<void> load() async {
  state = const ViewState.loading();

  final result = await getBookingsUseCase();

  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (bookings) {
      if (bookings.isEmpty) {
        state = const ViewState.empty(message: 'Aucune réservation'); // Empty
      } else {
        state = ViewState.success(bookings); // Success
      }
    },
  );
}

// View
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(bookingListStateProvider);

  return state.map(
    initial: (_) => const SizedBox.shrink(),
    loading: (_) => const Center(child: CircularProgressIndicator()),
    refreshing: (s) => _buildList(s.data), // Afficher liste vide pendant refresh
    success: (s) => _buildList(s.data), // Afficher liste avec données
    empty: (e) => EmptyState(
      message: e.message ?? 'Aucune réservation',
      icon: Icons.event_busy,
      action: ElevatedButton(
        onPressed: () => context.push('/vehicles'),
        child: const Text('Louer un véhicule'),
      ),
    ),
    failure: (f) => ErrorState(message: f.message, onRetry: _retry),
  );
}
```

---

## Exemples Complets

### Exemple 1: Wallet (Simple)

```dart
class WalletViewModel extends BaseViewModel<WalletData> {
  WalletViewModel({required this.getWalletUseCase});

  final GetWallet getWalletUseCase;

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  // 1. Initial → Loading → Success/Failure
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await getWalletUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (wallet) => state = ViewState.success(wallet),
    );
  }

  // 2. Success → Refreshing → Success/Failure
  @override
  Future<void> refresh() async {
    final currentData = state.dataOrNull;

    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    }

    await load();
  }

  // 3. Failure → Loading → Success/Failure
  @override
  Future<void> retry() async {
    await load();
  }
}
```

---

### Exemple 2: Booking List (avec Empty)

```dart
class BookingListViewModel extends BaseViewModel<List<Booking>> {
  BookingListViewModel({required this.getBookingsUseCase});

  final GetBookings getBookingsUseCase;

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  // 1. Initial → Loading → Success/Empty/Failure
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await getBookingsUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (bookings) {
        if (bookings.isEmpty) {
          state = const ViewState.empty(message: 'Aucune réservation');
        } else {
          state = ViewState.success(bookings);
        }
      },
    );
  }

  // 2. Success/Empty → Refreshing → Success/Empty/Failure
  @override
  Future<void> refresh() async {
    final currentData = state.dataOrNull;

    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    } else {
      // Si Empty, on ne peut pas passer en Refreshing (pas de données)
      // On passe directement en Loading
      state = const ViewState.loading();
    }

    final result = await getBookingsUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (bookings) {
        if (bookings.isEmpty) {
          state = const ViewState.empty(message: 'Aucune réservation');
        } else {
          state = ViewState.success(bookings);
        }
      },
    );
  }
}
```

---

### Exemple 3: Booking Details (avec initialize)

```dart
class BookingDetailsViewModel extends BaseViewModel<BookingDetails> {
  BookingDetailsViewModel({
    required this.getBookingDetailsUseCase,
    required this.cancelBookingUseCase,
  });

  final GetBookingDetails getBookingDetailsUseCase;
  final CancelBooking cancelBookingUseCase;

  String? _bookingId;

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  void initialize(String bookingId) {
    _bookingId = bookingId;
    load(); // Initial → Loading → Success/Failure
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  @override
  Future<void> load() async {
    if (_bookingId == null) return;

    state = const ViewState.loading();

    final result = await getBookingDetailsUseCase(bookingId: _bookingId!);

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (details) => state = ViewState.success(details),
    );
  }

  // =========================================================================
  // BUSINESS LOGIC
  // =========================================================================

  Future<void> cancelBooking() async {
    if (_bookingId == null) return;

    final result = await cancelBookingUseCase(bookingId: _bookingId!);

    result.fold(
      (failure) => showError(failure.message),
      (success) {
        showSuccess('Réservation annulée');
        navigateBack(result: true); // Effect
      },
    );
  }
}
```

---

## Best Practices

### 1. Toujours passer par Loading avant Success

```dart
// ✅ CORRECT
@override
Future<void> load() async {
  state = const ViewState.loading(); // État intermédiaire
  // ...
  state = ViewState.success(data);
}

// ❌ INCORRECT
@override
Future<void> load() async {
  // Pas de loading state!
  final result = await useCase();
  state = ViewState.success(result);
}
```

---

### 2. Utiliser Refreshing pour garder les données visibles

```dart
// ✅ CORRECT
@override
Future<void> refresh() async {
  final currentData = state.dataOrNull;

  if (currentData != null) {
    state = ViewState.refreshing(currentData); // Anciennes données visibles
  }

  await load();
}

// ❌ INCORRECT
@override
Future<void> refresh() async {
  state = const ViewState.loading(); // ❌ Cache les données!
  await load();
}
```

---

### 3. Gérer Empty pour les listes vides

```dart
// ✅ CORRECT
result.fold(
  (failure) => state = ViewState.failure(failure.message),
  (bookings) {
    if (bookings.isEmpty) {
      state = const ViewState.empty(message: 'Aucune réservation');
    } else {
      state = ViewState.success(bookings);
    }
  },
);

// ❌ INCORRECT
result.fold(
  (failure) => state = ViewState.failure(failure.message),
  (bookings) {
    state = ViewState.success(bookings); // Liste vide = Success
    // L'UI va afficher une liste vide sans message
  },
);
```

---

### 4. Afficher les anciennes données pendant Refreshing

```dart
// ✅ CORRECT
return state.map(
  initial: (_) => const SizedBox.shrink(),
  loading: (_) => const Center(child: CircularProgressIndicator()),
  refreshing: (s) => _buildContent(s.data), // ✅ Afficher les données
  success: (s) => _buildContent(s.data),
  empty: (e) => EmptyState(message: e.message),
  failure: (f) => ErrorState(message: f.message),
);

// ❌ INCORRECT
return state.map(
  initial: (_) => const SizedBox.shrink(),
  loading: (_) => const Center(child: CircularProgressIndicator()),
  refreshing: (_) => const Center(child: CircularProgressIndicator()), // ❌ Cache les données!
  success: (s) => _buildContent(s.data),
  empty: (e) => EmptyState(message: e.message),
  failure: (f) => ErrorState(message: f.message),
);
```

---

### 5. Retry relance load() (pas refresh())

```dart
// ✅ CORRECT
@override
Future<void> retry() async {
  await load(); // Failure → Loading → Success
}

// ❌ INCORRECT
@override
Future<void> retry() async {
  await refresh(); // Failure n'a pas de données → erreur avec Refreshing
}
```

---

## Conclusion

**Le State Lifecycle** garantit:

- ✅ **Comportement prévisible** - Transitions strictes
- ✅ **UI cohérente** - Pas de "flash" d'états incohérents
- ✅ **Bonne UX** - Loading indicators, anciennes données visibles pendant refresh
- ✅ **Débug facile** - Savoir quel état → quel état

**Règle finale:** Respectez les transitions autorisées et utilisez les bonnes méthodes (`load()`, `refresh()`, `retry()`).
