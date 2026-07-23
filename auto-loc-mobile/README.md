# AutoLoc Mobile 🚗

Application mobile Flutter pour AutoLoc - Location de véhicules au Sénégal

## 🎯 Objectif  open -a Simulator et aussi sleep 5 && xcrun simctl boot "A18C6EEB-B7B0-418F-AAB8-B1562EB2156D"
 open -a Simulator
%                                                                                                                                                                                                                      
apple@ash7dev ~ % sleep 5 && xcrun simctl boot "A18C6EEB-B7B0-418F-AAB8-B1562EB2156D"
%                                                                                                                                                           
AutoLoc permet aux utilisateurs de louer facilement des véhicules partout au Sénégal. L'application offre deux expériences :
- **Locataires** : Rechercher, réserver et gérer leurs locations
- **Propriétaires** : Publier leurs véhicules, gérer les réservations et leurs revenus

## 🏗️ Architecture

### Stack Technique
- **Framework** : Flutter 3.x
- **State Management** : Riverpod 2.x
- **Navigation** : go_router
- **Network** : Dio + Retrofit
- **Local Storage** : Isar + flutter_secure_storage
- **DI** : get_it + injectable
- **Functional Programming** : fpdart

### Pattern Architectural
```
Feature-First + Clean Architecture + MVVM + DDD
```

### Structure du projet
```
lib/
├── app/                    # Bootstrap et configuration
├── core/                   # Infrastructure transverse
│   ├── environment/        # Config dev/staging/prod
│   ├── constants/          # Constantes et endpoints API
│   ├── errors/             # Gestion des erreurs
│   ├── network/            # Dio + interceptors
│   ├── storage/            # Stockage local et sécurisé
│   ├── services/           # Services globaux
│   └── utils/              # Utilitaires et extensions
├── design_system/          # UI/UX réutilisable
│   ├── tokens/             # Design tokens
│   ├── theme/              # Thèmes light/dark
│   ├── atoms/              # Composants de base
│   ├── molecules/          # Composants composés
│   ├── organisms/          # Composants complexes
│   └── states/             # Vues d'état (loading, error, empty...)
├── shared/                 # Composants partagés entre features
│   ├── components/         # Widgets métier réutilisables
│   ├── extensions/         # Extensions métier
│   └── enums/              # Enums partagés
└── features/               # Features isolées
    ├── splash/
    ├── onboarding/
    ├── auth/
    ├── home/
    ├── explore/
    ├── vehicle/
    ├── booking/
    ├── payment/
    ├── wallet/
    ├── tenant/
    └── owner/
```

### Anatomie d'une feature
```
features/{feature_name}/
├── di/
│   └── injection.dart           # DI de la feature
├── domain/                      # Logique métier pure
│   ├── entities/                # Entités métier
│   ├── value_objects/           # Value objects validants
│   ├── repositories/            # Interfaces de repositories
│   ├── services/                # Domain services
│   └── usecases/                # Cas d'usage
├── data/                        # Implémentation technique
│   ├── dto/                     # Data Transfer Objects
│   ├── mappers/                 # DTO ↔ Entity
│   ├── datasources/
│   │   ├── remote/              # API calls
│   │   ├── local/               # Cache local
│   │   └── cache/               # Politiques de cache
│   └── repositories/            # Implémentation des repos
└── presentation/                # UI
    ├── states/                  # États de l'écran (sealed classes)
    ├── effects/                 # Effets one-shot (navigation, snackbars)
    ├── viewmodels/              # Logique de présentation
    ├── providers/               # Providers Riverpod
    ├── screens/                 # Écrans
    └── widgets/                 # Widgets spécifiques
```

## 🚀 Getting Started

### Prérequis
- Flutter SDK >=3.2.0
- Dart SDK >=3.2.0
- Android Studio / Xcode
- Un émulateur ou device physique

### Installation

1. **Cloner le dépôt**
```bash
cd apps/auto-loc-mobile
```

2. **Installer les dépendances**
```bash
flutter pub get
```

3. **Générer le code**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

4. **Lancer l'app en mode dev**
```bash
flutter run --dart-define=FLAVOR=development
```

### Environnements disponibles

```bash
# Development
flutter run --dart-define=FLAVOR=development

# Staging
flutter run --dart-define=FLAVOR=staging

# Production
flutter run --dart-define=FLAVOR=production --release
```

## 📦 Dépendances principales

| Package | Usage |
|---------|-------|
| flutter_riverpod | State management |
| go_router | Navigation déclarative |
| dio | Requêtes HTTP |
| retrofit | Client API type-safe |
| isar | Base de données locale |
| flutter_secure_storage | Stockage sécurisé (tokens) |
| get_it | Injection de dépendances |
| fpdart | Programmation fonctionnelle |
| freezed | Immutabilité + sealed classes |
| firebase_messaging | Notifications push |
| firebase_crashlytics | Monitoring des crashs |

## 🎨 Design System

Le Design System est basé sur des **tokens** (source de vérité) :
- Colors
- Spacing (4, 8, 12, 16, 24, 32...)
- Typography
- Radius
- Elevation
- Duration

Ces tokens alimentent le thème et tous les composants.

## 🔐 Sécurité

- Tokens JWT stockés dans flutter_secure_storage
- Refresh automatique des tokens via interceptor
- Endpoints sensibles protégés par guards
- Validation côté client ET serveur

## 🧪 Tests

```bash
# Tests unitaires
flutter test

# Tests d'intégration
flutter test integration_test/

# Coverage
flutter test --coverage
```

## 📱 Parcours utilisateur

### Locataire
1. Splash → Onboarding (première fois)
2. Navigation libre (Explorer, Rechercher)
3. Auth à la première réservation
4. KYC + Permis de conduire
5. Réservation → Paiement (Wave/Orange Money/InTouch)
6. Check-in → Location → Check-out
7. Avis après location

### Propriétaire
1. Même onboarding
2. Switch de rôle
3. KYC obligatoire
4. Ajout de véhicules (photos, infos, documents)
5. Gestion des réservations
6. Wallet : revenus, retraits, pénalités

## 🌐 API Backend

L'application communique avec le backend NestJS via **128+ endpoints** :

Modules :
- Auth (login, OTP, KYC, permissions)
- Users (profil, admin)
- Vehicles (CRUD, recherche, feed, photos)
- Reservations (lifecycle complet)
- Payments (Wave, Orange Money, InTouch)
- Wallet (balance, transactions, retraits)
- Reviews, Notifications, Support

Voir [api_endpoints.dart](lib/core/constants/api_endpoints.dart) pour la liste complète.

## 📖 Documentation

- [Plan d'action](Plan-daction.md) - Vision et parcours utilisateur
- [Architecture](architecture.md) - Architecture technique détaillée
- [PROGRESSION.md](PROGRESSION.md) - État d'avancement du projet

## 🤝 Contribution

### Convention de commits
```
feat: Nouvelle fonctionnalité
fix: Correction de bug
refactor: Refactorisation
docs: Documentation
style: Formatage
test: Tests
chore: Maintenance
```

### Checklist avant PR
- [ ] Code lint (`flutter analyze`)
- [ ] Formatage (`dart format .`)
- [ ] Tests passent
- [ ] Pas de warning
- [ ] Documentation à jour

## 📄 Licence

Propriétaire - AutoLoc © 2026

---

**Status** : 🚧 En développement actif

**Progression** : 7% (13/~180 fichiers créés)

**Prochaine étape** : Compléter le Core (Network, Storage, Services)
