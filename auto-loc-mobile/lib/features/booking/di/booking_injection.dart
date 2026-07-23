import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/datasources/booking_remote_datasource.dart';
import '../data/repositories/booking_repository_impl.dart';
import '../domain/repositories/booking_repository.dart';
import '../domain/usecases/calculate_cost.dart';
import '../domain/usecases/cancel_booking.dart';
import '../domain/usecases/check_availability.dart';
import '../domain/usecases/checkin_booking.dart';
import '../domain/usecases/checkout_booking.dart';
import '../domain/usecases/confirm_booking.dart';
import '../domain/usecases/create_booking.dart';
import '../domain/usecases/get_booking_details.dart';
import '../domain/usecases/get_locataire_docs.dart';
import '../domain/usecases/get_my_bookings.dart';
import '../domain/usecases/get_owner_bookings.dart';
import '../domain/usecases/refuse_checkin.dart';
import '../domain/usecases/signal_overload.dart';
import '../domain/usecases/signal_tenant_noshow.dart';
import '../domain/usecases/upload_photos_etat_lieu.dart';

// =============================================================================
// DATA LAYER PROVIDERS
// =============================================================================

/// Provider pour le Remote DataSource
final bookingRemoteDataSourceProvider =
    Provider<BookingRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return BookingRemoteDataSourceImpl(dio);
});

/// Provider pour le Repository
final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  final remoteDataSource = ref.watch(bookingRemoteDataSourceProvider);
  return BookingRepositoryImpl(remoteDataSource);
});

// =============================================================================
// DOMAIN LAYER PROVIDERS - USE CASES
// =============================================================================

/// UseCase: Create Booking
final createBookingUseCaseProvider = Provider<CreateBooking>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return CreateBooking(repository);
});

/// UseCase: Get My Bookings
final getMyBookingsUseCaseProvider = Provider<GetMyBookings>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return GetMyBookings(repository);
});

/// UseCase: Get Owner Bookings
final getOwnerBookingsUseCaseProvider = Provider<GetOwnerBookings>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return GetOwnerBookings(repository);
});

/// UseCase: Get Booking Details
final getBookingDetailsUseCaseProvider = Provider<GetBookingDetails>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return GetBookingDetails(repository);
});

/// UseCase: Cancel Booking
final cancelBookingUseCaseProvider = Provider<CancelBooking>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return CancelBooking(repository);
});

/// UseCase: Checkin Booking
final checkinBookingUseCaseProvider = Provider<CheckinBooking>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return CheckinBooking(repository);
});

/// UseCase: Checkout Booking
final checkoutBookingUseCaseProvider = Provider<CheckoutBooking>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return CheckoutBooking(repository);
});

/// UseCase: Check Availability
final checkAvailabilityUseCaseProvider = Provider<CheckAvailability>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return CheckAvailability(repository);
});

/// UseCase: Calculate Cost
final calculateCostUseCaseProvider = Provider<CalculateCost>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return CalculateCost(repository);
});

/// UseCase: Upload Photos État des Lieux
final uploadPhotosEtatLieuUseCaseProvider =
    Provider<UploadPhotosEtatLieu>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return UploadPhotosEtatLieu(repository);
});

/// UseCase: Confirm Booking
final confirmBookingUseCaseProvider = Provider<ConfirmBooking>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return ConfirmBooking(repository);
});

/// UseCase: Refuse Checkin
final refuseCheckinUseCaseProvider = Provider<RefuseCheckin>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return RefuseCheckin(repository);
});

/// UseCase: Signal Tenant Noshow
final signalTenantNoshowUseCaseProvider = Provider<SignalTenantNoshow>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return SignalTenantNoshow(repository);
});

/// UseCase: Signal Overload
final signalOverloadUseCaseProvider = Provider<SignalOverload>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return SignalOverload(repository);
});

/// UseCase: Get Locataire Docs
final getLocataireDocsUseCaseProvider = Provider<GetLocataireDocs>((ref) {
  final repository = ref.watch(bookingRepositoryProvider);
  return GetLocataireDocs(repository);
});
