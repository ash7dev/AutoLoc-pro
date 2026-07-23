import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';

/// Service pour les préférences non sensibles
/// (onboarding vu, thème, langue, etc.)
class Preferences {
  final SharedPreferences _prefs;

  Preferences({required SharedPreferences prefs}) : _prefs = prefs;

  // =========================================================================
  // ONBOARDING & TUTORIAL
  // =========================================================================

  /// Marque l'onboarding comme vu
  Future<void> setOnboardingSeen(bool seen) async {
    await _prefs.setBool(AppConstants.onboardingSeenKey, seen);
  }

  /// Vérifie si l'onboarding a été vu
  bool hasSeenOnboarding() {
    return _prefs.getBool(AppConstants.onboardingSeenKey) ?? false;
  }

  /// Marque le tutoriel comme vu
  Future<void> setTutorialSeen(bool seen) async {
    await _prefs.setBool(AppConstants.tutorialSeenKey, seen);
  }

  /// Vérifie si le tutoriel a été vu
  bool hasSeenTutorial() {
    return _prefs.getBool(AppConstants.tutorialSeenKey) ?? false;
  }

  // =========================================================================
  // THEME & LANGUAGE
  // =========================================================================

  /// Sauvegarde le mode de thème (light, dark, system)
  Future<void> setThemeMode(String mode) async {
    await _prefs.setString(AppConstants.themeModeKey, mode);
  }

  /// Récupère le mode de thème
  String getThemeMode() {
    return _prefs.getString(AppConstants.themeModeKey) ?? 'system';
  }

  /// Sauvegarde la langue (fr, wo, en)
  Future<void> setLanguage(String languageCode) async {
    await _prefs.setString(AppConstants.languageKey, languageCode);
  }

  /// Récupère la langue
  String getLanguage() {
    return _prefs.getString(AppConstants.languageKey) ?? 'fr';
  }

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================

  /// Active/désactive les notifications
  Future<void> setNotificationsEnabled(bool enabled) async {
    await _prefs.setBool(AppConstants.notificationsEnabledKey, enabled);
  }

  /// Vérifie si les notifications sont activées
  bool areNotificationsEnabled() {
    return _prefs.getBool(AppConstants.notificationsEnabledKey) ?? true;
  }

  /// Sauvegarde le token FCM
  Future<void> setFcmToken(String token) async {
    await _prefs.setString('fcm_token', token);
  }

  /// Récupère le token FCM
  String? getFcmToken() {
    return _prefs.getString('fcm_token');
  }

  // =========================================================================
  // SEARCH & FILTERS
  // =========================================================================

  /// Sauvegarde l'historique de recherche
  Future<void> addSearchHistory(String query) async {
    final history = getSearchHistory();

    // Éviter les doublons
    history.remove(query);

    // Ajouter en tête
    history.insert(0, query);

    // Limiter à 10 éléments
    if (history.length > 10) {
      history.removeRange(10, history.length);
    }

    await _prefs.setStringList('search_history', history);
  }

  /// Récupère l'historique de recherche
  List<String> getSearchHistory() {
    return _prefs.getStringList('search_history') ?? [];
  }

  /// Efface l'historique de recherche
  Future<void> clearSearchHistory() async {
    await _prefs.remove('search_history');
  }

  /// Sauvegarde les derniers filtres utilisés
  Future<void> saveLastFilters(Map<String, dynamic> filters) async {
    // Convertir en format simple (SharedPreferences ne supporte pas les maps complexes)
    filters.forEach((key, value) async {
      if (value is String) {
        await _prefs.setString('filter_$key', value);
      } else if (value is int) {
        await _prefs.setInt('filter_$key', value);
      } else if (value is double) {
        await _prefs.setDouble('filter_$key', value);
      } else if (value is bool) {
        await _prefs.setBool('filter_$key', value);
      } else if (value is List<String>) {
        await _prefs.setStringList('filter_$key', value);
      }
    });
  }

