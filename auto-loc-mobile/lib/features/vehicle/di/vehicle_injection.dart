import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../data/datasources/vehicle_remote_datasource.dart';
import '../data/repositories/vehicle_repository_impl.dart';
import '../domain/repositories/vehicle_repository.dart';
import '../domain/usecases/get_vehicles.dart';
import '../domain/usecases/get_vehicle_details.dart';
import '../domain/usecases/search_vehicles.dart';
import '../domain/usecases/create_vehicle.dart';
import '../domain/usecases/update_vehicle.dart';
import '../domain/usecases/archive_vehicle.dart';
import '../domain/usecases/delete_vehicle_permanently.dart';
import '../domain/usecases/get_my_vehicles.dart';
import '../domain/usecases/get_my_vehicles_summary.dart';
import '../domain/usecases/search_vehicles_with_filters.dart';
import '../domain/usecases/get_home_feed.dart';
import '../domain/usecases/get_mobile_feed.dart';
import '../domain/usecases/get_upload_signature.dart';
import '../domain/usecases/get_blocked_dates.dart';
import '../domain/usecases/get_pricing.dart';
import '../domain/usecases/create_indisponibilite.dart';
import '../domain/usecases/get_indisponibilites.dart';
import '../domain/usecases/delete_indisponibilite.dart';
import '../domain/usecases/add_photo.dart';
import '../domain/usecases/link_photo.dart';
import '../domain/usecases/update_photo.dart';
import '../domain/usecases/delete_photo.dart';

// =============================================================================
// DATA LAYER - DataSources
// =============================================================================

/// Provider pour VehicleRemoteDataSource
///
/// Dépend de Dio (fourni par apiClientProvider du core)
final vehicleRemoteDataSourceProvider = Provider<VehicleRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return VehicleRemoteDataSourceImpl(dio);
});

// TODO: Ajouter vehicleLocalDataSourceProvider pour le cache Isar

// =============================================================================
// DATA LAYER - Repository Implementation
// =============================================================================

/// Provider pour VehicleRepository (implémentation)
///
/// Dépend de VehicleRemoteDataSource
/// Retourne l'interface VehicleRepository (Dependency Inversion)
final vehicleRepositoryProvider = Provider<VehicleRepository>((ref) {
  final remoteDataSource = ref.watch(vehicleRemoteDataSourceProvider);
  // TODO: Ajouter localDataSource quand disponible
  return VehicleRepositoryImpl(remoteDataSource);
});

// =============================================================================
// DOMAIN LAYER - UseCases
// =============================================================================

/// Provider pour GetVehicles UseCase
///
/// Dépend de VehicleRepository
final getVehiclesUseCaseProvider = Provider<GetVehicles>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetVehicles(repository);
});

/// Provider pour GetVehicleDetails UseCase
final getVehicleDetailsUseCaseProvider = Provider<GetVehicleDetails>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetVehicleDetails(repository);
});

/// Provider pour SearchVehicles UseCase
final searchVehiclesUseCaseProvider = Provider<SearchVehicles>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return SearchVehicles(repository);
});

// NOUVEAUX PROVIDERS SYNCHRONISÉS AVEC BACKEND

/// Provider pour CreateVehicle UseCase
final createVehicleUseCaseProvider = Provider<CreateVehicle>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return CreateVehicle(repository);
});

/// Provider pour UpdateVehicle UseCase
final updateVehicleUseCaseProvider = Provider<UpdateVehicle>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return UpdateVehicle(repository);
});

/// Provider pour ArchiveVehicle UseCase
final archiveVehicleUseCaseProvider = Provider<ArchiveVehicle>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return ArchiveVehicle(repository);
});

/// Provider pour DeleteVehiclePermanently UseCase
final deleteVehiclePermanentlyUseCaseProvider = Provider<DeleteVehiclePermanently>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return DeleteVehiclePermanently(repository);
});

/// Provider pour GetMyVehicles UseCase
final getMyVehiclesUseCaseProvider = Provider<GetMyVehicles>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetMyVehicles(repository);
});

/// Provider pour GetMyVehiclesSummary UseCase
final getMyVehiclesSummaryUseCaseProvider = Provider<GetMyVehiclesSummary>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetMyVehiclesSummary(repository);
});

/// Provider pour SearchVehiclesWithFilters UseCase
final searchVehiclesWithFiltersUseCaseProvider = Provider<SearchVehiclesWithFilters>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return SearchVehiclesWithFilters(repository);
});

/// Provider pour GetHomeFeed UseCase
final getHomeFeedUseCaseProvider = Provider<GetHomeFeed>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetHomeFeed(repository);
});

/// Provider pour GetMobileFeed UseCase
final getMobileFeedUseCaseProvider = Provider<GetMobileFeed>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetMobileFeed(repository);
});

/// Provider pour GetUploadSignature UseCase
final getUploadSignatureUseCaseProvider = Provider<GetUploadSignature>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetUploadSignature(repository);
});

/// Provider pour GetBlockedDates UseCase
final getBlockedDatesUseCaseProvider = Provider<GetBlockedDates>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetBlockedDates(repository);
});

/// Provider pour GetPricing UseCase
final getPricingUseCaseProvider = Provider<GetPricing>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetPricing(repository);
});

/// Provider pour CreateIndisponibilite UseCase
final createIndisponibiliteUseCaseProvider = Provider<CreateIndisponibilite>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return CreateIndisponibilite(repository);
});

/// Provider pour GetIndisponibilites UseCase
final getIndisponibilitesUseCaseProvider = Provider<GetIndisponibilites>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return GetIndisponibilites(repository);
});

/// Provider pour DeleteIndisponibilite UseCase
final deleteIndisponibiliteUseCaseProvider = Provider<DeleteIndisponibilite>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return DeleteIndisponibilite(repository);
});

/// Provider pour AddPhoto UseCase
final addPhotoUseCaseProvider = Provider<AddPhoto>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return AddPhoto(repository);
});

/// Provider pour LinkPhoto UseCase
final linkPhotoUseCaseProvider = Provider<LinkPhoto>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return LinkPhoto(repository);
});

/// Provider pour UpdatePhoto UseCase
final updatePhotoUseCaseProvider = Provider<UpdatePhoto>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return UpdatePhoto(repository);
});

/// Provider pour DeletePhoto UseCase
final deletePhotoUseCaseProvider = Provider<DeletePhoto>((ref) {
  final repository = ref.watch(vehicleRepositoryProvider);
  return DeletePhoto(repository);
});

// =============================================================================
// NOTES:
// =============================================================================
//
// Cette architecture suit le principe de Dependency Inversion (SOLID):
//
// 1. Les UseCases dépendent de l'INTERFACE VehicleRepository (domain)
// 2. VehicleRepositoryImpl IMPLÉMENTE cette interface (data)
// 3. Riverpod injecte automatiquement la bonne implémentation
//
// Avantages:
// - Testable: on peut mocker VehicleRepository facilement
// - Flexible: on peut changer l'implémentation sans toucher aux UseCases
// - Clean: le domain ne connaît RIEN de la data layer
//
// Flow d'injection:
// Dio → RemoteDataSource → RepositoryImpl → UseCases → ViewModels → UI
