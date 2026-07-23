import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../../design_system/atoms/inputs/app_text_field.dart';
import '../../../../../design_system/components/premium_glass.dart';
import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../../../auth/di/auth_injection.dart';
import '../../../domain/entities/vehicle.dart';
import '../../../../user/domain/entities/user.dart';

/// Gate 1: Compléter le profil (Prénom, Nom, Date de naissance, Téléphone)
class CreateProfileGateView extends ConsumerStatefulWidget {
  const CreateProfileGateView({
    super.key,
    required this.user,
    required this.onComplete,
  });

  final User user;
  final Function(bool otpSent) onComplete;

  @override
  ConsumerState<CreateProfileGateView> createState() => _CreateProfileGateViewState();
}

class _CreateProfileGateViewState extends ConsumerState<CreateProfileGateView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _prenomController;
  late final TextEditingController _nomController;
  late final TextEditingController _phoneController;

  DateTime? _dateNaissance;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _prenomController = TextEditingController(text: widget.user.prenom);
    _nomController = TextEditingController(text: widget.user.nom);
    _phoneController = TextEditingController(text: widget.user.telephone);
    _dateNaissance = widget.user.dateNaissance;
  }

  @override
  void dispose() {
    _prenomController.dispose();
    _nomController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateNaissance ?? now.subtract(const Duration(days: 365 * 18)),
      firstDate: DateTime(1920),
      lastDate: now,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: kEmerald,
              onPrimary: Colors.black,
              surface: Color(0xFF1A1A1A),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _dateNaissance = picked;
        _error = null;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dateNaissance == null) {
      setState(() => _error = 'La date de naissance est obligatoire.');
      return;
    }

    final today = DateTime.now();
    int age = today.year - _dateNaissance!.year;
    if (today.month < _dateNaissance!.month ||
        (today.month == _dateNaissance!.month && today.day < _dateNaissance!.day)) {
      age--;
    }
    if (age < 18) {
      setState(() => _error = 'Vous devez avoir au moins 18 ans pour réserver.');
      return;
    }

    final phone = _phoneController.text.replaceAll(' ', '');
    if (phone.length < 8) {
      setState(() => _error = 'Numéro de téléphone invalide.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final completeProfile = ref.read(completeProfileUseCaseProvider);
      final sendPhoneOtp = ref.read(sendPhoneOtpUseCaseProvider);

      final profileResult = await completeProfile(
        prenom: _prenomController.text.trim(),
        nom: _nomController.text.trim(),
        telephone: phone,
        dateNaissance: _dateNaissance,
      );

      await profileResult.fold(
        (failure) async {
          setState(() => _error = failure.message);
        },
        (authUser) async {
          final otpResult = await sendPhoneOtp();
          bool otpSent = false;
          otpResult.fold(
            (failure) => null,
            (success) => otpSent = true,
          );
          widget.onComplete(otpSent);
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
    final dateFormat = DateFormat('dd MMMM yyyy', 'fr_FR');

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: AppTextField(
                  controller: _prenomController,
                  label: 'Prénom',
                  hint: 'Ex: Amadou',
                  textCapitalization: TextCapitalization.words,
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Prénom requis' : null,
                ),
              ),
              const SizedBox(width: DSSpacing.md),
              Expanded(
                child: AppTextField(
                  controller: _nomController,
                  label: 'Nom',
                  hint: 'Ex: Diop',
                  textCapitalization: TextCapitalization.characters,
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Nom requis' : null,
                ),
              ),
            ],
          ),
          const SizedBox(height: DSSpacing.md),
          Text(
            'DATE DE NAISSANCE',
            style: DSTypography.labelSmall.copyWith(
              color: DSColors.darkTextTertiary,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: DSSpacing.xs),
          InkWell(
            onTap: () => _selectDate(context),
            borderRadius: BorderRadius.circular(PremiumRadius.chip),
            child: PremiumGlassCard(
              radius: PremiumRadius.chip,
              blur: 10,
              accent: _dateNaissance != null,
              padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md),
              child: SizedBox(
                height: 48,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _dateNaissance != null ? dateFormat.format(_dateNaissance!) : 'Sélectionner votre date de naissance',
                      style: DSTypography.bodyMedium.copyWith(
                        color: _dateNaissance != null ? Colors.white : DSColors.darkTextTertiary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Icon(
                      Icons.calendar_today_rounded,
                      size: 16,
                      color: _dateNaissance != null ? kEmerald : DSColors.darkTextTertiary,
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: DSSpacing.md),
          AppTextField(
            controller: _phoneController,
            label: 'Numéro de téléphone',
            hint: 'Ex: +221 77 123 45 67',
            keyboardType: TextInputType.phone,
            validator: (value) => (value == null || value.trim().isEmpty) ? 'Numéro de téléphone requis' : null,
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
            onPressed: _submit,
            icon: Icons.arrow_forward_rounded,
            iconPosition: IconPosition.right,
          ),
        ],
      ),
    );
  }
}