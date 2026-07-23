import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import 'owner_section_header.dart';

/// Exemples d'utilisation du OwnerSectionHeader
///
/// Ce fichier contient des exemples concrets d'utilisation du header
/// pour différentes pages du module Owner.

// ============================================================================
// EXEMPLE 1 : FLOTTE (avec bouton d'ajout et compteur)
// ============================================================================

class FleetScreenExample extends StatelessWidget {
  const FleetScreenExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          OwnerSectionHeader(
            title: 'Ma flotte',
            subtitle: '12 véhicules',
            actions: [
              OwnerHeaderActionButton(
                icon: Icons.filter_list_rounded,
                onPressed: () {
                  // Ouvrir les filtres
                },
              ),
              const SizedBox(width: 8),
              OwnerHeaderActionButton(
                icon: Icons.add_circle_outline_rounded,
                onPressed: () => context.push(Routes.createVehicle),
              ),
            ],
          ),
          // Reste du contenu...
          Expanded(
            child: Center(
              child: Text(
                'Liste des véhicules...',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// EXEMPLE 2 : RÉSERVATIONS (avec filtres et badge de notifications)
// ============================================================================

class ReservationsScreenExample extends StatelessWidget {
  const ReservationsScreenExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          OwnerSectionHeader(
            title: 'Mes réservations',
            subtitle: '8 actives',
            actions: [
              OwnerHeaderActionButton(
                icon: Icons.notifications_outlined,
                badgeCount: 3, // 3 nouvelles notifications
                onPressed: () {
                  // Voir les notifications
                },
              ),
              const SizedBox(width: 8),
              OwnerHeaderActionButton(
                icon: Icons.filter_list_rounded,
                onPressed: () {
                  // Ouvrir les filtres
                },
              ),
            ],
          ),
          // Reste du contenu...
          Expanded(
            child: Center(
              child: Text(
                'Liste des réservations...',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// EXEMPLE 3 : WALLET (avec solde et bouton de retrait)
// ============================================================================

class WalletScreenExample extends StatelessWidget {
  const WalletScreenExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          OwnerSectionHeader(
            title: 'Mon Wallet',
            subtitle: 'Solde : 245 000 FCFA',
            actions: [
              OwnerHeaderActionButton(
                icon: Icons.file_download_outlined,
                onPressed: () => context.push(Routes.requestWithdrawal),
              ),
            ],
          ),
          // Reste du contenu...
          Expanded(
            child: Center(
              child: Text(
                'Historique des transactions...',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// EXEMPLE 4 : PARAMÈTRES (minimal, sans actions)
// ============================================================================

class SettingsScreenExample extends StatelessWidget {
  const SettingsScreenExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          const OwnerSectionHeader(
            title: 'Paramètres',
          ),
          // Reste du contenu...
          Expanded(
            child: Center(
              child: Text(
                'Liste des paramètres...',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// EXEMPLE 5 : DÉTAIL VÉHICULE (sans back button par défaut, avec actions)
// ============================================================================

class VehicleDetailScreenExample extends StatelessWidget {
  const VehicleDetailScreenExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          OwnerSectionHeader(
            title: 'Toyota Corolla 2020',
            subtitle: 'Disponible',
            actions: [
              OwnerHeaderActionButton(
                icon: Icons.edit_outlined,
                onPressed: () {
                  // Éditer le véhicule
                },
              ),
              const SizedBox(width: 8),
              OwnerHeaderActionButton(
                icon: Icons.more_vert_rounded,
                onPressed: () {
                  // Menu d'options
                },
              ),
            ],
          ),
          // Reste du contenu...
          Expanded(
            child: Center(
              child: Text(
                'Détails du véhicule...',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// EXEMPLE 6 : SANS BACK BUTTON (ex: page racine d'un onglet)
// ============================================================================

class StatisticsScreenExample extends StatelessWidget {
  const StatisticsScreenExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          OwnerSectionHeader(
            title: 'Statistiques',
            subtitle: 'Performance de votre flotte',
            hasBackButton: false, // Pas de bouton retour
            actions: [
              OwnerHeaderActionButton(
                icon: Icons.calendar_today_outlined,
                onPressed: () {
                  // Sélectionner une période
                },
              ),
            ],
          ),
          // Reste du contenu...
          Expanded(
            child: Center(
              child: Text(
                'Graphiques et statistiques...',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
