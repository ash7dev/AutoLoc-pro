import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../design_system/theme/app_theme.dart';
import '../core/environment/env.dart';
import 'app_router.dart';

/// App
/// Widget racine de l'application
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      // ========================================================================
      // CONFIGURATION
      // ========================================================================
      title: Env.instance.appName,
      debugShowCheckedModeBanner: Env.instance.isDevelopment,

      // ========================================================================
      // THEME
      // ========================================================================
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark, // Dark theme par défaut (glassmorphism)

      // ========================================================================
      // ROUTING
      // ========================================================================
      routerConfig: appRouter,

      // ========================================================================
      // LOCALE
      // ========================================================================
      locale: const Locale('fr', 'SN'), // Français - Sénégal
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('fr', 'SN'), // Français - Sénégal
        Locale('fr', 'FR'), // Français - France
      ],

      // ========================================================================
      // BUILDER (pour afficher banner dev/staging)
      // ========================================================================
      builder: (context, child) {
        // Afficher un banner en dev/staging
        if (!Env.instance.isProduction) {
          return Banner(
            message: Env.instance.flavor.name.toUpperCase(),
            location: BannerLocation.topEnd,
            color: Env.instance.isDevelopment ? Colors.green : Colors.orange,
            child: child!,
          );
        }
        return child!;
      },
    );
  }
}
