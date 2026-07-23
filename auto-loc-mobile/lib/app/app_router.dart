import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/navigation/routes.dart';
import '../features/splash/presentation/screens/splash_screen.dart';
import '../features/onboarding/presentation/screens/single_onboarding_screen.dart';
import '../features/home/presentation/screens/home_screen.dart';
import '../features/explore/presentation/screens/explore_screen.dart';
import '../features/bookings/presentation/screens/my_bookings_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/owner/dashboard/presentation/screens/owner_dashboard_screen.dart';
import '../features/owner/fleet/presentation/screens/fleet_screen.dart';
import '../features/owner/reservations/presentation/screens/owner_reservations_screen.dart';
import '../features/owner/wallet/presentation/screens/owner_wallet_screen.dart';
import '../features/settings/presentation/screens/owner_settings_screen.dart';
import '../features/auth/presentation/screens/phone_login_screen.dart';
import '../features/auth/presentation/screens/register_screen.dart';
import '../features/auth/presentation/screens/otp_verification_screen.dart';
import '../features/auth/presentation/screens/session_expired_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../debug/shell_test_screen.dart';
import 'shell/main_shell.dart';
import 'shell/owner_shell.dart';
import '../features/vehicle/presentation/screens/vehicle_details_screen.dart';
import '../features/vehicle/presentation/screens/vehicle_booking_config_screen.dart';
import '../features/booking/presentation/screens/booking_payment_screen.dart';
import '../features/booking/presentation/screens/booking_details_screen.dart';
import '../features/payment/presentation/screens/payment_success_screen.dart';
import '../features/payment/presentation/screens/payment_failed_screen.dart';
import '../features/vehicle/presentation/screens/vehicle_create_wizard_screen.dart';
import '../features/vehicle/presentation/screens/vehicle_edit_screen.dart';
import '../features/vehicle/domain/entities/vehicle.dart';
import '../core/di/core_injection.dart';
import '../core/network/interceptors/auth_interceptor.dart';

/// App Router - Navigation Tenant
///
/// Flow sans auth obligatoire (selon plan_daction.md):
/// Splash → Onboarding → Home (public)
///                ↓
///              Login (optionnel depuis bouton onboarding)
///
/// L'utilisateur peut explorer SANS connexion:
/// - Home (feed des annonces)
/// - Explorer véhicules
/// - Détails véhicule
/// - Recherche et filtres
///
/// Auth REQUISE uniquement pour:
/// - Réserver un véhicule
/// - Accéder au profil
/// - Mes réservations
/// - Publier une annonce (owner)
/// - Modifier son profil

