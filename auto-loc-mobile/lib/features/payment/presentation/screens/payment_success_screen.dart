import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

class PaymentSuccessScreen extends StatelessWidget {
  const PaymentSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(DSSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: DSColors.emerald500.withOpacity(0.1),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: DSColors.emerald500.withOpacity(0.2),
                    width: 2,
                  ),
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: DSColors.emerald500,
                  size: 64,
                ),
              ),
              const SizedBox(height: DSSpacing.lg),
              Text(
                'Paiement réussi !',
                style: DSTypography.h4.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: DSSpacing.sm),
              Text(
                'Votre réservation a été validée avec succès. Vous pouvez maintenant consulter vos détails de location ou retourner à l\'accueil.',
                textAlign: TextAlign.center,
                style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary, height: 1.5),
              ),
              const Spacer(),
              PrimaryButton(
                label: 'Voir mes réservations',
                onPressed: () {
                  context.go(Routes.myBookings);
                },
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () {
                  context.go(Routes.home);
                },
                child: Text(
                  'Retourner à l\'accueil',
                  style: DSTypography.bodyMedium.copyWith(
                    color: DSColors.darkTextTertiary,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
