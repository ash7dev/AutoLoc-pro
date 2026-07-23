import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../shared/widgets/owner_section_header.dart';
import '../providers/owner_reservations_providers.dart';
import '../widgets/owner_reservation_card.dart';
import '../widgets/reservation_status_filter.dart';

/// Owner Reservations Screen
///
/// Gestion des réservations reçues par le propriétaire
/// Accepter, refuser, gérer les réservations actives
class OwnerReservationsScreen extends ConsumerStatefulWidget {
  const OwnerReservationsScreen({super.key});

  @override
  ConsumerState<OwnerReservationsScreen> createState() =>
      _OwnerReservationsScreenState();
}

class _OwnerReservationsScreenState
    extends ConsumerState<OwnerReservationsScreen> {
  @override
  void initState() {
    super.initState();
    // Charge les réservations au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ownerReservationsViewModelProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(ownerReservationsStateProvider);
    final viewModel = ref.read(ownerReservationsViewModelProvider.notifier);
    final count = ref.watch(ownerReservationsCountProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          OwnerSectionHeader(
            title: 'Mes réservations',
            subtitle: '$count réservation${count > 1 ? 's' : ''}',
            actions: [
              OwnerHeaderActionButton(
                icon: Icons.notifications_outlined,
                badgeCount: 0, // TODO: Récupérer depuis API
                onPressed: () {
                  // TODO: Voir les notifications
                },
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Filtres de statut
          ReservationStatusFilter(
            selectedStatus: viewModel.selectedStatus,
            onStatusChanged: (status) {
              viewModel.filterByStatus(status);
            },
          ),
          const SizedBox(height: 16),

          // Liste des réservations avec états MVVM
          Expanded(
            child: state.when(
              initial: () => const _EmptyState(
                message: 'Chargement des réservations...',
              ),
              loading: () => const _LoadingState(),
              refreshing: (data) => _ReservationsList(
                reservations: data,
                onRefresh: viewModel.refresh,
              ),
              success: (data) => _ReservationsList(
                reservations: data,
                onRefresh: viewModel.refresh,
              ),
              empty: (_) => const _EmptyState(
                message: 'Aucune réservation pour le moment',
              ),
              failure: (error, _) => _ErrorState(
                message: error,
                onRetry: viewModel.load,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Liste des réservations avec pull-to-refresh
class _ReservationsList extends StatelessWidget {
  const _ReservationsList({
    required this.reservations,
    required this.onRefresh,
  });

  final List reservations;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (reservations.isEmpty) {
      return const _EmptyState(
        message: 'Aucune réservation pour ce filtre',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      color: const Color(0xFF34D399),
      backgroundColor: Colors.black,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
        itemCount: reservations.length,
        separatorBuilder: (_, __) => const SizedBox(height: DSSpacing.md),
        itemBuilder: (context, index) {
          final reservation = reservations[index];
          return OwnerReservationCard(
            reservation: reservation,
            onTap: () {
              // TODO: Navigation vers le détail
            },
          );
        },
      ),
    );
  }
}

/// État de chargement avec shimmer
class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.lg),
      itemCount: 3,
      separatorBuilder: (_, __) => const SizedBox(height: DSSpacing.md),
      itemBuilder: (_, __) => _ShimmerCard(),
    );
  }
}

/// Card shimmer pour le loading
class _ShimmerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 300,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1.5,
        ),
      ),
      child: Center(
        child: CircularProgressIndicator(
          color: const Color(0xFF34D399),
        ),
      ),
    );
  }
}

/// État vide - Design premium similaire à Fleet
class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Illustration avec glassmorphisme
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF34D399).withOpacity(0.1),
                border: Border.all(
                  color: const Color(0xFF34D399).withOpacity(0.2),
                  width: 2,
                ),
              ),
              child: Icon(
                Icons.event_note_rounded,
                size: 60,
                color: const Color(0xFF34D399).withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 32),

            // Titre
            Text(
              'Aucune réservation',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),

            // Message
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                    height: 1.5,
                  ),
            ),
            const SizedBox(height: 40),

            // Info cards
            _InfoCard(
              icon: Icons.directions_car_outlined,
              title: 'Publiez vos véhicules',
              description: 'Ajoutez des véhicules à votre flotte pour recevoir des réservations',
            ),
            const SizedBox(height: 16),
            _InfoCard(
              icon: Icons.verified_user_outlined,
              title: 'Validez votre KYC',
              description: 'Complétez votre vérification d\'identité pour activer les réservations',
            ),
          ],
        ),
      ),
    );
  }
}

/// Info card pour l'état vide
class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
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
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF34D399).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: const Color(0xFF34D399),
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey.shade600,
                        height: 1.4,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// État d'erreur avec bouton retry
class _ErrorState extends StatelessWidget {
  const _ErrorState({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 80,
            color: Colors.red.shade400,
          ),
          const SizedBox(height: 24),
          Text(
            'Erreur',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                  ),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Réessayer'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF34D399),
              foregroundColor: Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}
