import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/navigation/routes.dart';
import '../../../shared/widgets/owner_publish_gate_bottom_sheet.dart';
import '../providers/owner_dashboard_providers.dart';
import '../widgets/owner_dashboard_header.dart';
import '../widgets/owner_quick_actions.dart';
import '../widgets/owner_dashboard_todos.dart';
import '../widgets/owner_dashboard_shimmer.dart';
import '../widgets/owner_stats_cards.dart';

/// Owner Dashboard Screen
///
/// Dashboard principal pour les propriétaires avec architecture MVVM complète.
/// Affiche les statistiques, revenus, réservations actives depuis l'API.
///
/// **Animations** : chaque section apparaît avec un staggered fade-in + slide-up
/// en cascade, donnant une impression de fluidité premium.
class OwnerDashboardScreen extends ConsumerStatefulWidget {
  const OwnerDashboardScreen({super.key});

  @override
  ConsumerState<OwnerDashboardScreen> createState() =>
      _OwnerDashboardScreenState();
}

class _OwnerDashboardScreenState extends ConsumerState<OwnerDashboardScreen>
    with TickerProviderStateMixin {
  AnimationController? _entranceController;
  bool _hasAnimated = false;

  // Stagger intervals pour chaque section
  // Header → Stats → Todos → QuickActions
  static const _totalSections = 4;
  static const _staggerSlice = 0.18; // overlap entre sections
  static const _sectionDuration = 0.40; // durée par section (en fraction)

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    // Charger les données au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ownerDashboardViewModelProvider.notifier).load();
    });
  }

  @override
  void dispose() {
    _entranceController?.dispose();
    super.dispose();
  }

  /// Retourne un Interval pour la section à l'index donné (0-based).
  Interval _intervalFor(int index) {
    final start = (index * _staggerSlice).clamp(0.0, 1.0);
    final end = (start + _sectionDuration).clamp(0.0, 1.0);
    return Interval(start, end, curve: Curves.easeOutCubic);
  }

  /// Wrapper qui anime un enfant avec fade + slide-up.
  Widget _animatedSection({required int index, required Widget child}) {
    // Si l'animation n'est pas encore initialisée, retourner l'enfant sans animation
    if (_entranceController == null) {
      return child;
    }

    final interval = _intervalFor(index);
    final opacity = CurvedAnimation(
      parent: _entranceController!,
      curve: interval,
    );
    final offset = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entranceController!,
      curve: interval,
    ));

    return FadeTransition(
      opacity: opacity,
      child: SlideTransition(
        position: offset,
        child: child,
      ),
    );
  }

  void _triggerEntrance() {
    if (!_hasAnimated && _entranceController != null) {
      _hasAnimated = true;
      _entranceController!.forward(from: 0);
    }
  }

  void _handlePublishVehicle() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => OwnerPublishGateBottomSheet(
        onProceed: () {
          // Une fois le profil complété, naviguer vers le formulaire
          context.push(Routes.createVehicle);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(ownerDashboardStateProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: state.when(
          initial: () => _buildInitial(),
          loading: () => _buildLoading(),
          refreshing: (data) => _buildContent(data, isRefreshing: true),
          success: (data) => _buildContent(data),
          empty: (message) => _buildEmpty(),
          failure: (message, code) => _buildError(message),
        ),
      ),
    );
  }

  /// État initial
  Widget _buildInitial() {
    return const OwnerDashboardShimmer();
  }

  /// État de chargement
  Widget _buildLoading() {
    return const OwnerDashboardShimmer();
  }

  /// Contenu principal avec les données
  Widget _buildContent(data, {bool isRefreshing = false}) {
    // Déclencher les animations d'entrée la première fois
    WidgetsBinding.instance.addPostFrameCallback((_) => _triggerEntrance());

    return RefreshIndicator(
      color: const Color(0xFF34D399),
      onRefresh: () async {
        await ref.read(ownerDashboardViewModelProvider.notifier).refresh();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            // 0. Header avec revenus
            _animatedSection(
              index: 0,
              child: OwnerDashboardHeader(
                monthlyRevenue: data.monthlyRevenue,
                cumulativeRevenue: data.cumulativeRevenue,
                notificationCount: 0,
                onNotificationTap: () {},
                onProfileTap: () {},
              ),
            ),

            const SizedBox(height: 24),

            // 1. Cartes de statistiques (avec barre animée)
            _animatedSection(
              index: 1,
              child: OwnerStatsCards(
                totalVehicles: data.totalVehicles,
                activeReservations: data.activeReservations,
                occupancyRate: data.occupancyRate,
              ),
            ),

            const SizedBox(height: 20),

            // 2. Todos
            _animatedSection(
              index: 2,
              child: OwnerDashboardTodos(
                pendingConfirmations: data.pendingConfirmations,
                upcomingCheckins: data.upcomingCheckins,
                upcomingCheckouts: data.upcomingCheckouts,
                openDisputes: data.openDisputes,
                onTodoTap: () {},
              ),
            ),

            if (data.hasTodos) const SizedBox(height: 20),

            // 3. Actions rapides
            _animatedSection(
              index: 3,
              child: OwnerQuickActions(
                onPublishVehicle: _handlePublishVehicle,
                onViewReservations: () => context.go('/owner/reservations'),
                onViewWallet: () => context.go('/owner/wallet'),
                onViewVehicles: () => context.go('/owner/fleet'),
                onViewProfile: () => context.push(Routes.profile),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  /// État vide (pas de données)
  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.car_rental_outlined,
              size: 80,
              color: Colors.grey.shade700,
            ),
            const SizedBox(height: 24),
            Text(
              'Aucun véhicule',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Ajoutez votre premier véhicule pour commencer',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  /// État d'erreur
  Widget _buildError(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
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
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                  ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                ref.read(ownerDashboardViewModelProvider.notifier).retry();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF34D399),
                foregroundColor: Colors.white,
              ),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }
}
