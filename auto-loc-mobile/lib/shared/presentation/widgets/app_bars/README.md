# TenantAppBar - Header Contextuel

## 📖 Vue d'ensemble

`TenantAppBar` est un composant header modulaire et contextuel qui s'adapte automatiquement selon l'écran affiché.

## 🎯 4 Modes d'affichage

### 1️⃣ Home Mode
```dart
TenantAppBar(mode: TenantAppBarMode.home)
```
**Affichage :**
```
┌──────────────────────────────────────────────────────┐
│  [Logo]                     [XOF ▼] [🔔] [👤]       │
└──────────────────────────────────────────────────────┘
```
**Composants :**
- Logo AutoLoc (theme-aware)
- `CurrencySelectorButton` - Sélecteur de devise
- `NotificationButton` - Badge de notifications
- `ProfileButton` - Avatar utilisateur

---

### 2️⃣ Explore Mode
```dart
TenantAppBar(
  mode: TenantAppBarMode.explore,
  onSearchChanged: (query) => print('Recherche: $query'),
  onFilterTap: () => _showFilterSheet(),
  filterCount: 3,
)
```
**Affichage :**
```
┌──────────────────────────────────────────────────────┐
│  [🔍 Rechercher...              ]  [🎛️ Filtres]     │
└──────────────────────────────────────────────────────┘
```
**Composants :**
- `ExploreSearchBar` - Barre de recherche
- `FilterButton` - Badge avec compteur de filtres actifs

---

### 3️⃣ Bookings Mode
```dart
TenantAppBar(
  mode: TenantAppBarMode.bookings,
  title: 'Mes Réservations', // Optionnel
)
```
**Affichage :**
```
┌──────────────────────────────────────────────────────┐
│  Mes Réservations                                    │
└──────────────────────────────────────────────────────┘
```
**Composants :**
- `GradientText` - Titre avec dégradé blanc → émeraude

---

### 4️⃣ Settings Mode
```dart
TenantAppBar(
  mode: TenantAppBarMode.settings,
  title: 'Paramètres', // Optionnel
)
```
**Affichage :**
```
┌──────────────────────────────────────────────────────┐
│  Paramètres                                          │
└──────────────────────────────────────────────────────┘
```
**Composants :**
- `GradientText` - Titre avec dégradé blanc → émeraude

---

## 🏗️ Architecture

### Séparation des responsabilités

Chaque composant est dans son propre fichier :

```
lib/shared/presentation/widgets/
├── app_bars/
│   ├── tenant_app_bar.dart          ← Composant principal
│   └── README.md                     ← Cette doc
│
├── currency/
│   └── currency_selector_button.dart
│
├── notifications/
│   └── notification_button.dart
│
├── profile/
│   └── profile_button.dart
│
└── search/
    ├── explore_search_bar.dart
    └── filter_button.dart
```

### Composants réutilisables

#### `GradientText`
```dart
GradientText(
  'Mon Titre',
  gradient: LinearGradient(
    colors: [Colors.white, Color(0xFF34D399)],
    stops: [0.0, 0.55, 1.0],
  ),
  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
)
```

---

## 📋 Utilisation dans les screens

### HomeScreen
```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: TenantAppBar(mode: TenantAppBarMode.home),
    body: HomeContent(),
  );
}
```

### ExploreScreen
```dart
class ExploreScreen extends StatefulWidget {
  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  String _searchQuery = '';
  int _activeFilters = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: TenantAppBar(
        mode: TenantAppBarMode.explore,
        onSearchChanged: (query) => setState(() => _searchQuery = query),
        onFilterTap: _showFilterBottomSheet,
        filterCount: _activeFilters,
      ),
      body: ExploreContent(searchQuery: _searchQuery),
    );
  }

  void _showFilterBottomSheet() {
    // TODO: Ouvrir le bottom sheet de filtres
  }
}
```

### BookingsScreen
```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: TenantAppBar(mode: TenantAppBarMode.bookings),
    body: BookingsContent(),
  );
}
```

### SettingsScreen
```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: TenantAppBar(mode: TenantAppBarMode.settings),
    body: SettingsContent(),
  );
}
```

---

## 🎨 Design

### Couleurs
- Fond : `#0D0D0D` (Noir premium)
- Dégradé titres : Blanc → Émeraude `#34D399`
- Boutons : Glassmorphism `rgba(255,255,255,0.08)`

### Typographie
- Titres : `FontWeight.w900`, `fontSize: 24`
- Boutons : `FontWeight.w700`, `fontSize: 13`

### Hauteur
- AppBar : `60px`

---

## ✅ TODO

### Composants à finaliser :
- [ ] `CurrencySelectorButton` - Connecter au provider Riverpod
- [ ] `NotificationButton` - Connecter au provider de notifications
- [ ] `ProfileButton` - Afficher la vraie photo de profil
- [ ] Gestion du thème (logo dark/light)
- [ ] `FilterBottomSheet` - Créer le modal complet de filtres

---

## 🚀 Prochaines étapes

1. Intégrer `TenantAppBar` dans les screens
2. Créer le `FilterBottomSheet` (dates, zones, types, budget...)
3. Créer les providers Riverpod (currency, notifications, user)
4. Ajouter l'internationalisation (i18n)
