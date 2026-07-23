import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/wallet.dart';

/// Liste des transactions avec design premium
class TransactionHistoryList extends StatelessWidget {
  const TransactionHistoryList({
    super.key,
    required this.transactions,
  });

  final List<WalletTransaction> transactions;

  @override
  Widget build(BuildContext context) {
    if (transactions.isEmpty) {
      return _EmptyTransactions();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Historique des transactions',
                style: DSTypography.h5.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Voir toutes les transactions
                },
                child: Text(
                  'Voir tout',
                  style: DSTypography.labelMedium.copyWith(
                    color: DSColors.emerald600,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: DSSpacing.md),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
          itemCount: transactions.length,
          separatorBuilder: (_, __) => const SizedBox(height: DSSpacing.sm),
          itemBuilder: (context, index) {
            final transaction = transactions[index];
            return TransactionItem(transaction: transaction);
          },
        ),
      ],
    );
  }
}

/// Item de transaction avec glassmorphisme
class TransactionItem extends StatelessWidget {
  const TransactionItem({
    super.key,
    required this.transaction,
  });

  final WalletTransaction transaction;

  String _formatAmount(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return formatter.format(amount);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final transactionDate = DateTime(date.year, date.month, date.day);

    if (transactionDate == today) {
      return "Aujourd'hui ${DateFormat('HH:mm').format(date)}";
    } else if (transactionDate == yesterday) {
      return "Hier ${DateFormat('HH:mm').format(date)}";
    } else {
      return DateFormat('dd MMM yyyy HH:mm', 'fr_FR').format(date);
    }
  }

  IconData _getIcon() {
    switch (transaction.type) {
      case TransactionType.creditLocation:
        return Icons.trending_up_rounded;
      case TransactionType.debitPenalite:
        return Icons.warning_amber_rounded;
      case TransactionType.debitRetrait:
        return Icons.account_balance_outlined;
    }
  }

  Color _getColor() {
    if (transaction.isCredit) {
      return DSColors.emerald600;
    } else {
      switch (transaction.type) {
        case TransactionType.debitPenalite:
          return DSColors.warning;
        case TransactionType.debitRetrait:
          return DSColors.blue600;
        default:
          return DSColors.error;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColor();
    final isCredit = transaction.isCredit;

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(DSSpacing.md),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              // Icône
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getIcon(),
                  color: color,
                  size: 24,
                ),
              ),
              const SizedBox(width: DSSpacing.md),

              // Info transaction
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      transaction.typeLabel,
                      style: DSTypography.labelLarge.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          _formatDate(transaction.creeLe),
                          style: DSTypography.bodySmall.copyWith(
                            color: DSColors.darkTextSecondary,
                          ),
                        ),
                        if (transaction.fournisseur != null) ...[
                          const SizedBox(width: DSSpacing.xs),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              transaction.fournisseur!,
                              style: DSTypography.labelSmall.copyWith(
                                color: color,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),

              // Montant
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${isCredit ? '+' : '-'} ${_formatAmount(transaction.montant)}',
                    style: DSTypography.labelLarge.copyWith(
                      color: color,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Solde: ${_formatAmount(transaction.soldeApres)} F',
                    style: DSTypography.bodySmall.copyWith(
                      color: DSColors.darkTextSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// État vide pour les transactions
class _EmptyTransactions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(DSSpacing.xl),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: DSColors.emerald600.withOpacity(0.1),
              border: Border.all(
                color: DSColors.emerald600.withOpacity(0.2),
                width: 2,
              ),
            ),
            child: Icon(
              Icons.receipt_long_outlined,
              size: 40,
              color: DSColors.emerald600.withOpacity(0.5),
            ),
          ),
          const SizedBox(height: DSSpacing.lg),
          Text(
            'Aucune transaction',
            style: DSTypography.h5.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: DSSpacing.xs),
          Text(
            'Vos transactions apparaîtront ici',
            textAlign: TextAlign.center,
            style: DSTypography.bodyMedium.copyWith(
              color: DSColors.darkTextSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
