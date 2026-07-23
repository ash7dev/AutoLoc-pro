import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../core/network/api_client.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../data/datasources/owner_dashboard_remote_datasource.dart';
import '../../data/repositories/owner_dashboard_repository_impl.dart';
import '../../domain/entities/owner_dashboard_data.dart';
import '../../domain/repositories/owner_dashboard_repository.dart';
import '../../domain/usecases/get_owner_stats.dart';
import '../viewmodels/owner_dashboard_viewmodel.dart';

// ===========================================================================
// DATA LAYER
// ===========================================================================

/// Provider pour le DataSource
final ownerDashboardRemoteDataSourceProvider =
    Provider<OwnerDashboardRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return OwnerDashboardRemoteDataSourceImpl(dio);
});

/// Provider pour le Repository
final ownerDashboardRepositoryProvider =
    Provider<OwnerDashboardRepository>((ref) {
  final dataSource = ref.watch(ownerDashboardRemoteDataSourceProvider);
  return OwnerDashboardRepositoryImpl(dataSource);
});

// ===========================================================================
// DOMAIN LAYER
// ===========================================================================

/// Provider pour le UseCase
final getOwnerStatsProvider = Provider<GetOwnerStats>((ref) {
  final repository = ref.watch(ownerDashboardRepositoryProvider);
  return GetOwnerStats(repository);
});

// ===========================================================================
// PRESENTATION LAYER
// ===========================================================================

/// Provider pour le ViewModel
final ownerDashboardViewModelProvider =
    StateNotifierProvider<OwnerDashboardViewModel, ViewState<OwnerDashboardData>>(
  (ref) {
    final getOwnerStats = ref.watch(getOwnerStatsProvider);
    return OwnerDashboardViewModel(getOwnerStats: getOwnerStats);
  },
);

/// Provider pour l'état du dashboard
final ownerDashboardStateProvider =
    Provider<ViewState<OwnerDashboardData>>((ref) {
  return ref.watch(ownerDashboardViewModelProvider);
});

/// Provider pour les données du dashboard (nullable)
final ownerDashboardDataProvider = Provider<OwnerDashboardData?>((ref) {
  return ref.watch(ownerDashboardStateProvider).dataOrNull;
});
