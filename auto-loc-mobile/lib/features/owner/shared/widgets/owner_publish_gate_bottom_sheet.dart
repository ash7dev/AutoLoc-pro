import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/enums/kyc_status.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../user/presentation/providers/user_profile_provider.dart';
import '../../../user/domain/entities/user.dart';
import '../../../vehicle/presentation/widgets/gates/kyc_gate_view.dart';
import '../../../vehicle/presentation/widgets/gates/phone_verify_gate_view.dart'
    show PhoneVerifyGateView, GateStage;
import '../../../vehicle/presentation/widgets/gates/create_profile_gate_view.dart';

/// **OwnerPublishGateBottomSheet**
/// Orchestrateur des étapes de validation (Gate) pour publier un véhicule
/// Vérifie que le propriétaire a:
/// 1. Profil complété (nom, prénom, téléphone)
/// 2. Téléphone vérifié
/// 3. KYC validé
class OwnerPublishGateBottomSheet extends ConsumerStatefulWidget {
  const OwnerPublishGateBottomSheet({
    super.key,
    required this.onProceed,
  });

  final VoidCallback onProceed;

  @override
  ConsumerState<OwnerPublishGateBottomSheet> createState() =>
      _OwnerPublishGateBottomSheetState();
}

class _OwnerPublishGateBottomSheetState
    extends ConsumerState<OwnerPublishGateBottomSheet> {
  @override
  void initState() {
    super.initState();
    // Charger le profil si pas déjà chargé
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(userProfileProvider.notifier).loadProfile();
    });
  }

  void _refreshProfile() {
    ref.read(userProfileProvider.notifier).refresh();
  }

  String _resolveGate(User user) {
    // 1. Vérifier le profil
    final isProfileIncomplete =
        !user.profileCompleted || user.prenom.isEmpty || user.nom.isEmpty;
    if (isProfileIncomplete) return "create_profile";

    // 2. Vérifier le téléphone
    final phoneMissing = !user.phoneVerified || user.telephone.isEmpty;
    if (phoneMissing) return "phone";

    // 3. Vérifier le KYC
    final kyc = user.statutKyc;

    // Si KYC vérifié ou en attente → on peut créer le véhicule
    // (le véhicule ne sera visible qu'après validation KYC)
    if (kyc == KycStatus.verified || kyc == KycStatus.pending) {
      return "ready";
    }

    // Si KYC non vérifié ou rejeté → afficher le formulaire KYC
    if (kyc == KycStatus.notVerified || kyc == KycStatus.rejected) {
      return "kyc";
    }

    return "ready";
  }

  List<Map<String, dynamic>> _resolveSteps(User user) {
    final phoneOk = user.profileCompleted &&
        user.phoneVerified &&
        user.telephone.isNotEmpty;
    final profileOk =
        user.profileCompleted && user.prenom.isNotEmpty && user.nom.isNotEmpty;
    final kyc = user.statutKyc;
    final kycDone = kyc == KycStatus.verified;
    final kycPending = kyc == KycStatus.pending;
    final kycRejected = kyc == KycStatus.rejected;

    final steps = <Map<String, dynamic>>[];

    // 1. Profil & Téléphone
    if (!profileOk || !phoneOk) {
      steps.add({
        "key": "phone",
        "label": profileOk ? "Téléphone vérifié" : "Profil & Téléphone",
        "description": profileOk
            ? "Confirmez votre numéro de téléphone"
            : "Prénom, nom et numéro de téléphone",
        "duration": profileOk ? "~1 min" : "~2 min",
        "status": (profileOk && phoneOk) ? "done" : "required",
        "icon": Icons.phone_android_rounded,
      });
    }

    // 2. KYC d'identité
    steps.add({
      "key": "kyc",
      "label": "Vérification d'identité",
      "description": "Pièce d'identité nationale ou passeport",
      "duration": "~2 min",
      "status": kycDone
          ? "done"
          : (kycPending ? "pending" : (kycRejected ? "rejected" : "required")),
      "icon": Icons.verified_user_rounded,
    });

    return steps;
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(userProfileProvider);

    return profileState.when(
      initial: () => Container(
        height: 300,
        color: Colors.black,
        alignment: Alignment.center,
        child: const CircularProgressIndicator(color: DSColors.emerald500),
      ),
      loading: () => Container(
        height: 300,
        color: Colors.black,
        alignment: Alignment.center,
        child: const CircularProgressIndicator(color: DSColors.emerald500),
      ),
      refreshing: (user) => _buildGateDialog(context, user),
      success: (user) => _buildGateDialog(context, user),
      empty: (message) => Container(
        height: 300,
        color: Colors.black,
        padding: const EdgeInsets.all(DSSpacing.md),
        alignment: Alignment.center,
        child: Text(
          message ?? 'Profil introuvable',
          style: DSTypography.bodyMedium.copyWith(color: Colors.white),
          textAlign: TextAlign.center,
        ),
      ),
      failure: (message, code) => Container(
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
              message,
              style: DSTypography.bodyMedium.copyWith(color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: DSSpacing.md),
            PrimaryButton(
              label: 'Réessayer',
              onPressed: _refreshProfile,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGateDialog(BuildContext context, User user) {
    final gate = _resolveGate(user);

    if (gate == "ready") {
      // Defer proceed callback to avoid executing during build phase
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pop(context);
        widget.onProceed();
      });
      return const SizedBox.shrink();
    }

    // Étape 2 : Stepper actif
    Widget gateContent = const SizedBox.shrink();
    String title = "Complétez votre profil";
    String subtitle = "Finalisez votre profil pour publier votre véhicule.";

    switch (gate) {
      case "create_profile":
        title = "Créez votre profil";
        subtitle = "Prénom, nom, date de naissance et téléphone.";
        gateContent = CreateProfileGateView(
          user: user,
          onComplete: (otpSent) {
            _refreshProfile();
          },
        );
        break;

      case "phone":
        title = "Vérifiez votre téléphone";
        subtitle = "Étape requise pour sécuriser votre compte.";
        gateContent = PhoneVerifyGateView(
          user: user,
          onVerified: () {
            _refreshProfile();
          },
          initialStage: GateStage.intro,
        );
        break;

      case "kyc":
        title = "Vérifiez votre identité";
        subtitle = "Soumettez vos documents pour continuer — la validation se fait en parallèle.";
        gateContent = KycGateView(
          kycStatus: user.statutKyc,
          onProceed: () {
            // Dans le cas de KYC pending, on peut continuer
            Navigator.pop(context);
            widget.onProceed();
          },
          onSubmitted: () {
            _refreshProfile();
          },
          pendingMode: 'continue',
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
                          'AUTO LOC · PROPRIÉTAIRE',
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
