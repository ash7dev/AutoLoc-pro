import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// TODO: Décommenter quand ces services seront implémentés
import '../core/di/core_injection.dart';

/// Bootstrap
/// Séquence d'initialisation de l'application (version simplifiée)
/// 1. Configuration Flutter
/// 2. Lancement de l'app
Future<void> bootstrap(Widget Function() builder) async {
  // Ensure Flutter is initialized
  WidgetsFlutterBinding.ensureInitialized();

  // ============================================================================
  // 1. CONFIGURATION FLUTTER
  // ============================================================================

  // Portrait mode only
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Transparent status bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.black,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // ============================================================================
  // 2. GESTION DES ERREURS (TODO: À implémenter plus tard)
  // ============================================================================

  // ============================================================================
  // 3. INJECTION DE DÉPENDANCES
  // ============================================================================
  try {
    await CoreInjection.register();
    await CoreInjection.initializeServices();
    debugPrint('✅ Core dependencies registered and services initialized');
  } catch (e, stack) {
    debugPrint('Failed to register dependencies: $e\n$stack');
    rethrow;
  }

  // ============================================================================
  // 4. INITIALISATION FIREBASE (TODO: À implémenter plus tard)
  // ============================================================================

  // TODO: Activer quand Firebase sera configuré
  // if (Env.instance.enableCrashReporting) {
  //   try {
  //     await CrashReporter.initialize();
  //     AppLogger.info('✅ Crashlytics initialized');
  //   } catch (e, stack) {
  //     AppLogger.warning(
  //       'Failed to initialize Crashlytics',
  //       error: e,
  //       stackTrace: stack,
  //     );
  //   }
  // }

  // ============================================================================
  // 5. LANCEMENT DE L'APPLICATION
  // ============================================================================

  // Note: SharedPreferences est initialisé dans main.dart avant bootstrap

  runApp(builder());

  // TODO: Activer quand AppLogger sera implémenté
  // AppLogger.info(
  //   '🚀 ${Env.instance.appName} started (${Env.instance.flavor.name})',
  // );
  // AppLogger.info('🌍 API: ${Env.instance.apiBaseUrl}');

  debugPrint('🚀 AutoLoc Mobile started');
}
