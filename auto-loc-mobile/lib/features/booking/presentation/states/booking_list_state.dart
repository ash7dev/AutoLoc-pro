import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/booking.dart';

part 'booking_list_state.freezed.dart';

/// Type alias pour l'état de la liste des réservations
typedef BookingListState = ViewState<BookingListData>;

/// Données d'état pour la liste des réservations locataire / propriétaire
@freezed
class BookingListData with _$BookingListData {
  const factory BookingListData({
    /// Réservations effectuées en tant que locataire
    @Default([]) List<Booking> tenantBookings,

    /// Réservations reçues en tant que propriétaire
    @Default([]) List<Booking> ownerBookings,

    /// Filtre de statut de réservation sélectionné (ALL, WAITING, CONFIRMED, etc.)
    @Default('ALL') String selectedFilter,
  }) = _BookingListData;
}
