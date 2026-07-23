# ViewModel Rules - Règles et Conventions

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure Obligatoire](#structure-obligatoire)
- [Méthodes Lifecycle](#méthodes-lifecycle)
- [State Management](#state-management)
- [Effect Management](#effect-management)
- [Quand utiliser Success vs Empty](#quand-utiliser-success-vs-empty)
- [Quand émettre Effect vs State](#quand-émettre-effect-vs-state)
- [Anti-Patterns](#anti-patterns)
- [Checklist de Validation](#checklist-de-validation)

---

## Vue d'ensemble

**Tous les ViewModels** de l'app DOIVENT suivre les mêmes règles strictes pour garantir:

- ✅ **Cohérence** - Tous les ViewModels fonctionnent de la même façon
- ✅ **Maintenabilité** - Règles claires pour tous les devs
- ✅ **Testabilité** - Comportement prévisible
- ✅ **Qualité** - Pas de divergence architecturale

---

## Structure Obligatoire

### Règle #1: Toujours étendre BaseViewModel<T>

```dart
// ✅ CORRECT
class WalletViewModel extends BaseViewModel<WalletData> {
  // ...
}

// ❌ INCORRECT
class WalletViewModel extends StateNotifier<ViewState<WalletData>> {
  // Manque les helpers, effects stream, etc.
}

// ❌ INCORRECT
class WalletViewModel {
  // Pas de state management du tout
}
```

**Pourquoi?**
- `BaseViewModel` fournit: state, effects stream, helpers, lifecycle hooks
- Garantit que TOUS les ViewModels ont la même API
- Réduit le boilerplate

---

### Règle #2: Déclarer les dépendances en constructor

```dart
// ✅ CORRECT - UseCases injectés via constructor
class WalletViewModel extends BaseViewModel<WalletData> {
  WalletViewModel({
    required this.getWalletUseCase,
    required this.requestWithdrawalUseCase,
  });

  final GetWallet getWalletUseCase;
  final RequestWithdrawal requestWithdrawalUseCase;

  @override
  Future<void> load() async {
    final result = await getWalletUseCase();
    // ...
  }
}

// ❌ INCORRECT - Créer les UseCases à l'intérieur
class WalletViewModel extends BaseViewModel<WalletData> {
  @override
  Future<void> load() async {
    final useCase = GetWallet(repository: WalletRepository()); // ❌ Hard-coded!
    // ...
  }
}
```

**Pourquoi?**
- Facilite les tests (mock des UseCases)
- Respecte Dependency Injection
- Évite le couplage fort

---

### Règle #3: Un ViewModel = Un seul Type de State

```dart
// ✅ CORRECT - Un seul ViewState<T>
class WalletViewModel extends BaseViewModel<WalletData> {
  // state est ViewState<WalletData>
}

// ❌ INCORRECT - Plusieurs states
class WalletViewModel extends BaseViewModel<WalletData> {
  final StateNotifier<bool> isLoadingState = StateNotifier(false);
  final StateNotifier<String?> errorState = StateNotifier(null);
  final StateNotifier<WalletData?> dataState = StateNotifier(null);

  // Trop compliqué! ViewState gère déjà loading, error, data
}
```

**Pourquoi?**
- `ViewState<T>` contient déjà: loading, error, data, empty
- Évite la complexité de synchroniser plusieurs states
- UI plus simple (un seul state à watcher)

---

## Méthodes Lifecycle

### Règle #4: Toujours implémenter load()

**load()** est la méthode **abstraite** de `BaseViewModel` - vous DEVEZ l'implémenter.

```dart
// ✅ CORRECT
class WalletViewModel extends BaseViewModel<WalletData> {
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await getWalletUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (wallet) => state = ViewState.success(wallet),
    );
  }
}

// ❌ INCORRECT - Pas de load()
class WalletViewModel extends BaseViewModel<WalletData> {
  // Compilation error! load() est abstract
}
```

**Quand load() est-elle appelée?**
- Automatiquement dans `onInit()` (appelé au constructor)
- Manuellement via `retry()` (après erreur)
- Jamais appelée directement depuis la View (utiliser `retry()`)

---

### Règle #5: Utiliser refresh() pour le pull-to-refresh

**refresh()** est fournie par `BaseViewModel` - ne la surchargez que si nécessaire.

```dart
// ✅ CORRECT - Utiliser refresh() par défaut
// Dans la View
Future<void> _onRefresh() async {
  final viewModel = ref.read(walletViewModelProvider.notifier);
  await viewModel.refresh();
}

// ✅ CORRECT - Surcharger si logique custom
class WalletViewModel extends BaseViewModel<WalletData> {
  @override
  Future<void> refresh() async {
    // Custom logic avant refresh
    print('Refreshing wallet...');

    // Appeler le refresh de BaseViewModel
    await super.refresh();
  }
}

// ❌ INCORRECT - Appeler load() depuis la View pour refresh
Future<void> _onRefresh() async {
  final viewModel = ref.read(walletViewModelProvider.notifier);
  await viewModel.load(); // ❌ Utiliser refresh() à la place!
}
```

**Différence load() vs refresh():**
- `load()`: state = loading (pas de données affichées)
- `refresh()`: state = refreshing(oldData) (anciennes données visibles pendant chargement)

---

### Règle #6: Ne jamais surcharger onInit() sans appeler super

```dart
// ✅ CORRECT
class WalletViewModel extends BaseViewModel<WalletData> {
  @override
  void onInit() {
    super.onInit(); // ← Appelle load()

    // Custom init logic
    _startPeriodicRefresh();
  }

  @override
  Future<void> load() async {
    // ...
  }
}

// ❌ INCORRECT - Oublier super.onInit()
class WalletViewModel extends BaseViewModel<WalletData> {
  @override
  void onInit() {
    // super.onInit(); ← Manquant! load() ne sera jamais appelé
    _startPeriodicRefresh();
  }
}
```

---

## State Management

### Règle #7: Toujours passer par les états intermédiaires

```dart
// ✅ CORRECT - Loading → Success/Failure
@override
Future<void> load() async {
  state = const ViewState.loading(); // État intermédiaire

  final result = await getWalletUseCase();

  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (wallet) => state = ViewState.success(wallet),
  );
}

// ❌ INCORRECT - Sauter l'état loading
@override
Future<void> load() async {
  final result = await getWalletUseCase(); // ❌ Pas de loading state!

  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (wallet) => state = ViewState.success(wallet),
  );
}
```

**Pourquoi?**
- L'UI doit montrer un indicateur de chargement
- L'utilisateur sait que quelque chose se passe
- Évite l'impression de freeze

---

### Règle #8: Gérer TOUS les cas d'erreur

```dart
// ✅ CORRECT - Tous les cas gérés
@override
Future<void> load() async {
  state = const ViewState.loading();

  try {
    final result = await getWalletUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message, code: failure.code),
      (wallet) => state = ViewState.success(wallet),
    );
  } catch (e, stackTrace) {
    // Gérer les exceptions non prévues
    debugPrint('Unexpected error: $e\n$stackTrace');
    state = const ViewState.failure('Une erreur inattendue est survenue');
  }
}

// ❌ INCORRECT - Exceptions non gérées
@override
Future<void> load() async {
  state = const ViewState.loading();

  final result = await getWalletUseCase(); // Si ça throw, crash!

  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (wallet) => state = ViewState.success(wallet),
  );
}
```

---

### Règle #9: Utiliser dataOrNull pour accéder aux données

```dart
// ✅ CORRECT - Utiliser dataOrNull
Future<void> requestWithdrawal(int amount) async {
  final currentWallet = state.dataOrNull;

  if (currentWallet == null) {
    showError('Wallet non chargé');
    return;
  }

  if (amount > currentWallet.solde) {
    showError('Solde insuffisant');
    return;
  }

  // ...
}

// ❌ INCORRECT - Cast dangereux
Future<void> requestWithdrawal(int amount) async {
  final currentWallet = (state as _Success<WalletData>).data; // ❌ Peut crash!

  // ...
}
```

---

## Effect Management

### Règle #10: Utiliser les helpers pour émettre des Effects

`BaseViewModel` fournit des helpers - utilisez-les plutôt que `emitEffect()` directement.

```dart
// ✅ CORRECT - Utiliser les helpers
Future<void> requestWithdrawal() async {
  // ...
  result.fold(
    (failure) => showError(failure.message), // Helper
    (success) {
      showSuccess('Retrait demandé'); // Helper
      navigateTo('/wallet/history'); // Helper
    },
  );
}

// ❌ INCORRECT - Utiliser emitEffect() directement
Future<void> requestWithdrawal() async {
  // ...
  result.fold(
    (failure) => emitEffect(ViewEffect.showSnackbar(
      failure.message,
      type: SnackbarType.error,
    )),
    (success) {
      emitEffect(ViewEffect.showSnackbar(
        'Retrait demandé',
        type: SnackbarType.success,
      ));
      emitEffect(ViewEffect.navigateTo('/wallet/history'));
    },
  );
}
```

**Helpers disponibles:**
```dart
// Messages
showSuccess(String message);
showError(String message);
showWarning(String message);
showInfo(String message);
showToast(String message);

// Navigation
navigateTo(String route, {Object? arguments});
navigateBack({Object? result});
navigateReplace(String route, {Object? arguments});

// System
copyToClipboard(String text);
openUrl(String url);
shareText(String text);
launchCall(String phone);
```

---

### Règle #11: Ne jamais émettre d'Effect pour des données

```dart
// ❌ INCORRECT - Effect pour données
Future<void> load() async {
  final result = await getWalletUseCase();

  result.fold(
    (failure) => emitEffect(ViewEffect.showError(failure.message)),
    (wallet) => emitEffect(ViewEffect.showWallet(wallet)), // ❌ Les données vont dans le State!
  );
}

// ✅ CORRECT - State pour données, Effect pour messages
Future<void> load() async {
  state = const ViewState.loading();

  final result = await getWalletUseCase();

  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (wallet) => state = ViewState.success(wallet), // ✅ State
  );
}
```

---

## Quand utiliser Success vs Empty

### Règle #12: Empty pour listes vides, Success pour données

```dart
// ✅ CORRECT - Empty pour liste vide
class BookingListViewModel extends BaseViewModel<List<Booking>> {
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
}

// ✅ CORRECT - Success même si certaines valeurs sont nullables
class UserProfileViewModel extends BaseViewModel<UserProfile> {
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await getUserProfileUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (profile) {
        // Même si profile.bio == null, on met Success
        // car on a bien récupéré le profil
        state = ViewState.success(profile);
      },
    );
  }
}

// ❌ INCORRECT - Empty pour données nullables
class UserProfileViewModel extends BaseViewModel<UserProfile> {
  @override
  Future<void> load() async {
    // ...
    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (profile) {
        if (profile.bio == null) {
          state = const ViewState.empty(); // ❌ Ce n'est pas "vide", c'est un profil incomplet
        } else {
          state = ViewState.success(profile);
        }
      },
    );
  }
}
```

**Règle simple:**
- **Success**: Il y a des données à afficher (même partielles)
- **Empty**: Aucune donnée (liste vide, recherche sans résultats)

---

## Quand émettre Effect vs State

### Règle #13: Effect = One-shot, State = Persistent

```dart
// ✅ CORRECT
Future<void> deleteBooking(String id) async {
  final result = await deleteBookingUseCase(id: id);

  result.fold(
    (failure) {
      // Erreur → Effect (message one-shot)
      showError(failure.message);
    },
    (success) {
      // Succès → Effect (message) + State (reload)
      showSuccess('Réservation supprimée');
      load(); // Recharger la liste
    },
  );
}

// ❌ INCORRECT - State pour message
Future<void> deleteBooking(String id) async {
  final result = await deleteBookingUseCase(id: id);

  result.fold(
    (failure) {
      // ❌ Message dans le State
      state = ViewState.failure(failure.message);
    },
    (success) {
      // ❌ Message dans le State
      state = ViewState.success('Réservation supprimée'); // Type error!
    },
  );
}
```

**Questions à se poser:**
- **"Si l'user quitte et revient, doit-il voir ça à nouveau?"**
  - Oui → State (données)
  - Non → Effect (message, navigation)

- **"Est-ce une donnée à afficher ou une action à effectuer?"**
  - Donnée → State
  - Action → Effect

---

### Règle #14: Émettre Effect PUIS modifier State

```dart
// ✅ CORRECT - Effect PUIS State
Future<void> createBooking() async {
  final result = await createBookingUseCase(...);

  result.fold(
    (failure) => showError(failure.message),
    (booking) {
      showSuccess('Réservation créée'); // 1. Effect
      navigateTo('/booking/${booking.id}'); // 2. Effect
      // Pas besoin de modifier state - on a navigué ailleurs
    },
  );
}

// ✅ CORRECT - Effect + reload State
Future<void> cancelBooking(String id) async {
  final result = await cancelBookingUseCase(id: id);

  result.fold(
    (failure) => showError(failure.message),
    (success) {
      showSuccess('Réservation annulée'); // 1. Effect
      load(); // 2. State - reload liste
    },
  );
}

// ❌ INCORRECT - State PUIS Effect (confusion)
Future<void> createBooking() async {
  final result = await createBookingUseCase(...);

  result.fold(
    (failure) => state = ViewState.failure(failure.message),
    (booking) {
      state = ViewState.success(booking); // ❌ Inutile si on navigue
      navigateTo('/booking/${booking.id}');
    },
  );
}
```

---

## Anti-Patterns

### ❌ Anti-Pattern #1: Business Logic dans la View

```dart
// ❌ MAUVAIS
class WalletScreen extends ConsumerWidget {
  void _requestWithdrawal(int amount) {
    final wallet = ref.read(walletStateProvider).dataOrNull;

    if (wallet == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Wallet non chargé')),
      );
      return;
    }

    if (amount < 5000) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Montant minimum: 5000 FCFA')),
      );
      return;
    }

    if (amount > wallet.solde) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Solde insuffisant')),
      );
      return;
    }

    // Appeler le ViewModel
    ref.read(walletViewModelProvider.notifier).requestWithdrawal(amount);
  }
}

// ✅ BON - Validation dans le ViewModel
class WalletViewModel extends BaseViewModel<WalletData> {
  Future<void> requestWithdrawal(int amount) async {
    final currentWallet = state.dataOrNull;

    if (currentWallet == null) {
      showError('Wallet non chargé');
      return;
    }

    if (amount < 5000) {
      showError('Montant minimum: 5000 FCFA');
      return;
    }

    if (amount > currentWallet.solde) {
      showError('Solde insuffisant');
      return;
    }

    // ... call UseCase
  }
}

// View - Simple
class WalletScreen extends ConsumerWidget {
  void _requestWithdrawal(int amount) {
    ref.read(walletViewModelProvider.notifier).requestWithdrawal(amount);
  }
}
```

---

### ❌ Anti-Pattern #2: Appeler des UseCases depuis la View

```dart
// ❌ MAUVAIS
class WalletScreen extends ConsumerWidget {
  Future<void> _loadWallet() async {
    final useCase = ref.read(getWalletUseCaseProvider);
    final result = await useCase();

    result.fold(
      (failure) => ScaffoldMessenger.of(context).showSnackBar(...),
      (wallet) {
        // Comment mettre à jour le state depuis ici? 🤔
      },
    );
  }
}

// ✅ BON - UseCases appelés depuis le ViewModel
class WalletViewModel extends BaseViewModel<WalletData> {
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await getWalletUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (wallet) => state = ViewState.success(wallet),
    );
  }
}
```

---

### ❌ Anti-Pattern #3: Dépendre de BuildContext dans le ViewModel

```dart
// ❌ MAUVAIS
class WalletViewModel extends BaseViewModel<WalletData> {
  final BuildContext context; // ❌ JAMAIS!

  WalletViewModel({required this.context});

  Future<void> goToHistory() async {
    Navigator.of(context).push(...); // ❌ ViewModel ne doit pas dépendre de l'UI
  }
}

// ✅ BON - Utiliser Effects
class WalletViewModel extends BaseViewModel<WalletData> {
  void goToHistory() {
    navigateTo('/wallet/history'); // Effect
  }
}
```

---

### ❌ Anti-Pattern #4: State mutable

```dart
// ❌ MAUVAIS
class WalletData {
  WalletData({required this.solde});

  int solde; // ❌ Mutable!
}

class WalletViewModel extends BaseViewModel<WalletData> {
  Future<void> addFunds(int amount) async {
    final currentWallet = state.dataOrNull;
    if (currentWallet != null) {
      currentWallet.solde += amount; // ❌ Mutation directe!
      state = ViewState.success(currentWallet); // Riverpod ne détecte pas le changement
    }
  }
}

// ✅ BON - State immutable (Freezed)
@freezed
class WalletData with _$WalletData {
  const factory WalletData({
    required int solde,
  }) = _WalletData;
}

class WalletViewModel extends BaseViewModel<WalletData> {
  Future<void> addFunds(int amount) async {
    final currentWallet = state.dataOrNull;
    if (currentWallet != null) {
      // Créer une nouvelle instance
      final updatedWallet = currentWallet.copyWith(
        solde: currentWallet.solde + amount,
      );
      state = ViewState.success(updatedWallet); // Riverpod détecte le changement
    }
  }
}
```

---

### ❌ Anti-Pattern #5: Oublier de gérer l'état refreshing

```dart
// ❌ MAUVAIS - Refreshing non géré
return state.map(
  initial: (_) => const SizedBox.shrink(),
  loading: (_) => const Center(child: CircularProgressIndicator()),
  refreshing: (_) => const Center(child: CircularProgressIndicator()), // ❌ Cache les anciennes données!
  success: (s) => _buildContent(s.data),
  empty: (e) => EmptyState(message: e.message),
  failure: (f) => ErrorState(message: f.message),
);

// ✅ BON - Afficher les anciennes données pendant refresh
return state.map(
  initial: (_) => const SizedBox.shrink(),
  loading: (_) => const Center(child: CircularProgressIndicator()),
  refreshing: (s) => _buildContent(s.data), // ✅ Afficher les données
  success: (s) => _buildContent(s.data),
  empty: (e) => EmptyState(message: e.message),
  failure: (f) => ErrorState(message: f.message),
);
```

---

## Checklist de Validation

Avant de considérer qu'un ViewModel est terminé, vérifiez:

### Structure
- [ ] Le ViewModel étend `BaseViewModel<T>`
- [ ] Les UseCases sont injectés via constructor
- [ ] Un seul type de State (`ViewState<T>`)

### Lifecycle
- [ ] `load()` est implémenté
- [ ] `load()` met `state = loading` avant d'appeler le UseCase
- [ ] `onInit()` appelle `super.onInit()` si surchargé
- [ ] `refresh()` est utilisé pour pull-to-refresh (ou non surchargé)

### State Management
- [ ] Tous les cas d'erreur sont gérés (try/catch + result.fold)
- [ ] Success vs Empty utilisé correctement
- [ ] `dataOrNull` utilisé pour accéder aux données
- [ ] State immutable (Freezed)

### Effect Management
- [ ] Helpers utilisés (`showSuccess`, `showError`, `navigateTo`, etc.)
- [ ] Pas d'Effect pour des données (uniquement State)
- [ ] Effects émis AVANT modification de State

### Anti-Patterns
- [ ] Pas de business logic dans la View
- [ ] Pas d'appel direct aux UseCases depuis la View
- [ ] Pas de dépendance à `BuildContext`
- [ ] Pas de mutation directe du State

### View (Screen)
- [ ] Mixin `EffectHandler` ajouté
- [ ] `listenToEffects()` appelé dans `initState()`
- [ ] Tous les cas de State gérés dans `build()` (initial, loading, refreshing, success, empty, failure)
- [ ] Refreshing affiche les anciennes données

---

## Conclusion

**En respectant ces règles**, vous garantissez:

- ✅ **Cohérence** - Tous les ViewModels suivent le même pattern
- ✅ **Qualité** - Pas de code spaghetti
- ✅ **Maintenabilité** - Code prévisible et facile à modifier
- ✅ **Testabilité** - ViewModels testables sans UI

**Règle finale:** En cas de doute, référez-vous à `BaseViewModel` et suivez les exemples de la doc.
