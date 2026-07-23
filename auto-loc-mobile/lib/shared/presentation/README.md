# Presentation Layer - Architecture Overview

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure](#structure)
- [Composants Principaux](#composants-principaux)
- [Quick Start](#quick-start)
- [Ressources](#ressources)

---

## Vue d'ensemble

La **Presentation Layer** de AutoLoc Mobile suit une architecture **MVVM (Model-View-ViewModel)** stricte avec **Riverpod** pour la gestion d'état.

### Objectifs

- ✅ **Séparation des responsabilités** - View, ViewModel, Model isolés
- ✅ **Cohérence** - TOUS les screens suivent le même pattern
- ✅ **Testabilité** - ViewModels testables sans UI
- ✅ **Maintenabilité** - Code prévisible et facile à modifier
- ✅ **Réutilisabilité** - Composants partagés

### Principes Fondamentaux

1. **Un ViewModel = Un ViewState<T>** - Pas de multiple states
2. **State vs Effect** - State = données persistantes, Effect = événements one-shot
3. **BaseViewModel obligatoire** - Tous les ViewModels étendent BaseViewModel
4. **EffectHandler pour les Effects** - Mixin pour gérer les effects
5. **Feature-Scoped Providers** - Chaque feature a ses providers

---

## Structure

```
lib/shared/presentation/
├── README.md                           ← Ce fichier
├── base/
│   ├── view_state.dart                 ← États génériques (Loading, Success, etc.)
│   ├── view_effect.dart                ← Effets one-shot (Navigation, Snackbar, etc.)
│   ├── base_view_model.dart            ← Classe de base pour tous les ViewModels
│   └── effect_handler.dart             ← Mixin pour gérer les effects
├── providers/
│   ├── README.md                       ← Stratégie des providers
│   └── global_providers.dart           ← Providers globaux (session, auth, etc.)
└── widgets/                            ← Widgets réutilisables (TODO)

features/{{FEATURE}}/presentation/
├── providers/
│   └── {{FEATURE}}_providers.dart      ← Providers feature-scoped
├── viewmodels/
│   └── {{FEATURE}}_view_model.dart     ← ViewModel
├── screens/
│   └── {{FEATURE}}_screen.dart         ← Screen (View)
└── widgets/
    └── {{FEATURE}}_widget.dart         ← Widgets custom (optionnel)
```

---

## Composants Principaux

### 1. ViewState<T>

**Fichier:** [base/view_state.dart](base/view_state.dart)

**Description:** État générique pour TOUS les ViewModels.

**États disponibles:**
- `Initial` - État de départ
- `Loading` - Chargement initial
- `Refreshing` - Rafraîchissement avec données existantes
- `Success` - Données chargées
- `Empty` - Pas de données (liste vide, etc.)
- `Failure` - Erreur

**Exemple:**
```dart
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

**Documentation complète:** [docs/presentation/STATE_LIFECYCLE.md](../../docs/presentation/STATE_LIFECYCLE.md)

---

### 2. ViewEffect

**Fichier:** [base/view_effect.dart](base/view_effect.dart)

**Description:** Événements one-shot (navigation, messages, etc.).

**Effects disponibles:**
- **Navigation**: `navigateTo`, `navigateBack`, `navigateReplace`
- **Messages**: `showSnackbar`, `showToast`, `showDialog`, `showBottomSheet`
- **System**: `copyToClipboard`, `openUrl`, `shareText`, `launchCall`
- **Permissions**: `requestPermission`

**Exemple:**
```dart
class WalletViewModel extends BaseViewModel<WalletData> {
  Future<void> requestWithdrawal() async {
    // ... withdrawal logic

    showSuccess('Retrait demandé');
    navigateTo('/wallet/history');
  }
}
```

**Philosophie:** State = persistent, Effect = one-shot

---

### 3. BaseViewModel<T>

**Fichier:** [base/base_view_model.dart](base/base_view_model.dart)

**Description:** Classe abstraite que TOUS les ViewModels DOIVENT étendre.

**Méthodes obligatoires:**
- `load()` - Charger les données (abstract)

**Méthodes fournies:**
- `onInit()` - Initialisation (appelle load())
- `refresh()` - Pull-to-refresh
- `retry()` - Réessayer après erreur
- `dispose()` - Cleanup

**Helpers fournis:**
```dart
// Messages
showSuccess(String message);
showError(String message);
showWarning(String message);
showInfo(String message);

// Navigation
navigateTo(String route);
navigateBack({Object? result});
navigateReplace(String route);

// System
copyToClipboard(String text);
openUrl(String url);
shareText(String text);
```

**Exemple:**
```dart
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

**Documentation complète:** [docs/presentation/VIEWMODEL_RULES.md](../../docs/presentation/VIEWMODEL_RULES.md)

---

### 4. EffectHandler

**Fichier:** [base/effect_handler.dart](base/effect_handler.dart)

**Description:** Mixin pour gérer les effects dans les Screens.

**Usage:**
```dart
class WalletScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen>
    with EffectHandler {
  @override
  void initState() {
    super.initState();
    listenToEffects(walletEffectsProvider); // ← Écouter les effects
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(walletStateProvider);
    // ... UI
  }
}
```

**Gestion automatique:**
- Navigation via go_router
- Snackbar avec couleurs selon le type
- Dialog
- Bottom Sheet
- Clipboard
- URL Launcher
- Share
- Phone Call

---

### 5. Providers Strategy

**Fichier:** [providers/README.md](providers/README.md)

**Description:** Stratégie de séparation Global vs Feature-Scoped.

**Global Providers** (`shared/presentation/providers/global_providers.dart`):
- Session & Auth (`sessionProvider`, `currentUserProvider`, `isAuthenticatedProvider`)
- Business Logic Guards (`canMakeReservationProvider`, `canCreateVehicleProvider`)
- UI State (`notificationBadgeProvider`, `themeProvider`)

**Feature-Scoped Providers** (`features/*/presentation/providers/`):
- ViewModelProvider
- StateProvider (alias)
- EffectsProvider

**Exemple:**
```dart
// Global - shared/presentation/providers/global_providers.dart
final currentUserProvider = Provider<User?>((ref) {
  // ...
});

// Feature-Scoped - features/wallet/presentation/providers/wallet_providers.dart
final walletViewModelProvider = StateNotifierProvider<WalletViewModel, ViewState<WalletData>>((ref) {
  return WalletViewModel(getWalletUseCase: ref.read(getWalletUseCaseProvider));
});

final walletStateProvider = Provider<ViewState<WalletData>>((ref) {
  return ref.watch(walletViewModelProvider);
});

final walletEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(walletViewModelProvider.notifier);
  return viewModel.effects;
});
```

---

## Quick Start

### Créer une Nouvelle Feature

#### 1. Utiliser le Feature Template

```bash
# Copier le template
cp -r feature_template/ features/my_feature/

# Renommer les fichiers
cd features/my_feature/
find . -name "*.template" | while read file; do
  mv "$file" "${file%.template}"
done

# Remplacer les placeholders
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/my_feature/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{Feature}}/MyFeature/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{feature}}/myFeature/g' {} \;

# Renommer les fichiers
find . -type f -name "*{{FEATURE}}*" | while read file; do
  newname=$(echo "$file" | sed 's/{{FEATURE}}/my_feature/g')
  mv "$file" "$newname"
done
```

**Voir:** [feature_template/USAGE.md](../../feature_template/USAGE.md)

---

#### 2. Adapter le Code

**Domain Layer:**
```dart
// domain/entities/my_feature_entity.dart
@freezed
class MyFeature with _$MyFeature {
  const factory MyFeature({
    required String id,
    required String name,
  }) = _MyFeature;

  factory MyFeature.fromJson(Map<String, dynamic> json) =>
      _$MyFeatureFromJson(json);
}
```

**ViewModel:**
```dart
// presentation/viewmodels/my_feature_view_model.dart
class MyFeatureViewModel extends BaseViewModel<MyFeature> {
  MyFeatureViewModel({required this.getMyFeatureUseCase});

  final GetMyFeature getMyFeatureUseCase;

  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await getMyFeatureUseCase();

    result.fold(
      (failure) => state = ViewState.failure(failure.message),
      (feature) => state = ViewState.success(feature),
    );
  }
}
```

**Screen:**
```dart
// presentation/screens/my_feature_screen.dart
class MyFeatureScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<MyFeatureScreen> createState() => _MyFeatureScreenState();
}

class _MyFeatureScreenState extends ConsumerState<MyFeatureScreen>
    with EffectHandler {
  @override
  void initState() {
    super.initState();
    listenToEffects(myFeatureEffectsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(myFeatureStateProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Feature')),
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

  Widget _buildContent(MyFeature feature) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: SingleChildScrollView(
        child: Text(feature.name),
      ),
    );
  }

  Future<void> _refresh() async {
    await ref.read(myFeatureViewModelProvider.notifier).refresh();
  }

  Future<void> _retry() async {
    await ref.read(myFeatureViewModelProvider.notifier).retry();
  }
}
```

---

#### 3. Générer le Code Freezed

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

---

#### 4. Valider

**Checklist:**
- [ ] ViewModel étend `BaseViewModel<T>`
- [ ] `load()` implémenté
- [ ] Providers créés (ViewModel, State, Effects)
- [ ] Screen avec `EffectHandler` mixin
- [ ] Tous les états gérés dans `build()`
- [ ] Compilation réussie sans warning

---

## Ressources

### Documentation Complète

- **[MVVM_GUIDE.md](../../docs/presentation/MVVM_GUIDE.md)** - Architecture MVVM complète
- **[VIEWMODEL_RULES.md](../../docs/presentation/VIEWMODEL_RULES.md)** - Règles pour les ViewModels
- **[STATE_LIFECYCLE.md](../../docs/presentation/STATE_LIFECYCLE.md)** - Lifecycle des states
- **[Provider Strategy](providers/README.md)** - Stratégie des providers

### Templates

- **[feature_template/](../../feature_template/)** - Template générique pour créer des features
- **[feature_template/USAGE.md](../../feature_template/USAGE.md)** - Guide d'utilisation du template

### Code Source

- **[base/view_state.dart](base/view_state.dart)** - ViewState<T>
- **[base/view_effect.dart](base/view_effect.dart)** - ViewEffect
- **[base/base_view_model.dart](base/base_view_model.dart)** - BaseViewModel<T>
- **[base/effect_handler.dart](base/effect_handler.dart)** - EffectHandler mixin
- **[providers/global_providers.dart](providers/global_providers.dart)** - Providers globaux

---

## Prochaines Étapes

### Phase 8: Feature Splash (Premier Validation)

Créer la feature Splash en utilisant le template pour valider l'architecture:

1. Copier le template
2. Adapter le code (SplashData, check version, load config)
3. Créer l'UI (logo + animation)
4. Valider que tout fonctionne

### Phase 9: Feature Onboarding (Deuxième Validation)

Créer la feature Onboarding pour valider à nouveau:

1. Copier le template
2. Adapter le code (OnboardingPages, track progress)
3. Créer l'UI (PageView + indicateur)
4. Valider

### Phase 10+: Features de Production

Créer les features de production:

1. **Settings** - Configuration de l'app
2. **Notifications** - Gestion des notifications
3. **Auth** - Authentification (Login, Register, KYC)
4. **Home** - Page d'accueil
5. **Wallet** (Presentation) - Affichage du wallet
6. **Booking** (Presentation) - Gestion des réservations
7. **Vehicle** (Presentation) - Gestion des véhicules
8. **User** (Presentation) - Profil utilisateur
9. **Disputes** (Presentation) - Gestion des litiges

---

## Support

En cas de question ou de problème:

1. Consultez la documentation dans [docs/presentation/](../../docs/presentation/)
2. Vérifiez les exemples dans [feature_template/](../../feature_template/)
3. Relisez les règles dans [VIEWMODEL_RULES.md](../../docs/presentation/VIEWMODEL_RULES.md)

**Règle finale:** En cas de doute, suivez EXACTEMENT le template et les exemples fournis.
