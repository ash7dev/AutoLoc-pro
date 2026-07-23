import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/presentation/base/effect_handler.dart';
import '../providers/onboarding_providers.dart';

/// Single Page Onboarding Screen
///
/// Design premium avec:
/// - Image véhicule fullscreen
/// - Badge émeraude + texte percutant en haut à gauche
/// - Forme blanche "vague" premium en bas avec bouton
///
/// **Architecture MVVM:**
/// - ViewModel: OnboardingViewModel
/// - State: ViewState<OnboardingData>
/// - Effect: navigateTo('/home') après complétion
class SingleOnboardingScreen extends ConsumerStatefulWidget {
  const SingleOnboardingScreen({super.key});

  @override
  ConsumerState<SingleOnboardingScreen> createState() =>
      _SingleOnboardingScreenState();
}

class _SingleOnboardingScreenState
    extends ConsumerState<SingleOnboardingScreen>
    with SingleTickerProviderStateMixin, EffectHandler {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<Offset> _sheetSlideAnimation;

  static const Color _emerald = Color(0xFF34D399);

  @override
  void initState() {
    super.initState();

    // Écouter les effects du ViewModel
    listenToEffects(onboardingEffectsProvider);

    // Initialiser les animations
    _initAnimations();
  }

  void _initAnimations() {
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1100),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(-0.15, 0),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );

    _sheetSlideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.25),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.2, 1.0, curve: Curves.easeOutCubic),
      ),
    );

    _controller.forward();
  }

  Future<void> _completeOnboarding() async {
    // Appeler le ViewModel pour compléter l'onboarding
    final viewModel = ref.read(onboardingViewModelProvider.notifier);
    await viewModel.completeOnboarding();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Image véhicule fullscreen
          Positioned.fill(
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/images/banner-dark.png',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: Colors.black,
                      child: const Center(
                        child: Icon(
                          Icons.directions_car_rounded,
                          size: 64,
                          color: Colors.white24,
                        ),
                      ),
                    );
                  },
                ),

                // Couche 1 : dégradé sombre pour lisibilité du texte
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.black.withOpacity(0.55),
                        Colors.black.withOpacity(0.15),
                        Colors.black.withOpacity(0.55),
                      ],
                      stops: const [0.0, 0.45, 1.0],
                    ),
                  ),
                ),

                // Couche 2 : voile duotone émeraude/noir, très subtil,
                // pour une teinte premium cohérente avec l'accent couleur
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        _emerald.withOpacity(0.14),
                        Colors.transparent,
                        Colors.black.withOpacity(0.25),
                      ],
                      stops: const [0.0, 0.45, 1.0],
                    ),
                  ),
                ),

                // Couche 3 : légère vignette sur les bords pour
                // renforcer l'effet "cadre photo" premium
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment.center,
                      radius: 1.1,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.28),
                      ],
                      stops: const [0.7, 1.0],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Badge émeraude + texte punchy en haut à gauche
          Positioned(
            top: topPadding + 30,
            left: 32,
            right: 32,
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: child,
                  ),
                );
              },
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge émeraude
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: _emerald.withOpacity(0.4),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      color: _emerald.withOpacity(0.12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: _emerald,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: _emerald.withOpacity(0.8),
                                blurRadius: 6,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'PREMIUM',
                          style: TextStyle(
                            color: _emerald,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 2.0,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Texte principal — typographie punchy, dégradé
                  // blanc → émeraude pour un rendu plus premium
                  ShaderMask(
                    blendMode: BlendMode.srcIn,
                    shaderCallback: (bounds) => LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white,
                        Colors.white,
                        _emerald,
                      ],
                      stops: const [0.0, 0.55, 1.0],
                    ).createShader(bounds),
                    child: Text(
                      'Kaay\nRéserver.',
                      textAlign: TextAlign.left,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 40,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1.2,
                        height: 1.05,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Forme blanche "vague" premium en bas
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _sheetSlideAnimation,
                    child: child,
                  ),
                );
              },
              child: ClipPath(
                clipper: _PremiumSheetClipper(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.25),
                        blurRadius: 30,
                        offset: const Offset(0, -8),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: EdgeInsets.only(
                      left: 32,
                      right: 32,
                      top: 52,
                      bottom: bottomPadding + 32,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Petit trait accent au-dessus du titre
                        Container(
                          width: 44,
                          height: 4,
                          decoration: BoxDecoration(
                            color: _emerald,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Titre — punchy, compact
                        const Text(
                          'Louez premium.\nRoulez au Sénégal.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.8,
                            height: 1.2,
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Sous-titre
                        Text(
                          'Des centaines d\'annonces vérifiées,\nréservez en quelques clics.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.black.withOpacity(0.55),
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            height: 1.5,
                          ),
                        ),

                        const SizedBox(height: 32),

                        // Bouton Commencer
                        SizedBox(
                          width: double.infinity,
                          height: 58,
                          child: ElevatedButton(
                            onPressed: _completeOnboarding,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.black,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(29),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Text(
                                  'Commencer',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                                SizedBox(width: 8),
                                Icon(Icons.arrow_forward_rounded, size: 20),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Lien vers connexion
                        GestureDetector(
                          onTap: () {
                            ref
                                .read(onboardingViewModelProvider.notifier)
                                .navigateToLogin();
                          },
                          child: Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Déjà un compte ? ',
                                  style: TextStyle(
                                    color: Colors.black.withOpacity(0.38),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                TextSpan(
                                  text: 'Connexion',
                                  style: TextStyle(
                                    color: Colors.black.withOpacity(0.75),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Clipper personnalisé pour une forme du bas plus premium qu'un simple
/// rectangle arrondi : une vague asymétrique type "lait renversé" avec
/// une bosse légère côté gauche, pour un rendu plus dynamique et soigné.
class _PremiumSheetClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    const waveHeight = 36.0;

    path.moveTo(0, waveHeight);
    path.quadraticBezierTo(
      size.width * 0.22,
      -waveHeight * 0.6,
      size.width * 0.5,
      waveHeight * 0.55,
    );
    path.quadraticBezierTo(
      size.width * 0.78,
      waveHeight * 1.6,
      size.width,
      0,
    );
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}