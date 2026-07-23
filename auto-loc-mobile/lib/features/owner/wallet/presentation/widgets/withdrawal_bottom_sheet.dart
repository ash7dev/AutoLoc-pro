import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/entities/withdrawal.dart';
import '../providers/wallet_providers.dart';

/// Bottom Sheet pour demander un retrait
class WithdrawalBottomSheet extends ConsumerStatefulWidget {
  const WithdrawalBottomSheet({
    super.key,
    required this.wallet,
  });

  final Wallet wallet;

  @override
  ConsumerState<WithdrawalBottomSheet> createState() =>
      _WithdrawalBottomSheetState();
}

class _WithdrawalBottomSheetState
    extends ConsumerState<WithdrawalBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();

  WithdrawalMethod _selectedMethod = WithdrawalMethod.wave;
  bool _isLoading = false;

  String _formatAmount(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return formatter.format(amount);
  }

  Future<void> _submitWithdrawal() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final request = WithdrawalRequest(
      montant: double.parse(_amountController.text.replaceAll(' ', '')),
      methode: _selectedMethod,
      numeroDestinataire: _phoneController.text.trim(),
    );

    final requestWithdrawal = ref.read(requestWithdrawalProvider);
    final result = await requestWithdrawal(request);

    setState(() => _isLoading = false);

    result.fold(
      (failure) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(failure.displayMessage),
              backgroundColor: DSColors.error,
            ),
          );
        }
      },
      (_) {
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                _selectedMethod == WithdrawalMethod.wave
                    ? 'Retrait en cours de traitement...'
                    : 'Demande de retrait envoyée',
              ),
              backgroundColor: DSColors.emerald600,
            ),
          );
          // Recharger le wallet
          ref.read(walletViewModelProvider.notifier).load();
        }
      },
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.9),
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(24),
          ),
          border: Border(
            top: BorderSide(
              color: Colors.white.withOpacity(0.15),
              width: 1.5,
            ),
          ),
        ),
        padding: EdgeInsets.only(
          left: DSSpacing.lg,
          right: DSSpacing.lg,
          top: DSSpacing.lg,
          bottom: MediaQuery.of(context).viewInsets.bottom + DSSpacing.lg,
        ),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Demander un retrait',
                      style: DSTypography.h4.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.close,
                        color: DSColors.darkTextSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: DSSpacing.xs),

                // Solde retirable
                Container(
                  padding: const EdgeInsets.all(DSSpacing.md),
                  decoration: BoxDecoration(
                    color: DSColors.emerald600.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: DSColors.emerald600.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.account_balance_wallet,
                        color: DSColors.emerald600,
                        size: 20,
                      ),
                      const SizedBox(width: DSSpacing.sm),
                      Text(
                        'Solde retirable: ',
                        style: DSTypography.labelMedium.copyWith(
                          color: DSColors.darkTextSecondary,
                        ),
                      ),
                      Text(
                        '${_formatAmount(widget.wallet.soldeRetirable)} FCFA',
                        style: DSTypography.labelLarge.copyWith(
                          color: DSColors.emerald600,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: DSSpacing.lg),

                // Sélection méthode
                Text(
                  'Méthode de paiement',
                  style: DSTypography.labelLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: DSSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: _MethodCard(
                        label: 'Wave',
                        subtitle: 'Instantané',
                        icon: Icons.flash_on_rounded,
                        isSelected: _selectedMethod == WithdrawalMethod.wave,
                        onTap: () => setState(() {
                          _selectedMethod = WithdrawalMethod.wave;
                        }),
                      ),
                    ),
                    const SizedBox(width: DSSpacing.sm),
                    Expanded(
                      child: _MethodCard(
                        label: 'Orange Money',
                        subtitle: 'Manuel',
                        icon: Icons.phone_android_rounded,
                        isSelected:
                            _selectedMethod == WithdrawalMethod.orangeMoney,
                        onTap: () => setState(() {
                          _selectedMethod = WithdrawalMethod.orangeMoney;
                        }),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: DSSpacing.lg),

                // Montant
                Text(
                  'Montant',
                  style: DSTypography.labelLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: DSSpacing.sm),
                TextFormField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  style: DSTypography.h5.copyWith(color: Colors.white),
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  decoration: InputDecoration(
                    hintText: 'Minimum 500 FCFA',
                    hintStyle: DSTypography.bodyMedium.copyWith(
                      color: DSColors.darkTextSecondary,
                    ),
                    suffixText: 'FCFA',
                    suffixStyle: DSTypography.labelMedium.copyWith(
                      color: DSColors.emerald600,
                      fontWeight: FontWeight.w700,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: DSColors.emerald600,
                        width: 2,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: DSColors.error,
                        width: 2,
                      ),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez saisir un montant';
                    }
                    final amount = double.tryParse(value);
                    if (amount == null || amount < 500) {
                      return 'Montant minimum: 500 FCFA';
                    }
                    if (amount > widget.wallet.soldeRetirable) {
                      return 'Solde insuffisant';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: DSSpacing.lg),

                // Numéro de téléphone
                Text(
                  'Numéro ${_selectedMethod.displayName}',
                  style: DSTypography.labelLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: DSSpacing.sm),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: DSTypography.h5.copyWith(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: '+221 77 123 45 67',
                    hintStyle: DSTypography.bodyMedium.copyWith(
                      color: DSColors.darkTextSecondary,
                    ),
                    prefixIcon: Icon(
                      Icons.phone,
                      color: DSColors.emerald600,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: DSColors.emerald600,
                        width: 2,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: DSColors.error,
                        width: 2,
                      ),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez saisir un numéro';
                    }
                    final regex = RegExp(r'^\+?[0-9\s]{7,15}$');
                    if (!regex.hasMatch(value.trim())) {
                      return 'Numéro invalide';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: DSSpacing.xl),

                // Bouton soumettre
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submitWithdrawal,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DSColors.emerald600,
                      disabledBackgroundColor:
                          DSColors.emerald600.withOpacity(0.5),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        vertical: DSSpacing.lg,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: _isLoading
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            'Demander le retrait',
                            style: DSTypography.labelLarge.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
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

/// Card de sélection de méthode
class _MethodCard extends StatelessWidget {
  const _MethodCard({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final String subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(DSSpacing.md),
        decoration: BoxDecoration(
          color: isSelected
              ? DSColors.emerald600.withOpacity(0.15)
              : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? DSColors.emerald600
                : Colors.white.withOpacity(0.1),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? DSColors.emerald600 : DSColors.darkTextSecondary,
              size: 28,
            ),
            const SizedBox(height: DSSpacing.xs),
            Text(
              label,
              style: DSTypography.labelMedium.copyWith(
                color: isSelected ? DSColors.emerald600 : Colors.white,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              ),
            ),
            Text(
              subtitle,
              style: DSTypography.labelSmall.copyWith(
                color: DSColors.darkTextSecondary,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
