import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/wallet.dart';

/// Card premium pour afficher le solde du wallet
/// Design: Gradient emerald avec glassmorphisme, blur 20
class WalletBalanceCard extends StatelessWidget {
  const WalletBalanceCard({
    super.key,
    required this.wallet,
    this.onWithdrawTap,
  });

  final Wallet wallet;
  final VoidCallback? onWithdrawTap;

  String _formatAmount(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return formatter.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  DSColors.emerald600,
                  DSColors.emerald700,
                  DSColors.emerald800,
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: DSColors.emerald600.withOpacity(0.3),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Stack(
              children: [
                // Motifs décoratifs
                Positioned(
                  top: -50,
                  right: -50,
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.1),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -30,
                  left: -30,
                  child: Container(
                    width: 150,
                    height: 150,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.05),
                    ),
                  ),
                ),

                // Contenu
                Padding(
                  padding: const EdgeInsets.all(DSSpacing.xl),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.account_balance_wallet_rounded,
                                color: Colors.white,
                                size: 24,
                              ),
                              const SizedBox(width: DSSpacing.sm),
                              Text(
                                'Mon portefeuille',
                                style: DSTypography.h5.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          // Badge KYC ou statut
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: DSSpacing.sm,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.verified,
                                  color: Colors.white,
                                  size: 14,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Vérifié',
                                  style: DSTypography.labelSmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: DSSpacing.xl),

                      // Solde principal
                      Text(
                        'Solde disponible',
                        style: DSTypography.bodyMedium.copyWith(
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                      const SizedBox(height: DSSpacing.xs),
                      Text(
                        '${_formatAmount(wallet.soldeDisponible)} FCFA',
                        style: DSTypography.h1.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 36,
                        ),
                      ),

                      const SizedBox(height: DSSpacing.md),

                      // Solde retirable
                      Container(
                        padding: const EdgeInsets.all(DSSpacing.md),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.savings_outlined,
                              color: Colors.white.withOpacity(0.9),
                              size: 20,
                            ),
                            const SizedBox(width: DSSpacing.sm),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Solde retirable',
                                    style: DSTypography.labelMedium.copyWith(
                                      color: Colors.white.withOpacity(0.8),
                                    ),
                                  ),
                                  Text(
                                    '${_formatAmount(wallet.soldeRetirable)} FCFA',
                                    style: DSTypography.labelLarge.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (wallet.totalPenalites > 0)
                              Icon(
                                Icons.warning_amber_rounded,
                                color: DSColors.warning,
                                size: 20,
                              ),
                          ],
                        ),
                      ),

                      const SizedBox(height: DSSpacing.lg),

                      // Bouton retrait
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: wallet.soldeRetirable >= 500
                              ? onWithdrawTap
                              : null,
                          icon: Icon(
                            Icons.account_balance,
                            size: 20,
                          ),
                          label: Text('Retirer'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: DSColors.emerald600,
                            disabledBackgroundColor:
                                Colors.white.withOpacity(0.3),
                            disabledForegroundColor:
                                Colors.white.withOpacity(0.5),
                            padding: const EdgeInsets.symmetric(
                              vertical: DSSpacing.md,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
