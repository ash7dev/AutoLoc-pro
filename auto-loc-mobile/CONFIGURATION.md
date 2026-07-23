# Configuration de l'Environnement AutoLoc Mobile

Ce document explique comment configurer l'application Flutter pour se connecter au backend (local ou Render).

## 🔧 Switcher entre Local et Render

### Option 1: Serveur Local (Développement)

Pour développer avec le serveur en local sur `http://localhost:3000`:

**1. Ouvre [`lib/main.dart`](lib/main.dart)**

**2. Utilise `EnvDev()`:**
```dart
// 👇 Local: http://localhost:3000
const environment = EnvDev();
```

**3. Assure-toi que ton serveur local est lancé:**
```bash
cd apps/auto-loc-backend
npm run start:dev
```

### Option 2: Serveur Render (Production)

Pour utiliser ton serveur déployé sur Render:

**1. Configure ton URL Render**

L'URL est déjà configurée dans [`lib/core/environment/env_prod.dart`](lib/core/environment/env_prod.dart):

```dart
@override
String get apiBaseUrl => 'https://api.autoloc.sn/api';
```

**2. Dans [`lib/main.dart`](lib/main.dart), utilise `EnvProd()`:**
```dart
// 👇 Render: Production
const environment = EnvProd();
```

### Option 3: Staging (Tests)

Pour tester avec l'environnement de staging:

**1. Configure [`lib/core/environment/env_staging.dart`](lib/core/environment/env_staging.dart)**

**2. Dans [`lib/main.dart`](lib/main.dart):**
```dart
const environment = EnvStaging();
```

## 📱 Tester sur Émulateur/Device

### Android Emulator

L'émulateur Android ne peut pas accéder à `localhost` directement. Utilise:

```dart
// Dans env_dev.dart, change:
String get apiBaseUrl => 'http://10.0.2.2:3000/api'; // Android Emulator
```

### iOS Simulator

L'iOS Simulator peut accéder à `localhost`:

```dart
String get apiBaseUrl => 'http://localhost:3000/api'; // iOS OK
```

### Physical Device (même réseau WiFi)

Si tu testes sur un téléphone physique connecté au même WiFi:

```dart
// Trouve ton IP locale (ex: 192.168.1.10)
String get apiBaseUrl => 'http://192.168.1.10:3000/api';
```

**Trouve ton IP:**
- **Mac/Linux:** `ifconfig | grep inet`
- **Windows:** `ipconfig`

## 🌍 URLs par Environnement

| Environnement | Fichier | URL par défaut |
|---------------|---------|----------------|
| **Development** | `env_dev.dart` | `http://localhost:3000/api` |
| **Staging** | `env_staging.dart` | À configurer |
| **Production** | `env_prod.dart` | `https://api.autoloc.sn/api` |

## ✅ Vérifier la Connexion

Une fois l'app lancée, tu verras dans les logs:

```
✅ Core dependencies registered
✅ Crashlytics initialized
🚀 AutoLoc DEV started (development)
🌍 API: http://localhost:3000/api
```

**Si tu vois ton URL correcte, c'est bon!** ✨

## 🔐 Variables d'Environnement (Production)

Pour la production, les secrets sont passés via `--dart-define`:

```bash
flutter run --dart-define=WAVE_API_KEY=xxx \
            --dart-define=FIREBASE_API_KEY=yyy \
            --dart-define=SENTRY_DSN=zzz
```

## 🚨 Problèmes Courants

### Erreur de connexion réseau

**Symptôme:** `Failed host lookup: 'localhost'`

**Solutions:**
1. Vérifie que le backend est lancé
2. Utilise `10.0.2.2` pour Android Emulator
3. Utilise ton IP locale pour physical device

### Timeout

**Symptôme:** `SocketException: OS Error: Connection timed out`

**Solutions:**
1. Augmente le timeout dans `env.dart`: `int get apiTimeout => 60000;`
2. Vérifie ton firewall
3. Sur Render, vérifie que le service est actif (pas en veille)

### CORS Error

**Symptôme:** Erreur CORS sur Render

**Solution:**
Dans ton backend NestJS, vérifie que CORS est activé:

```typescript
// main.ts
app.enableCors({
  origin: '*', // ou ton domaine mobile
  credentials: true,
});
```

## 📦 Dépendances Requises

Assure-toi d'avoir installé:

```bash
flutter pub get
```

## 🎯 Recommandation

**Pour le développement quotidien:**
- Utilise `EnvDev()` avec serveur local
- Plus rapide, pas de latence réseau
- Pas de limite de requêtes

**Pour tester le déploiement:**
- Utilise `EnvProd()` avec Render
- Teste les vraies conditions de production
- Vérifie que tout fonctionne en ligne

---

**Besoin d'aide?** Ouvre une issue sur le repo! 🚀
