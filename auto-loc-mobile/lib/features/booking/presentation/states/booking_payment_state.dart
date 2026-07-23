import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/payment_status.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../payment/domain/entities/payment_initiation.dart';
import '../../domain/entities/booking.dart';

part 'booking_payment_state.freezed.dart';

/// Type alias pour l'état du checkout/paiement de la réservation
typedef BookingPaymentState = ViewState<BookingPaymentData>;

/// Données d'état pour le flow de création de réservation et son paiement
@freezed
class BookingPaymentData with _$BookingPaymentData {
  const factory BookingPaymentData({
    /// ID du véhicule à louer
    required String vehiculeId,

    /// Date de début de location
    required DateTime dateDebut,

    /// Date de fin de location
    required DateTime dateFin,

    /// Conduite autorisée hors Dakar
    @Default(false) bool horsDakar,

    /// Adresse de livraison optionnelle
    String? adresseLivraison,

    /// Frais de livraison calculés
    double? fraisLivraison,

    /// Détails du coût calculé (devis)
    Map<String, dynamic>? calculatedCost,

    /// Réservation créée (si validée)
    Booking? booking,

    /// Détails de l'initiation du paiement (Wave/Orange Money)
    PaymentInitiation? paymentInitiation,

    /// Statut actuel du paiement
    PaymentStatus? paymentStatus,
  }) = _BookingPaymentData;
}
