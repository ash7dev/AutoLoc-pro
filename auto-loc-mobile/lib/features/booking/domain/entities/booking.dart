import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/booking_status.dart';
import '../../../../shared/enums/checkin_source.dart';
import '../../../../shared/enums/payment_status.dart';
import '../../../../shared/enums/photo_categorie.dart';

part 'booking.freezed.dart';

/// Booking Entity (Reservation dans le backend)
///
/// Entité métier représentant une réservation de véhicule.
/// Synchronisée avec: apps/auto-loc-backend/prisma/schema.prisma (model Reservation)
///
/// Cette entité est immutable et contient toute la logique métier
/// liée aux réservations (calculs, validations, états).
@freezed
class Booking with _$Booking {
  const factory Booking({
    required String id,
    required String vehiculeId,
    required String locataireId,
    required String proprietaireId,
    required DateTime dateDebut,
    required DateTime dateFin,
    required double prixParJour,
    required double totalBase,
    required double tauxCommission,
    required double montantCommission,
    required double totalLocataire,
    required double netProprietaire,
    required BookingStatus statut,
    String? paymentUrl,
    required DateTime delaiSignature,
    String? annuleParId,
    DateTime? annuleLe,
    String? raisonAnnulation,
    DateTime? confirmeeLe,
    DateTime? checkinLe,
    DateTime? checkoutLe,
    DateTime? closeLe,
    @Default(false) bool updatedBySystem,
    required DateTime creeLe,
    required DateTime misAJourLe,
    String? contratPublicId,
    String? contratUrl,
    DateTime? checkinLocataireLe,
    DateTime? checkinProprietaireLe,
    String? adresseLivraison,
    double? fraisLivraison,
    @Default(false) bool horsDakar,
    double? supplementHorsDakar,
    DateTime? tacitCheckinDeadlineLe,
    CheckinSource? checkinLocataireSource,
    @Default(false) bool absenceSignalee,
    @Default(false) bool occupantsSignales,
    @Default(false) bool walletCredite,

    // Relations (optionnelles car pas toujours chargées)
    Payment? paiement,
    @Default([]) List<PhotoEtatLieu> photosEtatLieu,
  }) = _Booking;

  const Booking._();

  /// Durée de la location en jours
  int get nombreJours {
    return dateFin.difference(dateDebut).inDays;
  }

  /// Vérifie si la réservation est en attente de paiement
  bool get isPendingPayment => statut == BookingStatus.waitingPayment;

  /// Vérifie si la réservation est confirmée
  bool get isConfirmed => statut == BookingStatus.confirmed;

  /// Vérifie si la réservation est en cours
  bool get isActive => statut == BookingStatus.inProgress;

  /// Vérifie si la réservation est terminée
  bool get isCompleted => statut == BookingStatus.completed;

  /// Vérifie si la réservation est annulée
  bool get isCancelled => statut == BookingStatus.cancelled;

  /// Vérifie si la réservation peut être annulée
  bool get canCancel {
    return statut == BookingStatus.waitingPayment ||
        statut == BookingStatus.confirmed;
  }

  /// Vérifie si le check-in peut être effectué
  bool get canCheckin {
    if (statut != BookingStatus.confirmed) return false;
    final now = DateTime.now();
    // Check-in possible à partir de la date de début
    return now.isAfter(dateDebut.subtract(const Duration(hours: 2)));
  }

  /// Vérifie si le check-out peut être effectué
  bool get canCheckout {
    return statut == BookingStatus.inProgress && checkinLe != null;
  }

  /// Vérifie si les deux parties ont fait le check-in
  bool get bothCheckedIn {
    return checkinLocataireLe != null && checkinProprietaireLe != null;
  }

  /// Temps restant avant le délai de signature
  Duration? get tempsRestantSignature {
    final now = DateTime.now();
    if (now.isAfter(delaiSignature)) return null;
    return delaiSignature.difference(now);
  }

  /// Montant total formatté en FCFA
  String get totalFormatte {
    return '${totalLocataire.toStringAsFixed(0)} FCFA';
  }

  /// Prix par jour formatté en FCFA
  String get prixParJourFormatte {
    return '${prixParJour.toStringAsFixed(0)} FCFA/jour';
  }
}

/// Photo d'état des lieux
@freezed
class PhotoEtatLieu with _$PhotoEtatLieu {
  const factory PhotoEtatLieu({
    required String id,
    required String url,
    required bool estCheckin,
    String? publicId,
    PhotoCategorie? categorie,
    required DateTime creeLe,
  }) = _PhotoEtatLieu;
}

/// Paiement
@freezed
class Payment with _$Payment {
  const factory Payment({
    required String id,
    required String reservationId,
    required double montant,
    @Default('XOF') String devise,
    required String fournisseur,
    String? idTransactionFournisseur,
    required PaymentStatus statut,
    String? telephonePaiement,
    required DateTime creeLe,
    DateTime? rembourseLe,
    double? montantRembourse,
  }) = _Payment;

  const Payment._();

  /// Vérifie si le paiement est réussi
  bool get isSuccessful => statut == PaymentStatus.confirmed;

  /// Vérifie si le paiement est en attente
  bool get isPending => statut == PaymentStatus.pending;

  /// Vérifie si le paiement a échoué
  bool get isFailed => statut == PaymentStatus.failed;

  /// Vérifie si le paiement est remboursé
  bool get isRefunded => rembourseLe != null;

  /// Montant formatté
  String get montantFormatte {
    return '${montant.toStringAsFixed(0)} FCFA';
  }
}