final appRouter = GoRouter(
  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================
  initialLocation: Routes.splash,
  debugLogDiagnostics: true,

  // ===========================================================================
  // ROUTES
  // ===========================================================================
  routes: [
    // =========================================================================
    // SPLASH & ONBOARDING
    // =========================================================================
    GoRoute(
      path: Routes.splash,
      name: 'splash',
      builder: (context, state) => const SplashScreen(),
    ),

    GoRoute(
      path: Routes.onboarding,
      name: 'onboarding',
      builder: (context, state) => const SingleOnboardingScreen(),
    ),

    // =========================================================================
    // DEBUG - Shell Test (TEMPORAIRE - À supprimer en production)
    // =========================================================================
    GoRoute(
      path: '/debug/shells',
      name: 'shellTest',
      builder: (context, state) => const ShellTestScreen(),
    ),

    // =========================================================================
    // AUTH (Accessible depuis onboarding ou quand action nécessite auth)
    // =========================================================================
    GoRoute(
      path: Routes.login,
      name: 'login',
      builder: (context, state) => const PhoneLoginScreen(),
    ),

    GoRoute(
      path: Routes.register,
      name: 'register',
      builder: (context, state) => const RegisterScreen(),
    ),

    GoRoute(
      path: Routes.phoneLogin,
      name: 'phoneLogin',
      builder: (context, state) => const PhoneLoginScreen(),
    ),

    GoRoute(
      path: Routes.verifyOtp,
      name: 'verifyOtp',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return OtpVerificationScreen(
          identifier: extra?['identifier'] ?? '',
          expiresIn: extra?['expiresIn'] ?? 300,
          isLogin: extra?['isLogin'] ?? true,
        );
      },
    ),

    GoRoute(
      path: Routes.forgotPassword,
      name: 'forgotPassword',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Mot de passe oublié',
        message: 'Réinitialisez votre mot de passe',
        icon: Icons.lock_reset,
      ),
    ),

    GoRoute(
      path: Routes.completeProfile,
      name: 'completeProfile',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Compléter le profil',
        message: 'Finalisez votre inscription',
        icon: Icons.badge,
      ),
    ),

    GoRoute(
      path: Routes.sessionExpired,
      name: 'sessionExpired',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final typeString = extra?['type'] as String?;

        SessionExpirationType type = SessionExpirationType.expired;
        if (typeString == 'invalid') {
          type = SessionExpirationType.invalid;
        } else if (typeString == 'revoked') {
          type = SessionExpirationType.revoked;
        }

        return SessionExpiredScreen(type: type);
      },
    ),

    // =========================================================================
    // MAIN SHELL - Navigation avec Bottom Nav (4 écrans principaux)
    // =========================================================================
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        // HOME (index 0)
        GoRoute(
          path: Routes.home,
          name: 'home',
          builder: (context, state) => const HomeScreen(),
        ),

        // EXPLORE (index 1)
        GoRoute(
          path: Routes.explore,
          name: 'explore',
          builder: (context, state) => const ExploreScreen(),
        ),

        // MY BOOKINGS (index 2) - Auth requise
        GoRoute(
          path: Routes.myBookings,
          name: 'myBookings',
          builder: (context, state) => const MyBookingsScreen(),
        ),

        // PROFILE (index 3) - Auth requise
        GoRoute(
          path: Routes.profile,
          name: 'profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),

    // =========================================================================
    // OWNER SHELL - Navigation propriétaire avec Bottom Nav (5 écrans)
    // =========================================================================
    ShellRoute(
      builder: (context, state, child) => OwnerShell(child: child),
      routes: [
        // DASHBOARD (index 0)
        GoRoute(
          path: '/owner/dashboard',
          name: 'ownerDashboard',
          builder: (context, state) => const OwnerDashboardScreen(),
        ),

        // FLEET (index 1)
        GoRoute(
          path: '/owner/fleet',
          name: 'ownerFleet',
          builder: (context, state) => const FleetScreen(),
        ),

        // RESERVATIONS (index 2)
        GoRoute(
          path: '/owner/reservations',
          name: 'ownerReservations',
          builder: (context, state) => const OwnerReservationsScreen(),
        ),

        // WALLET (index 3)
        GoRoute(
          path: '/owner/wallet',
          name: 'ownerWallet',
          builder: (context, state) => const OwnerWalletScreen(),
        ),

        // SETTINGS (index 4)
        GoRoute(
          path: '/owner/settings',
          name: 'ownerSettings',
          builder: (context, state) => const OwnerSettingsScreen(),
        ),
      ],
    ),

    // =========================================================================
    // OWNER - VEHICLE ACTIONS (Fullscreen wizard and edit form)
    // =========================================================================
    GoRoute(
      path: Routes.createVehicle,
      name: 'createVehicle',
      builder: (context, state) => const VehicleCreateWizardScreen(),
    ),

    GoRoute(
      path: Routes.editVehicle,
      name: 'editVehicle',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        final vehicle = state.extra as Vehicle?;
        return VehicleEditScreen(vehicleId: id, vehicle: vehicle);
      },
    ),

    // =========================================================================
    // SEARCH (Accessible depuis Explore, mais fullscreen sans BottomNav)
    // =========================================================================

    GoRoute(
      path: Routes.search,
      name: 'search',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Recherche',
        message: 'Recherchez par critères',
        icon: Icons.search,
      ),
    ),

    GoRoute(
      path: Routes.searchResults,
      name: 'searchResults',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Résultats',
        message: 'Résultats de recherche',
        icon: Icons.list_alt,
      ),
    ),

    GoRoute(
      path: Routes.filters,
      name: 'filters',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Filtres',
        message: 'Affinez votre recherche',
        icon: Icons.filter_list,
      ),
    ),

    // =========================================================================
    // VEHICLES (Public - Détails accessibles sans auth)
    // =========================================================================
    GoRoute(
      path: Routes.vehicleDetails,
      name: 'vehicleDetails',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return VehicleDetailsScreen(vehicleId: id);
      },
    ),

    // =========================================================================
    // BOOKING (Auth requise - Redirect vers login si non connecté)
    // =========================================================================
    GoRoute(
      path: Routes.configureBooking,
      name: 'configureBooking',
      builder: (context, state) {
        final vehicleId = state.uri.queryParameters['vehicleId'] ?? '';
        return VehicleBookingConfigScreen(vehicleId: vehicleId);
      },
    ),
    GoRoute(
      path: Routes.createBooking,
      name: 'createBooking',
      builder: (context, state) {
        final vehicleId = state.uri.queryParameters['vehicleId'] ?? '';
        final dateDebutStr = state.uri.queryParameters['dateDebut'] ?? '';
        final dateFinStr = state.uri.queryParameters['dateFin'] ?? '';
        final horsDakar = state.uri.queryParameters['horsDakar'] == 'true';
        final avecLivraison = state.uri.queryParameters['avecLivraison'] == 'true';
        final adresse = state.uri.queryParameters['adresse'] ?? '';

        final dateDebut = DateTime.tryParse(dateDebutStr) ?? DateTime.now().add(const Duration(days: 1));
        final dateFin = DateTime.tryParse(dateFinStr) ?? DateTime.now().add(const Duration(days: 2));

        return BookingPaymentScreen(
          vehicleId: vehicleId,
          dateDebut: dateDebut,
          dateFin: dateFin,
          horsDakar: horsDakar,
          avecLivraison: avecLivraison,
          adresse: adresse,
        );
      },
    ),

    GoRoute(
      path: Routes.bookingSummary,
      name: 'bookingSummary',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Récapitulatif',
        message: 'Vérifiez votre réservation',
        icon: Icons.receipt_long,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.bookingDetails,
      name: 'bookingDetails',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return BookingDetailsScreen(bookingId: id);
      },
    ),

    // =========================================================================
    // PAYMENT (Auth requise)
    // =========================================================================
    GoRoute(
      path: Routes.payment,
      name: 'payment',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Paiement',
        message: 'Wave ou Orange Money',
        icon: Icons.payment,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.paymentSuccess,
      name: 'paymentSuccess',
      builder: (context, state) => const PaymentSuccessScreen(),
    ),

    GoRoute(
      path: Routes.paymentFailed,
      name: 'paymentFailed',
      builder: (context, state) => const PaymentFailedScreen(),
    ),

    // =========================================================================
    // CONTRACT (Auth requise)
    // =========================================================================
    GoRoute(
      path: Routes.contract,
      name: 'contract',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return _PlaceholderScreen(
          title: 'Contrat',
          message: 'Contrat ID: $id',
          icon: Icons.description,
          requiresAuth: true,
        );
      },
    ),

    // =========================================================================
    // PROFILE MANAGEMENT (Auth requise - sans BottomNav)
    // =========================================================================
    GoRoute(
      path: Routes.editProfile,
      name: 'editProfile',
      builder: (context, state) => const ProfileScreen(),
    ),

    GoRoute(
      path: Routes.changePassword,
      name: 'changePassword',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Changer mot de passe',
        message: 'Modifiez votre mot de passe',
        icon: Icons.lock,
        requiresAuth: true,
      ),
    ),

    // =========================================================================
    // KYC (Auth requise)
    // =========================================================================
    GoRoute(
      path: Routes.kyc,
      name: 'kyc',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Vérification KYC',
        message: 'Vérifiez votre identité',
        icon: Icons.verified,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.kycCni,
      name: 'kycCni',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'CNI',
        message: 'Vérification carte d\'identité',
        icon: Icons.credit_card,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.kycLicense,
      name: 'kycLicense',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Permis de conduire',
        message: 'Vérification permis',
        icon: Icons.badge,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.kycSelfie,
      name: 'kycSelfie',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Selfie',
        message: 'Vérification selfie',
        icon: Icons.face,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.kycStatus,
      name: 'kycStatus',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Statut KYC',
        message: 'État de votre vérification',
        icon: Icons.info,
        requiresAuth: true,
      ),
    ),

    // =========================================================================
    // SETTINGS (Public)
    // =========================================================================
    GoRoute(
      path: Routes.settings,
      name: 'settings',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Paramètres',
        message: 'Configurez l\'application',
        icon: Icons.settings,
      ),
    ),

    GoRoute(
      path: Routes.themeSettings,
      name: 'themeSettings',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Thème',
        message: 'Choisissez votre thème',
        icon: Icons.palette,
      ),
    ),

    GoRoute(
      path: Routes.languageSettings,
      name: 'languageSettings',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Langue',
        message: 'Choisissez votre langue',
        icon: Icons.language,
      ),
    ),

    GoRoute(
      path: Routes.notificationSettings,
      name: 'notificationSettings',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Notifications',
        message: 'Gérez vos notifications',
        icon: Icons.notifications,
      ),
    ),

    GoRoute(
      path: Routes.privacySettings,
      name: 'privacySettings',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Confidentialité',
        message: 'Paramètres de confidentialité',
        icon: Icons.privacy_tip,
      ),
    ),

    GoRoute(
      path: Routes.aboutApp,
      name: 'aboutApp',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'À propos',
        message: 'AutoLoc v1.0.0',
        icon: Icons.info,
      ),
    ),

    // =========================================================================
    // NOTIFICATIONS (Auth requise)
    // =========================================================================
    GoRoute(
      path: Routes.notifications,
      name: 'notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),

    // =========================================================================
    // SUPPORT (Public + Tickets Auth requise)
    // =========================================================================
    GoRoute(
      path: Routes.support,
      name: 'support',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Support',
        message: 'Contactez le support',
        icon: Icons.support_agent,
      ),
    ),

    GoRoute(
      path: Routes.faq,
      name: 'faq',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'FAQ',
        message: 'Questions fréquentes',
        icon: Icons.help,
      ),
    ),

    GoRoute(
      path: Routes.supportTickets,
      name: 'supportTickets',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Mes tickets',
        message: 'Suivez vos demandes',
        icon: Icons.confirmation_number,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.createTicket,
      name: 'createTicket',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Nouveau ticket',
        message: 'Créer une demande',
        icon: Icons.add_box,
        requiresAuth: true,
      ),
    ),

    GoRoute(
      path: Routes.ticketDetails,
      name: 'ticketDetails',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return _PlaceholderScreen(
          title: 'Ticket',
          message: 'Ticket ID: $id',
          icon: Icons.receipt,
          requiresAuth: true,
        );
      },
    ),

    // =========================================================================
    // ERROR PAGES (Public)
    // =========================================================================
    GoRoute(
      path: Routes.error,
      name: 'error',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Erreur',
        message: 'Une erreur est survenue',
        icon: Icons.error_outline,
      ),
    ),

    GoRoute(
      path: Routes.maintenance,
      name: 'maintenance',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Maintenance',
        message: 'Application en maintenance',
        icon: Icons.build,
      ),
    ),

    GoRoute(
      path: Routes.offline,
      name: 'offline',
      builder: (context, state) => const _PlaceholderScreen(
        title: 'Hors ligne',
        message: 'Aucune connexion internet',
        icon: Icons.wifi_off,
      ),
    ),
  ],

  // ===========================================================================
  // ERROR HANDLING
  // ===========================================================================
  errorBuilder: (context, state) => _ErrorScreen(
    error: state.error.toString(),
  ),

  // ===========================================================================
  // REDIRECTS (Guards) - Auth non obligatoire par défaut
  // ===========================================================================
  // TODO: Implémenter le guard avec Riverpod
  //
  // redirect: (context, state) {
  //   // Récupérer l'état d'auth depuis Riverpod
  //   // final container = ProviderScope.containerOf(context);
  //   // final isAuthenticated = container.read(authProvider).isAuthenticated;
  //
  //   final currentRoute = state.matchedLocation;
  //
  //   // Si la route nécessite l'auth ET l'utilisateur n'est pas connecté
  //   if (Routes.requiresAuth(currentRoute) && !isAuthenticated) {
  //     // Sauvegarder la route de destination pour y retourner après login
  //     // Exemple: /login?redirect=/booking/create
  //     return Routes.withParams(Routes.login, {'redirect': currentRoute});
  //   }
  //
  //   return null; // Pas de redirection, laisser passer
  // },
);

