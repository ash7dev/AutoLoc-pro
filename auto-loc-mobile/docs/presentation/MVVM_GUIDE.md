# MVVM Architecture Guide - AutoLoc Mobile

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture MVVM](#architecture-mvvm)
- [Les 3 Couches](#les-3-couches)
- [State vs Effect](#state-vs-effect)
- [Data Flow](#data-flow)
- [Exemples Complets](#exemples-complets)
- [Best Practices](#best-practices)

---

## Vue d'ensemble

**AutoLoc Mobile** suit une architecture **MVVM (Model-View-ViewModel)** combinée avec **Clean Architecture** et **Riverpod** pour une séparation claire des responsabilités.

```
┌─────────────────────────────────────────────────────────────┐
│                       CLEAN ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐          │
│  │ Domain   │ ◄─── │   Data   │ ◄─── │ External │          │
│  │ (Rules)  │      │ (Repos)  │      │  (API)   │          │
│  └──────────┘      └──────────┘      └──────────┘          │
│       ▲                                                       │
│       │                                                       │
│       │                                                       │
│  ┌────┴──────────────────────────────────────────┐          │
│  │           PRESENTATION (MVVM)                  │          │
│  │                                                 │          │
│  │  ┌───────┐    ┌──────────┐    ┌──────────┐   │          │
│  │  │ View  │───▶│ViewModel │───▶│  Model   │   │          │
│  │  │(Screen)│◀───│  (Logic) │◀───│(UseCase) │   │          │
│  │  └───────┘    └──────────┘    └──────────┘   │          │
│  │                                                 │          │
│  └─────────────────────────────────────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture MVVM

**MVVM** sépare la UI (View), la logique de présentation (ViewModel) et les données (Model).

### Pourquoi MVVM?

- ✅ **Séparation des responsabilités** - UI, logique, données séparées
- ✅ **Testabilité** - ViewModel testable sans UI
- ✅ **Réutilisabilité** - Logique réutilisable entre différentes vues
- ✅ **Maintenabilité** - Changements isolés dans chaque couche

### Les 3 piliers

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│   VIEW (Screen)                                              │
│   ├─ Affiche l'UI                                            │
│   ├─ Écoute le State du ViewModel                           │
│   ├─ Écoute les Effects du ViewModel                        │
│   └─ Appelle les méthodes du ViewModel (user actions)       │
│                                                               │
│                        ▼ User Action                          │
│                        ▲ State / Effects                      │
│                                                               │
│   VIEWMODEL (Business Logic)                                 │
│   ├─ Gère le State (ViewState<T>)                           │
│   ├─ Émet des Effects (ViewEffect)                          │
│   ├─ Appelle les UseCases (Domain)                          │
│   └─ Transforme les résultats en State/Effects              │
│                                                               │
│                        ▼ Execute UseCase                      │
│                        ▲ Result<T>                            │
│                                                               │
│   MODEL (Domain)                                             │
│   ├─ Entities (User, Booking, Vehicle)                      │
│   ├─ UseCases (GetWallet, CreateBooking)                    │
│   └─ Repositories (interfaces)                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Les 3 Couches

### 1. View (Screen/Widget)

**Responsabilité:** Afficher l'UI et réagir aux changements d'état.

**Ce que la View FAIT:**
- ✅ Afficher l'UI (widgets)
- ✅ Watcher le State du ViewModel
- ✅ Écouter les Effects du ViewModel
- ✅ Appeler les méthodes du ViewModel (en réponse aux actions utilisateur)

**Ce que la View NE FAIT PAS:**
- ❌ Contenir de la business logic
- ❌ Appeler directement des UseCases
- ❌ Gérer du state complexe
- ❌ Faire des appels API

**Exemple:**
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
    // Écouter les effects (navigation, snackbar, etc.)
    listenToEffects(walletEffectsProvider);
  }

  @override
  Widget build(BuildContext context) {
    // Watcher le state
    final state = ref.watch(walletStateProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mon Wallet')),
      body: state.map(
        initial: (_) => const SizedBox.shrink(),
        loading: (_) => const Center(child: CircularProgressIndicator()),
        refreshing: (s) => _buildContent(s.data), // Afficher anciennes données pendant refresh
        success: (s) => _buildContent(s.data),
        empty: (e) => EmptyState(message: e.message ?? 'Aucune donnée'),
        failure: (f) => ErrorState(message: f.message, onRetry: _retry),
      ),
    );
  }

  Widget _buildContent(WalletData wallet) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: Column(
        children: [
          // Afficher le solde
          Text('Solde: ${wallet.solde} FCFA'),

          // Bouton de retrait
          ElevatedButton(
            onPressed: _requestWithdrawal,
            child: const Text('Demander un retrait'),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // USER ACTIONS - Appeler le ViewModel
  // =========================================================================

  Future<void> _refresh() async {
    final viewModel = ref.read(walletViewModelProvider.notifier);
    await viewModel.refresh();
  }

  Future<void> _retry() async {
    final viewModel = ref.read(walletViewModelProvider.notifier);
    await viewModel.retry();
  }

  Future<void> _requestWithdrawal() async {
    final viewModel = ref.read(walletViewModelProvider.notifier);
    await viewModel.requestWithdrawal(amount: 10000);
  }
}
```

---

### 2. ViewModel (Business Logic)

**Responsabilité:** Gérer le state, la business logic de présentation, et l'orchestration des UseCases.

**Ce que le ViewModel FAIT:**
- ✅ Gérer le State (`ViewState<T>`)
- ✅ Émettre des Effects (`ViewEffect`)
- ✅ Appeler les UseCases (Domain)
- ✅ Transformer les résultats (`Result<T>`) en State/Effects
- ✅ Gérer les erreurs et les afficher à l'utilisateur

**Ce que le ViewModel NE FAIT PAS:**
- ❌ Contenir des widgets
- ❌ Dépendre de `BuildContext`
- ❌ Faire des appels API directement (utiliser UseCases)
- ❌ Gérer la navigation directement (émettre des Effects)

**Exemple:**
```dart
class WalletViewModel extends BaseViewModel<WalletData> {
  WalletViewModel({
    required this.getWalletUseCase,
    required this.requestWithdrawalUseCase,
  });

  final GetWallet getWalletUseCase;
  final RequestWithdrawal requestWithdrawalUseCase;

  // =========================================================================
  // LIFECYCLE - Chargement initial
  // =========================================================================

  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await getWalletUseCase();

    result.fold(
      (failure) {
        state = ViewState.failure(failure.message, code: failure.code);
      },
      (wallet) {
        state = ViewState.success(wallet);
      },
    );
  }

  // =========================================================================
  // BUSINESS LOGIC - Demander un retrait
  // =========================================================================

  Future<void> requestWithdrawal({required int amount}) async {
    // Validation
    final currentWallet = state.dataOrNull;
    if (currentWallet == null) {
      showError('Erreur: Wallet non chargé');
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

    // Appel du UseCase
    final result = await requestWithdrawalUseCase(amount: amount);

    result.fold(
      (failure) {
        showError(failure.message);
      },
      (success) {
        // Succès - Afficher message + recharger le wallet
        showSuccess('Demande de retrait envoyée');
        load(); // Recharger pour avoir le nouveau solde
      },
    );
  }
}
```

---

### 3. Model (Domain)

**Responsabilité:** Représenter les règles métier, les entités, et les cas d'usage.

**Structure:**
```
domain/
├── entities/
│   ├── wallet_data.dart
│   ├── booking.dart
│   └── vehicle.dart
├── repositories/
│   └── wallet_repository.dart (interface)
└── usecases/
    ├── get_wallet.dart
    └── request_withdrawal.dart
```

**Exemple - Entity:**
```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'wallet_data.freezed.dart';
part 'wallet_data.g.dart';

@freezed
class WalletData with _$WalletData {
  const factory WalletData({
    required int solde,
    required int totalGains,
    required int totalRetraits,
    required List<Transaction> dernieresTransactions,
  }) = _WalletData;

  factory WalletData.fromJson(Map<String, dynamic> json) =>
      _$WalletDataFromJson(json);
}
```

**Exemple - UseCase:**
```dart
import '../../../../core/utils/result.dart';
import '../entities/wallet_data.dart';
import '../repositories/wallet_repository.dart';

class GetWallet {
  GetWallet({required this.repository});

  final WalletRepository repository;

  Future<Result<WalletData>> call() async {
    return await repository.getWallet();
  }
}
```

---

## State vs Effect

### Philosophie

**State** = Ce qui **persiste** (données à afficher)
**Effect** = Ce qui **se produit une fois** (navigation, snackbar)

### État (ViewState<T>)

**Définition:** Représente les **données** et l'**état de chargement** de la vue.

**Quand utiliser State:**
- ✅ Données à afficher (wallet balance, liste véhicules)
- ✅ État de chargement (loading, success, error)
- ✅ État vide (liste vide, recherche sans résultats)

**Types de State:**
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

**Exemple:**
```dart
// ✅ State - Données persistantes
state = ViewState.success(WalletData(
  solde: 50000,
  totalGains: 200000,
  totalRetraits: 150000,
  dernieresTransactions: [...],
));
```

### Effet (ViewEffect)

**Définition:** Représente des **événements one-shot** qui ne persistent pas.

**Quand utiliser Effect:**
- ✅ Navigation (aller à une page, revenir en arrière)
- ✅ Messages utilisateur (snackbar, toast, dialog)
- ✅ Actions système (copier dans le presse-papier, ouvrir URL)
- ✅ Permissions (demander accès caméra, localisation)

**Types d'Effects:**
```dart
sealed class ViewEffect {
  // Navigation
  const factory ViewEffect.navigateTo(String route, {Object? arguments}) = _NavigateTo;
  const factory ViewEffect.navigateBack({Object? result}) = _NavigateBack;

  // Messages
  const factory ViewEffect.showSnackbar(String message, {SnackbarType? type}) = _ShowSnackbar;
  const factory ViewEffect.showDialog({...}) = _ShowDialog;

  // System
  const factory ViewEffect.copyToClipboard(String text) = _CopyToClipboard;
  const factory ViewEffect.openUrl(String url) = _OpenUrl;
}
```

**Exemple:**
```dart
// ✅ Effect - Événement one-shot
emitEffect(ViewEffect.showSnackbar(
  'Demande de retrait envoyée',
  type: SnackbarType.success,
));

emitEffect(ViewEffect.navigateTo('/wallet/history'));
```

### Pourquoi séparer State et Effect?

**Problème sans Effects:**
```dart
// ❌ MAUVAIS - Mettre les messages dans le State
class WalletState {
  final WalletData? data;
  final bool showSuccessMessage; // ⚠️ Problème!
  final String? navigationRoute; // ⚠️ Problème!
}

// Si l'utilisateur quitte et revient, le message s'affiche à nouveau!
```

**Solution avec Effects:**
```dart
// ✅ BON - Effects émis UNE SEULE FOIS
class WalletViewModel extends BaseViewModel<WalletData> {
  Future<void> requestWithdrawal() async {
    // ... withdrawal logic

    // Effect émis UNE fois, puis disparaît
    emitEffect(ViewEffect.showSnackbar(
      'Retrait demandé',
      type: SnackbarType.success,
    ));
  }
}
```

---

## Data Flow

### Flow complet: User Action → State Update

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  1. USER ACTION                                                  │
│     User appuie sur "Demander un retrait"                       │
│                                                                   │
│     ┌────────────────┐                                           │
│     │  WalletScreen  │                                           │
│     │  (View)        │                                           │
│     └────────┬───────┘                                           │
│              │                                                    │
│              │ onPressed: () => viewModel.requestWithdrawal()    │
│              ▼                                                    │
│                                                                   │
│  2. VIEWMODEL - Business Logic                                   │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │                  │                                         │
│     │ requestWithdrawal() {                                      │
│     │   // Validation                                            │
│     │   if (amount < 5000) {                                     │
│     │     showError('Montant minimum: 5000 FCFA'); // Effect    │
│     │     return;                                                │
│     │   }                                                        │
│     │                                                             │
│     │   // Call UseCase                                          │
│     │   final result = await useCase(amount);                    │
│     │                                                             │
│     │   result.fold(                                             │
│     │     (failure) => showError(failure.message), // Effect     │
│     │     (success) {                                            │
│     │       showSuccess('Retrait demandé'); // Effect            │
│     │       load(); // Reload State                              │
│     │     },                                                     │
│     │   );                                                        │
│     │ }                                                          │
│     └────────┬─────────┘                                         │
│              │                                                    │
│              │ await requestWithdrawalUseCase(amount)            │
│              ▼                                                    │
│                                                                   │
│  3. DOMAIN - UseCase                                             │
│     ┌──────────────────────┐                                     │
│     │ RequestWithdrawal    │                                     │
│     │ (UseCase)            │                                     │
│     └────────┬─────────────┘                                     │
│              │                                                    │
│              │ repository.requestWithdrawal(amount)              │
│              ▼                                                    │
│                                                                   │
│  4. DATA - Repository                                            │
│     ┌──────────────────────┐                                     │
│     │ WalletRepository     │                                     │
│     │ (Implementation)     │                                     │
│     └────────┬─────────────┘                                     │
│              │                                                    │
│              │ POST /api/wallet/withdraw                         │
│              ▼                                                    │
│                                                                   │
│  5. EXTERNAL - API                                               │
│     ┌──────────────────┐                                         │
│     │  Backend API     │                                         │
│     └────────┬─────────┘                                         │
│              │                                                    │
│              │ { "success": true }                               │
│              ▼                                                    │
│                                                                   │
│  6. RESULT PROPAGATION                                           │
│     Result<void> → UseCase → ViewModel                           │
│                                                                   │
│              │                                                    │
│              │ result.fold(...)                                  │
│              ▼                                                    │
│                                                                   │
│  7. STATE UPDATE & EFFECTS                                       │
│     ┌──────────────────┐                                         │
│     │ WalletViewModel  │                                         │
│     │                  │                                         │
│     │ // Émet effect                                             │
│     │ emitEffect(ViewEffect.showSnackbar('Retrait demandé'));   │
│     │                                                             │
│     │ // Recharge le state                                       │
│     │ load(); // state = ViewState.loading() → success(...)      │
│     └────────┬─────────┘                                         │
│              │                                                    │
│              │ Stream<ViewEffect> + StateNotifier<ViewState>     │
│              ▼                                                    │
│                                                                   │
│  8. VIEW REACTS                                                  │
│     ┌────────────────┐                                           │
│     │  WalletScreen  │                                           │
│     │                │                                           │
│     │ // Effect handler affiche le snackbar                     │
│     │ handleEffect(ViewEffect.showSnackbar(...))                 │
│     │                                                             │
│     │ // State watcher rebuild le widget                        │
│     │ state.map(                                                 │
│     │   success: (s) => WalletContent(s.data), // Nouveau solde │
│     │   ...                                                      │
│     │ )                                                          │
│     └────────────────┘                                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Exemples Complets

### Exemple 1: Wallet Feature (Simple)

#### 1.1 Entity
```dart
// features/wallet/domain/entities/wallet_data.dart

@freezed
class WalletData with _$WalletData {
  const factory WalletData({
    required int solde,
    required int totalGains,
    required int totalRetraits,
  }) = _WalletData;

  factory WalletData.fromJson(Map<String, dynamic> json) =>
      _$WalletDataFromJson(json);
}
```

#### 1.2 UseCase
```dart
// features/wallet/domain/usecases/get_wallet.dart

class GetWallet {
  GetWallet({required this.repository});
  final WalletRepository repository;

  Future<Result<WalletData>> call() async {
    return await repository.getWallet();
  }
}
```

#### 1.3 ViewModel
```dart
// features/wallet/presentation/viewmodels/wallet_view_model.dart

class WalletViewModel extends BaseViewModel<WalletData> {
  WalletViewModel({required this.getWalletUseCase});

  final GetWallet getWalletUseCase;

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

#### 1.4 Providers
```dart
// features/wallet/presentation/providers/wallet_providers.dart

final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>((ref) {
  return WalletViewModel(
    getWalletUseCase: ref.read(getWalletUseCaseProvider),
  );
});

final walletStateProvider = Provider<ViewState<WalletData>>((ref) {
  return ref.watch(walletViewModelProvider);
});

final walletEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(walletViewModelProvider.notifier);
  return viewModel.effects;
});
```

#### 1.5 Screen
```dart
// features/wallet/presentation/screens/wallet_screen.dart

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
    listenToEffects(walletEffectsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(walletStateProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mon Wallet')),
      body: state.map(
        initial: (_) => const SizedBox.shrink(),
        loading: (_) => const Center(child: CircularProgressIndicator()),
        refreshing: (s) => _buildContent(s.data),
        success: (s) => _buildContent(s.data),
        empty: (e) => EmptyState(message: e.message),
        failure: (f) => ErrorState(message: f.message, onRetry: _retry),
      ),
    );
  }

  Widget _buildContent(WalletData wallet) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: SingleChildScrollView(
        child: Column(
          children: [
            Text('Solde: ${wallet.solde} FCFA'),
            Text('Gains totaux: ${wallet.totalGains} FCFA'),
            Text('Retraits totaux: ${wallet.totalRetraits} FCFA'),
          ],
        ),
      ),
    );
  }

  Future<void> _refresh() async {
    final viewModel = ref.read(walletViewModelProvider.notifier);
    await viewModel.refresh();
  }

  Future<void> _retry() async {
    final viewModel = ref.read(walletViewModelProvider.notifier);
    await viewModel.retry();
  }
}
```

---

### Exemple 2: Booking Feature (Complexe - List + Details)

#### 2.1 ViewModels

**BookingListViewModel:**
```dart
class BookingListViewModel extends BaseViewModel<List<Booking>> {
  BookingListViewModel({required this.getBookingsUseCase});

  final GetBookings getBookingsUseCase;

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

  void goToBookingDetails(String bookingId) {
    navigateTo('/booking/$bookingId');
  }
}
```

**BookingDetailsViewModel:**
```dart
class BookingDetailsViewModel extends BaseViewModel<BookingDetails> {
  BookingDetailsViewModel({
    required this.getBookingDetailsUseCase,
    required this.cancelBookingUseCase,
  });

  final GetBookingDetails getBookingDetailsUseCase;
  final CancelBooking cancelBookingUseCase;

  String? _bookingId;

  void initialize(String bookingId) {
    _bookingId = bookingId;
    load();
  }

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

  Future<void> cancelBooking() async {
    if (_bookingId == null) return;

    final result = await cancelBookingUseCase(bookingId: _bookingId!);

    result.fold(
      (failure) => showError(failure.message),
      (success) {
        showSuccess('Réservation annulée');
        navigateBack(result: true); // Retourner à la liste avec refresh
      },
    );
  }
}
```

#### 2.2 Providers
```dart
// Booking List
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

// Booking Details
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

#### 2.3 Screens

**BookingListScreen:**
```dart
class BookingListScreen extends ConsumerStatefulWidget {
  const BookingListScreen({super.key});

  @override
  ConsumerState<BookingListScreen> createState() => _BookingListScreenState();
}

class _BookingListScreenState extends ConsumerState<BookingListScreen>
    with EffectHandler {
  @override
  void initState() {
    super.initState();
    listenToEffects(bookingListEffectsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bookingListStateProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mes Réservations')),
      body: state.map(
        initial: (_) => const SizedBox.shrink(),
        loading: (_) => const Center(child: CircularProgressIndicator()),
        refreshing: (s) => _buildList(s.data),
        success: (s) => _buildList(s.data),
        empty: (e) => EmptyState(
          message: e.message ?? 'Aucune réservation',
          icon: Icons.event_busy,
        ),
        failure: (f) => ErrorState(message: f.message, onRetry: _retry),
      ),
    );
  }

  Widget _buildList(List<Booking> bookings) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView.builder(
        itemCount: bookings.length,
        itemBuilder: (context, index) {
          final booking = bookings[index];
          return BookingCard(
            booking: booking,
            onTap: () => _goToDetails(booking.id),
          );
        },
      ),
    );
  }

  Future<void> _refresh() async {
    final viewModel = ref.read(bookingListViewModelProvider.notifier);
    await viewModel.refresh();
  }

  Future<void> _retry() async {
    final viewModel = ref.read(bookingListViewModelProvider.notifier);
    await viewModel.retry();
  }

  void _goToDetails(String bookingId) {
    final viewModel = ref.read(bookingListViewModelProvider.notifier);
    viewModel.goToBookingDetails(bookingId);
  }
}
```

**BookingDetailsScreen:**
```dart
class BookingDetailsScreen extends ConsumerStatefulWidget {
  const BookingDetailsScreen({
    super.key,
    required this.bookingId,
  });

  final String bookingId;

  @override
  ConsumerState<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends ConsumerState<BookingDetailsScreen>
    with EffectHandler {
  @override
  void initState() {
    super.initState();
    listenToEffects(bookingDetailsEffectsProvider);

    // Initialize ViewModel with bookingId
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final viewModel = ref.read(bookingDetailsViewModelProvider.notifier);
      viewModel.initialize(widget.bookingId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bookingDetailsStateProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Détails Réservation')),
      body: state.map(
        initial: (_) => const SizedBox.shrink(),
        loading: (_) => const Center(child: CircularProgressIndicator()),
        refreshing: (s) => _buildContent(s.data),
        success: (s) => _buildContent(s.data),
        empty: (_) => const EmptyState(message: 'Réservation introuvable'),
        failure: (f) => ErrorState(message: f.message, onRetry: _retry),
      ),
    );
  }

  Widget _buildContent(BookingDetails details) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Détails de la réservation
          Text('Véhicule: ${details.vehicleName}'),
          Text('Dates: ${details.startDate} - ${details.endDate}'),
          Text('Prix total: ${details.totalPrice} FCFA'),

          // Bouton d'annulation
          if (details.canCancel)
            ElevatedButton(
              onPressed: _cancelBooking,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Annuler la réservation'),
            ),
        ],
      ),
    );
  }

  Future<void> _retry() async {
    final viewModel = ref.read(bookingDetailsViewModelProvider.notifier);
    await viewModel.retry();
  }

  Future<void> _cancelBooking() async {
    // Afficher dialog de confirmation
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Annuler la réservation?'),
        content: const Text('Cette action est irréversible'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Non'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Oui'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final viewModel = ref.read(bookingDetailsViewModelProvider.notifier);
      await viewModel.cancelBooking();
      // Le ViewModel émet un navigateBack effect après succès
    }
  }
}
```

---

## Best Practices

### 1. Toujours étendre BaseViewModel

```dart
// ✅ CORRECT
class WalletViewModel extends BaseViewModel<WalletData> {
  @override
  Future<void> load() async {
    // ...
  }
}

// ❌ INCORRECT - Ne pas créer son propre StateNotifier
class WalletViewModel extends StateNotifier<ViewState<WalletData>> {
  // Manque les helpers, les effects, etc.
}
```

### 2. Un ViewModel = Un ViewState<T>

```dart
// ✅ CORRECT - Un seul State
class WalletViewModel extends BaseViewModel<WalletData> {
  // state est ViewState<WalletData>
}

// ❌ INCORRECT - Plusieurs states
class WalletViewModel extends BaseViewModel<WalletData> {
  final StateNotifier<bool> isLoadingProvider = StateNotifier(false);
  final StateNotifier<String?> errorProvider = StateNotifier(null);
  // Trop compliqué! Utiliser ViewState.loading / ViewState.failure
}
```

### 3. Utiliser Effects pour les actions one-shot

```dart
// ✅ CORRECT - Effect pour navigation
Future<void> goToDetails(String id) async {
  emitEffect(ViewEffect.navigateTo('/details/$id'));
}

// ❌ INCORRECT - State pour navigation
class MyState {
  final String? navigationRoute; // State ne doit PAS contenir ça
}
```

### 4. Toujours gérer tous les cas de State dans la View

```dart
// ✅ CORRECT - Tous les cas gérés
return state.map(
  initial: (_) => const SizedBox.shrink(),
  loading: (_) => const Center(child: CircularProgressIndicator()),
  refreshing: (s) => _buildContent(s.data),
  success: (s) => _buildContent(s.data),
  empty: (e) => EmptyState(message: e.message),
  failure: (f) => ErrorState(message: f.message, onRetry: _retry),
);

// ❌ INCORRECT - Cas manquants
return state.maybeMap(
  success: (s) => _buildContent(s.data),
  orElse: () => const SizedBox.shrink(), // Pas de handling d'erreur!
);
```

### 5. Feature-Scoped Providers dans features/

```dart
// ✅ CORRECT
// features/wallet/presentation/providers/wallet_providers.dart
final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>(...);

// ❌ INCORRECT
// lib/shared/presentation/providers/global_providers.dart
final walletViewModelProvider = ... // Wallet est feature-specific!
```

### 6. Toujours utiliser le mixin EffectHandler

```dart
// ✅ CORRECT
class _WalletScreenState extends ConsumerState<WalletScreen>
    with EffectHandler {
  @override
  void initState() {
    super.initState();
    listenToEffects(walletEffectsProvider);
  }
}

// ❌ INCORRECT - Gérer les effects manuellement
class _WalletScreenState extends ConsumerState<WalletScreen> {
  @override
  void initState() {
    super.initState();
    // Manque le mixin, code boilerplate dupliqué
    ref.listen(walletEffectsProvider, (previous, next) {
      // ...
    });
  }
}
```

### 7. load() vs refresh()

```dart
// ✅ CORRECT
// Première fois
await viewModel.load(); // state = loading → success

// Pull-to-refresh
await viewModel.refresh(); // state = refreshing(oldData) → success(newData)

// Après erreur
await viewModel.retry(); // state = loading → success
```

### 8. Valider dans le ViewModel, pas dans la View

```dart
// ✅ CORRECT - Validation dans ViewModel
class WalletViewModel extends BaseViewModel<WalletData> {
  Future<void> requestWithdrawal(int amount) async {
    if (amount < 5000) {
      showError('Montant minimum: 5000 FCFA');
      return;
    }
    // ...
  }
}

// ❌ INCORRECT - Validation dans View
class WalletScreen extends ConsumerWidget {
  void _requestWithdrawal(int amount) {
    if (amount < 5000) {
      ScaffoldMessenger.of(context).showSnackBar(...);
      return;
    }
    viewModel.requestWithdrawal(amount);
  }
}
```

---

## Conclusion

**MVVM** avec **ViewState** et **ViewEffect** garantit:

- ✅ **Séparation claire** - View, ViewModel, Model isolés
- ✅ **Testabilité** - ViewModel testable sans UI
- ✅ **Consistance** - Tous les screens suivent le même pattern
- ✅ **Maintenabilité** - Changements isolés
- ✅ **Réutilisabilité** - Logique partageable

**Règle finale:** Si vous hésitez, demandez-vous:
- **"Est-ce une donnée à afficher?"** → State
- **"Est-ce un événement one-shot?"** → Effect
- **"Est-ce de la business logic?"** → ViewModel
- **"Est-ce de l'UI?"** → View
