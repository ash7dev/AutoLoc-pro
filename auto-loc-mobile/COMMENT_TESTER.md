# 🧪 Comment Tester l'Application

## ✅ Prérequis

- ✅ Flutter 3.19.6 installé
- ✅ Xcode 14.3.1 (pour iOS)
- ✅ Dépendances installées (`flutter pub get`)
- ✅ Fichiers freezed générés (`build_runner`)
- ✅ Logos dans `assets/images/` :
  - `logosansfond.png`
  - `logofondnoir.jpg`

---

## 🚀 Lancer l'Application

### Option 1 : iOS Simulator (Recommandé)

```bash
# 1. Ajouter Flutter au PATH
export PATH="$HOME/development/flutter/bin:$PATH"

# 2. Naviguer vers le projet
cd "/Users/apple/Private things/AutoLoc/apps/auto-loc-mobile"

# 3. Lancer sur iOS Simulator
flutter run
```

**Note** : Si le simulateur n'est pas lancé, Flutter le lancera automatiquement.

### Option 2 : Chrome (Web)

```bash
flutter run -d chrome
```

### Option 3 : Device iOS Physique

```bash
# Brancher l'iPhone via USB
flutter devices  # Vérifier que le device est détecté
flutter run      # Choisir le device iOS
```

---

## 📱 Flow à Tester

### 1️⃣ Splash Screen (2.5 secondes)

**Ce que vous devriez voir** :
- Dégradé violet/bleu en arrière-plan
- Logo AutoLoc transparent centré
- Formes organiques qui flottent doucement
- Loader circulaire blanc en dessous du logo
- Texte "Version 1.0.0" en bas

**Animations** :
- Logo fade in + scale (élastique)
- Formes en mouvement parallax
- Loader qui tourne

**Après 2.5s** : Navigation automatique vers Onboarding

---

### 2️⃣ Onboarding - Page 1 : Découvrir

**Ce que vous devriez voir** :
- Background violet/bleu avec formes flottantes
- Carte véhicule glassmorphism :
  - Icône voiture
  - "Mercedes Classe A"
  - "45 000 FCFA/jour"
  - ⭐ 4.8
  - 📍 Dakar
- Titre : "Découvrir"
- Description : "Louez une voiture partout au Sénégal..."
- Page indicator en bas : **● ○ ○**
- Bouton "Passer" en haut à droite

**Animations** :
- Carte slide from bottom + scale
- Background parallax
- Fade in progressif

**Actions** :
- **Swipe left** → Page 2
- **Tap "Passer"** → Page 3

---

### 3️⃣ Onboarding - Page 2 : Réserver

**Ce que vous devriez voir** :
- Background animé
- Carte glassmorphism avec :
  - 📍 "Point de départ" (avec pulse)
  - Ligne pointillée verticale qui se dessine
  - 📍 "Destination"
  - ✅ "Réservation validée" (apparaît à la fin)
- Titre : "Réserver"
- Description : "Réservez votre véhicule en quelques minutes."
- Page indicator : **○ ● ○**

**Animations** :
- Card apparaît avec scale
- Path GPS se dessine progressivement
- Marqueur départ pulse en continu
- Checkmark pop avec elastic

**Actions** :
- **Swipe left** → Page 3
- **Swipe right** → Page 1
- **Tap "Passer"** → Page 3

---

### 4️⃣ Onboarding - Page 3 : Confiance

**Ce que vous devriez voir** :
- 3 badges glassmorphism :
  1. 💳 "Paiement sécurisé" (vert)
  2. 📄 "Contrat automatique" (bleu)
  3. ✓ "Véhicules vérifiés" (violet)
- Logos paiement : Wave + Orange Money
- Titre : "Confiance"
- Description : "Paiement sécurisé • Contrat automatique..."
- **Bouton "Commencer →"** (blanc, qui pulse)
- Page indicator : **○ ○ ●**
- **PAS de bouton "Passer"** (dernière page)

**Animations** :
- 3 badges apparaissent en cascade (stagger)
- Elastic bounce
- CTA button pulse subtil

**Actions** :
- **Swipe right** → Page 2
- **Tap "Commencer"** → Home Screen + Save `hasSeenOnboarding = true`

---

### 5️⃣ Home Screen (Placeholder)

**Ce que vous devriez voir** :
- AppBar violet : "AutoLoc"
- Icône voiture
- Texte : "Bienvenue sur AutoLoc !"
- Texte : "Home Screen à implémenter"

**Comportement** :
- Si vous **redémarrez l'app** (hot restart), vous devriez **aller directement à Home** (skip Onboarding)
- Si vous **désinstallez et réinstallez**, l'Onboarding réapparaîtra

---

## 🔄 Tester le Flow Complet

### Test 1 : Première Installation

