import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/atoms/buttons/secondary_button.dart';
import '../../../../design_system/atoms/inputs/app_text_field.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../user/di/user_injection.dart';
import '../../../user/domain/entities/user.dart';
import '../../domain/entities/vehicle.dart';
import 'gates/create_profile_gate_view.dart';
import 'gates/kyc_gate_view.dart';
import 'gates/permis_gate_view.dart';
import 'gates/phone_verify_gate_view.dart';
import '../../../../shared/enums/kyc_status.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../features/auth/di/auth_injection.dart';
import '../../../../features/user/domain/usecases/update_profile.dart';

/// **ReservationGateBottomSheet**
/// Orchestrateur des étapes de validation (Gate) pour la réservation d'un véhicule
class ReservationGateBottomSheet extends ConsumerStatefulWidget {
  const ReservationGateBottomSheet({
    super.key,
    required this.vehicle,
    required this.onProceed,
  });

  final Vehicle vehicle;
  final VoidCallback onProceed;

  @override
  ConsumerState<ReservationGateBottomSheet> createState() => _ReservationGateBottomSheetState();
}

class _ReservationGateBottomSheetState extends ConsumerState<ReservationGateBottomSheet> {
  User? _currentUser;
  bool _isLoadingProfile = true;
  String? _profileError;
  bool _preGateDismissed = false;
  bool _phoneOtpPreSent = false;

  // Local state for age/phone fields if requested
  DateTime? _localBirthDate;
  final TextEditingController _localPhoneController = TextEditingController();
  bool _isSavingGateForm = false;
  String? _gateFormError;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    _localPhoneController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile({bool otpSent = false}) async {
    setState(() {
      _isLoadingProfile = true;
      _profileError = null;
    });

    if (otpSent) {
      _phoneOtpPreSent = true;
    }

    try {
      final getProfile = ref.read(getProfileProvider);
      final result = await getProfile();

      result.fold(
        (failure) {
          setState(() {
            _profileError = failure.message;
            _isLoadingProfile = false;
          });
        },
        (user) {
          setState(() {
            _currentUser = user;
            _isLoadingProfile = false;
            if (user.dateNaissance != null) {
              _localBirthDate = user.dateNaissance;
            }
            if (user.telephone.isNotEmpty) {
              _localPhoneController.text = user.telephone;
            }
          });
        },
      );
    } catch (e) {
      setState(() {
        _profileError = 'Erreur lors du chargement : $e';
        _isLoadingProfile = false;
      });
    }
  }

  int _calculateAge(DateTime birthDate) {
    final today = DateTime.now();
    int age = today.year - birthDate.year;
    if (today.month < birthDate.month ||
        (today.month == birthDate.month && today.day < birthDate.day)) {
      age--;
    }
    return age;
  }

  String _resolveGate(User user) {
    final isProfileIncomplete = !user.profileCompleted || user.prenom.isEmpty || user.nom.isEmpty;
    if (isProfileIncomplete) return "create_profile";

    final phoneMissing = !user.phoneVerified || user.telephone.isEmpty;

    if (widget.vehicle.ageMinimum > 0) {
      final ageDateMissing = user.dateNaissance == null;
      final userAge = ageDateMissing ? null : _calculateAge(user.dateNaissance!);
      final ageInsuffisant = !ageDateMissing && userAge != null && userAge < widget.vehicle.ageMinimum;

      if (ageDateMissing) {
        if (phoneMissing) return "age_phone";
        return "age";
      }

      if (ageInsuffisant) return "age";
    }

    if (phoneMissing) return "phone";

    final kyc = user.statutKyc;
    if (kyc == KycStatus.notVerified || kyc == KycStatus.rejected) return "kyc";

    if (user.permisUrl == null || user.permisUrl!.isEmpty) return "permis";

    return "ready";
  }

