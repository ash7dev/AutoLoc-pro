# Flux d'Authentification Mobile - AutoLoc

## Analyse du Frontend Web

### 1. Architecture d'Authentification Web

Le frontend web utilise:
- **Next.js App Router** avec routes groupées `(auth)` et `(public)`
- **Supabase Auth** pour l'authentification email/Google OAuth
- **Backend NestJS** pour la synchronisation et les tokens JWT
- **Middleware Next.js** pour la protection des routes

### 2. Flow d'Authentification Téléphone (Principal)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOGIN PHONE SCREEN                                           │
│    - Saisie du numéro de téléphone (+221...)                   │
│    - Validation format                                           │
│    - Acceptation CGU                                            │
│    - Bouton "Recevoir le code SMS"                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. POST /auth/phone-login/send-otp                             │
│    Body: { phone: "+221XXXXXXXXX" }                            │
│    Response: { expiresIn: 300 }                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. OTP VERIFICATION SCREEN                                      │
│    - 6 champs pour le code OTP                                  │
│    - Auto-submit quand les 6 chiffres sont saisis             │
│    - Timer de 300s avec bouton "Renvoyer"                      │
│    - Support paste du code complet                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. POST /auth/phone-login/verify-otp                           │
│    Body: { phone: "+221XXX", code: "123456" }                  │
│    Response: {                                                  │
│      accessToken: "...",                                        │
│      refreshToken: "...",                                       │
│      activeRole: "LOCATAIRE",                                  │
│      profile: { ... }                                           │
│    }                                                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. SESSION CREATION                                             │
│    - Sauvegarde tokens dans SecureStorage                      │
│    - Création UserSession avec profil                          │
│    - Mise à jour SessionService                                │
│    - Émission événement authenticated                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. NAVIGATION CONDITIONNELLE                                    │
│    - Si !hasUtilisateur → /complete-profile                    │
│    - Si role === PROPRIETAIRE → /owner/shell                  │
│    - Sinon → /tenant/shell (home)                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Flow d'Authentification Email (Secondaire)

```
Login Email → POST /auth/login (Supabase)
           → Sync with NestJS (POST /auth/login avec accessToken)
           → Session + Navigation
```

### 4. Composants Web Clés

#### **login-form.tsx**
- Tabs: Téléphone / Email
- PhoneField avec validation internationale
- Gestion erreurs + session expirée
- 3 hooks: `useLogin`, `useLoginOtp`, `useOAuth`

#### **otp-form.tsx**
- 6 inputs OTP avec auto-focus
- Auto-submit sur code complet
- Support paste multidigit
- Timer countdown avec resend
- Prefetch des destinations

#### **use-auth-flow.ts**
- `redirectAfterAuth()`: logique de redirection
- Sync NestJS (email ou phone)
- Switch de rôle si nécessaire
- Completion de profil en background
- Navigation selon rôle (ADMIN/SUPPORT/PROPRIETAIRE/LOCATAIRE)

### 5. Middleware Protection

```typescript
// middleware.ts
- Vérification JWT signature avec jose
- Redirection / → /dashboard/owner si PROPRIETAIRE
- Protection /dashboard/* avec role check
- Session expirée → /login?expired=1&next=...
```