```bash
# 1. Lancer l'app
flutter run

# 2. Observer :
#    Splash (2.5s) → Onboarding Page 1

# 3. Swiper les 3 pages

# 4. Tap "Commencer"

# 5. Observer :
#    Navigation vers Home
```

### Test 2 : Deuxième Lancement

```bash
# 1. Hot Restart (ou relancer l'app)
flutter run

# 2. Observer :
#    Splash (2.5s) → Home (skip Onboarding)
```

### Test 3 : Reset Onboarding

```bash
# 1. Désinstaller l'app du simulateur
# 2. Relancer
flutter run

# 3. Observer :
#    Onboarding réapparaît
```

---

## 🐛 Debug

### Vérifier le State de `hasSeenOnboarding`

```dart
// Dans lib/features/splash/presentation/screens/splash_screen.dart
// Ligne 87-88, ajouter un print :

final hasSeenOnboarding = prefs.getBool('hasSeenOnboarding') ?? false;
print('🔍 hasSeenOnboarding = $hasSeenOnboarding');
```

### Forcer l'Onboarding

```dart
// Ligne 89, forcer :
return '/onboarding';  // Toujours aller vers onboarding
```

### Forcer Home

```dart
// Ligne 89, forcer :
return '/home';  // Toujours aller vers home
```

---

## 📊 Performance

### Vérifier les FPS

```bash
# Lancer en mode profile
flutter run --profile

# Observer dans DevTools :
# - FPS devrait être 60fps constant
# - Pas de jank sur les animations
```

### Timeline

```bash
# Ouvrir DevTools
flutter pub global activate devtools
flutter pub global run devtools

# Analyser :
# - Frame rendering time
# - GPU/CPU usage
```

---

## 🎨 Customisation Rapide

### Changer les Couleurs

Éditer `lib/core/design_system/theme/app_colors.dart` :

```dart
static const Color primary = Color(0xFFXXXXXX);
static const Color secondary = Color(0xFFXXXXXX);
```

### Changer la Durée du Splash

Éditer `lib/features/splash/presentation/screens/splash_screen.dart` :

```dart
// Ligne 68
await Future.delayed(const Duration(milliseconds: 2500)); // Changer ici
```

### Changer le Texte de l'Onboarding

Éditer les fichiers dans `lib/features/onboarding/presentation/pages/` :
- `discover_page.dart` - Page 1
- `reserve_page.dart` - Page 2
- `trust_page.dart` - Page 3

---

## ✅ Checklist de Test

- [ ] Splash s'affiche pendant 2-3 secondes
- [ ] Logo est visible et centré
- [ ] Animations sont fluides (60fps)
- [ ] Navigation vers Onboarding fonctionne
- [ ] Les 3 pages de l'onboarding s'affichent
- [ ] Swipe left/right fonctionne
- [ ] Bouton "Passer" fonctionne
- [ ] Animations des cartes sont fluides
- [ ] Path GPS se dessine correctement
- [ ] Badges apparaissent en cascade
- [ ] Bouton "Commencer" fonctionne
- [ ] Navigation vers Home fonctionne
- [ ] Au 2ème lancement, Onboarding est skipé
- [ ] Pas de crash
- [ ] Pas de lag

---

## 🚨 Problèmes Courants

### Erreur : Assets Not Found

**Symptôme** : `Unable to load asset: assets/images/logosansfond.png`

**Solution** :
1. Vérifier que les logos sont dans `assets/images/`
2. Relancer : `flutter pub get`
3. Faire un clean : `flutter clean && flutter pub get`

### Splash Screen reste noir

**Symptôme** : Écran noir au lancement

**Solution** :
1. Vérifier les logs : `flutter run -v`
2. Vérifier que les couleurs sont correctes
3. Hot restart : `r` dans le terminal

### Onboarding ne se skip pas

**Symptôme** : Onboarding apparaît à chaque lancement

**Solution** :
1. Vérifier que `SharedPreferences` fonctionne
2. Ajouter un debug print (voir section Debug)
3. Vérifier les permissions de stockage

### Animations saccadées

**Symptôme** : FPS < 60

**Solution** :
1. Lancer en mode release : `flutter run --release`
2. Tester sur device physique (pas simulateur)
3. Vérifier DevTools performance

---

## 📝 Notes

- Le Splash Screen s'affiche **à chaque lancement**
- L'Onboarding s'affiche **une seule fois** (première installation)
- Le Home est un **placeholder** pour l'instant
- Les animations sont **optimisées pour 60fps**
- Le design est **responsive** (fonctionne sur tous les écrans)

---

**Bon test ! 🚀**

Si vous rencontrez un problème, vérifiez :
1. Les logs Flutter
2. Les assets
3. Les dépendances
4. La configuration du routing
