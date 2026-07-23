import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../owner/shared/widgets/owner_section_header.dart';

/// Wallet Screen
///
/// Portefeuille du propriétaire
/// Solde, historique des transactions, demandes de retrait
class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          OwnerSectionHeader(
            title: 'Mon Wallet',
            subtitle: 'Solde : 0 FCFA', // TODO: Récupérer depuis API
            actions: [
              OwnerHeaderActionButton(
                icon: Icons.history_rounded,
                onPressed: () => context.push(Routes.walletTransactions),
              ),
              const SizedBox(width: 8),
              OwnerHeaderActionButton(
                icon: Icons.file_download_outlined,
                onPressed: () => context.push(Routes.requestWithdrawal),
              ),
            ],
          ),
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.account_balance_wallet_rounded,
                    size: 80,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Portefeuille',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'À implémenter',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'Fonctionnalités prévues:',
                    style: TextStyle(color: Colors.grey.shade400),
                  ),
                  const SizedBox(height: 16),
                  const _FeatureItem(text: '💰 Solde disponible'),
                  const _FeatureItem(text: '📊 Graphique des revenus'),
                  const _FeatureItem(text: '💸 Demande de retrait'),
                  const _FeatureItem(text: '📜 Historique transactions'),
                  const _FeatureItem(text: '🧾 Factures et reçus'),
                  const _FeatureItem(text: '📈 Statistiques financières'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  const _FeatureItem({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey.shade400,
            ),
      ),
    );
  }
}
