import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/wallet.dart';

/// Grille de statistiques du wallet avec glassmorphisme
class WalletStatsGrid extends StatelessWidget {
  const WalletStatsGrid({
    super.key,
    required this.wallet,
  });

  final Wallet wallet;

  String _formatAmount(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return formatter.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
      child: Row(
        children: [
          Expanded(
            child: _StatCard(
              icon: Icons.trending_up_rounded,
              label: 'En attente',
              value: '${_formatAmount(wallet.enAttente)} F',
              color: DSColors.amber600,
            ),
          ),
          const SizedBox(width: DSSpacing.md),
          Expanded(
            child: _StatCard(
              icon: Icons.paid_rounded,
              label: 'Total gagné',
              value: '${_formatAmount(wallet.totalGagne)} F',
              color: DSColors.emerald600,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(DSSpacing.lg),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: Colors.white.withOpacity(0.15),
              width: 1.5,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 20,
                ),
              ),
              const SizedBox(height: DSSpacing.md),
              Text(
                label,
                style: DSTypography.labelMedium.copyWith(
                  color: DSColors.darkTextSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: DSTypography.h5.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
