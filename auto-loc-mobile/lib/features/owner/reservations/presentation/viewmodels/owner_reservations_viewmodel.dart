import '../../../../../shared/presentation/base/base_view_model.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/owner_reservation.dart';
import '../../domain/usecases/get_my_reservations.dart';
import '../widgets/reservation_status_filter.dart';

/// ViewModel pour la gestion des réservations Owner
class OwnerReservationsViewModel
    extends BaseViewModel<List<OwnerReservation>> {
  final GetMyReservations _getMyReservations;

  OwnerReservationsViewModel({
    required GetMyReservations getMyReservations,
  }) : _getMyReservations = getMyReservations;

  // Filtres actifs
  String? _selectedVehiculeId;
  ReservationStatus _selectedStatus = ReservationStatus.all;

  // Données brutes (non filtrées)
  List<OwnerReservation> _allReservations = [];

  /// Charge les réservations depuis l'API
  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await _getMyReservations(
      vehiculeId: _selectedVehiculeId,
    );

    result.fold(
      (failure) {
        state = ViewState.failure(failure.message, code: failure.code);
      },
      (reservations) {
        _allReservations = reservations;
        final filtered = _applyStatusFilter(reservations);

        if (filtered.isEmpty) {
          state = const ViewState.empty(message: 'Aucune réservation');
        } else {
          state = ViewState.success(filtered);
        }
      },
    );
  }

  /// Rafraîchit les réservations (pull-to-refresh)
  @override
  Future<void> refresh() async {
    final currentData = state.dataOrNull;
    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    }

    final result = await _getMyReservations(
      vehiculeId: _selectedVehiculeId,
    );

    result.fold(
      (failure) {
        state = ViewState.failure(failure.message, code: failure.code);
      },
      (reservations) {
        _allReservations = reservations;
        final filtered = _applyStatusFilter(reservations);

        if (filtered.isEmpty) {
          state = const ViewState.empty(message: 'Aucune réservation');
        } else {
          state = ViewState.success(filtered);
        }
      },
    );
  }

  /// Filtre par statut de réservation
  void filterByStatus(ReservationStatus status) {
    _selectedStatus = status;

    // Applique le filtre sur les données existantes
    final filtered = _applyStatusFilter(_allReservations);

    // Met à jour l'état avec les données filtrées
    if (filtered.isEmpty) {
      state = const ViewState.empty(message: 'Aucune réservation pour ce filtre');
    } else {
      state = ViewState.success(filtered);
    }
  }

  /// Filtre par véhicule
  void filterByVehicle(String? vehiculeId) {
    _selectedVehiculeId = vehiculeId;
    load(); // Recharge depuis l'API avec le nouveau filtre
  }

  /// Applique le filtre de statut sur une liste de réservations
  List<OwnerReservation> _applyStatusFilter(
    List<OwnerReservation> reservations,
  ) {
    switch (_selectedStatus) {
      case ReservationStatus.all:
        return reservations;

      case ReservationStatus.ongoing:
        return reservations.where((r) => r.isEnCours).toList();

      case ReservationStatus.completed:
        return reservations.where((r) => r.isTerminee).toList();

      case ReservationStatus.cancelled:
        return reservations.where((r) => r.isAnnulee).toList();

      case ReservationStatus.dispute:
        return reservations.where((r) => r.isLitige).toList();
    }
  }

  /// Confirme une réservation (action rapide depuis la liste)
  Future<void> confirmReservation(String reservationId) async {
    // TODO: Implémenter avec le usecase approprié
    // Pour l'instant, on recharge juste la liste
    await refresh();
  }

  /// Annule une réservation (action rapide depuis la liste)
  Future<void> cancelReservation(String reservationId, String raison) async {
    // TODO: Implémenter avec le usecase approprié
    await refresh();
  }

  /// Getters pour l'UI
  ReservationStatus get selectedStatus => _selectedStatus;
  String? get selectedVehiculeId => _selectedVehiculeId;

  /// Nombre de réservations filtrées
  int get reservationsCount {
    return state.maybeWhen(
      success: (data) => data.length,
      orElse: () => 0,
    );
  }

  /// Statistiques rapides
  int get totalReservations => _allReservations.length;
  int get ongoingCount =>
      _allReservations.where((r) => r.isEnCours).length;
  int get completedCount =>
      _allReservations.where((r) => r.isTerminee).length;
  int get cancelledCount =>
      _allReservations.where((r) => r.isAnnulee).length;
  int get disputeCount =>
      _allReservations.where((r) => r.isLitige).length;
}
