import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../../design_system/atoms/inputs/app_text_field.dart';
import '../../../../../design_system/atoms/inputs/otp_field.dart';
import '../../../../../design_system/components/premium_glass.dart';
import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../../../auth/di/auth_injection.dart';
import '../../../../user/domain/entities/user.dart';

enum GateStage { intro, otp, success }

/// Gate 2: Vérifier le numéro de téléphone (OTP 6 chiffres)
class PhoneVerifyGateView extends ConsumerStatefulWidget {
  const PhoneVerifyGateView({
    super.key,
    required this.user,
    required this.onVerified,
    this.initialStage = GateStage.intro,
  });

  final User user;
  final VoidCallback onVerified;
  final GateStage initialStage;

  @override
  ConsumerState<PhoneVerifyGateView> createState() => _PhoneVerifyGateViewState();
}

class _PhoneVerifyGateViewState extends ConsumerState<PhoneVerifyGateView> {
  late GateStage _stage;
  late final TextEditingController _phoneController;

  bool _isLoading = false;
  String? _error;
  String _otpCode = '';

  @override
  void initState() {
    super.initState();
    _stage = widget.initialStage;
    _phoneController = TextEditingController(text: widget.user.telephone);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.replaceAll(' ', '');
    if (phone.length < 8) {
      setState(() => _error = 'Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final updatePhone = ref.read(updatePhoneUseCaseProvider);
      final sendPhoneOtp = ref.read(sendPhoneOtpUseCaseProvider);

      final updateResult = await updatePhone(telephone: phone);

      await updateResult.fold(
        (failure) async {
          final isAlreadySent = failure.message.toLowerCase().contains('déjà') ||
              failure.message.toLowerCase().contains('deja') ||
              failure.message.toLowerCase().contains('déja') ||
              failure.message.toLowerCase().contains('déja');
          if (isAlreadySent) {
            setState(() => _stage = GateStage.otp);
          } else {
            setState(() => _error = failure.message);
          }
        },
        (_) async {
          final sendResult = await sendPhoneOtp();
          sendResult.fold(
            (failure) {
              final isAlreadySent = failure.message.toLowerCase().contains('déjà') ||
                  failure.message.toLowerCase().contains('deja') ||
                  failure.message.toLowerCase().contains('déja') ||
                  failure.message.toLowerCase().contains('déja');
              if (isAlreadySent) {
                setState(() => _stage = GateStage.otp);
              } else {
                setState(() => _error = failure.message);
              }
            },
            (_) => setState(() => _stage = GateStage.otp),
          );
        },
      );
    } catch (e) {
      setState(() => _error = 'Erreur: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _verifyOtp(String code) async {
    if (code.length != 6) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final verifyPhoneOtp = ref.read(verifyPhoneOtpUseCaseProvider);
      final result = await verifyPhoneOtp(code: code);

      result.fold(
        (failure) {
          setState(() => _error = failure.message);
        },
        (_) {
          setState(() => _stage = GateStage.success);
          Future.delayed(const Duration(milliseconds: 1200), widget.onVerified);
        },
      );
    } catch (e) {
      setState(() => _error = 'Erreur: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_stage == GateStage.success) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: DSSpacing.xl),
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const StatusIconBadge(icon: Icons.check_circle_outline_rounded),
            const SizedBox(height: DSSpacing.md),
            Text(
              'Téléphone vérifié',
              style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w800, letterSpacing: -0.3),
            ),
            const SizedBox(height: DSSpacing.xs),
            Text(
              'Redirection en cours...',
              style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
            ),
          ],
        ),
      );
    }

    if (_stage == GateStage.otp) {
      final isCodeComplete = _otpCode.length == 6;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Un code à 6 chiffres a été envoyé par WhatsApp (ou SMS) au :',
            style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary, height: 1.4),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: DSSpacing.xs),
          Align(
            alignment: Alignment.center,
            child: Text(
              _phoneController.text,
              style: DSTypography.bodyLarge.copyWith(fontWeight: FontWeight.w800, color: Colors.white),
            ),
          ),
          const SizedBox(height: DSSpacing.lg),
          OtpField(
            length: 6,
            hasError: _error != null,
            onChanged: (val) {
              setState(() {
                _otpCode = val;
                _error = null;
              });
            },
            onCompleted: _verifyOtp,
          ),
          if (_error != null) ...[
            const SizedBox(height: DSSpacing.md),
            InlineErrorBanner(message: _error!),
          ],
          const SizedBox(height: DSSpacing.lg),
          PrimaryButton(
            label: 'Vérifier le code',
            fullWidth: true,
            isLoading: _isLoading,
            isDisabled: !isCodeComplete,
            onPressed: () => _verifyOtp(_otpCode),
          ),
          const SizedBox(height: DSSpacing.sm),
          Align(
            alignment: Alignment.center,
            child: TextButton(
              onPressed: () {
                setState(() {
                  _stage = GateStage.intro;
                  _otpCode = '';
                  _error = null;
                });
              },
              child: Text(
                'Modifier le numéro',
                style: DSTypography.buttonMedium.copyWith(
                  color: DSColors.darkTextSecondary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        AppTextField(
          controller: _phoneController,
          label: 'Numéro de téléphone',
          hint: 'Ex: +221 77 123 45 67',
          keyboardType: TextInputType.phone,
        ),
        if (_error != null) ...[
          const SizedBox(height: DSSpacing.md),
          InlineErrorBanner(message: _error!),
        ],
        const SizedBox(height: DSSpacing.lg),
        PrimaryButton(
          label: 'Continuer',
          fullWidth: true,
          isLoading: _isLoading,
          onPressed: _sendOtp,
          icon: Icons.arrow_forward_rounded,
          iconPosition: IconPosition.right,
        ),
      ],
    );
  }
}