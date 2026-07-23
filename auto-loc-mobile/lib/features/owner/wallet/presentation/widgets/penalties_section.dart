import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/wallet.dart';

/// Section d'affichage des pénalités
class PenaltiesSection extends StatelessWidget {
  const PenaltiesSection({
    super.key,
    required this.wallet,
    this.onViewAllTap,
  });

  final Wallet wallet;
  final VoidCallback? onViewAllTap;

  String _formatAmount(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return formatter.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    if (wallet.totalPenalites == 0) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    color: DSColors.warning,
                    size: 20,
                  ),
                  const SizedBox(width: DSSpacing.xs),
                  Text(
                    'Pénalités en attente',
                    style: DSTypography.h5.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (onViewAllTap != null)
                TextButton(
                  onPressed: onViewAllTap,
                  child: Text(
                    'Voir tout',
                    style: DSTypography.labelMedium.copyWith(
                      color: DSColors.warning,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: DSSpacing.md),

        // Card d'avertissement
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(DSSpacing.lg),
                decoration: BoxDecoration(
                  color: DSColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: DSColors.warning.withOpacity(0.3),
                    width: 1.5,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: DSColors.warning.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.error_outline_rounded,
                        color: DSColors.warning,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: DSSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Pénalités à régler',
                            style: DSTypography.labelLarge.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${wallet.penaltiesCount} pénalité${wallet.penaltiesCount > 1 ? 's' : ''}',
                            style: DSTypography.bodySmall.copyWith(
                              color: DSColors.darkTextSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${_formatAmount(wallet.totalPenalites)}',
                          style: DSTypography.h5.copyWith(
                            color: DSColors.warning,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'FCFA',
                          style: DSTypography.labelSmall.copyWith(
                            color: DSColors.warning,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        const SizedBox(height: DSSpacing.sm),

        // Message explicatif
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
          child: Container(
            padding: const EdgeInsets.all(DSSpacing.md),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  color: DSColors.blue600,
                  size: 16,
                ),
                const SizedBox(width: DSSpacing.sm),
                Expanded(
                  child: Text(
                    'Ces montants seront déduits de vos prochains retraits',
                    style: DSTypography.bodySmall.copyWith(
                      color: DSColors.darkTextSecondary,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