### 6. Endpoints Backend

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/auth/phone-login/send-otp` | POST | Envoie OTP WhatsApp/SMS |
| `/auth/phone-login/verify-otp` | POST | Vérifie OTP et retourne tokens |
| `/auth/check-availability` | GET | Vérifie si email/phone disponible |
| `/auth/login` | POST | Login Supabase avec accessToken |
| `/auth/refresh` | POST | Refresh les tokens JWT |
| `/auth/me` | GET | Récupère le profil utilisateur |
| `/auth/logout` | POST | Déconnexion |
| `/auth/complete-profile` | POST | Complète le profil (prenom, nom, dateNaissance) |
| `/auth/switch-role` | PATCH | Change LOCATAIRE ↔ PROPRIETAIRE |

---

## Implémentation Mobile Flutter

### 1. Structure des Écrans

```
features/auth/presentation/screens/
├── phone_login_screen.dart         # Saisie téléphone
├── otp_verification_screen.dart    # Vérification OTP
└── complete_profile_screen.dart    # Complétion profil si nécessaire
```

### 2. Navigation Flow Mobile

```dart
// Routes
/login                    → PhoneLoginScreen
/login/verify             → OtpVerificationScreen (args: phone, expiresIn)
/complete-profile         → CompleteProfileScreen
/tenant                   → TenantShell (after login LOCATAIRE)
/owner                    → OwnerShell (after login PROPRIETAIRE)
```

### 3. ViewModels MVVM

#### **PhoneLoginViewModel**
```dart
State:
- PhoneLoginFormState (phone, isValid, agreedToTerms)
- OtpVerificationFormState (code, expiresIn, canResend)
- ViewState<AuthUser> (loading, success, failure)

Methods:
- updatePhone(String phone)
- toggleTermsAgreement()
- sendOtp() → navigateToOtpVerification
- updateOtpCode(String code)
- verifyOtp() → startSession → navigateToHome/CompleteProfile
- resendOtp()

Effects:
- NavigateToOtpVerification
- NavigateToCompleteProfile
- NavigateToHome
- ShowError/ShowSuccess
- StartOtpTimer
```

### 4. Providers Riverpod

```dart
// Session
final sessionServiceProvider = Provider<SessionService>

// Auth State
final authStateProvider = StateNotifierProvider<AuthStateNotifier, AuthState>
final isAuthenticatedProvider = Provider<bool>
final currentUserProvider = Provider<UserSession?>

// Phone Login
final phoneLoginViewModelProvider = StateNotifierProvider.autoDispose
final phoneLoginStateProvider = Provider
final phoneLoginEffectsProvider = StreamProvider
```

### 5. SessionService Integration

```dart
class SessionService {
  // Streams
  Stream<AuthState> get authStateStream;
  Stream<UserSession?> get sessionStream;

  // State
  bool get isAuthenticated;
  UserRole? get currentRole;
  String? get userId;

  // Actions
  Future<void> initialize();
  Future<void> startSession(UserSession);
  Future<void> updateSession(UserSession);
  Future<void> endSession();
  Future<void> refreshTokens({accessToken, refreshToken});

  // Guards
  bool canMakeReservation();
  bool canCreateVehicle();
  bool canRequestWithdrawal();
}
```

### 6. Écrans UI

#### **PhoneLoginScreen**
- Logo AutoLoc centré
- Titre: "Bon retour !" ou "Bienvenue"
- PhoneField avec CountryCodePicker (+221 par défaut)
- Checkbox CGU
- Bouton primaire "Recevoir le code SMS"
- Fond blanc avec accents émeraude
- Animation shimmer sur loading

#### **OtpVerificationScreen**
- Header avec icône Smartphone
- Texte: "Saisissez le code envoyé par WhatsApp ou SMS au numéro +221..."
- 6 champs OTP avec border emerald quand rempli
- Auto-submit sur 6ème chiffre
- Timer circulaire: "Renvoyer dans 04:32"
- Bouton "Renvoyer le code" (actif après expiration)
- Warning: "Seul le dernier code reçu est valide"

#### **CompleteProfileScreen**
- Titre: "Complétez votre profil"
- Champs: Prénom, Nom, Date de naissance
- Bouton "Continuer"
- Skip possible si données Supabase disponibles

### 7. Design System

```dart
Colors:
- Primary: Color(0xFF10B981) // emerald-500
- Dark: Color(0xFF0D0D0D)    // near black
- Error: Color(0xFFEF4444)   // red-500
- Success: Color(0xFF34D399) // emerald-400

