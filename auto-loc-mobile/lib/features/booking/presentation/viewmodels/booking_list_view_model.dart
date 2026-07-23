import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/booking.dart';
import '../../domain/usecases/get_my_bookings.dart';
import '../../domain/usecases/get_owner_bookings.dart';
import '../../domain/usecases/cancel_booking.dart';
import '../states/booking_list_state.dart';
import '../../../../shared/providers/session_providers.dart';

/// **BookingListViewModel** - ViewModel pour la liste des réservations
///
/// Gère l'affichage des réservations du locataire et du propriétaire,
/// avec filtrage par statut, annulation et gestion de cache.
class BookingListViewModel extends BaseViewModel<BookingListData> {
  final GetMyBookings _getMyBookings;
  final GetOwnerBookings _getOwnerBookings;
  final CancelBooking _cancelBooking;
  final Ref _ref;

  BookingListViewModel({
    required GetMyBookings getMyBookings,
    required GetOwnerBookings getOwnerBookings,
    required CancelBooking cancelBooking,
    required Ref ref,
  })  : _getMyBookings = getMyBookings,
        _getOwnerBookings = getOwnerBookings,
        _cancelBooking = cancelBooking,
        _ref = ref,
        super();

  /// Cache privé des réservations
  BookingListData? _cachedData;

  /// Horodatage du dernier chargement réussi
  DateTime? _lastLoadTime;

  /// Durée de validité du cache (5 minutes)
  static const _cacheDuration = Duration(minutes: 5);

  /// Vérifie si les données du cache sont encore valides
  bool get _isCacheValid {
    if (_lastLoadTime == null) return false;
    final difference = DateTime.now().difference(_lastLoadTime!);
    return difference < _cacheDuration;
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  @override
  Future<void> load({bool forceRefresh = false}) async {
    // Si le cache est valide et qu'on ne force pas le rechargement,
    // on sert immédiatement les données en cache
    if (!forceRefresh && _cachedData != null && _isCacheValid) {
      state = ViewState.success(_cachedData!);
      return;
    }

    final currentData = state.dataOrNull ?? _cachedData;

    // Stale-while-revalidate : si on a du cache, on l'affiche pendant la revalidation
    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    } else {
      state = const ViewState.loading();
    }

    try {
      final isTenant = _ref.read(isTenantProvider);
      final isOwner = _ref.read(isOwnerProvider);

      final tenantResult = isTenant ? await _getMyBookings() : null;
      final ownerResult = isOwner ? await _getOwnerBookings() : null;

      List<Booking> tenantBookings = [];
      List<Booking> ownerBookings = [];

      if (tenantResult != null) {
        tenantResult.fold(
          (failure) {
            if (failure.code == '403' || failure.code == '401' || failure.message.contains('Profil incomplet') || failure.message.contains('403') || failure.message.contains('401')) {
              // Ignorer et laisser la liste vide
            } else {
              if (currentData != null) {
                state = ViewState.success(currentData);
                showError(failure.message);
              } else {
                state = ViewState.failure(failure.message, code: failure.code);
              }
            }
          },
          (bookings) => tenantBookings = bookings,
        );
        if (state.maybeWhen(failure: (_, __) => true, orElse: () => false)) return;
      }

      if (ownerResult != null) {
        ownerResult.fold(
          (failure) {
            if (failure.code == '403' || failure.code == '401' || failure.message.contains('Profil incomplet') || failure.message.contains('403') || failure.message.contains('401')) {
              // Ignorer et laisser la liste vide
            } else {
              if (currentData != null) {
                state = ViewState.success(currentData);
                showError(failure.message);
              } else {
                state = ViewState.failure(failure.message, code: failure.code);
              }
            }
          },
          (bookings) => ownerBookings = bookings,
        );
        if (state.maybeWhen(failure: (_, __) => true, orElse: () => false)) return;
      }

      final selectedFilter = currentData?.selectedFilter ?? 'ALL';
      final newData = BookingListData(
        tenantBookings: tenantBookings,
        ownerBookings: ownerBookings,
        selectedFilter: selectedFilter,
      );

      // Mettre à jour le cache
      _cachedData = newData;
      _lastLoadTime = DateTime.now();

      if (tenantBookings.isEmpty && ownerBookings.isEmpty) {
        state = const ViewState.empty(
          message: 'Aucune réservation pour le moment',
        );
      } else {
        state = ViewState.success(newData);
      }
    } catch (e) {
      if (currentData != null) {
        state = ViewState.success(currentData);
        showError(e.toString());
      } else {
        state = ViewState.failure(e.toString());
      }
    }
  }

  @override
  Future<void> refresh() async {
    await load(forceRefresh: true);
  }

  @override
  Future<void> retry() async {
    await load(forceRefresh: true);
  }

  // =========================================================================
  // FILTERS
  // =========================================================================

  /// Appliquer un filtre de statut sur les réservations
  void setFilter(String filter) {
    final currentData = state.dataOrNull ?? _cachedData;
    if (currentData == null) return;

    final updated = currentData.copyWith(selectedFilter: filter);
    _cachedData = updated;
    state = ViewState.success(updated);
  }

  /// Retourne les réservations locataire filtrées par statut
  List<Booking> getFilteredTenantBookings(BookingListData data) {
    if (data.selectedFilter == 'ALL') return data.tenantBookings;
    return data.tenantBookings
        .where((b) => b.statut.value == data.selectedFilter)
        .toList();
  }

  /// Retourne les réservations propriétaire filtrées par statut
  List<Booking> getFilteredOwnerBookings(BookingListData data) {
    if (data.selectedFilter == 'ALL') return data.ownerBookings;
    return data.ownerBookings
        .where((b) => b.statut.value == data.selectedFilter)
        .toList();
  }

  // =========================================================================
  // ACTIONS SPÉCIFIQUES
  // =========================================================================

  /// Annuler une réservation
  Future<void> cancelBooking({
    required String bookingId,
    required String raison,
  }) async {
    final currentData = state.dataOrNull ?? _cachedData;
    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    } else {
      state = const ViewState.loading();
    }

    final result = await _cancelBooking(CancelBookingParams(
      bookingId: bookingId,
      raison: raison,
    ));

    await result.fold(
      (failure) async {
        if (currentData != null) {
          state = ViewState.success(currentData);
        }
        showError(failure.message);
      },
      (_) async {
        showSuccess('Réservation annulée avec succès');
        // Forcer le rechargement pour mettre à jour la liste
        await load(forceRefresh: true);
      },
    );
  }
}
