import 'dart:async';
import 'dart:ui';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/widgets/buttons/primary_button.dart';
import '../../../../shared/presentation/widgets/buttons/google_button.dart';
import '../../../../shared/presentation/widgets/inputs/phone_input_field.dart';
import '../effects/auth_effect.dart';
import '../providers/auth_providers.dart';
import '../../../../shared/providers/session_providers.dart';

const Color _emerald = Color(0xFF34D399);

/// PhoneLoginScreen
///
/// Écran de connexion par téléphone.
/// Flow: Saisie téléphone → Acceptation CGU → Envoi OTP → Navigation vers vérification
class PhoneLoginScreen extends ConsumerStatefulWidget {
  const PhoneLoginScreen({super.key});

  @override
  ConsumerState<PhoneLoginScreen> createState() => _PhoneLoginScreenState();
}

class _PhoneLoginScreenState extends ConsumerState<PhoneLoginScreen>
    with TickerProviderStateMixin {
  StreamSubscription<Object>? _effectsSubscription;
  StreamSubscription<Object>? _googleEffectsSubscription;

  // ═══ Animations ════════════════════════════════════════════════════════════
  late final AnimationController _masterController;
  late final AnimationController _glowController;
  late final AnimationController _pulseController;

  // Staggered animations pour chaque élément
  late final Animation<double> _logoFade;
  late final Animation<Offset> _logoSlide;
  late final Animation<double> _titleFade;
  late final Animation<Offset> _titleSlide;
  late final Animation<double> _subtitleFade;
  late final Animation<double> _phoneFade;
  late final Animation<Offset> _phoneSlide;
  late final Animation<double> _cguFade;
  late final Animation<Offset> _cguSlide;
  late final Animation<double> _buttonFade;
  late final Animation<double> _buttonScale;
  late final Animation<double> _dividerFade;
  late final Animation<double> _googleFade;
  late final Animation<Offset> _googleSlide;
  late final Animation<double> _linkFade;
  late final Animation<double> _badgeFade;

  // Glow pulsating
  late final Animation<double> _glowPulse;
  late final Animation<double> _logoPulse;

  @override
  void initState() {
    super.initState();
    _listenToEffects();
    _initAnimations();
  }

  void _initAnimations() {
    // Master controller — orchestre toute l'entrée (1.2s)
    _masterController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Glow — animation en boucle infinie, légère pulsation
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat(reverse: true);

    _glowPulse = Tween<double>(begin: 0.12, end: 0.22).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    // Pulse du logo — respiration subtile
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _logoPulse = Tween<double>(begin: 1.0, end: 1.04).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // ── Staggered fade/slide pour chaque élément ──
    _logoFade = _fadeIn(0.0, 0.3);
    _logoSlide = _slideUp(0.0, 0.3);

    _titleFade = _fadeIn(0.1, 0.4);
    _titleSlide = _slideUp(0.1, 0.4);

    _subtitleFade = _fadeIn(0.15, 0.45);

    _phoneFade = _fadeIn(0.25, 0.55);
    _phoneSlide = _slideUp(0.25, 0.55);

    _cguFade = _fadeIn(0.35, 0.6);
    _cguSlide = _slideUp(0.35, 0.6);

    _buttonFade = _fadeIn(0.45, 0.7);
    _buttonScale = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(
        parent: _masterController,
        curve: const Interval(0.45, 0.7, curve: Curves.easeOutBack),
      ),
    );

    _dividerFade = _fadeIn(0.55, 0.75);

    _googleFade = _fadeIn(0.6, 0.8);
    _googleSlide = _slideUp(0.6, 0.8);

    _linkFade = _fadeIn(0.7, 0.85);

    _badgeFade = _fadeIn(0.8, 1.0);

    // Lancer l'animation
    _masterController.forward();
  }

  Animation<double> _fadeIn(double begin, double end) {
    return Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _masterController,
        curve: Interval(begin, end, curve: Curves.easeOut),
      ),
    );
  }

  Animation<Offset> _slideUp(double begin, double end) {
    return Tween<Offset>(
      begin: const Offset(0, 24),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _masterController,
        curve: Interval(begin, end, curve: Curves.easeOutCubic),
      ),
    );
  }

  void _listenToEffects() {
    final effectsStream = ref.read(phoneLoginViewModelProvider.notifier).effects;
    _effectsSubscription = effectsStream.listen((effect) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _handleEffect(effect as AuthEffect);
        }
      });
    });

    final googleEffectsStream = ref.read(googleAuthViewModelProvider.notifier).effects;
    _googleEffectsSubscription = googleEffectsStream.listen((effect) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _handleEffect(effect as AuthEffect);
        }
      });
    });
  }

  void _handleEffect(AuthEffect effect) {
    effect.when(
      navigateToOtpVerification: (email, expiresIn) {
        // Pour le login par téléphone, email contient le numéro de téléphone
        context.push(Routes.verifyOtp, extra: {
          'identifier': email,
          'expiresIn': expiresIn,
          'isLogin': true,
        });
      },
      navigateToCompleteProfile: () {
        // Pas utilisé en login
      },
      navigateToHome: () {
        final isOwner = ref.read(isOwnerProvider);
        if (isOwner) {
          context.go('/owner/dashboard');
        } else {
          context.go('/home');
        }
      },
      showError: (message) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      showSuccess: (message) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: _emerald,
          ),
        );
      },
      showOtpSent: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Code envoyé par SMS'),
            backgroundColor: _emerald,
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      showOtpResent: () {
        // Pas utilisé en login screen
      },
      startOtpTimer: (_) {
        // Géré par le ViewModel
      },
    );
  }

  @override
  void dispose() {
    _effectsSubscription?.cancel();
    _googleEffectsSubscription?.cancel();
    _masterController.dispose();
    _glowController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(phoneLoginViewModelProvider);
    final viewModel = ref.read(phoneLoginViewModelProvider.notifier);
    final formState = ref.watch(phoneLoginFormStateNotifierProvider);
    final formNotifier = ref.read(phoneLoginFormStateNotifierProvider.notifier);

    final googleState = ref.watch(googleAuthViewModelProvider);
    final googleViewModel = ref.read(googleAuthViewModelProvider.notifier);

    final isLoading = state.showLoading;
    final isGoogleLoading = googleState.showLoading;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.go(Routes.home),
        ),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // ═══ Glow émeraude pulsant ════════════════════════════════
            AnimatedBuilder(
              animation: _glowPulse,
              builder: (context, child) {
                return Positioned(
                  top: -60,
                  right: -60,
                  child: ImageFiltered(
                    imageFilter: ImageFilter.blur(sigmaX: 70, sigmaY: 70),
                    child: Container(
                      width: 220,
                      height: 220,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _emerald.withOpacity(_glowPulse.value),
                      ),
                    ),
                  ),
                );
              },
            ),

            // ═══ Glow secondaire (bas gauche) ═════════════════════════
            AnimatedBuilder(
              animation: _glowPulse,
              builder: (context, child) {
                return Positioned(
                  bottom: -80,
                  left: -80,
                  child: ImageFiltered(
                    imageFilter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _emerald.withOpacity(_glowPulse.value * 0.5),
                      ),
                    ),
                  ),
                );
              },
            ),

            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ═══ Logo animé ═════════════════════════════════════
                  _AnimatedElement(
                    fade: _logoFade,
                    slide: _logoSlide,
                    child: AnimatedBuilder(
                      animation: _logoPulse,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _logoPulse.value,
                          child: child,
                        );
                      },
                      child: Center(
                        child: Image.asset(
                          'assets/images/logofondnoir.png',
                          height: 72,
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),

                  // ═══ Titre animé ════════════════════════════════════
                  _AnimatedElement(
                    fade: _titleFade,
                    slide: _titleSlide,
                    child: ShaderMask(
                      blendMode: BlendMode.srcIn,
                      shaderCallback: (bounds) => const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Colors.white, Colors.white, _emerald],
                        stops: [0.0, 0.6, 1.0],
                      ).createShader(bounds),
                      child: const Text(
                        'Bon retour !',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -0.5,
                          height: 1.2,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // ═══ Sous-titre ═════════════════════════════════════
                  FadeTransition(
                    opacity: _subtitleFade,
                    child: Text(
                      'Connectez-vous à votre espace',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.5),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                  const SizedBox(height: 40),

                  // ═══ Champ téléphone animé ══════════════════════════
                  _AnimatedElement(
                    fade: _phoneFade,
                    slide: _phoneSlide,
                    child: PhoneInputField(
                      label: 'Numéro de téléphone',
                      initialValue: formState.phone,
                      onChanged: formNotifier.updatePhone,
                      enabled: !isLoading,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ═══ Checkbox CGU animée ════════════════════════════
                  _AnimatedElement(
                    fade: _cguFade,
                    slide: _cguSlide,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 22,
                            height: 22,
                            child: Checkbox(
                              value: formState.agreedToTerms,
                              onChanged: isLoading
                                  ? null
                                  : (_) {
                                      HapticFeedback.selectionClick();
                                      formNotifier.toggleTermsAgreement();
                                    },
                              activeColor: _emerald,
                              checkColor: Colors.black,
                              fillColor: MaterialStateProperty.resolveWith((states) {
                                if (states.contains(MaterialState.selected)) {
                                  return _emerald;
                                }
                                return Colors.transparent;
                              }),
                              side: BorderSide(
                                  color: Colors.white.withOpacity(0.5),
                                  width: 2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: GestureDetector(
                              onTap: isLoading
                                  ? null
                                  : () {
                                      HapticFeedback.selectionClick();
                                      formNotifier.toggleTermsAgreement();
                                    },
                              child: RichText(
                                text: TextSpan(
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withOpacity(0.6),
                                    height: 1.5,
                                  ),
                                  children: [
                                    const TextSpan(text: 'J\'accepte les '),
                                    TextSpan(
                                      text: 'conditions générales',
                                      style: TextStyle(
                                        color: _emerald,
                                        fontWeight: FontWeight.w700,
                                        decoration: TextDecoration.underline,
                                        decorationColor:
                                            _emerald.withOpacity(0.5),
                                      ),
                                    ),
                                    const TextSpan(text: ' d\'utilisation'),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ═══ Bouton connexion animé ═════════════════════════
                  FadeTransition(
                    opacity: _buttonFade,
                    child: ScaleTransition(
                      scale: _buttonScale,
                      child: PrimaryButton(
                        label: 'Recevoir le code SMS',
                        onPressed: formState.canSubmit && !isLoading
                            ? () {
                                HapticFeedback.mediumImpact();
                                viewModel.sendOtp(formState.phone, formState.agreedToTerms);
                              }
                            : null,
                        isLoading: isLoading,
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ═══ Divider animé ══════════════════════════════════
                  FadeTransition(
                    opacity: _dividerFade,
                    child: Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 1,
                            color: Colors.white.withOpacity(0.08),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'OU',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Colors.white.withOpacity(0.35),
                              letterSpacing: 1.2,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            height: 1,
                            color: Colors.white.withOpacity(0.08),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ═══ Google Button animé ════════════════════════════
                  _AnimatedElement(
                    fade: _googleFade,
                    slide: _googleSlide,
                    child: GoogleButton(
                      onPressed: isLoading || isGoogleLoading
                          ? null
                          : () {
                              HapticFeedback.mediumImpact();
                              googleViewModel.signInWithGoogle();
                            },
                      isLoading: isGoogleLoading,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // ═══ Lien register animé ════════════════════════════
                  FadeTransition(
                    opacity: _linkFade,
                    child: Center(
                      child: GestureDetector(
                        onTap: isLoading
                            ? null
                            : () {
                                HapticFeedback.selectionClick();
                                context.push(Routes.register);
                              },
                        child: RichText(
                          text: TextSpan(
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.5),
                            ),
                            children: [
                              const TextSpan(text: 'Pas encore de compte ? '),
                              TextSpan(
                                text: 'Créer un compte',
                                style: TextStyle(
                                  color: _emerald,
                                  fontWeight: FontWeight.w700,
                                  decoration: TextDecoration.underline,
                                  decorationColor: _emerald.withOpacity(0.5),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),

                  // ═══ Badge sécurité animé ═══════════════════════════
                  FadeTransition(
                    opacity: _badgeFade,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.08),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.shield_rounded,
                              size: 14,
                              color: _emerald.withOpacity(0.8),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Sécurisé par AutoLoc',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white.withOpacity(0.5),
                                letterSpacing: 1.0,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// WIDGET: Élément animé réutilisable (fade + slide)
// =============================================================================

class _AnimatedElement extends StatelessWidget {
  const _AnimatedElement({
    required this.fade,
    required this.slide,
    required this.child,
  });

  final Animation<double> fade;
  final Animation<Offset> slide;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([fade, slide]),
      builder: (context, _) {
        return Opacity(
          opacity: fade.value,
          child: Transform.translate(
            offset: slide.value,
            child: child,
          ),
        );
      },
    );
  }
}