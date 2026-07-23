/// Interface pour la configuration d'environnement
abstract class Env {
  // API Configuration
  String get apiBaseUrl;
  String get apiVersion;
  int get apiTimeout;

  // Payment Providers
  String get waveApiKey;
  String get waveSecretKey;
  String get orangeMoneyApiKey;
  String get orangeMoneySecretKey;

  // Firebase
  String get firebaseApiKey;
  String get firebaseProjectId;
  String get firebaseMessagingSenderId;
  String get firebaseAppId;

  // Sentry / Monitoring
  String? get sentryDsn;
  bool get enableCrashReporting;
  bool get enableAnalytics;

  // Feature Flags
  bool get enableWalletFeature;
  bool get enableChatSupport;
  bool get enableBiometricAuth;

  // App Configuration
  String get appName;
  Flavor get flavor;
  bool get isProduction => flavor == Flavor.production;
  bool get isDevelopment => flavor == Flavor.development;

  // Storage
  String get secureStorageKey;

  // Cache
  Duration get defaultCacheDuration;

  // Pagination
  int get defaultPageSize;

  // Upload
  int get maxImageUploadSizeMb;
  int get maxDocumentUploadSizeMb;

  static late Env _instance;
  static Env get instance => _instance;

  /// Initialise l'environnement avec une instance spécifique
  static void initialize(Env env) {
    _instance = env;
  }

  // TODO: Décommenter quand on utilisera Flavor au lieu de passer l'instance directement
  // static Future<void> load(Flavor flavor) async {
  //   switch (flavor) {
  //     case Flavor.development:
  //       _instance = EnvDev();
  //       break;
  //     case Flavor.staging:
  //       _instance = EnvStaging();
  //       break;
  //     case Flavor.production:
  //       _instance = EnvProd();
  //       break;
  //   }
  // }
}

enum Flavor {
  development,
  staging,
  production,
}
