import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../core/services/session_service.dart' as session_service;
import '../../../../shared/presentation/base/effect_handler.dart';
import '../../../../shared/providers/session_providers.dart';
import '../../../booking/presentation/providers/booking_providers.dart';
import '../../../owner/dashboard/presentation/providers/owner_dashboard_providers.dart';
import '../../../vehicle/presentation/providers/vehicle_providers.dart';
import '../providers/splash_providers.dart';

const Color _emerald = Color(0xFF34D399);

/// Splash Screen avec logo AutoLoc et animations premium
///
/// Flow:
/// 1. Affiche logo avec fade in + scale
/// 2. Loader circulaire en dessous
/// 3. ViewModel détermine nextRoute (onboarding/home)
/// 4. Navigate après 2.5s via Effect
///
/// Durée totale: 2-3 secondes
///
/// **Architecture MVVM:**
/// - ViewModel: SplashViewModel
/// - State: ViewState<SplashData>
/// - Effect: navigateTo(nextRoute)
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin, EffectHandler {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    // Initialiser la session au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(sessionInitializerProvider.future);
      // Précharger le feed d'exploration en parallèle pour un affichage instantané
      ref.read(vehicleExploreViewModelProvider.notifier).load();
      
      // Si connecté, précharger les données adaptées au rôle
      if (ref.read(isAuthenticatedProvider)) {
        final isOwner = ref.read(isOwnerProvider);
        if (isOwner) {
          // Précharger le dashboard propriétaire
          ref.read(ownerDashboardViewModelProvider.notifier).load();
        }
        
        // Précharger les réservations (le ViewModel filtrera en fonction du rôle)
        ref.read(bookingListViewModelProvider.notifier).load();
      }
    });

    // Écouter les effects du ViewModel
    listenToEffects(splashEffectsProvider);

    // Initialiser les animations
    _initAnimations();

    // Naviguer après délai
    _navigateAfterDelay();
  }

  void _initAnimations() {
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    // Fade in animation
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    // Scale animation (légère)
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.8, curve: Curves.elasticOut),
      ),
    );

    _controller.forward();
  }

  Future<void> _navigateAfterDelay() async {
    // Attendre que la session soit restaurée et que le délai minimal de 2.5s soit écoulé
    await Future.wait([
      ref.read(sessionInitializerProvider.future),
      Future.delayed(const Duration(milliseconds: 2500)),
    ]);

    if (!mounted) return;

    // Déterminer la route selon l'état réel de la session
    final sessionService = ref.read(sessionServiceProvider);
    final sharedPrefs = ref.read(sharedPreferencesProvider);
    final hasSeenOnboarding = sharedPrefs.getBool('hasSeenOnboarding') ?? false;

    String nextRoute;
    if (!hasSeenOnboarding) {
      nextRoute = Routes.onboarding;
    } else if (!sessionService.isAuthenticated) {
      nextRoute = Routes.home; // Accès public visiteur
    } else {
      // Utilisateur authentifié : on redirige vers son dernier espace actif restauré
      final role = sessionService.currentRole;
      if (role == session_service.UserRole.owner) {
        nextRoute = Routes.ownerDashboard;
      } else {
        nextRoute = Routes.home;
      }
    }

    if (mounted) {
      context.go(nextRoute);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Watcher le state (optionnel ici, mais bonne pratique)
    final state = ref.watch(splashStateProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Glow émeraude décoratif en haut à droite
          Positioned(
            top: -50,
            right: -50,
            child: ImageFiltered(
              imageFilter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _emerald.withOpacity(0.16),
                ),
              ),
            ),
          ),

          // Glow émeraude décoratif en bas à gauche (pour équilibrer)
          Positioned(
            bottom: -80,
            left: -80,
            child: ImageFiltered(
              imageFilter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _emerald.withOpacity(0.12),
                ),
              ),
            ),
          ),

          // Logo centré avec animations
          Center(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Opacity(
                  opacity: _fadeAnimation.value,
                  child: Transform.scale(
                    scale: _scaleAnimation.value,
                    child: child,
                  ),
                );
              },
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo AutoLoc
                  Image.asset(
                    'assets/images/logofondnoir.png',
                    width: 320,
                    height: 320,
                    fit: BoxFit.contain,
                  ),

                  const SizedBox(height: 32),

                  // Loader circulaire custom
                  SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Version en bas (optionnel)
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: AnimatedBuilder(
              animation: _fadeAnimation,
              builder: (context, child) {
                return Opacity(
                  opacity: _fadeAnimation.value * 0.6,
                  child: child,
                );
              },
              child: const Text(
                'Version 1.0.0',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