  /// Récupère un filtre sauvegardé
  dynamic getFilter(String key) {
    return _prefs.get('filter_$key');
  }

  /// Efface tous les filtres
  Future<void> clearFilters() async {
    final keys = _prefs.getKeys().where((k) => k.startsWith('filter_'));
    for (final key in keys) {
      await _prefs.remove(key);
    }
  }

  // =========================================================================
  // CACHE TIMESTAMPS
  // =========================================================================

  /// Sauvegarde le timestamp de dernière synchro
  Future<void> setLastSync(String key, DateTime timestamp) async {
    await _prefs.setInt('last_sync_$key', timestamp.millisecondsSinceEpoch);
  }

  /// Récupère le timestamp de dernière synchro
  DateTime? getLastSync(String key) {
    final timestamp = _prefs.getInt('last_sync_$key');
    return timestamp != null
        ? DateTime.fromMillisecondsSinceEpoch(timestamp)
        : null;
  }

  // =========================================================================
  // APP STATE
  // =========================================================================

  /// Sauvegarde la dernière position de scroll (pour restauration)
  Future<void> setScrollPosition(String screenKey, double position) async {
    await _prefs.setDouble('scroll_$screenKey', position);
  }

  /// Récupère la dernière position de scroll
  double getScrollPosition(String screenKey) {
    return _prefs.getDouble('scroll_$screenKey') ?? 0.0;
  }

  /// Sauvegarde le dernier onglet visité
  Future<void> setLastTab(String screenKey, int tabIndex) async {
    await _prefs.setInt('last_tab_$screenKey', tabIndex);
  }

  /// Récupère le dernier onglet visité
  int getLastTab(String screenKey) {
    return _prefs.getInt('last_tab_$screenKey') ?? 0;
  }

  // =========================================================================
  // FAVORITES (local cache)
  // =========================================================================

  /// Ajoute un véhicule aux favoris
  Future<void> addFavorite(String vehicleId) async {
    final favorites = getFavorites();
    if (!favorites.contains(vehicleId)) {
      favorites.add(vehicleId);
      await _prefs.setStringList('favorites', favorites);
    }
  }

  /// Retire un véhicule des favoris
  Future<void> removeFavorite(String vehicleId) async {
    final favorites = getFavorites();
    favorites.remove(vehicleId);
    await _prefs.setStringList('favorites', favorites);
  }

  /// Récupère la liste des favoris
  List<String> getFavorites() {
    return _prefs.getStringList('favorites') ?? [];
  }

  /// Vérifie si un véhicule est favori
  bool isFavorite(String vehicleId) {
    return getFavorites().contains(vehicleId);
  }

  // =========================================================================
  // UTILITY
  // =========================================================================

  /// Supprime toutes les préférences
  Future<void> clearAll() async {
    await _prefs.clear();
  }

  /// Récupère toutes les clés
  Set<String> getKeys() {
    return _prefs.getKeys();
  }

  /// Écrit une valeur custom
  Future<void> setString(String key, String value) async {
    await _prefs.setString(key, value);
  }

  Future<void> setInt(String key, int value) async {
    await _prefs.setInt(key, value);
  }

  Future<void> setBool(String key, bool value) async {
    await _prefs.setBool(key, value);
  }

  Future<void> setDouble(String key, double value) async {
    await _prefs.setDouble(key, value);
  }

  Future<void> setStringList(String key, List<String> value) async {
    await _prefs.setStringList(key, value);
  }

  /// Lit une valeur custom
  String? getString(String key) => _prefs.getString(key);
  int? getInt(String key) => _prefs.getInt(key);
  bool? getBool(String key) => _prefs.getBool(key);
  double? getDouble(String key) => _prefs.getDouble(key);
  List<String>? getStringList(String key) => _prefs.getStringList(key);

  /// Supprime une valeur
  Future<void> remove(String key) async {
    await _prefs.remove(key);
  }
}
