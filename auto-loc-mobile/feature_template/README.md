# Feature Template - Structure Générique

## 🎯 Objectif

Ce template sert de **modèle générique** pour créer TOUTES les features de l'app AutoLoc Mobile.

**⚠️ IMPORTANT:** Ce template n'est **JAMAIS utilisé directement**. Il doit être **copié et adapté** pour chaque nouvelle feature.

---

## 📁 Structure du Template

```
feature_template/
├── README.md                           ← Ce fichier
├── USAGE.md                            ← Instructions d'utilisation
│
├── domain/
│   ├── entities/
│   │   └── {{FEATURE}}_entity.dart.template
│   ├── repositories/
│   │   └── {{FEATURE}}_repository.dart.template
│   └── usecases/
│       ├── get_{{FEATURE}}.dart.template
│       └── create_{{FEATURE}}.dart.template
│
├── data/
│   ├── datasources/
│   │   ├── {{FEATURE}}_remote_datasource.dart.template
│   │   └── {{FEATURE}}_local_datasource.dart.template (optionnel)
│   ├── models/
│   │   └── {{FEATURE}}_model.dart.template
│   └── repositories/
│       └── {{FEATURE}}_repository_impl.dart.template
│
└── presentation/
    ├── providers/
    │   └── {{FEATURE}}_providers.dart.template
    ├── viewmodels/
    │   └── {{FEATURE}}_view_model.dart.template
    ├── screens/
    │   ├── {{FEATURE}}_screen.dart.template
    │   └── {{FEATURE}}_details_screen.dart.template (optionnel)
    └── widgets/
        ├── {{FEATURE}}_card.dart.template (optionnel)
        └── {{FEATURE}}_item.dart.template (optionnel)
```

---

## 🔧 Comment utiliser ce template

### Option 1: Utilisation Manuelle

1. **Copier** le dossier `feature_template/` vers `features/{{FEATURE_NAME}}/`

```bash
cp -r feature_template/ features/splash/
```

2. **Renommer** tous les fichiers `.template` en `.dart`

```bash
cd features/splash/
find . -name "*.template" | while read file; do
  mv "$file" "${file%.template}"
done
```

3. **Remplacer** tous les placeholders `{{FEATURE}}` par le nom de votre feature

```bash
# Example: splash
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/splash/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{Feature}}/Splash/g' {} \;
```

4. **Supprimer** les fichiers optionnels non nécessaires
   - `{{FEATURE}}_local_datasource.dart` si pas de cache local
   - `{{FEATURE}}_details_screen.dart` si pas de page de détails
   - Widgets non utilisés

5. **Adapter** le code à votre feature
   - Modifier les entities selon vos besoins
   - Adapter les UseCases
   - Personnaliser l'UI

### Option 2: Script de Génération (TODO)

Un script Dart sera créé pour automatiser ce processus:

```bash
dart run scripts/create_feature.dart splash
```

---

## 📋 Placeholders à Remplacer

| Placeholder    | Description                    | Exemple (Splash)    |
|----------------|--------------------------------|---------------------|
| `{{FEATURE}}`  | Nom en snake_case             | `splash`            |
| `{{Feature}}`  | Nom en PascalCase             | `Splash`            |
| `{{feature}}`  | Nom en camelCase              | `splash`            |
| `{{FEATURE_DESC}}` | Description de la feature | `Splash Screen`     |

---

## ✅ Checklist de Validation

Après avoir créé une feature à partir du template, vérifiez:

### Domain Layer
- [ ] Entity définie avec Freezed
- [ ] Repository (interface) définie
- [ ] UseCases créés (au moins `Get{{Feature}}`)
- [ ] UseCases retournent `Result<T>`

