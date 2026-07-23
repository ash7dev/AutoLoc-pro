import 'env.dart';

class EnvDev implements Env {
  @override
  String get apiBaseUrl => 'https://api.autoloc.sn';

  @override
  String get apiVersion => '';

  @override
  int get apiTimeout => 30000; // 30 secondes

  @override
  String get waveApiKey => 'dev_wave_key';

  @override
  String get waveSecretKey => 'dev_wave_secret';

  @override
  String get orangeMoneyApiKey => 'dev_orange_key';

  @override
  String get orangeMoneySecretKey => 'dev_orange_secret';

  @override
  String get firebaseApiKey => 'dev_firebase_api_key';

  @override
  String get firebaseProjectId => 'auto-loc-dev';

  @override
  String get firebaseMessagingSenderId => 'dev_sender_id';

  @override
  String get firebaseAppId => 'dev_app_id';

  @override
  String? get sentryDsn => null; // Pas de Sentry en dev

  @override
  bool get enableCrashReporting => false;

  @override
  bool get enableAnalytics => false;

  @override
  bool get enableWalletFeature => true;

  @override
  bool get enableChatSupport => true;

  @override
  bool get enableBiometricAuth => true;

  @override
  String get appName => 'AutoLoc DEV';

  @override
  Flavor get flavor => Flavor.development;

  @override
  String get secureStorageKey => 'auto_loc_dev_storage';

  @override
  Duration get defaultCacheDuration => const Duration(minutes: 5);

  @override
  int get defaultPageSize => 20;

  @override
  int get maxImageUploadSizeMb => 10;

  @override
  int get maxDocumentUploadSizeMb => 5;

  @override
  bool get isProduction => false;

  @override
  bool get isDevelopment => true;
}
