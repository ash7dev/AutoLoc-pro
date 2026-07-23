import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/presentation/base/view_effect.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../di/booking_injection.dart';
import '../states/booking_details_state.dart';
import '../states/booking_list_state.dart';
import '../states/booking_payment_state.dart';
import '../viewmodels/booking_details_view_model.dart';
import '../viewmodels/booking_list_view_model.dart';
import '../viewmodels/booking_payment_view_model.dart';

// ============================================================================
// 1. BOOKING LIST PROVIDERS
// ============================================================================

/// Provider pour BookingListViewModel
final bookingListViewModelProvider =
    StateNotifierProvider<BookingListViewModel, ViewState<BookingListData>>((ref) {
  return BookingListViewModel(
    getMyBookings: ref.read(getMyBookingsUseCaseProvider),
    getOwnerBookings: ref.read(getOwnerBookingsUseCaseProvider),
    cancelBooking: ref.read(cancelBookingUseCaseProvider),
    ref: ref,
  );
});

/// Alias du state de liste des réservations pour la UI
final bookingListStateProvider = Provider<ViewState<BookingListData>>((ref) {
  return ref.watch(bookingListViewModelProvider);
});

/// Stream d'effects pour la liste des réservations
final bookingListEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(bookingListViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// 2. BOOKING DETAILS PROVIDERS
// ============================================================================

/// Provider pour BookingDetailsViewModel
final bookingDetailsViewModelProvider =
    StateNotifierProvider<BookingDetailsViewModel, ViewState<BookingDetailsData>>((ref) {
  return BookingDetailsViewModel(
    getBookingDetails: ref.read(getBookingDetailsUseCaseProvider),
    cancelBooking: ref.read(cancelBookingUseCaseProvider),
    checkinBooking: ref.read(checkinBookingUseCaseProvider),
    checkoutBooking: ref.read(checkoutBookingUseCaseProvider),
    uploadPhotosEtatLieu: ref.read(uploadPhotosEtatLieuUseCaseProvider),
    confirmBooking: ref.read(confirmBookingUseCaseProvider),
    refuseCheckin: ref.read(refuseCheckinUseCaseProvider),
    signalTenantNoshow: ref.read(signalTenantNoshowUseCaseProvider),
    signalOverload: ref.read(signalOverloadUseCaseProvider),
  );
});

/// Alias du state de détails d'une réservation pour la UI
final bookingDetailsStateProvider = Provider<ViewState<BookingDetailsData>>((ref) {
  return ref.watch(bookingDetailsViewModelProvider);
});

/// Stream d'effects pour les détails de la réservation
final bookingDetailsEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(bookingDetailsViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

// ============================================================================
// 3. BOOKING PAYMENT (CHECKOUT) PROVIDERS
// ============================================================================

/// Provider pour BookingPaymentViewModel
final bookingPaymentViewModelProvider =
    StateNotifierProvider<BookingPaymentViewModel, ViewState<BookingPaymentData>>((ref) {
  return BookingPaymentViewModel(
    calculateCost: ref.read(calculateCostUseCaseProvider),
    createBooking: ref.read(createBookingUseCaseProvider),
    getBookingDetails: ref.read(getBookingDetailsUseCaseProvider),
  );
});

/// Alias du state de checkout/paiement pour la UI
final bookingPaymentStateProvider = Provider<ViewState<BookingPaymentData>>((ref) {
  return ref.watch(bookingPaymentViewModelProvider);
});

/// Stream d'effects pour le checkout/paiement
final bookingPaymentEffectsProvider = StreamProvider<ViewEffect>((ref) {
  final viewModel = ref.watch(bookingPaymentViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});
