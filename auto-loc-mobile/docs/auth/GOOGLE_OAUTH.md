# Google OAuth - Implémentation Mobile

## ✅ Ce qui a été ajouté

### 1. Services

**`SupabaseService`** (`lib/core/services/supabase_service.dart`)
- Service centralisé pour toutes les opérations Supabase
- **Google OAuth:**
  - `signInWithGoogle()` - Lance le flow OAuth dans le navigateur
  - Deep link callback: `autoloc://auth-callback`
- **Email Auth:**
  - `signInWithEmail()` - Connexion par email/password
  - `signUpWithEmail()` - Inscription par email/password
- **Session:**
  - `getSession()` - Récupère la session Supabase
  - `currentUser` - Utilisateur connecté
  - `authStateChanges` - Stream de changements d'état
  - `getAccessToken()` - Récupère l'access token
  - `refreshSession()` - Refresh la session
  - `signOut()` - Déconnexion

### 2. ViewModel

**`GoogleAuthViewModel`** (`lib/features/auth/presentation/viewmodels/google_auth_viewmodel.dart`)
- Gère le flow OAuth complet
- **Methods:**
  - `signInWithGoogle()` - Démarre le flow (ouvre navigateur)
  - `handleOAuthCallback()` - Traite le callback après redirection
- **Flow:**
  1. Ouvrir Google OAuth
  2. Récupérer session Supabase après callback
  3. Sync avec backend NestJS (`POST /auth/login` avec accessToken)
  4. Démarrer session avec `SessionService`
  5. Navigation home

### 3. Widget

**`GoogleButton`** (`lib/shared/presentation/widgets/buttons/google_button.dart`)
- Bouton blanc avec bordure grise
- Logo Google officiel 4 couleurs (dessiné avec CustomPainter)
- États: Normal, Loading, Disabled
- Personnalisable: `label` (default: "Continuer avec Google")
- Design identique au web

### 4. Providers

**Ajouts dans `auth_providers.dart`:**
```dart
// Service Supabase
final supabaseServiceProvider = Provider<SupabaseService>

// Google OAuth ViewModel
final googleAuthViewModelProvider = StateNotifierProvider.autoDispose<GoogleAuthViewModel, AuthState>
final googleAuthEffectsProvider = StreamProvider.autoDispose<AuthEffect>
```

### 5. Écrans Mis à Jour

**PhoneLoginScreen:**
- ✅ Divider "OU" entre téléphone et Google
- ✅ `GoogleButton` avec label "Continuer avec Google"
- ✅ Gestion loading states (phone ET google)
- ✅ EffectHandler pour navigation

**RegisterScreen:**
- ✅ Divider "OU" entre formulaire et Google
- ✅ `GoogleButton` avec label "S'inscrire avec Google"
- ✅ Gestion loading states (register ET google)
- ✅ EffectHandler pour navigation

---

## 📱 UI Design

### PhoneLoginScreen

```
┌────────────────────────────────────────┐
│  [← Retour]                             │
│                                         │
│          [Logo AutoLoc]                 │
│                                         │
│       Bon retour !                      │
│   Connectez-vous à votre espace        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 🇸🇳 +221 | 77 123 45 67         │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ☐ J'accepte les CGU                   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Recevoir le code SMS            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ──────────── OU ────────────          │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ [G] Continuer avec Google        │  │ ← NOUVEAU
│  └──────────────────────────────────┘  │
│                                         │
│  Pas encore de compte ? Créer un compte│
│                                         │
│      🛡️ Sécurisé par AutoLoc           │
└────────────────────────────────────────┘
```

### RegisterScreen

```
┌────────────────────────────────────────┐
│  [← Retour]                             │
│                                         │
│       Créer un compte                   │
│  Rejoignez AutoLoc en quelques secondes│
│                                         │
│  Prénom: [_____________]               │
│  Nom:    [_____________]               │
│  Date:   [📅 12/05/1995]               │
│  Tél:    [🇸🇳 +221 | ___________]     │
│                                         │
│  ☐ J'accepte les CGU                   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Créer mon compte                │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ──────────── OU ────────────          │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ [G] S'inscrire avec Google       │  │ ← NOUVEAU
│  └──────────────────────────────────┘  │
│                                         │
│  Déjà un compte ? Se connecter         │
└────────────────────────────────────────┘
```

---

## 🔄 Flow Google OAuth

### Étape 1: Utilisateur clique sur "Continuer avec Google"

