/// Constantes de l'application AutoLoc
class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'AutoLoc';
  static const String appTagline = 'Location de véhicules au Sénégal';

  // Regex Patterns
  static final RegExp phoneRegex = RegExp(r'^(77|78|76|70|75)\d{7}$');
  static final RegExp cniRegex = RegExp(r'^\d{13}$');
  static final RegExp emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );

  // Formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String timeFormat = 'HH:mm';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  static const String apiDateFormat = 'yyyy-MM-dd';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Upload Limits
  static const int maxImageSizeMb = 10;
  static const int maxDocumentSizeMb = 5;
  static const int maxVehicleImages = 8;
  static const int minVehicleImages = 3;

  // Durations
  static const Duration splashDuration = Duration(seconds: 2);
  static const Duration otpTimeout = Duration(seconds: 60);
  static const Duration debounceDelay = Duration(milliseconds: 500);
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration snackbarDuration = Duration(seconds: 3);

  // Cache
  static const Duration vehiclesCacheDuration = Duration(minutes: 15);
  static const Duration profileCacheDuration = Duration(hours: 1);
  static const Duration bookingsCacheDuration = Duration(minutes: 5);

  // Booking
  static const int minBookingDays = 1;
  static const int maxBookingDays = 90;
  static const int minAdvanceBookingHours = 2;
  static const int cancellationFullRefundDays = 3;
  static const int cancellationPartialRefundDays = 1;

  // Wallet
  static const int minWithdrawalAmountFcfa = 5000;
  static const int maxWithdrawalAmountFcfa = 1000000;
  static const double platformCommissionPercent = 10.0;

  // Ratings
  static const double minRating = 1.0;
  static const double maxRating = 5.0;

  // Support
  static const String supportEmail = 'support@autoloc.sn';
  static const String supportPhone = '+221 77 123 45 67';

  // Social
  static const String facebookUrl = 'https://facebook.com/autoloc';
  static const String instagramUrl = 'https://instagram.com/autoloc';
  static const String twitterUrl = 'https://twitter.com/autoloc';

  // Legal
  static const String termsUrl = 'https://autoloc.sn/terms';
  static const String privacyUrl = 'https://autoloc.sn/privacy';
  static const String faqUrl = 'https://autoloc.sn/faq';

  // Maps
  static const double defaultLatitude = 14.6928; // Dakar
  static const double defaultLongitude = -17.4467;
  static const double defaultZoom = 12.0;
  static const double searchRadiusKm = 50.0;

  // Images
  static const String placeholderImage = 'assets/images/placeholder.png';
  static const String logoImage = 'assets/images/logo.png';
  static const String noVehicleImage = 'assets/illustrations/no_vehicle.svg';

  // Onboarding
  static const String onboardingSeenKey = 'onboarding_seen';
  static const String tutorialSeenKey = 'tutorial_seen';

  // Session
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';
  static const String userRoleKey = 'user_role';

  // Preferences
  static const String themeModeKey = 'theme_mode';
  static const String languageKey = 'language';
  static const String notificationsEnabledKey = 'notifications_enabled';
  static const String biometricEnabledKey = 'biometric_enabled';
}
