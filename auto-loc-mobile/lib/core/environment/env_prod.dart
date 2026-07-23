import 'env.dart';

class EnvProd implements Env {
  @override
  // URL API Render - Production
  String get apiBaseUrl => 'https://api.autoloc.sn';

  @override
  String get apiVersion => '';

  @override
  int get apiTimeout => 30000;

  @override
  String get waveApiKey => const String.fromEnvironment('WAVE_API_KEY');

  @override
  String get waveSecretKey => const String.fromEnvironment('WAVE_SECRET_KEY');

  @override
  String get orangeMoneyApiKey =>
      const String.fromEnvironment('ORANGE_MONEY_API_KEY');

  @override
  String get orangeMoneySecretKey =>
      const String.fromEnvironment('ORANGE_MONEY_SECRET_KEY');

  @override
  String get firebaseApiKey =>
      const String.fromEnvironment('FIREBASE_API_KEY');

  @override
  String get firebaseProjectId => 'auto-loc-prod';

  @override
  String get firebaseMessagingSenderId =>
      const String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');

  @override
  String get firebaseAppId => const String.fromEnvironment('FIREBASE_APP_ID');

  @override
  String? get sentryDsn => const String.fromEnvironment('SENTRY_DSN');

  @override
  bool get enableCrashReporting => true;

  @override
  bool get enableAnalytics => true;

  @override
  bool get enableWalletFeature => true;

  @override
  bool get enableChatSupport => true;

  @override
  bool get enableBiometricAuth => true;

  @override
  String get appName => 'AutoLoc';

  @override
  Flavor get flavor => Flavor.production;

  @override
  String get secureStorageKey => 'auto_loc_storage';

  @override
  Duration get defaultCacheDuration => const Duration(minutes: 15);

  @override
  int get defaultPageSize => 20;

  @override
  int get maxImageUploadSizeMb => 10;

  @override
  int get maxDocumentUploadSizeMb => 5;

  @override
  bool get isProduction => true;

  @override
  bool get isDevelopment => false;
}
