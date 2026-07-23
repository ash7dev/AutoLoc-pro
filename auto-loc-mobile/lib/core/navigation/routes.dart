/// Routes de l'application
/// Centralise tous les noms et paths des routes pour go_router
class Routes {
  Routes._();

  // =========================================================================
  // ROOT
  // =========================================================================

  static const String splash = '/';
  static const String onboarding = '/onboarding';

  // =========================================================================
  // AUTH
  // =========================================================================

  static const String auth = '/auth';
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String phoneLogin = '/auth/phone-login';
  static const String verifyOtp = '/auth/verify-otp';
  static const String forgotPassword = '/auth/forgot-password';
  static const String completeProfile = '/auth/complete-profile';
  static const String sessionExpired = '/auth/session-expired';

  // =========================================================================
  // MAIN NAVIGATION (Tenant)
  // =========================================================================

  static const String home = '/home';
  static const String explore = '/explore';
  static const String myBookings = '/my-bookings';
  static const String profile = '/profile';
  static const String settings = '/settings';

  // =========================================================================
  // VEHICLES
  // =========================================================================

  static const String vehicleDetails = '/vehicles/:id';

  static String vehicleDetailsPath(String id) => '/vehicles/$id';

  // =========================================================================
  // BOOKING
  // =========================================================================

  static const String configureBooking = '/booking/configure';
  static const String createBooking = '/booking/create';
  static const String bookingDetails = '/bookings/:id';
  static const String bookingSummary = '/booking/summary';

  static String bookingDetailsPath(String id) => '/bookings/$id';

  // =========================================================================
  // PAYMENT
  // =========================================================================

  static const String payment = '/payment';
  static const String paymentSuccess = '/payment/success';
  static const String paymentFailed = '/payment/failed';

  // =========================================================================
  // CONTRACT
  // =========================================================================

  static const String contract = '/contract/:id';

  static String contractPath(String id) => '/contract/$id';

  // =========================================================================
  // KYC
  // =========================================================================

  static const String kyc = '/kyc';
  static const String kycCni = '/kyc/cni';
  static const String kycLicense = '/kyc/license';
  static const String kycSelfie = '/kyc/selfie';
  static const String kycStatus = '/kyc/status';

  // =========================================================================
  // PROFILE & SETTINGS
  // =========================================================================

  static const String editProfile = '/profile/edit';
  static const String changePassword = '/profile/change-password';
  static const String themeSettings = '/settings/theme';
  static const String languageSettings = '/settings/language';
  static const String notificationSettings = '/settings/notifications';
  static const String privacySettings = '/settings/privacy';
  static const String aboutApp = '/settings/about';

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================

  static const String notifications = '/notifications';

  // =========================================================================
  // SUPPORT
  // =========================================================================

  static const String support = '/support';
  static const String supportTickets = '/support/tickets';
  static const String createTicket = '/support/tickets/create';
  static const String ticketDetails = '/support/tickets/:id';
  static const String faq = '/support/faq';

  static String ticketDetailsPath(String id) => '/support/tickets/$id';

  // =========================================================================
  // OWNER - DASHBOARD
  // =========================================================================

  static const String ownerDashboard = '/owner/dashboard';

  // =========================================================================
  // OWNER - FLEET
  // =========================================================================

  static const String fleet = '/owner/fleet';
  static const String createVehicle = '/owner/fleet/create';
  static const String editVehicle = '/owner/fleet/:id/edit';
  static const String vehicleStats = '/owner/fleet/:id/stats';

  static String editVehiclePath(String id) => '/owner/fleet/$id/edit';
  static String vehicleStatsPath(String id) => '/owner/fleet/$id/stats';

  // =========================================================================
  // OWNER - RESERVATIONS
  // =========================================================================

  static const String ownerBookings = '/owner/bookings';
  static const String ownerBookingDetails = '/owner/bookings/:id';

  static String ownerBookingDetailsPath(String id) => '/owner/bookings/$id';

  // =========================================================================
  // OWNER - WALLET
  // =========================================================================

  static const String wallet = '/owner/wallet';
  static const String walletBalance = '/owner/wallet/balance';
  static const String walletTransactions = '/owner/wallet/transactions';
  static const String walletWithdrawals = '/owner/wallet/withdrawals';
  static const String requestWithdrawal = '/owner/wallet/withdrawals/request';
  static const String withdrawalDetails = '/owner/wallet/withdrawals/:id';

  static String withdrawalDetailsPath(String id) => '/owner/wallet/withdrawals/$id';

  // =========================================================================
  // OWNER - STATISTICS
  // =========================================================================

  static const String statistics = '/owner/statistics';
  static const String revenue = '/owner/statistics/revenue';

  // =========================================================================
  // SEARCH
  // =========================================================================

  static const String search = '/search';
  static const String searchResults = '/search/results';
  static const String filters = '/search/filters';

  // =========================================================================
  // ERROR & MAINTENANCE
  // =========================================================================

  static const String error = '/error';
  static const String maintenance = '/maintenance';
  static const String offline = '/offline';

  // =========================================================================
  // DEEP LINKS
  // =========================================================================

  /// Construit une route avec des query parameters
  static String withParams(String route, Map<String, String> params) {
    final queryString = params.entries.map((e) => '${e.key}=${e.value}').join('&');
    return '$route?$queryString';
  }

  /// Vérifie si une route nécessite l'authentification
  static bool requiresAuth(String route) {
    final publicRoutes = [
      splash,
      onboarding,
      auth,
      login,
      register,
      phoneLogin,
      verifyOtp,
      forgotPassword,
      sessionExpired,
      home,
      explore,
      search,
      searchResults,
      filters,
      faq,
      aboutApp,
      error,
      maintenance,
      offline,
    ];

    // Routes de détail véhicule sont publiques
    if (route.startsWith('/vehicles/')) {
      return false;
    }

    return !publicRoutes.contains(route);
  }

  /// Vérifie si une route est réservée aux propriétaires
  static bool requiresOwnerRole(String route) {
    return route.startsWith('/owner/');
  }

  /// Vérifie si une route nécessite le KYC vérifié
  static bool requiresKyc(String route) {
    final kycRequiredRoutes = [
      createVehicle,
      requestWithdrawal,
    ];

    return kycRequiredRoutes.any((r) => route.startsWith(r));
  }

  /// Vérifie si une route nécessite le profil complété
  static bool requiresCompletedProfile(String route) {
    final profileRequiredRoutes = [
      configureBooking,
      createBooking,
      createVehicle,
      requestWithdrawal,
    ];

    return profileRequiredRoutes.any((r) => route.startsWith(r));
  }

  /// Vérifie si une route nécessite le téléphone vérifié
  static bool requiresPhoneVerified(String route) {
    final phoneRequiredRoutes = [
      configureBooking,
      createBooking,
      createVehicle,
    ];

    return phoneRequiredRoutes.any((r) => route.startsWith(r));
  }
}