```dart
GoogleButton(
  onPressed: () => googleViewModel.signInWithGoogle(),
)
```

### Étape 2: ViewModel lance le flow OAuth

```dart
// GoogleAuthViewModel
await _supabaseService.signInWithGoogle()
// Ouvre le navigateur → Google OAuth
// Redirect URL: autoloc://auth-callback
```

### Étape 3: Deep Link Callback

Après authentification Google, l'app reçoit le callback:

```
autoloc://auth-callback?access_token=...&refresh_token=...
```

### Étape 4: Traitement du Callback

```dart
// Dans main.dart ou router
void handleDeepLink(Uri uri) {
  if (uri.scheme == 'autoloc' && uri.host == 'auth-callback') {
    // Trigger OAuth callback handler
    ref.read(googleAuthViewModelProvider.notifier).handleOAuthCallback();
  }
}
```

### Étape 5: Sync avec Backend NestJS

```dart
// GoogleAuthViewModel.handleOAuthCallback()
1. Récupérer session Supabase
2. POST /auth/login { accessToken: supabaseToken }
3. Backend retourne: { profile, tokens }
4. Créer UserSession
5. SessionService.startSession()
6. Navigation → /tenant ou /owner
```

---

## ⚙️ Configuration Requise

### 1. Supabase

**Initialisation** (dans `main.dart`):
```dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);
```

**OAuth Provider** (Dashboard Supabase):
- Activer Google OAuth
- Configurer Client ID & Secret
- Ajouter redirect URL: `autoloc://auth-callback`

### 2. Deep Links

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="autoloc" android:host="auth-callback" />
</intent-filter>
```

**iOS** (`ios/Runner/Info.plist`):
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>autoloc</string>
    </array>
  </dict>
</array>
```

### 3. Dependencies

```yaml
dependencies:
  supabase_flutter: ^2.0.0
  flutter_svg: ^2.0.0  # Pour le logo Google (optionnel si CustomPainter)
```

---

## 🎯 Comparaison Web vs Mobile

| Aspect | Web | Mobile |
|--------|-----|--------|
| **OAuth Trigger** | `signInWithOAuth()` | `signInWithGoogle()` |
| **Callback** | URL redirect | Deep link (`autoloc://`) |
| **Session Storage** | Cookies | SecureStorage |
| **Logo Google** | SVG inline | CustomPainter |
| **Navigation** | Next.js Router | GoRouter |

---

## 🐛 Points d'Attention

### 1. Deep Link Handler

Le handler doit être configuré dans `main.dart` ou le router:

```dart
// Exemple avec GoRouter
final router = GoRouter(
  routes: [...],
  redirect: (context, state) {
    // Gérer les deep links OAuth
    if (state.uri.scheme == 'autoloc' && state.uri.host == 'auth-callback') {
      // Déclencher handleOAuthCallback
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final container = ProviderScope.containerOf(context);
        container.read(googleAuthViewModelProvider.notifier).handleOAuthCallback();
      });
    }
    return null;
  },
);
```

### 2. Token Extraction

Actuellement le backend doit retourner ses propres tokens JWT:

```dart
// TODO dans GoogleAuthViewModel
final session = UserSession(
  accessToken: supabaseToken ?? '', // À REMPLACER par backend token
  refreshToken: '', // À RÉCUPÉRER du backend
  ...
);
```

**Solution**: Modifier le endpoint `/auth/login` pour retourner:
```json
{
  "profile": { ... },
  "accessToken": "nest_jwt_token",
  "refreshToken": "nest_refresh_token"
}
```

### 3. Loading States

Les deux ViewModels (Phone + Google) peuvent être en loading simultanément:

```dart
final isLoading = phoneState is ViewStateLoading;
final isGoogleLoading = googleState is ViewStateLoading;

// Désactiver tous les boutons si l'un des deux charge
disabled: isLoading || isGoogleLoading
```

---

## ✨ Prochaines Étapes

1. **Configurer Supabase** dans `main.dart`
2. **Configurer Deep Links** (Android + iOS)
3. **Tester le flow OAuth** en dev
4. **Modifier backend** pour retourner les tokens JWT
5. **Gérer les erreurs OAuth** (utilisateur annule, etc.)
6. **Ajouter analytics** (track OAuth success/failure)

---

Tout est prêt côté code ! Il ne reste plus qu'à configurer Supabase et les deep links. 🚀
