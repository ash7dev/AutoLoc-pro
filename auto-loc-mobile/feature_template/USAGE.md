# Feature Template - Guide d'Utilisation

## 🚀 Création d'une Nouvelle Feature

### Étapes Complètes

#### 1. Copier le Template

```bash
# Remplacez "my_feature" par le nom de votre feature en snake_case
cp -r feature_template/ features/my_feature/
```

**Exemples:**
- Splash: `cp -r feature_template/ features/splash/`
- Onboarding: `cp -r feature_template/ features/onboarding/`
- Settings: `cp -r feature_template/ features/settings/`

---

#### 2. Renommer les Fichiers .template en .dart

```bash
cd features/my_feature/

# Renommer tous les fichiers .template en .dart
find . -name "*.template" | while read file; do
  mv "$file" "${file%.template}"
done
```

**Résultat:**
```
{{FEATURE}}_entity.dart.template → {{FEATURE}}_entity.dart
{{FEATURE}}_repository.dart.template → {{FEATURE}}_repository.dart
etc.
```

---

#### 3. Remplacer les Placeholders

```bash
# Remplacer {{FEATURE}} par le nom en snake_case (ex: splash, onboarding)
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/my_feature/g' {} \;

# Remplacer {{Feature}} par le nom en PascalCase (ex: Splash, Onboarding)
find . -name "*.dart" -type f -exec sed -i '' 's/{{Feature}}/MyFeature/g' {} \;

# Remplacer {{feature}} par le nom en camelCase (ex: splash, onboarding)
find . -name "*.dart" -type f -exec sed -i '' 's/{{feature}}/myFeature/g' {} \;

# Remplacer {{FEATURE_DESC}} par la description
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE_DESC}}/My Feature Description/g' {} \;
```

**Exemples concrets:**

**Pour Splash:**
```bash
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/splash/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{Feature}}/Splash/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{feature}}/splash/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE_DESC}}/Splash Screen/g' {} \;
```

**Pour Settings:**
```bash
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/settings/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{Feature}}/Settings/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{feature}}/settings/g' {} \;
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE_DESC}}/Settings Screen/g' {} \;
```

---

#### 4. Renommer les Fichiers avec le Nom de la Feature

```bash
# Renommer les fichiers qui contiennent encore {{FEATURE}} dans leur nom
find . -type f -name "*{{FEATURE}}*" | while read file; do
  newname=$(echo "$file" | sed 's/{{FEATURE}}/my_feature/g')
  mv "$file" "$newname"
done
```

**Exemple pour Splash:**
```bash
find . -type f -name "*{{FEATURE}}*" | while read file; do
  newname=$(echo "$file" | sed 's/{{FEATURE}}/splash/g')
  mv "$file" "$newname"
done
```

**Résultat:**
```
{{FEATURE}}_entity.dart → splash_entity.dart
{{FEATURE}}_repository.dart → splash_repository.dart
{{FEATURE}}_view_model.dart → splash_view_model.dart
etc.
```

---

#### 5. Supprimer les Fichiers Optionnels Non Nécessaires

**Fichiers optionnels:**
- `data/datasources/{{FEATURE}}_local_datasource.dart` - Si pas de cache local
- `presentation/screens/{{FEATURE}}_details_screen.dart` - Si pas de page de détails
- `presentation/widgets/` - Si pas de widgets custom

**Exemple:**
```bash
# Pour Splash (pas de cache, pas de détails, pas de widgets)
rm data/datasources/splash_local_datasource.dart
rm presentation/screens/splash_details_screen.dart
rm -rf presentation/widgets/
```

---

#### 6. Adapter le Code à Votre Feature

**Domain Layer:**
1. Modifier `domain/entities/{{feature}}_entity.dart`
   - Définir les propriétés de votre entity
   - Utiliser Freezed

2. Adapter `domain/repositories/{{feature}}_repository.dart`
   - Définir les méthodes nécessaires

3. Créer les UseCases dans `domain/usecases/`
   - `get_{{feature}}.dart`
   - `create_{{feature}}.dart` (si applicable)
   - `update_{{feature}}.dart` (si applicable)
   - etc.

**Data Layer:**
1. Modifier `data/models/{{feature}}_model.dart`
   - Mapper les champs JSON
   - Implémenter `fromJson` et `toJson`

2. Adapter `data/datasources/{{feature}}_remote_datasource.dart`
   - Définir les endpoints API
   - Implémenter les appels HTTP

3. Implémenter `data/repositories/{{feature}}_repository_impl.dart`
   - Gérer les erreurs
   - Mapper Model → Entity

