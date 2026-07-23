import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/widgets/buttons/primary_button.dart';
import '../effects/auth_effect.dart';
import '../providers/auth_providers.dart';
import '../../../../shared/providers/session_providers.dart';

/// OtpVerificationScreen
///
/// Écran de vérification du code OTP.
/// Utilisé par login ET register.
class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String identifier; // phone pour login, email pour register
  final int expiresIn;
  final bool isLogin; // true = login flow, false = register flow

  const OtpVerificationScreen({
    super.key,
    required this.identifier,
    required this.expiresIn,
    this.isLogin = true,
  });

  @override
  ConsumerState<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  StreamSubscription<Object>? _effectsSubscription;

  @override
  void initState() {
    super.initState();
    // Écouter les effets du ViewModel approprié
    _listenToEffects();

    // Focus sur le premier champ
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  void _listenToEffects() {
    final effectsStream = widget.isLogin
        ? ref.read(phoneLoginViewModelProvider.notifier).effects
        : ref.read(registerViewModelProvider.notifier).effects;
    _effectsSubscription = effectsStream.listen((effect) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _handleEffect(effect as AuthEffect);
        }
      });
    });
  }

  @override
  void dispose() {
    _effectsSubscription?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _handleEffect(AuthEffect effect) {
    effect.when(
      navigateToOtpVerification: (_, __) {
        // Déjà sur cet écran
      },
      navigateToCompleteProfile: () {
        // Pas utilisé
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
        // Déjà géré
      },
      showOtpResent: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nouveau code envoyé'),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      startOtpTimer: (_) {
        // Géré par le ViewModel
      },
    );
  }

  void _onCodeChanged(int index, String value) {
    if (value.length > 1) {
      // Paste handler
      final code = value.replaceAll(RegExp(r'\D'), '');
      for (int i = 0; i < code.length && i < 6; i++) {
        _controllers[i].text = code[i];
      }
      if (code.length >= 6) {
        _focusNodes[5].requestFocus();
        _submitCode();
      } else if (code.isNotEmpty) {
        final nextIndex = code.length < 6 ? code.length : 5;
        _focusNodes[nextIndex].requestFocus();
      }
      return;
    }

    if (value.isNotEmpty) {
      // Move to next field
      if (index < 5) {
        _focusNodes[index + 1].requestFocus();
      } else {
        // Last field filled, auto-submit
        _focusNodes[index].unfocus();
        _submitCode();
      }
    }
  }

  void _onKeyEvent(int index, RawKeyEvent event) {
    if (event is RawKeyDownEvent) {
      if (event.logicalKey == LogicalKeyboardKey.backspace) {
        if (_controllers[index].text.isEmpty && index > 0) {
          _focusNodes[index - 1].requestFocus();
        }
      }
    }
  }

  void _submitCode() {
    final code = _controllers.map((c) => c.text).join();
    if (code.length != 6) return;

    HapticFeedback.mediumImpact();

    if (widget.isLogin) {
      final viewModel = ref.read(phoneLoginViewModelProvider.notifier);
      viewModel.updateOtpCode(code);
      viewModel.verifyOtp();
    } else {
      final viewModel = ref.read(registerViewModelProvider.notifier);
      viewModel.verifyEmailOtp(code);
    }
  }

  void _resendCode() {
    HapticFeedback.selectionClick();

    if (widget.isLogin) {
      ref.read(phoneLoginViewModelProvider.notifier).resendOtp();
    } else {
      ref.read(registerViewModelProvider.notifier).resendOtp();
    }

    // Clear les champs
    for (var controller in _controllers) {
      controller.clear();
    }
    _focusNodes[0].requestFocus();
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.isLogin
        ? ref.watch(phoneLoginViewModelProvider)
        : ref.watch(registerViewModelProvider);

    final otpFormState = widget.isLogin
        ? ref.watch(phoneOtpFormStateProvider)
        : ref.watch(registerOtpFormStateProvider);

    final isLoading = state.showLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0D0D0D)),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Icône
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Icon(
                    Icons.smartphone,
                    size: 40,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Titre
              const Text(
                'Vérification',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0D0D0D),
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 8),

              Text(
                widget.isLogin
                    ? 'Saisissez le code envoyé par WhatsApp ou SMS au numéro ${widget.identifier}'
                    : 'Saisissez le code envoyé par email à ${widget.identifier}',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: Color(0xFF64748B),
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 48),

              // OTP Fields
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 48,
                    height: 56,
                    child: RawKeyboardListener(
                      focusNode: FocusNode(),
                      onKey: (event) => _onKeyEvent(index, event),
                      child: TextField(
                        controller: _controllers[index],
                        focusNode: _focusNodes[index],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        maxLength: 1,
                        enabled: !isLoading,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0D0D0D),
                        ),
                        decoration: InputDecoration(
                          counterText: '',
                          contentPadding: EdgeInsets.zero,
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: _controllers[index].text.isNotEmpty
                                  ? const Color(0xFF10B981)
                                  : const Color(0xFFE2E8F0),
                              width: 2,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(
                              color: Color(0xFF10B981),
                              width: 2,
                            ),
                          ),
                          filled: true,
                          fillColor: _controllers[index].text.isNotEmpty
                              ? const Color(0xFF10B981).withOpacity(0.05)
                              : const Color(0xFFF8FAFC),
                        ),
                        onChanged: (value) => _onCodeChanged(index, value),
                      ),
                    ),
                  );
                }),
              ),

              const SizedBox(height: 32),

              // Warning
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFFFDE68A),
                  ),
                ),
                child: const Text(
                  'Seul le dernier code reçu est valide.',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF92400E),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              const SizedBox(height: 32),

              // Submit button
              PrimaryButton(
                label: 'Confirmer le code',
                onPressed: !isLoading ? _submitCode : null,
                isLoading: isLoading,
              ),

              const SizedBox(height: 24),

              // Timer & Resend
              Center(
                child: otpFormState.canResend
                    ? TextButton.icon(
                        onPressed: isLoading ? null : _resendCode,
                        icon: const Icon(
                          Icons.refresh,
                          size: 18,
                          color: Color(0xFF10B981),
                        ),
                        label: const Text(
                          'Renvoyer le code',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF10B981),
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.timer_outlined,
                            size: 18,
                            color: Colors.grey[600],
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Renvoyer dans ${_formatTime(otpFormState.expiresIn)}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
