import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../shared/presentation/widgets/app_bars/tenant_app_bar.dart';
import '../../../../shared/presentation/widgets/search/explore_search_bar.dart';
import '../../../../shared/presentation/widgets/search/filter_button.dart';
import '../../../../shared/presentation/widgets/banners/premium_hero_banner.dart';
import '../../../../shared/presentation/widgets/selectors/vehicle_type_selector.dart';
import '../../../vehicle/domain/entities/vehicle.dart';
import '../../../vehicle/presentation/providers/vehicle_providers.dart';
import '../../../vehicle/presentation/states/vehicle_explore_state.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../widgets/sections/featured_vehicles_section.dart';
import '../widgets/sections/nearby_vehicles_section.dart';
import '../widgets/sections/premium_selection_grid.dart';

/// Home Screen avec search bar, filtres et sections de véhicules
///
/// **Important :** `extendBodyBehindAppBar: true` est nécessaire pour que
/// le glassmorphism du `TenantAppBar` ait un effet visible — sans ça, le
/// blur n'a rien à flouter derrière lui et l'app bar paraît plate.
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Charger les données seulement si elles ne sont pas déjà en cache
    Future.microtask(() {
      final viewModel = ref.read(vehicleExploreViewModelProvider.notifier);
      // Le ViewModel gérera automatiquement le cache
      viewModel.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vehicleExploreStateProvider);

    // Déterminer si on est en chargement
    final isLoading = state.maybeWhen(
      loading: () => true,
      orElse: () => false,
    );

    // Extraire les véhicules spécifiques depuis les catégories du mobileFeed
    final featuredVehicles = state.maybeWhen(
      success: (data) => data.featuredVehicles,
      refreshing: (data) => data.featuredVehicles,
      orElse: () => <Vehicle>[],
    );

    final nearbyVehicles = state.maybeWhen(
      success: (data) => data.nearbyVehicles,
      refreshing: (data) => data.nearbyVehicles,
      orElse: () => <Vehicle>[],
    );

    final premiumVehicles = state.maybeWhen(
      success: (data) => data.premiumVehicles,
      refreshing: (data) => data.premiumVehicles,
      orElse: () => <Vehicle>[],
    );

    final showEmptyState = state.maybeWhen(
      empty: (_) => true,
      success: (data) => data.featuredVehicles.isEmpty && data.nearbyVehicles.isEmpty && data.premiumVehicles.isEmpty,
      orElse: () => false,
    );

    final showErrorState = state.maybeWhen(
      failure: (_, __) => true,
      orElse: () => false,
    );

    final hasFilters = state.maybeWhen(
      success: (data) => (data.typeFilter != null && data.typeFilter!.isNotEmpty) || data.searchQuery.isNotEmpty,
      orElse: () => false,
    );

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: const TenantAppBar(
        mode: TenantAppBarMode.home,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Espace pour le header
              const SizedBox(height: 20),

              // Search bar et bouton filtres
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    const Expanded(
                      child: ExploreSearchBar(),
                    ),
                    const SizedBox(width: 12),
                    FilterButton(),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Premium Hero Banner
              PremiumHeroBanner(
                title: 'Fini les Scam',
                subtitle: 'Location de voiture 100% sécurisée au Sénégal',
                ctaPrefix: 'Kaay',
                ctaHighlight: 'Louer',
                onTap: () => context.push(Routes.explore),
              ),

              const SizedBox(height: 28),

              // Vehicle Type Selector
              VehicleTypeSelector(
                selected: state.maybeWhen(
                  success: (data) => data.typeFilter ?? '',
                  refreshing: (data) => data.typeFilter ?? '',
                  orElse: () => '',
                ),
                onChanged: (type) {
                  ref
                      .read(vehicleExploreViewModelProvider.notifier)
                      .updateTypeFilter(type.isEmpty ? null : type);
                },
              ),

              const SizedBox(height: 28),

              if (showErrorState) ...[
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.redAccent.withOpacity(0.08),
                          Colors.redAccent.withOpacity(0.02),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: Colors.redAccent.withOpacity(0.2),
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
                            color: Colors.redAccent.withOpacity(0.1),
                          ),
                          child: const Icon(
                            Icons.error_outline_rounded,
                            size: 38,
                            color: Colors.redAccent,
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
                        ),
                        const SizedBox(height: 8),
                        Text(
                          state.errorMessageOrNull ?? 'Impossible de charger les véhicules.',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () => ref.read(vehicleExploreViewModelProvider.notifier).load(),
                          icon: const Icon(Icons.refresh_rounded, size: 18),
                          label: const Text('Réessayer'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.redAccent,
                            foregroundColor: Colors.white,
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
              ] else if (showEmptyState) ...[
                const SizedBox(height: 20),
                Padding(
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
                            Icons.directions_car_filled_outlined,
                            size: 38,
                            color: Color(0xFF34D399),
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Aucun véhicule disponible',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          hasFilters
                              ? 'Aucun véhicule ne correspond à vos critères de recherche.'
                              : 'Notre flotte est temporairement indisponible. Revenez plus tard !',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        if (hasFilters)
                          ElevatedButton.icon(
                            onPressed: () {
                              final notifier = ref.read(vehicleExploreViewModelProvider.notifier);
                              notifier.updateTypeFilter(null);
                              notifier.search('');
                            },
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('Réinitialiser les filtres'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF34D399),
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: () => ref.read(vehicleExploreViewModelProvider.notifier).load(),
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('Rafraîchir'),
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
              ] else ...[
                // Section "À la une"
                FeaturedVehiclesSection(
                  vehicles: featuredVehicles,
                  isLoading: isLoading,
                ),

                const SizedBox(height: 32),

                // Section "À proximité"
                NearbyVehiclesSection(
                  vehicles: nearbyVehicles,
                  isLoading: isLoading,
                ),

                const SizedBox(height: 32),

                // Section "Sélection Premium" (grille 2×2)
                PremiumSelectionGrid(
                  vehicles: premiumVehicles,
                  isLoading: isLoading,
                ),
              ],

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