### Data Layer
- [ ] Model créé avec `fromJson`/`toJson`
- [ ] RemoteDataSource implémenté
- [ ] Repository implémenté (avec gestion d'erreurs)

### Presentation Layer
- [ ] ViewModel étend `BaseViewModel<T>`
- [ ] `load()` implémenté
- [ ] Providers créés (ViewModel, State, Effects)
- [ ] Screen créé avec `EffectHandler` mixin
- [ ] Tous les états gérés (initial, loading, refreshing, success, empty, failure)

### Qualité
- [ ] Compilation sans erreur
- [ ] Pas de warning Dart Analyzer
- [ ] Documentation inline présente
- [ ] Naming conventions respectées

---

## 🎓 Exemples d'Utilisation

### Exemple 1: Feature Simple (Splash)

```bash
# 1. Copier le template
cp -r feature_template/ features/splash/

# 2. Renommer les fichiers
cd features/splash/
find . -name "*.template" -exec sh -c 'mv "$1" "${1%.template}"' _ {} \;

# 3. Remplacer les placeholders
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/splash/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{Feature}}/Splash/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE_DESC}}/Splash Screen/g' {} \;

# 4. Supprimer les fichiers optionnels non nécessaires
rm data/datasources/splash_local_datasource.dart
rm presentation/screens/splash_details_screen.dart
rm -rf presentation/widgets/

# 5. Adapter le code
# - Modifier splash_entity.dart selon vos besoins
# - Adapter splash_view_model.dart
# - Personnaliser splash_screen.dart
```

**Résultat:**
```
features/splash/
├── domain/
│   ├── entities/
│   │   └── splash_entity.dart
│   ├── repositories/
│   │   └── splash_repository.dart
│   └── usecases/
│       └── get_splash.dart
├── data/
│   ├── datasources/
│   │   └── splash_remote_datasource.dart
│   ├── models/
│   │   └── splash_model.dart
│   └── repositories/
│       └── splash_repository_impl.dart
└── presentation/
    ├── providers/
    │   └── splash_providers.dart
    ├── viewmodels/
    │   └── splash_view_model.dart
    └── screens/
        └── splash_screen.dart
```

---

### Exemple 2: Feature Complexe avec List + Details (Booking)

```bash
# 1. Copier le template
cp -r feature_template/ features/booking/

# 2. Renommer les fichiers
cd features/booking/
find . -name "*.template" -exec sh -c 'mv "$1" "${1%.template}"' _ {} \;

# 3. Remplacer les placeholders
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/booking/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{Feature}}/Booking/g' {} \;

# 4. Créer les fichiers supplémentaires
# - booking_list_view_model.dart
# - booking_details_view_model.dart
# - booking_list_screen.dart
# - booking_details_screen.dart
# - booking_card.dart (widget)

# 5. Adapter le code
# - booking_entity.dart avec toutes les propriétés
# - UseCases: GetBookings, GetBookingDetails, CancelBooking, etc.
# - ViewModels avec business logic
```

---

## 🚫 Anti-Patterns à Éviter

### ❌ 1. Modifier directement le template

```bash
# ❌ MAUVAIS - Ne modifiez JAMAIS feature_template/
cd feature_template/
vim domain/entities/splash_entity.dart # ❌

# ✅ BON - Copiez d'abord, puis modifiez
cp -r feature_template/ features/splash/
cd features/splash/
vim domain/entities/splash_entity.dart # ✅
```

---

### ❌ 2. Oublier de remplacer les placeholders

```dart
// ❌ MAUVAIS - Placeholders encore présents
class {{Feature}}ViewModel extends BaseViewModel<{{Feature}}Data> {
  // ...
}

// ✅ BON - Placeholders remplacés
class SplashViewModel extends BaseViewModel<SplashData> {
  // ...
}
```

---

### ❌ 3. Garder tous les fichiers optionnels

```
// ❌ MAUVAIS - Garder des fichiers inutilisés
features/splash/
├── data/
│   └── datasources/
│       ├── splash_remote_datasource.dart
│       └── splash_local_datasource.dart ← Inutile si pas de cache
└── presentation/
    └── screens/
        ├── splash_screen.dart
        └── splash_details_screen.dart ← Inutile si pas de détails

// ✅ BON - Supprimer les fichiers non nécessaires
features/splash/
├── data/
│   └── datasources/
│       └── splash_remote_datasource.dart
└── presentation/
    └── screens/
        └── splash_screen.dart
```

---

### ❌ 4. Ne pas respecter la structure

```
// ❌ MAUVAIS - Fichiers mal placés
features/splash/
├── splash_entity.dart ← Pas à la racine!
├── splash_screen.dart ← Pas à la racine!
└── splash_providers.dart ← Pas à la racine!

// ✅ BON - Respecter la structure
features/splash/
├── domain/
│   └── entities/
│       └── splash_entity.dart
├── presentation/
│   ├── screens/
│   │   └── splash_screen.dart
│   └── providers/
│       └── splash_providers.dart
```

---

## 🔗 Ressources

- [MVVM_GUIDE.md](../docs/presentation/MVVM_GUIDE.md) - Architecture MVVM
- [VIEWMODEL_RULES.md](../docs/presentation/VIEWMODEL_RULES.md) - Règles pour les ViewModels
- [STATE_LIFECYCLE.md](../docs/presentation/STATE_LIFECYCLE.md) - Lifecycle des states
- [Provider Strategy](../lib/shared/presentation/providers/README.md) - Stratégie des providers

---

## 📝 Notes

- Ce template sera utilisé pour créer **Splash**, puis **Onboarding**, puis toutes les features de production
- Le template évolue avec le temps - si vous trouvez un pattern utile, ajoutez-le au template
- Documentez toujours les adaptations spécifiques à votre feature

---

## ✨ Prochaines Étapes

Après avoir créé le template, la prochaine étape sera de:

1. **Créer Splash** en utilisant ce template (première validation)
2. **Créer Onboarding** en utilisant ce template (deuxième validation)
3. **Créer les features de production** (Settings, Notifications, Auth, etc.)

Chaque nouvelle feature suit **EXACTEMENT** la même structure pour garantir la cohérence.
