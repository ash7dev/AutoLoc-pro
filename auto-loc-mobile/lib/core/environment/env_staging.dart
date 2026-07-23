import 'env.dart';

class EnvStaging implements Env {
  @override
  String get apiBaseUrl => 'https://staging-api.autoloc.sn/api';

  @override
  String get apiVersion => 'v1';

  @override
  int get apiTimeout => 30000;

  @override
  String get waveApiKey => 'staging_wave_key';

  @override
  String get waveSecretKey => 'staging_wave_secret';

  @override
  String get orangeMoneyApiKey => 'staging_orange_key';

  @override
  String get orangeMoneySecretKey => 'staging_orange_secret';

  @override
  String get firebaseApiKey => 'staging_firebase_api_key';

  @override
  String get firebaseProjectId => 'auto-loc-staging';

  @override
  String get firebaseMessagingSenderId => 'staging_sender_id';

  @override
  String get firebaseAppId => 'staging_app_id';

  @override
  String? get sentryDsn => 'https://staging_sentry_dsn@sentry.io/project';

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
  String get appName => 'AutoLoc STAGING';

  @override
  Flavor get flavor => Flavor.staging;

  @override
  String get secureStorageKey => 'auto_loc_staging_storage';

  @override
  Duration get defaultCacheDuration => const Duration(minutes: 10);

  @override
  int get defaultPageSize => 20;

  @override
  int get maxImageUploadSizeMb => 10;

  @override
  int get maxDocumentUploadSizeMb => 5;

  @override
  bool get isProduction => false;

  @override
  bool get isDevelopment => false;
}
