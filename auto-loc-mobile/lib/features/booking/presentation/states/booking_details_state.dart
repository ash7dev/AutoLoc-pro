import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/booking.dart';

part 'booking_details_state.freezed.dart';

/// Type alias pour l'état des détails de la réservation
typedef BookingDetailsState = ViewState<BookingDetailsData>;

/// Données d'état pour la consultation d'une réservation spécifique
@freezed
class BookingDetailsData with _$BookingDetailsData {
  const factory BookingDetailsData({
    /// Réservation affichée
    required Booking booking,

    /// Statut de l'upload des photos d'état des lieux
    @Default(false) bool isUploadingPhotos,

    /// Progression de l'upload courant (0.0 à 1.0)
    @Default(0.0) double uploadProgress,
  }) = _BookingDetailsData;
}