// Initialiser le router dans l'intercepteur d'authentification
// Ceci permet à l'intercepteur de naviguer vers l'écran de session expirée
void _initializeAuthInterceptor() {
  try {
    final authInterceptor = CoreInjection.sl<AuthInterceptor>();
    authInterceptor.setRouter(appRouter);
  } catch (e) {
    // L'intercepteur n'est peut-être pas encore initialisé
    // Ce n'est pas grave, il sera initialisé plus tard
  }
}

// Appeler l'initialisation
final _ = _initializeAuthInterceptor();

// =============================================================================
// PLACEHOLDER SCREENS (temporaires)
// =============================================================================

class _PlaceholderScreen extends StatelessWidget {
  const _PlaceholderScreen({
    required this.title,
    required this.message,
    this.icon = Icons.construction,
    this.requiresAuth = false,
  });

  final String title;
  final String message;
  final IconData icon;
  final bool requiresAuth;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 64,
              color: Colors.amber,
            ),
            const SizedBox(height: 24),
            Text(
              message,
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              'Cette fonctionnalité sera bientôt disponible',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            if (requiresAuth)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Chip(
                  label: const Text('🔒 Authentification requise'),
                  backgroundColor: Colors.orange.withOpacity(0.2),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ErrorScreen extends StatelessWidget {
  const _ErrorScreen({
    required this.error,
  });

  final String error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Erreur'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 24),
            Text(
              'Une erreur est survenue',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                error,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
