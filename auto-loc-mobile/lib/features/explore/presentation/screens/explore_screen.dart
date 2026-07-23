import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/presentation/widgets/app_bars/tenant_app_bar.dart';
import '../../../../shared/presentation/widgets/cards/vehicle_list_item.dart';
import '../../../vehicle/domain/entities/vehicle.dart';
import '../../../vehicle/presentation/providers/vehicle_providers.dart';

/// Explore Screen - Recherche et filtres
///
/// Permet à l'utilisateur de:
/// - Rechercher des véhicules
/// - Filtrer par type, prix, localisation
/// - Voir tous les véhicules disponibles
///
/// Accessible SANS authentification (navigation publique)
class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  String _searchQuery = '';
  late final dynamic _exploreViewModel;

  @override
  void initState() {
    super.initState();
    _exploreViewModel = ref.read(vehicleExploreViewModelProvider.notifier);
    // Charger les véhicules seulement si elles ne sont pas déjà en cache
    Future.microtask(() {
      // Le ViewModel gérera automatiquement le cache
      _exploreViewModel.load();
    });
  }

  @override
  void dispose() {
    // Réinitialiser la recherche/filtres pour que l'écran d'accueil retrouve son état d'origine
    // Note: On ne peut pas utiliser ref après dispose, donc on ne clear pas ici
    // Le ViewModel est autoDispose et se nettoiera automatiquement
    super.dispose();
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });

    // Lancer la recherche si la query n'est pas vide
    if (query.isNotEmpty) {
      _exploreViewModel.search(query);
    } else {
      // Restaurer le feed initial à partir du cache si la recherche est vide
      _exploreViewModel.clearSearch();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vehicleExploreStateProvider);

    // Déterminer si on est en chargement
    final isLoading = state.maybeWhen(
      loading: () => true,
      orElse: () => false,
    );

    // Extraire les véhicules
    final vehicles = state.maybeWhen(
      success: (data) => _searchQuery.isNotEmpty
          ? data.searchResults
          : data.vehicles,
      refreshing: (data) => _searchQuery.isNotEmpty
          ? data.searchResults
          : data.vehicles,
      orElse: () => <Vehicle>[],
    );

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: TenantAppBar(
        mode: TenantAppBarMode.explore,
        onSearchChanged: _onSearchChanged,
      ),
      body: state.when(
        initial: () => _buildEmptyState('Recherchez des véhicules'),
        loading: () => _buildLoadingState(),
        success: (data) {
          if (vehicles.isEmpty) {
            return _buildEmptyState(
              _searchQuery.isNotEmpty
                  ? 'Aucun véhicule trouvé pour "$_searchQuery"'
                  : 'Aucun véhicule disponible',
            );
          }
          return _buildVehicleList(vehicles, isLoading);
        },
        refreshing: (data) => _buildVehicleList(vehicles, isLoading),
        failure: (message, code) => _buildErrorState(message),
        empty: (message) => _buildEmptyState(message ?? 'Aucun véhicule disponible'),
      ),
    );
  }

  Widget _buildVehicleList(List<Vehicle> vehicles, bool isLoading) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 16),
      itemCount: vehicles.length,
      itemBuilder: (context, index) {
        return VehicleListItem(vehicle: vehicles[index]);
      },
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: CircularProgressIndicator(
        color: Color(0xFF34D399),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
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
                  Icons.directions_car_filled_outlined,
                  size: 38,
                  color: Color(0xFF34D399),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                _searchQuery.isNotEmpty
                    ? 'Aucun véhicule ne correspond à vos critères de recherche.'
                    : 'Notre flotte est temporairement indisponible. Revenez plus tard !',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              if (_searchQuery.isNotEmpty)
                ElevatedButton.icon(
                  onPressed: () {
                    _exploreViewModel.search('');
                    setState(() {
                      _searchQuery = '';
                    });
                  },
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('Réinitialiser la recherche'),
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
                  onPressed: () => _exploreViewModel.load(),
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
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline_rounded,
            size: 64,
            color: Colors.red.withOpacity(0.6),
          ),
          const SizedBox(height: 24),
          Text(
            'Erreur',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              message,
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}