**Presentation Layer:**
1. Modifier `presentation/viewmodels/{{feature}}_view_model.dart`
   - Implémenter `load()`
   - Ajouter la business logic

2. Adapter `presentation/providers/{{feature}}_providers.dart`
   - Créer les providers Riverpod

3. Personnaliser `presentation/screens/{{feature}}_screen.dart`
   - Créer l'UI
   - Gérer tous les états

4. Créer des widgets custom si nécessaire

---

## 📝 Script Bash Complet

Voici un script complet pour créer une feature:

```bash
#!/bin/bash

# Usage: ./create_feature.sh feature_name "Feature Description"
# Example: ./create_feature.sh splash "Splash Screen"

FEATURE_SNAKE=$1  # Ex: splash
FEATURE_DESC=$2   # Ex: "Splash Screen"

# Convert to PascalCase (simple version)
FEATURE_PASCAL=$(echo "$FEATURE_SNAKE" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' FS="_" OFS="")

echo "Creating feature: $FEATURE_SNAKE ($FEATURE_PASCAL)"

# 1. Copy template
cp -r feature_template/ "features/$FEATURE_SNAKE/"
cd "features/$FEATURE_SNAKE/" || exit

# 2. Rename .template files to .dart
find . -name "*.template" | while read -r file; do
  mv "$file" "${file%.template}"
done

# 3. Replace placeholders in content
find . -name "*.dart" -type f -exec sed -i '' "s/{{FEATURE}}/$FEATURE_SNAKE/g" {} \;
find . -name "*.dart" -type f -exec sed -i '' "s/{{Feature}}/$FEATURE_PASCAL/g" {} \;
find . -name "*.dart" -type f -exec sed -i '' "s/{{feature}}/$FEATURE_SNAKE/g" {} \;
find . -name "*.dart" -type f -exec sed -i '' "s/{{FEATURE_DESC}}/$FEATURE_DESC/g" {} \;

# 4. Rename files
find . -type f -name "*{{FEATURE}}*" | while read -r file; do
  newname=$(echo "$file" | sed "s/{{FEATURE}}/$FEATURE_SNAKE/g")
  mv "$file" "$newname"
done

echo "✅ Feature '$FEATURE_SNAKE' created successfully!"
echo "📁 Location: features/$FEATURE_SNAKE/"
echo ""
echo "Next steps:"
echo "1. Review and adapt domain/entities/${FEATURE_SNAKE}_entity.dart"
echo "2. Implement domain/usecases/"
echo "3. Implement presentation/viewmodels/${FEATURE_SNAKE}_view_model.dart"
echo "4. Design presentation/screens/${FEATURE_SNAKE}_screen.dart"
echo "5. Run: flutter pub run build_runner build --delete-conflicting-outputs"
```

**Utilisation:**
```bash
chmod +x create_feature.sh
./create_feature.sh splash "Splash Screen"
./create_feature.sh onboarding "Onboarding Flow"
./create_feature.sh settings "Settings Screen"
```

---

## ✅ Checklist Post-Création

Après avoir créé votre feature, vérifiez:

### Structure
- [ ] Tous les fichiers `.template` ont été renommés en `.dart`
- [ ] Tous les placeholders `{{FEATURE}}`, `{{Feature}}`, `{{feature}}` ont été remplacés
- [ ] Les fichiers optionnels non nécessaires ont été supprimés
- [ ] Les noms de fichiers ne contiennent plus `{{FEATURE}}`

### Domain Layer
- [ ] Entity définie avec les bonnes propriétés
- [ ] Repository (interface) défini
- [ ] UseCases créés et adaptés
- [ ] UseCases retournent `Result<T>`

### Data Layer
- [ ] Model avec `fromJson`/`toJson` implémenté
- [ ] RemoteDataSource avec les bons endpoints
- [ ] Repository implémenté avec gestion d'erreurs

### Presentation Layer
- [ ] ViewModel étend `BaseViewModel<T>`
- [ ] `load()` implémenté
- [ ] Providers créés
- [ ] Screen avec `EffectHandler` mixin
- [ ] Tous les états gérés dans `build()`

### Code Generation
- [ ] Lancer `flutter pub run build_runner build --delete-conflicting-outputs`
- [ ] Pas d'erreur de génération
- [ ] Les fichiers `.freezed.dart` et `.g.dart` générés

### Compilation
- [ ] `flutter analyze` sans warning
- [ ] Compilation réussie
- [ ] Imports corrects

---

## 🎯 Exemples Complets

### Exemple 1: Feature Splash

