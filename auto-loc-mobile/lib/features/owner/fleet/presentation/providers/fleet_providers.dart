import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../core/network/api_client.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../data/datasources/fleet_remote_datasource.dart';
import '../../data/repositories/fleet_repository_impl.dart';
import '../../domain/entities/owner_vehicle.dart';
import '../../domain/repositories/fleet_repository.dart';
import '../../domain/usecases/get_my_vehicles.dart';
import '../viewmodels/fleet_viewmodel.dart';

// ============================================================================
// DATA LAYER PROVIDERS
// ============================================================================

/// Provider pour le RemoteDataSource
final fleetRemoteDataSourceProvider = Provider<FleetRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return FleetRemoteDataSourceImpl(dio);
});

/// Provider pour le Repository
final fleetRepositoryProvider = Provider<FleetRepository>((ref) {
  final remoteDataSource = ref.watch(fleetRemoteDataSourceProvider);
  return FleetRepositoryImpl(remoteDataSource: remoteDataSource);
});

// ============================================================================
// DOMAIN LAYER PROVIDERS
// ============================================================================

/// Provider pour le UseCase GetMyVehicles
final getMyVehiclesProvider = Provider<GetMyVehicles>((ref) {
  final repository = ref.watch(fleetRepositoryProvider);
  return GetMyVehicles(repository);
});

// ============================================================================
// PRESENTATION LAYER PROVIDERS
// ============================================================================

/// Provider pour le FleetViewModel
final fleetViewModelProvider =
    StateNotifierProvider<FleetViewModel, ViewState<List<OwnerVehicle>>>((ref) {
  final getMyVehicles = ref.watch(getMyVehiclesProvider);

  return FleetViewModel(
    getMyVehicles: getMyVehicles,
  );
});

/// Provider exposant uniquement le state du ViewModel (alias pour simplifier)
final fleetStateProvider = Provider<ViewState<List<OwnerVehicle>>>((ref) {
  return ref.watch(fleetViewModelProvider);
});

/// Provider pour les effects du ViewModel
final fleetEffectsProvider = Provider<Stream<Object>>((ref) {
  return ref.watch(fleetViewModelProvider.notifier).effects;
});
