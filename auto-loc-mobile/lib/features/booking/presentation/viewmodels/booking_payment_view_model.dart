import 'dart:async';

import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/payment_status.dart';
import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/enums/booking_status.dart';
import '../../domain/entities/booking.dart';
import '../../domain/usecases/calculate_cost.dart';
import '../../domain/usecases/create_booking.dart';
import '../../domain/usecases/get_booking_details.dart';
import '../states/booking_payment_state.dart';

/// **BookingPaymentViewModel** - ViewModel pour le flow de réservation et paiement (Checkout)
///
/// Permet de calculer le devis d'une location, créer la réservation,
/// et gérer l'intégration des paiements Wave / Orange Money.
class BookingPaymentViewModel extends BaseViewModel<BookingPaymentData> {
  final CalculateCost _calculateCost;
  final CreateBooking _createBooking;
  final GetBookingDetails _getBookingDetails;

  Timer? _pollingTimer;

  BookingPaymentViewModel({
    required CalculateCost calculateCost,
    required CreateBooking createBooking,
    required GetBookingDetails getBookingDetails,
  })  : _calculateCost = calculateCost,
        _createBooking = createBooking,
        _getBookingDetails = getBookingDetails,
        super();

  /// **Initialiser le flow de checkout avec le véhicule et les dates**
  void initialize({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    bool horsDakar = false,
    String? adresseLivraison,
  }) {
    state = ViewState.success(BookingPaymentData(
      vehiculeId: vehiculeId,
      dateDebut: dateDebut,
      dateFin: dateFin,
      horsDakar: horsDakar,
      adresseLivraison: adresseLivraison,
    ));

    // Calculer le coût immédiatement
    getCostEstimation();
  }

  // =========================================================================
  // LIFECYCLE & CLEANUP
  // =========================================================================

  @override
  Future<void> load() async {
    // L'initialisation est explicite via initialize()
  }

  @override
  void dispose() {
    stopStatusPolling();
    super.dispose();
  }

  // =========================================================================
  // LOGIQUE ESTIMATION DU COÛT
  // =========================================================================

  /// Récupère l'estimation détaillée des coûts de location
  Future<void> getCostEstimation() async {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.refreshing(currentData);

    final result = await _calculateCost(CalculateCostParams(
      vehiculeId: currentData.vehiculeId,
      dateDebut: currentData.dateDebut,
      dateFin: currentData.dateFin,
      horsDakar: currentData.horsDakar,
      avecLivraison: currentData.adresseLivraison != null,
    ));

    result.fold(
      (failure) {
        state = ViewState.failure(failure.message, code: failure.code);
      },
      (costMap) {
        final fraisLiv = costMap['fraisLivraison'] != null
            ? (costMap['fraisLivraison'] as num).toDouble()
            : null;
        state = ViewState.success(currentData.copyWith(
          calculatedCost: costMap,
          fraisLivraison: fraisLiv,
        ));
      },
    );
  }

  /// Basculer l'option de conduite hors de Dakar
  void toggleHorsDakar(bool value) {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.success(currentData.copyWith(
      horsDakar: value,
    ));

    getCostEstimation();
  }

  /// Modifier l'adresse de livraison
  void updateAdresseLivraison(String? adresse) {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.success(currentData.copyWith(
      adresseLivraison: adresse,
    ));

    getCostEstimation();
  }

  // =========================================================================
  // CRÉATION DE LA RÉSERVATION & INITIATION DU PAIEMENT
  // =========================================================================

  /// Crée la réservation en BD puis redirige vers l'url de paiement
  Future<void> confirmAndPay({
    required PaymentProvider provider,
    required String payerPhone,
  }) async {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.refreshing(currentData);

    final fournisseurString = provider == PaymentProvider.wave ? 'WAVE' : 'ORANGE_MONEY';

    // 1. Création de la réservation (Booking) qui gère aussi l'initiation du paiement
    final createResult = await _createBooking(CreateBookingParams(
      vehiculeId: currentData.vehiculeId,
      dateDebut: currentData.dateDebut,
      dateFin: currentData.dateFin,
      fournisseur: fournisseurString,
      targetPayment: fournisseurString,
      payerPhone: payerPhone,
      adresseLivraison: currentData.adresseLivraison,
      horsDakar: currentData.horsDakar,
    ));

    await createResult.fold(
      (failure) async {
        showError(failure.message);
        state = ViewState.success(currentData);
      },
      (booking) async {
        showSuccess('Réservation créée avec succès.');
        state = ViewState.success(currentData.copyWith(
          booking: booking,
          paymentStatus: PaymentStatus.pending,
        ));

        // Si l'API retourne un paymentUrl, on l'ouvre
        if (booking.paymentUrl != null && booking.paymentUrl!.isNotEmpty) {
          openUrl(booking.paymentUrl!);
        }

        // Démarrer la vérification de statut en tâche de fond (polling)
        startStatusPolling(booking.id);
      },
    );
  }

  // =========================================================================
  // VÉRIFICATION DU PAIEMENT (POLLING)
  // =========================================================================

  /// Démarre la vérification automatique du paiement toutes les 5 secondes
  void startStatusPolling(String reservationId) {
    stopStatusPolling();

    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      await verifyPaymentStatus(reservationId);
    });
  }

  /// Arrête le polling de vérification de paiement
  void stopStatusPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  /// Vérifie manuellement ou via polling le statut du paiement
  Future<void> verifyPaymentStatus(String reservationId) async {
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    final result = await _getBookingDetails(reservationId);

    result.fold(
      (failure) {
        // En cas d'erreur de requête, on n'arrête pas le polling mais on trace
      },
      (booking) {
        final status = switch (booking.statut) {
          BookingStatus.waitingPayment => PaymentStatus.pending,
          BookingStatus.paid ||
          BookingStatus.confirmed ||
          BookingStatus.inProgress ||
          BookingStatus.completed =>
            PaymentStatus.confirmed,
          BookingStatus.cancelled => PaymentStatus.failed,
          _ => PaymentStatus.pending,
        };

        if (status != currentData.paymentStatus) {
          state = ViewState.success(currentData.copyWith(
            paymentStatus: status,
            booking: booking,
          ));

          if (status == PaymentStatus.confirmed) {
            stopStatusPolling();
            showSuccess('Paiement confirmé avec succès !');
            // Rediriger vers l'écran de succès
            navigateTo('/payment/success');
          } else if (status == PaymentStatus.failed) {
            stopStatusPolling();
            showError('Le paiement a échoué. Veuillez réessayer.');
            navigateTo('/payment/failed');
          }
        }
      },
    );
  }
}
