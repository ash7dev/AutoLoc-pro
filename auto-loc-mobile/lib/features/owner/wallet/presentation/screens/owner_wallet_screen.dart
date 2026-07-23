import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../shared/widgets/owner_section_header.dart';
import '../../../shared/widgets/owner_publish_gate_bottom_sheet.dart';
import '../providers/wallet_providers.dart';
import '../widgets/penalties_section.dart';
import '../widgets/transaction_history_list.dart';
import '../widgets/wallet_balance_card.dart';
import '../widgets/wallet_stats_grid.dart';
import '../widgets/withdrawal_bottom_sheet.dart';

/// Owner Wallet Screen - Portefeuille du propriétaire
///
/// Affiche:
/// - Solde disponible et retirable
/// - Statistiques (en attente, total gagné)
/// - Historique des transactions
/// - Pénalités en attente
/// - Possibilité de retrait (Wave / Orange Money)
class OwnerWalletScreen extends ConsumerStatefulWidget {
  const OwnerWalletScreen({super.key});

  @override
  ConsumerState<OwnerWalletScreen> createState() => _OwnerWalletScreenState();
}

class _OwnerWalletScreenState extends ConsumerState<OwnerWalletScreen> {
  @override
  void initState() {
    super.initState();
    // Charge le wallet au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(walletViewModelProvider.notifier).load();
    });
  }

  void _showWithdrawalSheet(wallet) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => WithdrawalBottomSheet(wallet: wallet),
    );
  }

  void _showOwnerGate() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => OwnerPublishGateBottomSheet(
        onProceed: () {
          // Une fois le profil complété, recharger le wallet
          ref.read(walletViewModelProvider.notifier).load();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(walletStateProvider);
    final viewModel = ref.read(walletViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: Colors.black,
      body: state.when(
        initial: () => const _LoadingState(),
        loading: () => const _LoadingState(),
        refreshing: (wallet) => _buildContent(wallet, viewModel, isRefreshing: true),
        success: (wallet) => _buildContent(wallet, viewModel),
        empty: (_) => _buildEmpty(),
        failure: (errorMessage, _) => _buildError(errorMessage, viewModel),
      ),
    );
  }

  Widget _buildContent(wallet, viewModel, {bool isRefreshing = false}) {
    return RefreshIndicator(
      onRefresh: viewModel.refresh,
      color: const Color(0xFF34D399),
      backgroundColor: Colors.black,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            OwnerSectionHeader(
              title: 'Portefeuille',
              subtitle: 'Gérez vos revenus',
              actions: [
                OwnerHeaderActionButton(
                  icon: Icons.receipt_long_outlined,
                  onPressed: () {
                    // TODO: Voir historique complet
                  },
                ),
              ],
            ),
            const SizedBox(height: DSSpacing.lg),

            // Balance Card
            WalletBalanceCard(
              wallet: wallet,
              onWithdrawTap: () => _showWithdrawalSheet(wallet),
            ),
            const SizedBox(height: DSSpacing.lg),

            // Stats Grid
            WalletStatsGrid(wallet: wallet),
            const SizedBox(height: DSSpacing.xl),

            // Pénalités (si présentes)
            PenaltiesSection(
              wallet: wallet,
              onViewAllTap: () {
                // TODO: Navigation vers liste complète des pénalités
              },
            ),
            if (wallet.totalPenalites > 0) const SizedBox(height: DSSpacing.xl),

            // Historique des transactions
            TransactionHistoryList(
              transactions: wallet.transactions,
            ),
            const SizedBox(height: DSSpacing.xl),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Column(
      children: [
        const OwnerSectionHeader(
          title: 'Portefeuille',
          subtitle: 'Gérez vos revenus',
        ),
        Expanded(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.account_balance_wallet_outlined,
                    size: 80,
                    color: Colors.grey.shade700,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Portefeuille vide',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Vos revenus apparaîtront ici une fois que vous recevrez des réservations',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                          height: 1.5,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildError(String message, viewModel) {
    final isProfileIncomplete = message.contains('profil');

    return Column(
      children: [
        const OwnerSectionHeader(
          title: 'Portefeuille',
          subtitle: 'Gérez vos revenus',
        ),
        Expanded(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isProfileIncomplete
                          ? const Color(0xFF34D399).withOpacity(0.1)
                          : Colors.red.withOpacity(0.1),
                      border: Border.all(
                        color: isProfileIncomplete
                            ? const Color(0xFF34D399).withOpacity(0.2)
                            : Colors.red.withOpacity(0.2),
                        width: 2,
                      ),
                    ),
                    child: Icon(
                      isProfileIncomplete
                          ? Icons.person_outline_rounded
                          : Icons.error_outline_rounded,
                      size: 56,
                      color: isProfileIncomplete
                          ? const Color(0xFF34D399).withOpacity(0.6)
                          : Colors.red.shade400,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    isProfileIncomplete ? 'Profil incomplet' : 'Erreur',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    message,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade500,
                          height: 1.5,
                        ),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton.icon(
                    onPressed: isProfileIncomplete ? _showOwnerGate : viewModel.load,
                    icon: Icon(isProfileIncomplete
                        ? Icons.arrow_forward
                        : Icons.refresh),
                    label: Text(isProfileIncomplete
                        ? 'Compléter mon profil'
                        : 'Réessayer'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF34D399),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// État de chargement
class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const OwnerSectionHeader(
          title: 'Portefeuille',
          subtitle: 'Chargement...',
        ),
        Expanded(
          child: Center(
            child: CircularProgressIndicator(
              color: const Color(0xFF34D399),
            ),
          ),
        ),
      ],
    );
  }
}
