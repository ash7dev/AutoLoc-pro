import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

class PaymentFailedScreen extends StatelessWidget {
  const PaymentFailedScreen({super.key});

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
                  color: DSColors.red500.withOpacity(0.1),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: DSColors.red500.withOpacity(0.2),
                    width: 2,
                  ),
                ),
                child: const Icon(
                  Icons.error_outline_rounded,
                  color: DSColors.red500,
                  size: 64,
                ),
              ),
              const SizedBox(height: DSSpacing.lg),
              Text(
                'Échec du paiement',
                style: DSTypography.h4.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: DSSpacing.sm),
              Text(
                'Une erreur est survenue lors du traitement de votre transaction chez le fournisseur de paiement. Veuillez réessayer de finaliser votre réservation.',
                textAlign: TextAlign.center,
                style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary, height: 1.5),
              ),
              const Spacer(),
              PrimaryButton(
                label: 'Réessayer le paiement',
                onPressed: () {
                  context.pop();
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