  List<Map<String, dynamic>> _resolveSteps(User user) {
    final phoneOk = user.profileCompleted && user.phoneVerified && user.telephone.isNotEmpty;
    final profileOk = user.profileCompleted && user.prenom.isNotEmpty && user.nom.isNotEmpty;
    final kyc = user.statutKyc;
    final kycDone = kyc == KycStatus.verified;
    final kycPending = kyc == KycStatus.pending;
    final kycRejected = kyc == KycStatus.rejected;
    final permisOk = user.permisUrl != null && user.permisUrl!.isNotEmpty;

    final steps = <Map<String, dynamic>>[];

    // 1. Age (si requis)
    if (widget.vehicle.ageMinimum > 0) {
      final userAge = user.dateNaissance != null ? _calculateAge(user.dateNaissance!) : null;
      final ageStatus = user.dateNaissance == null
          ? "required"
          : (userAge != null && userAge < widget.vehicle.ageMinimum ? "rejected" : "done");
      
      steps.add({
        "key": "age",
        "label": "Âge minimum vérifié",
        "description": user.dateNaissance == null
            ? "Veuillez renseigner votre date de naissance"
            : (userAge != null && userAge < widget.vehicle.ageMinimum
                ? "Âge minimum requis : ${widget.vehicle.ageMinimum} ans"
                : "Âge vérifié avec succès"),
        "duration": "~30 sec",
        "status": ageStatus,
        "icon": Icons.calendar_today_rounded,
      });
    }

    // 2. Profil & Téléphone
    if (!profileOk || !phoneOk) {
      steps.add({
        "key": "phone",
        "label": profileOk ? "Téléphone vérifié" : "Profil & Téléphone",
        "description": profileOk
            ? "Confirmez votre numéro de téléphone"
            : "Prénom, nom, date de naissance et numéro de téléphone",
        "duration": profileOk ? "~1 min" : "~2 min",
        "status": (profileOk && phoneOk) ? "done" : "required",
        "icon": Icons.phone_android_rounded,
      });
    }

    // 3. KYC d'identité
    steps.add({
      "key": "kyc",
      "label": "Vérification d'identité",
      "description": "Pièce d'identité nationale ou passeport",
      "duration": "~2 min",
      "status": kycDone ? "done" : (kycPending ? "pending" : (kycRejected ? "rejected" : "required")),
      "icon": Icons.verified_user_rounded,
    });

    // 4. Permis de conduire
    steps.add({
      "key": "permis",
      "label": "Permis de conduire",
      "description": "Photo recto-verso de votre permis en cours de validité",
      "duration": "~1 min",
      "status": permisOk ? "done" : "required",
      "icon": Icons.credit_card_rounded,
    });

    return steps;
  }