```bash
# 1. Créer la feature
./create_feature.sh splash "Splash Screen"

# 2. Supprimer les fichiers optionnels
cd features/splash/
rm data/datasources/splash_local_datasource.dart
rm presentation/screens/splash_details_screen.dart
rm -rf presentation/widgets/

# 3. Adapter le code
# - Modifier splash_entity.dart (version app, config, etc.)
# - Implémenter get_splash.dart (charger config initiale)
# - Implémenter splash_view_model.dart (vérifier version, charger config)
# - Créer l'UI dans splash_screen.dart (logo + animation)

# 4. Générer le code
flutter pub run build_runner build --delete-conflicting-outputs

# 5. Tester
flutter run
```

---

### Exemple 2: Feature Settings

```bash
# 1. Créer la feature
./create_feature.sh settings "Settings Screen"

# 2. Garder tous les fichiers (Settings a besoin de cache local)
cd features/settings/

# 3. Adapter le code
# - settings_entity.dart: theme, language, notifications, etc.
# - get_settings.dart: charger les settings
# - update_settings.dart: sauvegarder les settings
# - settings_local_datasource.dart: SharedPreferences
# - settings_view_model.dart: load/save settings
# - settings_screen.dart: liste des options

# 4. Générer le code
flutter pub run build_runner build --delete-conflicting-outputs
```

---

### Exemple 3: Feature Booking (Complexe - List + Details)

```bash
# 1. Créer la feature
./create_feature.sh booking "Booking Management"

# 2. Créer les fichiers supplémentaires
cd features/booking/

# ViewModels
cp presentation/viewmodels/booking_view_model.dart presentation/viewmodels/booking_list_view_model.dart
cp presentation/viewmodels/booking_view_model.dart presentation/viewmodels/booking_details_view_model.dart

# Screens
cp presentation/screens/booking_screen.dart presentation/screens/booking_list_screen.dart
mv presentation/screens/booking_details_screen.dart presentation/screens/booking_details_screen.dart

# Widgets
mkdir -p presentation/widgets/
touch presentation/widgets/booking_card.dart
touch presentation/widgets/booking_status_badge.dart

# 3. Adapter le code
# - booking_entity.dart: id, vehicleId, startDate, endDate, status, etc.
# - UseCases: get_bookings, get_booking_details, cancel_booking, etc.
# - booking_list_view_model.dart: gérer la liste
# - booking_details_view_model.dart: gérer les détails + actions (cancel)
# - booking_providers.dart: providers pour List ET Details
# - booking_list_screen.dart: liste avec pull-to-refresh
# - booking_details_screen.dart: détails + bouton annuler
# - booking_card.dart: widget pour afficher un booking dans la liste

# 4. Générer le code
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 🚫 Erreurs Courantes

### Erreur 1: Placeholders non remplacés

**Symptôme:**
```dart
class {{Feature}}ViewModel extends BaseViewModel<{{Feature}}Data> {
  // ...
}
```

**Solution:**
```bash
# Vérifier que les sed ont bien fonctionné
grep -r "{{" features/my_feature/

# Si des placeholders restent, les remplacer manuellement
find . -name "*.dart" -type f -exec sed -i '' 's/{{FEATURE}}/my_feature/g' {} \;
```

---

### Erreur 2: Fichiers non renommés

**Symptôme:**
```
features/splash/
└── domain/
    └── entities/
        └── {{FEATURE}}_entity.dart  ← Pas renommé!
```

**Solution:**
```bash
# Renommer manuellement ou relancer le script
find . -type f -name "*{{FEATURE}}*" | while read file; do
  newname=$(echo "$file" | sed 's/{{FEATURE}}/splash/g')
  mv "$file" "$newname"
done
```

---

### Erreur 3: Fichiers .template encore présents

**Symptôme:**
```
features/splash/
└── domain/
    └── entities/
        └── splash_entity.dart.template  ← Extension .template!
```

**Solution:**
```bash
# Renommer en .dart
find . -name "*.template" | while read file; do
  mv "$file" "${file%.template}"
done
```

---

## 📚 Ressources

- [README.md](README.md) - Vue d'ensemble du template
- [MVVM_GUIDE.md](../docs/presentation/MVVM_GUIDE.md)
- [VIEWMODEL_RULES.md](../docs/presentation/VIEWMODEL_RULES.md)
- [STATE_LIFECYCLE.md](../docs/presentation/STATE_LIFECYCLE.md)

---

## 💡 Conseils

1. **Toujours commencer par le Domain Layer** (Entities, UseCases)
2. **Ne pas modifier feature_template/** directement
3. **Supprimer les fichiers optionnels** non nécessaires
4. **Documenter les adaptations** spécifiques à votre feature
5. **Tester la compilation** après chaque étape importante
6. **Utiliser le script bash** pour automatiser la création