Typography:
- Hero: fontSize 32, fontWeight 900 (black)
- Title: fontSize 24, fontWeight 700 (bold)
- Body: fontSize 16, fontWeight 400 (regular)
- Caption: fontSize 14, fontWeight 500 (medium)

Components:
- Rounded corners: 16px (xl)
- Button height: 56px
- Input padding: 16px
- Shadow: elevation 2
```

### 8. Gestion d'Erreurs

```dart
Common Errors:
1. Code invalide → "Le code saisi est incorrect"
2. Code expiré → "Le code a expiré. Demandez-en un nouveau"
3. Téléphone invalide → "Numéro de téléphone invalide"
4. Réseau → "Connexion impossible. Vérifiez votre réseau"
5. Session expirée → Auto-refresh ou redirect login

User Feedback:
- Snackbar pour succès/erreurs
- Loading indicator sur boutons
- Disabled state pendant loading
- Haptic feedback sur actions
```

### 9. Tokens & Security

```dart
Storage:
- AccessToken → SecureStorage (Keychain iOS / Keystore Android)
- RefreshToken → SecureStorage
- UserId → SecureStorage
- UserRole → SecureStorage

Auto-Refresh:
- AuthInterceptor détecte 401
- Appelle POST /auth/refresh
- Sauvegarde nouveaux tokens
- Retry la requête originale
- Si refresh fail → clearTokens + redirect login

Session Persistence:
- Au démarrage app → SessionService.initialize()
- Lit accessToken depuis SecureStorage
- Si présent → crée session partielle
- Appelle GET /auth/me pour profil complet
- Émet AuthState.authenticated
```

### 10. Navigation Guards

```dart
// Router config
final router = GoRouter(
  routes: [
    GoRoute(path: '/login', builder: PhoneLoginScreen),
    GoRoute(
      path: '/tenant',
      redirect: (context, state) {
        if (!sessionService.isAuthenticated) return '/login';
        if (sessionService.currentRole != UserRole.tenant) return '/';
        return null;
      },
    ),
    GoRoute(
      path: '/owner',
      redirect: (context, state) {
        if (!sessionService.isAuthenticated) return '/login';
        if (sessionService.currentRole != UserRole.owner) return '/';
        return null;
      },
    ),
  ],
);
```

### 11. Tests à Effectuer

- [ ] Login avec numéro valide → OTP reçu
- [ ] OTP correct → navigation selon rôle
- [ ] OTP incorrect → message erreur
- [ ] OTP expiré → bouton resend actif
- [ ] Resend OTP → nouveau code reçu
- [ ] Session persistence → restart app → reste connecté
- [ ] Token refresh → requête avec 401 → auto-refresh
- [ ] Logout → tokens cleared → redirect login
- [ ] Complete profile → données sauvegardées
- [ ] Switch role → navigation adaptée

---

## Différences Web vs Mobile

| Aspect | Web | Mobile |
|--------|-----|--------|
| Auth Method | Email/Phone/Google | Phone only (priorité) |
| Navigation | Next.js Router | GoRouter |
| State | React hooks | Riverpod + MVVM |
| Storage | Cookies | SecureStorage + SharedPreferences |
| Middleware | Next.js middleware | Navigation guards |
| UI | Responsive design | Native Flutter widgets |
| OTP Input | 6 inputs HTML | 6 TextFields Flutter |
| Timer | useState + useEffect | StateNotifier + Timer |

---

## Prochaines Étapes

1. ✅ Créer AuthState, AuthEffect, PhoneLoginViewModel
2. ⏳ Créer auth providers Riverpod
3. ⏳ Créer PhoneLoginScreen UI
4. ⏳ Créer OtpVerificationScreen UI
5. ⏳ Créer CompleteProfileScreen UI
6. ⏳ Intégrer SessionService avec providers
7. ⏳ Configurer navigation guards
8. ⏳ Tester flow complet end-to-end
9. ⏳ Ajouter Google OAuth (optionnel)
10. ⏳ Ajouter email login (optionnel)
