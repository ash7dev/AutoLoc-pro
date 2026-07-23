import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../core/network/api_client.dart';
import '../../../../../shared/presentation/base/view_effect.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../data/datasources/owner_reservations_remote_datasource.dart';
import '../../data/repositories/owner_reservations_repository_impl.dart';
import '../../domain/entities/owner_reservation.dart';
import '../../domain/repositories/owner_reservations_repository.dart';
import '../../domain/usecases/get_my_reservations.dart';
import '../viewmodels/owner_reservations_viewmodel.dart';

// ============================================================================
// DATA LAYER PROVIDERS
// ============================================================================

/// Provider pour le RemoteDataSource des réservations Owner
final ownerReservationsRemoteDataSourceProvider =
    Provider<OwnerReservationsRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return OwnerReservationsRemoteDataSourceImpl(dio);
});

/// Provider pour le Repository des réservations Owner
final ownerReservationsRepositoryProvider =
    Provider<OwnerReservationsRepository>((ref) {
  final remoteDataSource = ref.watch(ownerReservationsRemoteDataSourceProvider);
  return OwnerReservationsRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

// ============================================================================
// DOMAIN LAYER PROVIDERS
// ============================================================================

/// Provider pour le UseCase GetMyReservations
final getMyReservationsProvider = Provider<GetMyReservations>((ref) {
  final repository = ref.watch(ownerReservationsRepositoryProvider);
  return GetMyReservations(repository);
});

// ============================================================================
// PRESENTATION LAYER PROVIDERS
// ============================================================================

/// Provider pour le ViewModel des réservations Owner
final ownerReservationsViewModelProvider = StateNotifierProvider.autoDispose<
    OwnerReservationsViewModel, ViewState<List<OwnerReservation>>>((ref) {
  final getMyReservations = ref.watch(getMyReservationsProvider);

  return OwnerReservationsViewModel(
    getMyReservations: getMyReservations,
  );
});

/// Stream d'effects pour les réservations Owner
final ownerReservationsEffectsProvider = StreamProvider.autoDispose<ViewEffect>((ref) {
  final viewModel = ref.watch(ownerReservationsViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

/// Provider pour l'état actuel des réservations
final ownerReservationsStateProvider =
    Provider.autoDispose<ViewState<List<OwnerReservation>>>((ref) {
  return ref.watch(ownerReservationsViewModelProvider);
});

/// Provider pour le nombre de réservations
final ownerReservationsCountProvider = Provider.autoDispose<int>((ref) {
  final viewModel = ref.watch(ownerReservationsViewModelProvider.notifier);
  return viewModel.reservationsCount;
});

/// Provider pour les statistiques des réservations
final ownerReservationsStatsProvider = Provider.autoDispose<Map<String, int>>((ref) {
  final viewModel = ref.watch(ownerReservationsViewModelProvider.notifier);
  return {
    'total': viewModel.totalReservations,
    'ongoing': viewModel.ongoingCount,
    'completed': viewModel.completedCount,
    'cancelled': viewModel.cancelledCount,
    'dispute': viewModel.disputeCount,
  };
});
