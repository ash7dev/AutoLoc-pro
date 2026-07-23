# 🏗️ Architecture & Gestion d'État - AutoLoc Mobile

## 📐 Pattern: MVVM + Riverpod + States/Effects Séparés

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                          FEATURE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────────┐  │
│  │  SCREEN  │───▶│  VIEWMODEL  │───▶│  USE CASES       │  │
│  │  (View)  │◀───│  (States +  │◀───│  (Business Logic)│  │
│  └──────────┘    │   Effects)  │    └──────────────────┘  │
│       │          └─────────────┘              │            │
│       │                 │                     │            │
│       │          ┌──────▼──────┐      ┌──────▼──────┐    │
│       └─────────▶│   STATES    │      │ REPOSITORY  │    │
│                  │ (UI State)  │      │  (Data)     │    │
│                  └─────────────┘      └─────────────┘    │
│                  ┌─────────────┐              │           │
│                  │   EFFECTS   │      ┌───────▼───────┐  │
│                  │ (Side       │      │  DATA SOURCE  │  │
│                  │  Effects)   │      │  (API/Local)  │  │
│                  └─────────────┘      └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Séparation States / Effects

**States** (ViewState):
- État de l'UI (loading, success, error)
- Données à afficher
- Rebuilds du widget

**Effects** (ViewEffect):
- Navigation
- Snackbars/Toasts
- Dialogs
- Permissions
- **One-shot events** (pas de rebuild)

## 🔧 Configuration Riverpod

### 1. main.dart

```dart
void main() async {
  await bootstrap(
    () => ProviderScope(
      observers: [
        if (Env.instance.isDevelopment) AppProviderObserver(),
      ],
      child: const App(),
    ),
  );
}
```

### 2. Providers Globaux

#### Session (Authentification)

```dart
// Vérifier si authentifié
final isAuth = ref.watch(isAuthenticatedProvider);

// Récupérer la session
final session = ref.watch(currentSessionProvider);

// Vérifier les permissions
final canBook = ref.watch(canMakeReservationProvider);
final canCreateVehicle = ref.watch(canCreateVehicleProvider);
```

#### Connectivité

```dart
// Vérifier si en ligne
final isOnline = ref.watch(isOnlineProvider);

// Afficher banner offline si besoin
if (ref.watch(isOfflineProvider)) {
  return const OfflineBanner();
}
```

#### Thème

```dart
// Toggle dark/light mode
ref.read(themeModeProvider.notifier).toggleThemeMode();

// Vérifier si dark mode
final isDark = ref.watch(isDarkModeProvider);
```

## 📝 Exemple Complet: Feature Login

### 1. Structure de la Feature

```
features/
  auth/
    di/
      injection.dart
    domain/
      usecases/
        login_usecase.dart
      repositories/
        auth_repository.dart
    data/
      dto/
        login_request.dto.dart
        login_response.dto.dart
      repositories/
        auth_repository_impl.dart
      datasources/
        auth_remote_datasource.dart
    presentation/
      states/
        login_state.dart      ← States (UI state)
      effects/
        login_effect.dart     ← Effects (side-effects)
      viewmodels/
        login_viewmodel.dart  ← ViewModel
      providers/
        login_providers.dart  ← Providers Riverpod
      screens/
        login_screen.dart     ← Screen (View)
      widgets/
        login_form.dart
```

### 2. States (login_state.dart)

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/user_session.dart';

part 'login_state.freezed.dart';

@freezed
class LoginState with _$LoginState {
  const factory LoginState.initial() = _Initial;
  const factory LoginState.loading() = _Loading;
  const factory LoginState.success(UserSession session) = _Success;
  const factory LoginState.failure(String error) = _Failure;
}
```

### 3. Effects (login_effect.dart)

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'login_effect.freezed.dart';

@freezed
class LoginEffect with _$LoginEffect {
  const factory LoginEffect.showError(String message) = _ShowError;
  const factory LoginEffect.navigateToHome() = _NavigateToHome;
  const factory LoginEffect.navigateToOnboarding() = _NavigateToOnboarding;
}
```

### 4. ViewModel (login_viewmodel.dart)

```dart
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../states/login_state.dart';
import '../effects/login_effect.dart';
import '../../domain/usecases/login_usecase.dart';

class LoginViewModel extends StateNotifier<LoginState> {
  LoginViewModel(this._loginUseCase) : super(const LoginState.initial());

  final LoginUseCase _loginUseCase;

  // Stream pour les effects (one-shot events)
  final _effectController = StreamController<LoginEffect>.broadcast();
  Stream<LoginEffect> get effects => _effectController.stream;

  @override
  void dispose() {
    _effectController.close();
    super.dispose();
  }

  /// Login avec email/password
  Future<void> login(String email, String password) async {
    // 1. État loading
    state = const LoginState.loading();

    // 2. Exécuter le use case
    final result = await _loginUseCase.execute(
      LoginParams(email: email, password: password),
    );

    // 3. Gérer le résultat
    result.fold(
      // Erreur
      (failure) {
        state = LoginState.failure(failure.displayMessage);
        _effectController.add(
          LoginEffect.showError(failure.displayMessage),
        );
      },
      // Succès
      (session) {
        state = LoginState.success(session);
        _effectController.add(const LoginEffect.navigateToHome());
      },
    );
  }
}
```

