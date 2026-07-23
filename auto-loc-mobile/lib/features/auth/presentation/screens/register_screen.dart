import 'dart:async';
import 'dart:ui';

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
import '../../../../shared/presentation/widgets/inputs/text_input_field.dart';
import '../effects/auth_effect.dart';
import '../providers/auth_providers.dart';
import '../../../../shared/providers/session_providers.dart';

const Color _emerald = Color(0xFF34D399);

/// RegisterScreen
///
/// Écran d'inscription avec email/password (aligné sur frontend).
/// Flow: Saisie profil → Check availability → Supabase signUp → Email OTP → Complete profile
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen>
    with TickerProviderStateMixin {
  StreamSubscription<Object>? _effectsSubscription;
  StreamSubscription<Object>? _googleEffectsSubscription;

  // ═══ Animations ════════════════════════════════════════════════════════════
  late final AnimationController _masterController;
  late final AnimationController _glowController;
  late final AnimationController _pulseController;

  // Staggered animations
  late final Animation<double> _logoFade;
  late final Animation<Offset> _logoSlide;
  late final Animation<double> _titleFade;
  late final Animation<Offset> _titleSlide;
  late final Animation<double> _subtitleFade;
  late final Animation<double> _nameRowFade;
  late final Animation<Offset> _nameRowSlide;
  late final Animation<double> _phoneFade;
  late final Animation<Offset> _phoneSlide;
  late final Animation<double> _emailFade;
  late final Animation<Offset> _emailSlide;
  late final Animation<double> _passwordFade;
  late final Animation<Offset> _passwordSlide;
  late final Animation<double> _cguFade;
  late final Animation<Offset> _cguSlide;
  late final Animation<double> _buttonFade;
  late final Animation<double> _buttonScale;
  late final Animation<double> _dividerFade;
  late final Animation<double> _googleFade;
  late final Animation<Offset> _googleSlide;
  late final Animation<double> _linkFade;

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
    // Master controller — plus long pour le register (plus d'éléments)
    _masterController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    // Glow — boucle infinie
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3500),
    )..repeat(reverse: true);

    _glowPulse = Tween<double>(begin: 0.10, end: 0.20).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    // Pulse du logo — respiration
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _logoPulse = Tween<double>(begin: 1.0, end: 1.04).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // ── Staggered ──
    _logoFade = _fadeIn(0.0, 0.2);
    _logoSlide = _slideUp(0.0, 0.2);

    _titleFade = _fadeIn(0.05, 0.25);
    _titleSlide = _slideUp(0.05, 0.25);

    _subtitleFade = _fadeIn(0.1, 0.3);

    _nameRowFade = _fadeIn(0.15, 0.38);
    _nameRowSlide = _slideUp(0.15, 0.38);

    _phoneFade = _fadeIn(0.22, 0.44);
    _phoneSlide = _slideUp(0.22, 0.44);

    _emailFade = _fadeIn(0.28, 0.50);
    _emailSlide = _slideUp(0.28, 0.50);

    _passwordFade = _fadeIn(0.34, 0.56);
    _passwordSlide = _slideUp(0.34, 0.56);

    _cguFade = _fadeIn(0.42, 0.62);
    _cguSlide = _slideUp(0.42, 0.62);

    _buttonFade = _fadeIn(0.50, 0.70);
    _buttonScale = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(
        parent: _masterController,
        curve: const Interval(0.50, 0.70, curve: Curves.easeOutBack),
      ),
    );

    _dividerFade = _fadeIn(0.58, 0.76);

    _googleFade = _fadeIn(0.64, 0.82);
    _googleSlide = _slideUp(0.64, 0.82);

    _linkFade = _fadeIn(0.75, 0.92);

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
    final effectsStream = ref.read(registerViewModelProvider.notifier).effects;
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
        context.push(Routes.verifyOtp, extra: {
          'identifier': email,
          'expiresIn': expiresIn,
          'isLogin': false,
        });
      },
      navigateToCompleteProfile: () {
        // Pas utilisé en register (profil complété directement)
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
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      showOtpSent: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Code envoyé par email'),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      showOtpResent: () {
        // Pas utilisé en register screen
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
    final state = ref.watch(registerViewModelProvider);
    final viewModel = ref.read(registerViewModelProvider.notifier);
    final formState = ref.watch(registerFormStateProvider);

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
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // ═══ Glow émeraude pulsant (haut droit) ═══════════════════
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
                  bottom: -100,
                  left: -80,
                  child: ImageFiltered(
                    imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                    child: Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _emerald.withOpacity(_glowPulse.value * 0.4),
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
                        'Créer un compte',
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
                    child: const Text(
                      'Aucun abonnement requis',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF94A3B8),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // ═══ Prénom + Nom animés ════════════════════════════
                  _AnimatedElement(
                    fade: _nameRowFade,
                    slide: _nameRowSlide,
                    child: Row(
                      children: [
                        Expanded(
                          child: TextInputField(
                            label: 'Prénom',
                            hint: 'Oumar',
                            initialValue: formState.prenom,
                            onChanged: viewModel.updatePrenom,
                            enabled: !isLoading,
                            keyboardType: TextInputType.name,
                            textCapitalization: TextCapitalization.words,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextInputField(
                            label: 'Nom',
                            hint: 'Sy',
                            initialValue: formState.nom,
                            onChanged: viewModel.updateNom,
                            enabled: !isLoading,
                            keyboardType: TextInputType.name,
                            textCapitalization: TextCapitalization.words,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ═══ Téléphone animé ════════════════════════════════
                  _AnimatedElement(
                    fade: _phoneFade,
                    slide: _phoneSlide,
                    child: PhoneInputField(
                      label: 'Numéro de téléphone',
                      initialValue: formState.phone,
                      onChanged: viewModel.updatePhone,
                      enabled: !isLoading,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ═══ Email animé ════════════════════════════════════
                  _AnimatedElement(
                    fade: _emailFade,
                    slide: _emailSlide,
                    child: TextInputField(
                      label: 'Adresse email',
                      hint: 'vous@autoloc.sn',
                      initialValue: formState.email,
                      onChanged: viewModel.updateEmail,
                      enabled: !isLoading,
                      keyboardType: TextInputType.emailAddress,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ═══ Mot de passe animé ═════════════════════════════
                  _AnimatedElement(
                    fade: _passwordFade,
                    slide: _passwordSlide,
                    child: TextInputField(
                      label: 'Mot de passe',
                      hint: '••••••••',
                      initialValue: formState.password,
                      onChanged: viewModel.updatePassword,
                      enabled: !isLoading,
                      obscureText: true,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // ═══ Checkbox CGU animée ════════════════════════════
                  _AnimatedElement(
                    fade: _cguFade,
                    slide: _cguSlide,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: formState.agreedToTerms,
                            onChanged: isLoading
                                ? null
                                : (_) {
                                    HapticFeedback.selectionClick();
                                    viewModel.toggleTermsAgreement();
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
                                    viewModel.toggleTermsAgreement();
                                  },
                            child: RichText(
                              text: const TextSpan(
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF94A3B8),
                                  height: 1.5,
                                ),
                                children: [
                                  TextSpan(text: 'J\'accepte les '),
                                  TextSpan(
                                    text: 'conditions générales',
                                    style: TextStyle(
                                      color: Color(0xFF10B981),
                                      fontWeight: FontWeight.w600,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                  TextSpan(text: ' d\'utilisation'),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // ═══ Bouton inscription animé ═══════════════════════
                  FadeTransition(
                    opacity: _buttonFade,
                    child: ScaleTransition(
                      scale: _buttonScale,
                      child: PrimaryButton(
                        label: 'Créer mon compte',
                        onPressed: formState.canSubmit && !isLoading
                            ? () {
                                HapticFeedback.mediumImpact();
                                viewModel.register();
                              }
                            : null,
                        isLoading: isLoading,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // ═══ Divider animé ══════════════════════════════════
                  FadeTransition(
                    opacity: _dividerFade,
                    child: Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 1,
                            color: const Color(0xFF1E293B),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'Ou continuer avec',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF94A3B8),
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            height: 1,
                            color: const Color(0xFF1E293B),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

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

                  // ═══ Lien login animé ═══════════════════════════════
                  FadeTransition(
                    opacity: _linkFade,
                    child: Center(
                      child: GestureDetector(
                        onTap: isLoading
                            ? null
                            : () {
                                HapticFeedback.selectionClick();
                                context.pop();
                              },
                        child: RichText(
                          text: const TextSpan(
                            style: TextStyle(
                              fontSize: 14,
                              color: Color(0xFF94A3B8),
                            ),
                            children: [
                              TextSpan(text: 'Déjà un compte ? '),
                              TextSpan(
                                text: 'Se connecter',
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontWeight: FontWeight.w600,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ],
                          ),
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
