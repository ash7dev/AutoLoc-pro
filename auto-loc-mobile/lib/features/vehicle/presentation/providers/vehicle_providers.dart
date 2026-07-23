import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../di/vehicle_injection.dart';
import '../states/my_vehicles_state.dart';
import '../states/vehicle_details_state.dart';
import '../states/vehicle_explore_state.dart';
import '../states/vehicle_form_state.dart';
import '../states/vehicle_indisponibilite_state.dart';
import '../viewmodels/my_vehicles_view_model.dart';
import '../viewmodels/vehicle_details_view_model.dart';
import '../viewmodels/vehicle_explore_view_model.dart';
import '../viewmodels/vehicle_form_view_model.dart';
import '../viewmodels/vehicle_indisponibilite_view_model.dart';

// ============================================================================
// 1. VEHICLE EXPLORE / SEARCH PROVIDERS
// ============================================================================

/// Provider pour VehicleExploreViewModel
final vehicleExploreViewModelProvider =
    StateNotifierProvider<VehicleExploreViewModel, ViewState<VehicleExploreData>>((ref) {
  return VehicleExploreViewModel(
    getMobileFeedUseCase: ref.read(getMobileFeedUseCaseProvider),
    searchVehiclesUseCase: ref.read(searchVehiclesUseCaseProvider),
    searchVehiclesWithFiltersUseCase: ref.read(searchVehiclesWithFiltersUseCaseProvider),
    getVehiclesUseCase: ref.read(getVehiclesUseCaseProvider),
  );
});

/// Alias du state d'exploration pour la UI
final vehicleExploreStateProvider = Provider<ViewState<VehicleExploreData>>((ref) {
  return ref.watch(vehicleExploreViewModelProvider);
});

/// Stream d'effects pour l'exploration
final vehicleExploreEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(vehicleExploreViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// 2. VEHICLE DETAILS PROVIDERS
// ============================================================================

/// Provider pour VehicleDetailsViewModel
final vehicleDetailsViewModelProvider =
    StateNotifierProvider<VehicleDetailsViewModel, ViewState<VehicleDetailsData>>((ref) {
  return VehicleDetailsViewModel(
    getVehicleDetailsUseCase: ref.read(getVehicleDetailsUseCaseProvider),
    getBlockedDatesUseCase: ref.read(getBlockedDatesUseCaseProvider),
    getPricingUseCase: ref.read(getPricingUseCaseProvider),
  );
});

/// Alias du state des détails pour la UI
final vehicleDetailsStateProvider = Provider<ViewState<VehicleDetailsData>>((ref) {
  return ref.watch(vehicleDetailsViewModelProvider);
});

/// Stream d'effects pour les détails
final vehicleDetailsEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(vehicleDetailsViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// 3. OWNER FLEET (MY VEHICLES) PROVIDERS
// ============================================================================

/// Provider pour MyVehiclesViewModel
final myVehiclesViewModelProvider =
    StateNotifierProvider<MyVehiclesViewModel, ViewState<MyVehiclesData>>((ref) {
  return MyVehiclesViewModel(
    getMyVehiclesUseCase: ref.read(getMyVehiclesUseCaseProvider),
    getMyVehiclesSummaryUseCase: ref.read(getMyVehiclesSummaryUseCaseProvider),
    archiveVehicleUseCase: ref.read(archiveVehicleUseCaseProvider),
    deleteVehiclePermanentlyUseCase: ref.read(deleteVehiclePermanentlyUseCaseProvider),
  );
});

/// Alias du state de la flotte pour la UI
final myVehiclesStateProvider = Provider<ViewState<MyVehiclesData>>((ref) {
  return ref.watch(myVehiclesViewModelProvider);
});

/// Stream d'effects pour la flotte propriétaire
final myVehiclesEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(myVehiclesViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// 4. VEHICLE FORM (CREATE / UPDATE) PROVIDERS
// ============================================================================

/// Provider pour VehicleFormViewModel
final vehicleFormViewModelProvider =
    StateNotifierProvider<VehicleFormViewModel, ViewState<VehicleFormData>>((ref) {
  return VehicleFormViewModel(
    createVehicleUseCase: ref.read(createVehicleUseCaseProvider),
    updateVehicleUseCase: ref.read(updateVehicleUseCaseProvider),
    getUploadSignatureUseCase: ref.read(getUploadSignatureUseCaseProvider),
    addPhotoUseCase: ref.read(addPhotoUseCaseProvider),
    linkPhotoUseCase: ref.read(linkPhotoUseCaseProvider),
    updatePhotoUseCase: ref.read(updatePhotoUseCaseProvider),
    deletePhotoUseCase: ref.read(deletePhotoUseCaseProvider),
    ref: ref,
  );
});

/// Alias du state du formulaire pour la UI
final vehicleFormStateProvider = Provider<ViewState<VehicleFormData>>((ref) {
  return ref.watch(vehicleFormViewModelProvider);
});

/// Stream d'effects pour le formulaire
final vehicleFormEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(vehicleFormViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// 5. VEHICLE INDISPONIBILITE PROVIDERS
// ============================================================================

/// Provider pour VehicleIndisponibiliteViewModel
final vehicleIndisponibiliteViewModelProvider =
    StateNotifierProvider<VehicleIndisponibiliteViewModel, ViewState<VehicleIndisponibiliteData>>((ref) {
  return VehicleIndisponibiliteViewModel(
    getIndisponibilitesUseCase: ref.read(getIndisponibilitesUseCaseProvider),
    createIndisponibiliteUseCase: ref.read(createIndisponibiliteUseCaseProvider),
    deleteIndisponibiliteUseCase: ref.read(deleteIndisponibiliteUseCaseProvider),
  );
});

/// Alias du state d'indisponibilité pour la UI
final vehicleIndisponibiliteStateProvider = Provider<ViewState<VehicleIndisponibiliteData>>((ref) {
  return ref.watch(vehicleIndisponibiliteViewModelProvider);
});

/// Stream d'effects pour les indisponibilités
final vehicleIndisponibiliteEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(vehicleIndisponibiliteViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});