### 5. Providers (login_providers.dart)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../states/login_state.dart';
import '../viewmodels/login_viewmodel.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../di/injection.dart';

/// Provider pour le LoginViewModel
final loginViewModelProvider =
    StateNotifierProvider<LoginViewModel, LoginState>((ref) {
  return LoginViewModel(ref.watch(loginUseCaseProvider));
});

/// Provider pour le LoginUseCase
final loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  return sl<LoginUseCase>();
});
```

### 6. Screen (login_screen.dart)

```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/login_providers.dart';
import '../states/login_state.dart';
import '../effects/login_effect.dart';
import '../../../../core/navigation/routes.dart';
import '../../../../core/utils/extensions/context_x.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  late StreamSubscription<LoginEffect> _effectsSubscription;

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();

    // Écouter les effects (one-shot events)
    _effectsSubscription = ref
        .read(loginViewModelProvider.notifier)
        .effects
        .listen((effect) {
      effect.when(
        showError: (message) {
          // Afficher snackbar d'erreur
          context.showErrorSnackbar(message);
        },
        navigateToHome: () {
          // Naviguer vers home
          context.go(Routes.home);
        },
        navigateToOnboarding: () {
          // Naviguer vers onboarding
          context.go(Routes.onboarding);
        },
      );
    });
  }

  @override
  void dispose() {
    _effectsSubscription.cancel();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    ref.read(loginViewModelProvider.notifier).login(
          _emailController.text,
          _passwordController.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    // Écouter l'état (rebuilds automatiques)
    final state = ref.watch(loginViewModelProvider);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Email input
              AppTextField(
                controller: _emailController,
                label: 'Email',
                keyboardType: TextInputType.emailAddress,
                enabled: !state.isLoading,
              ),
              const SizedBox(height: 16),

              // Password input
              AppTextField(
                controller: _passwordController,
                label: 'Mot de passe',
                obscureText: true,
                enabled: !state.isLoading,
              ),
              const SizedBox(height: 24),

              // Login button
              PrimaryButton(
                label: 'Se connecter',
                onPressed: _handleLogin,
                isLoading: state.isLoading,
                fullWidth: true,
              ),

              // Error message (optionnel, peut aussi être dans effect)
              if (state is _Failure)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Text(
                    (state as _Failure).error,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
```

## 🎯 Bonnes Pratiques

### 1. Séparation des Responsabilités

✅ **States** = État de l'UI (rebuilds)
```dart
state = const LoginState.loading(); // UI se rebuild
```

✅ **Effects** = Side-effects (one-shot)
```dart
_effectController.add(const LoginEffect.navigateToHome()); // Pas de rebuild
```

### 2. Utilisation de freezed

```dart
// Générer les classes
@freezed
class LoginState with _$LoginState {
  const factory LoginState.initial() = _Initial;
  const factory LoginState.loading() = _Loading;
  const factory LoginState.success(UserSession session) = _Success;
  const factory LoginState.failure(String error) = _Failure;
}

// Puis lancer:
// flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. Pattern matching avec when/maybeWhen

```dart
state.when(
  initial: () => const Text('Initial'),
  loading: () => const LoadingView(),
  success: (session) => Text('Welcome ${session.email}'),
  failure: (error) => ErrorView(message: error),
);

// Ou si on ne veut gérer que certains cas:
state.maybeWhen(
  loading: () => const LoadingView(),
  orElse: () => const SizedBox(),
);
```

### 4. Dispose des StreamControllers

```dart
@override
void dispose() {
  _effectController.close(); // ← IMPORTANT
  super.dispose();
}
```

### 5. Listen aux effects dans initState

```dart
@override
void initState() {
  super.initState();
  _effectsSubscription = ref.read(viewModelProvider.notifier)
    .effects.listen(_handleEffect);
}

@override
void dispose() {
  _effectsSubscription.cancel(); // ← IMPORTANT
  super.dispose();
}
```

## 📚 Providers Utiles

### StateNotifierProvider (pour ViewModels)

```dart
final myViewModelProvider =
    StateNotifierProvider<MyViewModel, MyState>((ref) {
  return MyViewModel(ref.watch(myUseCaseProvider));
});
```

### StreamProvider (pour streams)

```dart
final sessionStreamProvider = StreamProvider<UserSession?>((ref) {
  return ref.watch(sessionServiceProvider).sessionStream;
});
```

### FutureProvider (pour futures)

```dart
final userProvider = FutureProvider<User>((ref) async {
  return await ref.watch(userRepositoryProvider).getUser();
});
```

### Provider (pour dépendances)

```dart
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return sl<AuthRepository>();
});
```

## 🚀 Génération du Code freezed

```bash
# Générer une fois
flutter pub run build_runner build --delete-conflicting-outputs

# Watch mode (re-générer automatiquement)
flutter pub run build_runner watch --delete-conflicting-outputs
```

## ✅ Checklist Feature

- [ ] States créés avec freezed
- [ ] Effects créés avec freezed
- [ ] ViewModel avec StateNotifier
- [ ] StreamController pour effects + dispose
- [ ] Providers créés
- [ ] Screen écoute effects dans initState
- [ ] Disposal des subscriptions
- [ ] Use cases testés
- [ ] Repository testé

---

**Architecture robuste = Code maintenable ! 🎯**
