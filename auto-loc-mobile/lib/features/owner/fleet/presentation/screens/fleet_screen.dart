import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/navigation/routes.dart';
import '../../../shared/widgets/owner_publish_gate_bottom_sheet.dart';
import '../../../shared/widgets/owner_section_header.dart';
import '../providers/fleet_providers.dart';
import '../widgets/fleet_shimmer.dart';
import '../widgets/vehicle_card.dart';

/// Fleet Screen
///
/// Gestion de la flotte de véhicules du propriétaire avec architecture MVVM
/// Affiche la liste des véhicules, permet l'ajout, la modification, et la gestion
class FleetScreen extends ConsumerStatefulWidget {
  const FleetScreen({super.key});

  @override
  ConsumerState<FleetScreen> createState() => _FleetScreenState();
}

class _FleetScreenState extends ConsumerState<FleetScreen> {
  @override
  void initState() {
    super.initState();
    // Charger les véhicules au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(fleetViewModelProvider.notifier).load();
    });
  }

  /// Affiche le gate de vérification avant de publier un véhicule
  void _showPublishGate() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => OwnerPublishGateBottomSheet(
        onProceed: () {
          // Une fois toutes les vérifications passées, naviguer vers la création
          context.push(Routes.createVehicle);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(fleetStateProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: state.when(
        initial: () => const FleetShimmer(),
        loading: () => const FleetShimmer(),
        refreshing: (vehicles) => _buildContent(vehicles, isRefreshing: true),
        success: (vehicles) => _buildContent(vehicles),
        empty: (message) => _buildEmpty(message),
        failure: (message, code) => _buildError(message, code: code),
      ),
    );
  }

  Widget _buildContent(vehicles, {bool isRefreshing = false}) {
    final vehicleCount = vehicles.length;

    return Column(
      children: [
        OwnerSectionHeader(
          title: 'Ma flotte',
          subtitle: '$vehicleCount véhicule${vehicleCount > 1 ? 's' : ''}',
          actions: [
            OwnerHeaderActionButton(
              icon: Icons.filter_list_rounded,
              onPressed: () {
                // TODO: Implémenter les filtres
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Filtres à venir'),
                    duration: Duration(seconds: 1),
                  ),
                );
              },
            ),
            const SizedBox(width: 8),
            OwnerHeaderActionButton(
              icon: Icons.add_circle_outline_rounded,
              onPressed: _showPublishGate,
            ),
          ],
        ),
        Expanded(
          child: RefreshIndicator(
            color: const Color(0xFF34D399),
            onRefresh: () async {
              await ref.read(fleetViewModelProvider.notifier).refresh();
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: vehicles.length,
              itemBuilder: (context, index) {
                final vehicle = vehicles[index];

                return VehicleCard(
                  vehicle: vehicle,
                  onTap: () {
                    // TODO: Naviguer vers les détails
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Détails de ${vehicle.fullName}'),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                  onEdit: () {
                    // TODO: Naviguer vers l'édition
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Modifier ${vehicle.fullName}'),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmpty(String? message) {
    return Column(
      children: [
        OwnerSectionHeader(
          title: 'Ma flotte',
          subtitle: '0 véhicule',
          actions: [
            OwnerHeaderActionButton(
              icon: Icons.add_circle_outline_rounded,
              onPressed: _showPublishGate,
            ),
          ],
        ),
        Expanded(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.directions_car_rounded,
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
                    message ?? 'Ajoutez votre premier véhicule pour commencer',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton.icon(
                    onPressed: _showPublishGate,
                    icon: const Icon(Icons.add_circle_outline_rounded),
                    label: const Text('Publier un véhicule'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF34D399),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
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

  Widget _buildError(String message, {String? code}) {
    final is403 = (code == '403') ||
                  message.contains('403') ||
                  message.toLowerCase().contains('rôle insuffisant') ||
                  message.toLowerCase().contains('accès refusé') ||
                  message.toLowerCase().contains('profil à compléter') ||
                  message.toLowerCase().contains('non autorisé');

    if (is403) {
      return Column(
        children: [
          const OwnerSectionHeader(
            title: 'Ma flotte',
            subtitle: '0 véhicule',
          ),
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
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
                          Icons.directions_car_rounded,
                          size: 38,
                          color: Color(0xFF34D399),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Aucun véhicule publié',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Complétez votre profil et finalisez votre vérification KYC pour pouvoir commencer à publier vos véhicules sur la plateforme.',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 14,
                          height: 1.4,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 28),
                      ElevatedButton.icon(
                        onPressed: _showPublishGate,
                        icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                        label: const Text('Ajouter un véhicule'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF34D399),
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      children: [
        const OwnerSectionHeader(
          title: 'Ma flotte',
        ),
        Expanded(
          child: Center(
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
                      ref.read(fleetViewModelProvider.notifier).retry();
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
          ),
        ),
      ],
    );
  }
}
