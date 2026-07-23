import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/storage/preferences.dart';
import '../../core/di/core_injection.dart';

/// Provider pour les préférences
final preferencesProvider = Provider<Preferences>((ref) {
  return CoreInjection.sl<Preferences>();
});

/// Provider pour le ThemeMode
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>(
  (ref) {
    final preferences = ref.watch(preferencesProvider);
    return ThemeModeNotifier(preferences);
  },
);

/// Notifier pour gérer le thème
class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier(this._preferences) : super(ThemeMode.dark) {
    _loadThemeMode();
  }

  final Preferences _preferences;

  /// Charge le thème sauvegardé
  void _loadThemeMode() {
    final mode = _preferences.getThemeMode();
    if (mode == 'dark') {
      state = ThemeMode.dark;
    } else if (mode == 'light') {
      state = ThemeMode.light;
    } else {
      state = ThemeMode.system;
    }
  }

  /// Active le mode sombre
  Future<void> setDarkMode() async {
    await _preferences.setThemeMode('dark');
    state = ThemeMode.dark;
  }

  /// Active le mode clair
  Future<void> setLightMode() async {
    await _preferences.setThemeMode('light');
    state = ThemeMode.light;
  }

  /// Toggle entre clair et sombre
  Future<void> toggleThemeMode() async {
    if (state == ThemeMode.dark) {
      await setLightMode();
    } else {
      await setDarkMode();
    }
  }
}

/// Provider pour savoir si le mode sombre est activé
final isDarkModeProvider = Provider<bool>((ref) {
  return ref.watch(themeModeProvider) == ThemeMode.dark;
});
