import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../shared/enums/booking_status.dart';
import '../../../../shared/presentation/base/effect_handler.dart';
import '../../../../shared/presentation/widgets/app_bars/tenant_app_bar.dart';
import '../../../../shared/presentation/widgets/auth_required_placeholder.dart';
import '../../../../shared/presentation/widgets/cards/booking_list_item.dart';
import '../../../../shared/presentation/widgets/cards/booking_list_item_shimmer.dart';
import '../../../../shared/presentation/widgets/filters/booking_status_filter.dart';
import '../../../../shared/presentation/widgets/states/empty_bookings_state.dart';
import '../../../../shared/providers/session_providers.dart';
import '../../../booking/presentation/providers/booking_providers.dart';

const Color _emerald = Color(0xFF34D399);

/// My Bookings Screen - Mes réservations
///
/// Affiche la liste des réservations de l'utilisateur avec:
/// - Filtre par statut (avec effet glow émeraude)
/// - Liste des réservations
/// - États vides personnalisés
///
/// Suit l'architecture MVVM avec BookingListViewModel
class MyBookingsScreen extends ConsumerStatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  ConsumerState<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends ConsumerState<MyBookingsScreen>
    with EffectHandler {
  BookingStatus? _selectedStatus;

  @override
  void initState() {
    super.initState();
    // Écouter les effects
    listenToEffects(bookingListEffectsProvider);

    // Charger les réservations au démarrage
    Future.microtask(() {
      final user = ref.read(currentUserProvider);
      if (user != null) {
        ref.read(bookingListViewModelProvider.notifier).load();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final state = ref.watch(bookingListStateProvider);

    // Si pas connecté, afficher placeholder avec bouton de connexion
    if (user == null) {
      return const Scaffold(
        backgroundColor: Colors.black,
        extendBodyBehindAppBar: true,
        appBar: TenantAppBar(
          mode: TenantAppBarMode.bookings,
          title: 'Mes Réservations',
        ),
        body: SafeArea(
          child: AuthRequiredPlaceholder(
            icon: Icons.receipt_long_rounded,
            heading: 'Suivez vos réservations',
            subtitle: 'Accédez à toutes vos locations de véhicules en cours et passées',
            features: [
              PlaceholderFeature(
                icon: Icons.directions_car_rounded,
                label: 'Suivi de vos locations actives et futures',
              ),
              PlaceholderFeature(
                icon: Icons.history_rounded,
                label: 'Historique complet de vos locations passées',
              ),
              PlaceholderFeature(
                icon: Icons.description_rounded,
                label: 'Accès rapide aux contrats en cours et passés',
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: const TenantAppBar(
        mode: TenantAppBarMode.bookings,
        title: 'Mes Réservations',
      ),
      body: SafeArea(
        child: state.when(
          initial: () => const SizedBox.shrink(),
          loading: () => _buildLoadingState(),
          success: (data) => _buildContent(data),
          refreshing: (data) => _buildContent(data),
          empty: (message) => EmptyBookingsState(
            message: message ?? 'Aucune réservation',
          ),
          failure: (message, code) => _buildErrorState(message),
        ),
      ),
    );
  }

  Widget _buildContent(data) {
    // Exclure les réservations brouillon et en attente de paiement
    final validBookings = data.tenantBookings
        .where((b) =>
            b.statut != BookingStatus.initiated &&
            b.statut != BookingStatus.waitingPayment)
        .toList();

    // Filtrer les réservations selon le statut sélectionné
    final filteredBookings = _selectedStatus == null
        ? validBookings
        : validBookings
            .where((b) => b.statut == _selectedStatus)
            .toList();

    // Calculer les counts pour chaque statut (sans initiated et waitingPayment)
    final bookingCounts = <BookingStatus?, int>{
      null: validBookings.length,
      BookingStatus.confirmed: validBookings
          .where((b) => b.statut == BookingStatus.confirmed)
          .length,
      BookingStatus.inProgress: validBookings
          .where((b) => b.statut == BookingStatus.inProgress)
          .length,
      BookingStatus.completed: validBookings
          .where((b) => b.statut == BookingStatus.completed)
          .length,
      BookingStatus.cancelled: validBookings
          .where((b) => b.statut == BookingStatus.cancelled)
          .length,
    };

    return Column(
      children: [
        const SizedBox(height: 20),

        // Filtre par statut avec effet glow
        BookingStatusFilter(
          selectedStatus: _selectedStatus,
          onStatusChanged: (status) {
            setState(() {
              _selectedStatus = status;
            });
          },
          bookingCounts: bookingCounts,
        ),

        const SizedBox(height: 20),

        // Liste des réservations
        Expanded(
          child: filteredBookings.isEmpty
              ? EmptyBookingsState(
                  message: _selectedStatus == null
                      ? 'Aucune réservation'
                      : 'Aucune réservation ${_selectedStatus!.label.toLowerCase()}',
                  showExploreButton: _selectedStatus == null,
                )
              : RefreshIndicator(
                  onRefresh: _refresh,
                  color: _emerald,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 20),
                    itemCount: filteredBookings.length,
                    itemBuilder: (context, index) {
                      final booking = filteredBookings[index];
                      return BookingListItem(
                        booking: booking,
                        // TODO: Charger les détails du véhicule
                        vehicleName: 'Véhicule',
                        vehiclePhoto: null,
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      itemCount: 3,
      padding: const EdgeInsets.only(top: 20, bottom: 20),
      physics: const NeverScrollableScrollPhysics(),
      itemBuilder: (context, index) => const BookingListItemShimmer(),
    );
  }

  Widget _buildErrorState(String message) {
    // Vérifier si c'est une erreur 403 (accès refusé)
    final is403 = message.contains('403') ||
                  message.toLowerCase().contains('rôle insuffisant') ||
                  message.toLowerCase().contains('accès refusé');

    // Pour 403, afficher un empty state comme s'il n'y avait aucune réservation
    if (is403) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.08),
                  Colors.white.withOpacity(0.03),
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Colors.white.withOpacity(0.12),
                width: 1.5,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF34D399).withOpacity(0.1),
                  ),
                  child: const Icon(
                    Icons.receipt_long_rounded,
                    size: 38,
                    color: Color(0xFF34D399),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Aucune réservation',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Vous n\'avez pas encore de réservation.\nCommencez par explorer nos véhicules !',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => context.push(Routes.explore),
                  icon: const Icon(Icons.search_rounded, size: 18),
                  label: const Text('Chercher véhicule'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF34D399),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Pour les autres erreurs, afficher un état d'erreur classique
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withOpacity(0.08),
                Colors.white.withOpacity(0.03),
              ],
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Colors.white.withOpacity(0.12),
              width: 1.5,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.red.withOpacity(0.1),
                ),
                child: const Icon(
                  Icons.error_outline_rounded,
                  size: 38,
                  color: Colors.red,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Une erreur est survenue',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                message,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _retry,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Réessayer'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF34D399),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _refresh() async {
    final viewModel = ref.read(bookingListViewModelProvider.notifier);
    await viewModel.refresh();
  }

  Future<void> _retry() async {
    final viewModel = ref.read(bookingListViewModelProvider.notifier);
    await viewModel.retry();
  }
}
