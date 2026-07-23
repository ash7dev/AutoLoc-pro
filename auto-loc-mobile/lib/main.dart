import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/app.dart';
import 'app/app_observers.dart';
import 'app/bootstrap.dart';
import 'core/environment/env.dart';
import 'core/environment/env_dev.dart';
import 'core/environment/env_prod.dart';
import 'core/environment/env_staging.dart';
import 'core/network/api_client.dart';
import 'features/splash/presentation/providers/splash_providers.dart';
import 'features/onboarding/presentation/providers/onboarding_providers.dart' as onboarding;

void main() async {
  // ============================================================================
  // CONFIGURATION ENVIRONNEMENT
  // ============================================================================
  // 🔧 POUR DÉVELOPPEMENT LOCAL:
  // - Utilise EnvDev() (serveur local http://localhost:3000)
  // - Change ici pour tester avec différents environnements
  //
  // 🌍 POUR SERVEUR RENDER (PRODUCTION):
  // - Utilise EnvProd() (serveur Render)
  // - Ou utilise EnvStaging() pour tests
  //
  // ============================================================================

  // 👇 Change cette ligne pour switcher entre local et Render
  final environment = EnvDev(); // Local: http://localhost:3000
  // final environment = EnvProd(); // Render: https://api.autoloc.sn
  // final environment = EnvStaging(); // Staging

  // Initialiser l'environnement
  Env.initialize(environment);

  // Initialiser Flutter binding et Supabase
  WidgetsFlutterBinding.ensureInitialized();

  // Initialiser Supabase
  await Supabase.initialize(
    url: 'https://tcnlndjrvfddsjblamsj.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbmxuZGpydmZkZHNqYmxhbXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2Mjc4OTgsImV4cCI6MjA4NzIwMzg5OH0.HTbExC4asQs0S7igAC9J600UGG4ON0QQLM93XIqxwz0',
  );

  // Initialiser SharedPreferences
  final sharedPreferences = await SharedPreferences.getInstance();

  // Bootstrap l'application avec Riverpod et provider overrides
  await bootstrap(
    () => ProviderScope(
      overrides: [
        // Override sharedPreferencesProvider avec l'instance initialisée
        sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        onboarding.sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        // Override envProvider avec l'environnement configuré
        envProvider.overrideWithValue(environment),
      ],
      observers: [
        // Logger pour les providers (en dev seulement)
        if (Env.instance.isDevelopment) AppProviderObserver(),
      ],
      child: const App(),
    ),
  );
}