  Future<void> _selectBirthDate(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _localBirthDate ?? now.subtract(const Duration(days: 365 * 18)),
      firstDate: DateTime(1920),
      lastDate: now,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: DSColors.emerald500,
              onPrimary: Colors.black,
              surface: DSColors.darkSurfaceGlass,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _localBirthDate = picked;
        _gateFormError = null;
      });
    }
  }

  Future<void> _saveAgeOnly() async {
    if (_localBirthDate == null) {
      setState(() => _gateFormError = 'La date de naissance est obligatoire.');
      return;
    }

    // Validation âge minimum de base (18 ans)
    final age = _calculateAge(_localBirthDate!);
    if (age < 18) {
      setState(() => _gateFormError = 'Vous devez avoir au moins 18 ans pour utiliser la plateforme.');
      return;
    }

    setState(() {
      _isSavingGateForm = true;
      _gateFormError = null;
    });

    try {
      final updateProfile = ref.read(updateProfileProvider);
      final result = await updateProfile(UpdateProfileParams(
        dateNaissance: _localBirthDate,
      ));

      result.fold(
        (failure) => setState(() => _gateFormError = failure.message),
        (user) {
          _fetchProfile();
        },
      );
    } catch (e) {
      setState(() => _gateFormError = 'Erreur : $e');
    } finally {
      setState(() => _isSavingGateForm = false);
    }
  }

  Future<void> _saveAgePhone() async {
    if (_localBirthDate == null) {
      setState(() => _gateFormError = 'La date de naissance est obligatoire.');
      return;
    }

    final phone = _localPhoneController.text.replaceAll(' ', '');
    if (phone.length < 8) {
      setState(() => _gateFormError = 'Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    final age = _calculateAge(_localBirthDate!);
    if (age < widget.vehicle.ageMinimum) {
      setState(() => _gateFormError = 'Ce véhicule requiert un âge minimum de ${widget.vehicle.ageMinimum} ans.');
      return;
    }

    setState(() {
      _isSavingGateForm = true;
      _gateFormError = null;
    });

    try {
      final updateProfile = ref.read(updateProfileProvider);
      final updatePhone = ref.read(updatePhoneUseCaseProvider);
      final sendPhoneOtp = ref.read(sendPhoneOtpUseCaseProvider);

      // 1. Mettre à jour la date de naissance
      final profileResult = await updateProfile(UpdateProfileParams(
        dateNaissance: _localBirthDate,
      ));

      await profileResult.fold(
        (failure) async {
          setState(() => _gateFormError = failure.message);
        },
        (user) async {
          // 2. Mettre à jour le téléphone
          final phoneResult = await updatePhone(telephone: phone);

          await phoneResult.fold(
            (failure) async {
              setState(() => _gateFormError = failure.message);
            },
            (_) async {
              // 3. Envoyer l'OTP
              final otpResult = await sendPhoneOtp();
              bool otpSent = false;
              otpResult.fold(
                (failure) => null,
                (_) => otpSent = true,
              );
              _fetchProfile(otpSent: otpSent);
            },
          );
        },
      );
    } catch (e) {
      setState(() => _gateFormError = 'Erreur : $e');
    } finally {
      setState(() => _isSavingGateForm = false);
    }
  }

  Widget _buildPreGateOverlay(List<Map<String, dynamic>> steps) {
    final pendingSteps = steps.where((s) => s['status'] != 'done').toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AUTO LOC · LOCATAIRE',
                    style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, letterSpacing: 1.5),
                  ),
                  const SizedBox(height: DSSpacing.xxs),
                  Text(
                    'Avant de réserver',
                    style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: Colors.white54),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: DSSpacing.md),
          Text(
            pendingSteps.isEmpty
                ? 'Votre profil est complet. Vous pouvez continuer.'
                : '${pendingSteps.length} étape${pendingSteps.length > 1 ? 's' : ''} requise${pendingSteps.length > 1 ? 's' : ''} pour pouvoir réserver.',
            style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary),
          ),
          const SizedBox(height: DSSpacing.md),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: steps.length,
            separatorBuilder: (context, index) => const SizedBox(height: DSSpacing.sm),
            itemBuilder: (context, index) {
              final step = steps[index];
              final status = step['status'] as String;
              final isDone = status == 'done';
              final isPending = status == 'pending';
              final isRejected = status == 'rejected';

              Color cardBorderColor = DSColors.darkBorderGlass;
              Color cardBgColor = DSColors.darkSurfaceGlass;
              Color badgeBgColor = Colors.grey.shade900;
              Color badgeTextColor = DSColors.darkTextSecondary;
              String badgeText = 'Requis';
              IconData statusIcon = Icons.radio_button_unchecked_rounded;
              Color statusColor = DSColors.darkTextTertiary;

              if (isDone) {
                cardBorderColor = DSColors.emerald500.withOpacity(0.2);
                cardBgColor = DSColors.emerald500.withOpacity(0.04);
                badgeBgColor = DSColors.emerald500.withOpacity(0.1);
                badgeTextColor = DSColors.emerald500;
                badgeText = 'Complété';
                statusIcon = Icons.check_circle_rounded;
                statusColor = DSColors.emerald500;
              } else if (isPending) {
                badgeBgColor = Colors.amber.withOpacity(0.1);
                badgeTextColor = Colors.amber;
                badgeText = 'En vérification';
                statusIcon = Icons.hourglass_empty_rounded;
                statusColor = Colors.amber;
              } else if (isRejected) {
                cardBorderColor = DSColors.red600.withOpacity(0.2);
                badgeBgColor = DSColors.red600.withOpacity(0.1);
                badgeTextColor = DSColors.red600;
                badgeText = 'Rejeté';
                statusIcon = Icons.error_outline_rounded;
                statusColor = DSColors.red600;
              }

              return Container(
                padding: const EdgeInsets.all(DSSpacing.md),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: cardBorderColor),
                  color: cardBgColor,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: isDone ? DSColors.emerald500.withOpacity(0.1) : DSColors.darkSurfaceGlass,
                      ),
                      child: Icon(
                        step['icon'] as IconData,
                        color: isDone ? DSColors.emerald500 : DSColors.darkTextSecondary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: DSSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                step['label'] as String,
                                style: DSTypography.bodyMedium.copyWith(
                                  color: isDone ? DSColors.darkTextSecondary : Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: DSSpacing.xs),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(100),
                                  color: badgeBgColor,
                                ),
                                child: Text(
                                  badgeText,
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: badgeTextColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: DSSpacing.xxs),
                          Text(
                            step['description'] as String,
                            style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: DSSpacing.sm),
                    Icon(statusIcon, color: statusColor, size: 20),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: DSSpacing.md),
          Container(
            padding: const EdgeInsets.all(DSSpacing.md),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: DSColors.darkSurfaceGlass,
              border: Border.all(color: DSColors.darkBorderGlass),
            ),
            child: Text(
              'Ces informations sont nécessaires pour garantir la sécurité de chaque location. Vos données restent strictement confidentielles.',
              style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary, height: 1.4),
            ),
          ),
          const SizedBox(height: DSSpacing.lg),
          Row(
            children: [
              Expanded(
                child: SecondaryButton(
                  label: 'Annuler',
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              const SizedBox(width: DSSpacing.md),
              Expanded(
                child: PrimaryButton(
                  label: 'Continuer',
                  onPressed: () {
                    setState(() => _preGateDismissed = true);
                  },
                  icon: Icons.arrow_forward_rounded,
                  iconPosition: IconPosition.right,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAgeInsufficientView(int ageMin, int userAge) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Âge minimum requis',
                style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: Colors.white54),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: DSSpacing.md),
          Container(
            padding: const EdgeInsets.all(DSSpacing.md),
            decoration: BoxDecoration(
              color: DSColors.red600.withOpacity(0.1),
              border: Border.all(color: DSColors.red600.withOpacity(0.3)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.error_outline_rounded, color: DSColors.red600, size: 24),
                const SizedBox(width: DSSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Âge insuffisant',
                        style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: DSSpacing.xxs),
                      Text(
                        'Ce véhicule nécessite $ageMin ans minimum. Vous avez actuellement $userAge ans.',
                        style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: DSSpacing.md),
          Container(
            padding: const EdgeInsets.all(DSSpacing.md),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.1),
              border: Border.all(color: Colors.amber.withOpacity(0.2)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline_rounded, color: Colors.amber, size: 24),
                const SizedBox(width: DSSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Suggestion',
                        style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: DSSpacing.xxs),
                      Text(
                        'Découvrez nos véhicules disponibles pour les conducteurs de $userAge ans.',
                        style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: DSSpacing.lg),
          PrimaryButton(
            label: 'Retour aux détails',
            fullWidth: true,
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildAgeGateView(int ageMin) {
    final dateFormat = DateFormat('dd MMMM yyyy', 'fr_FR');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Vérification de l\'âge',
                style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: Colors.white54),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: DSSpacing.xxs),
          Text(
            'Ce véhicule nécessite un âge minimum de $ageMin ans.',
            style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
          ),
          const SizedBox(height: DSSpacing.md),
          Text(
            'Date de naissance',
            style: DSTypography.labelMedium.copyWith(color: DSColors.darkTextSecondary),
          ),
          const SizedBox(height: DSSpacing.xs),
          InkWell(
            onTap: () => _selectBirthDate(context),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: DSColors.darkBorderGlass),
                color: DSColors.darkSurfaceGlass,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _localBirthDate != null
                        ? dateFormat.format(_localBirthDate!)
                        : 'Sélectionner votre date de naissance',
                    style: DSTypography.bodyMedium.copyWith(
                      color: _localBirthDate != null ? Colors.white : DSColors.darkTextTertiary,
                    ),
                  ),
                  const Icon(Icons.calendar_today_rounded, size: 16, color: DSColors.emerald600),
                ],
              ),
            ),
          ),
          if (_gateFormError != null) ...[
            const SizedBox(height: DSSpacing.md),
            Text(_gateFormError!, style: DSTypography.bodySmall.copyWith(color: DSColors.red500)),
          ],
          const SizedBox(height: DSSpacing.lg),
          PrimaryButton(
            label: 'Confirmer mon âge',
            fullWidth: true,
            isLoading: _isSavingGateForm,
            onPressed: _saveAgeOnly,
          ),
        ],
      ),
    );
  }

  Widget _buildAgePhoneGateView(int ageMin) {
    final dateFormat = DateFormat('dd MMMM yyyy', 'fr_FR');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Informations requises',
                style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: Colors.white54),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: DSSpacing.xxs),
          Text(
            'Ce véhicule nécessite $ageMin ans minimum — renseignez votre date de naissance et votre numéro.',
            style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
          ),
          const SizedBox(height: DSSpacing.md),
          Text(
            'Date de naissance',
            style: DSTypography.labelMedium.copyWith(color: DSColors.darkTextSecondary),
          ),
          const SizedBox(height: DSSpacing.xs),
          InkWell(
            onTap: () => _selectBirthDate(context),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: DSColors.darkBorderGlass),
                color: DSColors.darkSurfaceGlass,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _localBirthDate != null
                        ? dateFormat.format(_localBirthDate!)
                        : 'Sélectionner votre date de naissance',
                    style: DSTypography.bodyMedium.copyWith(
                      color: _localBirthDate != null ? Colors.white : DSColors.darkTextTertiary,
                    ),
                  ),
                  const Icon(Icons.calendar_today_rounded, size: 16, color: DSColors.emerald600),
                ],
              ),
            ),
          ),
          const SizedBox(height: DSSpacing.md),
          AppTextField(
            controller: _localPhoneController,
            label: 'Numéro de téléphone',
            hint: 'Ex: +221 77 123 45 67',
            keyboardType: TextInputType.phone,
          ),
          if (_gateFormError != null) ...[
            const SizedBox(height: DSSpacing.md),
            Text(_gateFormError!, style: DSTypography.bodySmall.copyWith(color: DSColors.red500)),
          ],
          const SizedBox(height: DSSpacing.lg),
          PrimaryButton(
            label: 'Confirmer',
            fullWidth: true,
            isLoading: _isSavingGateForm,
            onPressed: _saveAgePhone,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingProfile) {
      return Container(
        height: 300,
        color: Colors.black,
        alignment: Alignment.center,
        child: const CircularProgressIndicator(color: DSColors.emerald500),
      );
    }

    if (_profileError != null) {
      return Container(
        height: 300,
        color: Colors.black,
        padding: const EdgeInsets.all(DSSpacing.md),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, color: DSColors.red600, size: 40),
            const SizedBox(height: DSSpacing.md),
            Text(
              _profileError!,
              style: DSTypography.bodyMedium.copyWith(color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: DSSpacing.md),
            PrimaryButton(
              label: 'Réessayer',
              onPressed: () => _fetchProfile(),
            ),
          ],
        ),
      );
    }

    final user = _currentUser!;
    final gate = _resolveGate(user);

    if (gate == "ready") {
      // Defer proceed callback to avoid executing during build phase
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pop(context);
        widget.onProceed();
      });
      return const SizedBox.shrink();
    }

    // Cas spécial: Âge insuffisant restrictif (hard stop)
    if (gate == "age" && user.dateNaissance != null) {
      final userAge = _calculateAge(user.dateNaissance!);
      if (userAge < widget.vehicle.ageMinimum) {
        return _buildAgeInsufficientView(widget.vehicle.ageMinimum, userAge);
      }
    }

    // Étape 1 : Si la vue d'ensemble des étapes requises n'est pas passée
    if (!_preGateDismissed) {
      return _buildPreGateOverlay(_resolveSteps(user));
    }

    // Étape 2 : Stepper actif
    Widget gateContent = const SizedBox.shrink();
    String title = "Complétez votre profil";
    String subtitle = "Finalisez votre profil pour continuer.";

    switch (gate) {
      case "create_profile":
        title = "Créez votre profil";
        subtitle = "Prénom, nom, date de naissance et téléphone.";
        gateContent = CreateProfileGateView(
          user: user,
          onComplete: (otpSent) {
            _fetchProfile(otpSent: otpSent);
          },
        );
        break;

      case "age_phone":
        return _buildAgePhoneGateView(widget.vehicle.ageMinimum);

      case "age":
        return _buildAgeGateView(widget.vehicle.ageMinimum);

      case "phone":
        title = "Vérifiez votre téléphone";
        subtitle = "Étape requise pour sécuriser votre réservation.";
        gateContent = PhoneVerifyGateView(
          user: user,
          onVerified: () {
            _fetchProfile();
          },
          initialStage: _phoneOtpPreSent ? GateStage.otp : GateStage.intro,
        );
        break;

      case "kyc":
        title = "Vérifiez votre identité";
        subtitle = "Soumettez vos documents pour continuer — la validation se fait en parallèle.";
        gateContent = KycGateView(
          kycStatus: user.statutKyc,
          onProceed: () {
            // Dans le cas de KYC pending, on peut continuer
            _fetchProfile();
          },
          onSubmitted: () {
            _fetchProfile();
          },
          pendingMode: 'continue',
        );
        break;

      case "permis":
        title = "Permis de conduire requis";
        subtitle = "Une photo de votre permis est nécessaire.";
        gateContent = PermisGateView(
          onSubmitted: () {
            _fetchProfile();
          },
          onProceed: () {
            Navigator.pop(context);
          },
        );
        break;
    }

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg, vertical: DSSpacing.xl),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 700),
        decoration: BoxDecoration(
          color: DSColors.darkSurfaceElevated,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: DSColors.darkBorderGlass),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(DSSpacing.lg),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'AUTO LOC · LOCATAIRE',
                          style: DSTypography.labelSmall.copyWith(
                            color: DSColors.darkTextTertiary,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: DSSpacing.xxs),
                        Text(
                          title,
                          style: DSTypography.h5.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: DSSpacing.xxs),
                        Text(
                          subtitle,
                          style: DSTypography.bodySmall.copyWith(
                            color: DSColors.darkTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white54),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: DSColors.darkBorderGlass),
            // Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(DSSpacing.lg),
                child: gateContent,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
