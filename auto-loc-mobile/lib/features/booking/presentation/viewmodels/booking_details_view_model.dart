import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/booking.dart';
import '../../domain/usecases/get_booking_details.dart';
import '../../domain/usecases/cancel_booking.dart';
import '../../domain/usecases/checkin_booking.dart';
import '../../domain/usecases/checkout_booking.dart';
import '../../domain/usecases/upload_photos_etat_lieu.dart';
import '../../domain/usecases/confirm_booking.dart';
import '../../domain/usecases/refuse_checkin.dart';
import '../../domain/usecases/signal_tenant_noshow.dart';
import '../../domain/usecases/signal_overload.dart';
import '../states/booking_details_state.dart';

/// **BookingDetailsViewModel** - ViewModel pour les détails et actions d'une réservation
///
/// Gère le cycle de vie d'une réservation : confirmation, états des lieux (check-in, check-out),
/// annulations et signalement de litiges.
class BookingDetailsViewModel extends BaseViewModel<BookingDetailsData> {
  final GetBookingDetails _getBookingDetails;
  final CancelBooking _cancelBooking;
  final CheckinBooking _checkinBooking;
  final CheckoutBooking _checkoutBooking;
  final UploadPhotosEtatLieu _uploadPhotosEtatLieu;
  final ConfirmBooking _confirmBooking;
  final RefuseCheckin _refuseCheckin;
  final SignalTenantNoshow _signalTenantNoshow;
  final SignalOverload _signalOverload;

  String? _bookingId;

  BookingDetailsViewModel({
    required GetBookingDetails getBookingDetails,
    required CancelBooking cancelBooking,
    required CheckinBooking checkinBooking,
    required CheckoutBooking checkoutBooking,
    required UploadPhotosEtatLieu uploadPhotosEtatLieu,
    required ConfirmBooking confirmBooking,
    required RefuseCheckin refuseCheckin,
    required SignalTenantNoshow signalTenantNoshow,
    required SignalOverload signalOverload,
  })  : _getBookingDetails = getBookingDetails,
        _cancelBooking = cancelBooking,
        _checkinBooking = checkinBooking,
        _checkoutBooking = checkoutBooking,
        _uploadPhotosEtatLieu = uploadPhotosEtatLieu,
        _confirmBooking = confirmBooking,
        _refuseCheckin = refuseCheckin,
        _signalTenantNoshow = signalTenantNoshow,
        _signalOverload = signalOverload,
        super();

  /// **Initialiser le ViewModel avec l'ID de la réservation**
  void initialize(String id) {
    _bookingId = id;
    load();
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  @override
  Future<void> load() async {
    if (_bookingId == null) return;
    state = const ViewState.loading();

    try {
      final result = await _getBookingDetails(_bookingId!);

      result.fold(
        (failure) =>
            state = ViewState.failure(failure.message, code: failure.code),
        (booking) {
          state = ViewState.success(BookingDetailsData(booking: booking));
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
    }
  }

  // =========================================================================
  // ACTIONS CYCLE DE VIE
  // =========================================================================

  /// Confirmer la réservation (Propriétaire uniquement)
  Future<void> confirm({required String heureDebut}) async {
    if (_bookingId == null) return;
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.refreshing(currentData);

    final result = await _confirmBooking(
      bookingId: _bookingId!,
      heureDebut: heureDebut,
    );

    result.fold(
      (failure) {
        showError(failure.message);
        state = ViewState.success(currentData);
      },
      (updatedBooking) {
        showSuccess('Réservation confirmée avec succès');
        state = ViewState.success(currentData.copyWith(booking: updatedBooking));
      },
    );
  }

  /// Annuler la réservation
  Future<void> cancel({required String raison}) async {
    if (_bookingId == null) return;
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.refreshing(currentData);

    final result = await _cancelBooking(CancelBookingParams(
      bookingId: _bookingId!,
      raison: raison,
    ));

    result.fold(
      (failure) {
        showError(failure.message);
        state = ViewState.success(currentData);
      },
      (updatedBooking) {
        showSuccess('Réservation annulée');
        state = ViewState.success(currentData.copyWith(booking: updatedBooking));
      },
    );
  }

  /// Effectuer le Check-in (début de location)
  /// Upload d'abord les photos locales, puis effectue le check-in
  Future<void> performCheckin({required List<String> localPhotoPaths}) async {
    if (_bookingId == null || localPhotoPaths.isEmpty) return;
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.success(currentData.copyWith(
      isUploadingPhotos: true,
      uploadProgress: 0.1,
    ));

    // 1. Upload des photos d'état des lieux
    final uploadResult = await _uploadPhotosEtatLieu(
      UploadPhotosEtatLieuParams(
        bookingId: _bookingId!,
        photoPaths: localPhotoPaths,
        isCheckin: true,
      ),
    );

    await uploadResult.fold(
      (failure) async {
        showError('Échec de l\'upload des photos: ${failure.message}');
        state = ViewState.success(currentData.copyWith(
          isUploadingPhotos: false,
          uploadProgress: 0.0,
        ));
      },
      (remoteUrls) async {
        state = ViewState.success(currentData.copyWith(
          uploadProgress: 0.8,
        ));

        // 2. Finalisation du checkin avec les urls distantes
        final checkinResult = await _checkinBooking(
          CheckinBookingParams(
            bookingId: _bookingId!,
            photoUrls: remoteUrls,
          ),
        );

        checkinResult.fold(
          (failure) {
            showError(failure.message);
            state = ViewState.success(currentData.copyWith(
              isUploadingPhotos: false,
              uploadProgress: 0.0,
            ));
          },
          (updatedBooking) {
            showSuccess('Check-in validé avec succès');
            state = ViewState.success(currentData.copyWith(
              booking: updatedBooking,
              isUploadingPhotos: false,
              uploadProgress: 0.0,
            ));
          },
        );
      },
    );
  }

  /// Effectuer le Check-out (fin de location)
  /// Upload d'abord les photos locales, puis effectue le check-out
  Future<void> performCheckout({required List<String> localPhotoPaths}) async {
    if (_bookingId == null || localPhotoPaths.isEmpty) return;
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.success(currentData.copyWith(
      isUploadingPhotos: true,
      uploadProgress: 0.1,
    ));

    // 1. Upload des photos d'état des lieux de fin
    final uploadResult = await _uploadPhotosEtatLieu(
      UploadPhotosEtatLieuParams(
        bookingId: _bookingId!,
        photoPaths: localPhotoPaths,
        isCheckin: false,
      ),
    );

    await uploadResult.fold(
      (failure) async {
        showError('Échec de l\'upload des photos: ${failure.message}');
        state = ViewState.success(currentData.copyWith(
          isUploadingPhotos: false,
          uploadProgress: 0.0,
        ));
      },
      (remoteUrls) async {
        state = ViewState.success(currentData.copyWith(
          uploadProgress: 0.8,
        ));

        // 2. Finalisation du checkout avec les urls distantes
        final checkoutResult = await _checkoutBooking(
          CheckoutBookingParams(
            bookingId: _bookingId!,
            photoUrls: remoteUrls,
          ),
        );

        checkoutResult.fold(
          (failure) {
            showError(failure.message);
            state = ViewState.success(currentData.copyWith(
              isUploadingPhotos: false,
              uploadProgress: 0.0,
            ));
          },
          (updatedBooking) {
            showSuccess('Restitution du véhicule validée');
            state = ViewState.success(currentData.copyWith(
              booking: updatedBooking,
              isUploadingPhotos: false,
              uploadProgress: 0.0,
            ));
          },
        );
      },
    );
  }

  // =========================================================================
  // GESTION DES LITIGES ET INCIDENTS
  // =========================================================================

  /// Refuser le check-in pour non-conformité
  Future<void> refuseCheckin({
    required String motif,
    required String commentaire,
  }) async {
    if (_bookingId == null) return;
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.refreshing(currentData);

    final result = await _refuseCheckin(
      bookingId: _bookingId!,
      motif: motif,
      commentaire: commentaire,
    );

    result.fold(
      (failure) {
        showError(failure.message);
        state = ViewState.success(currentData);
      },
      (updatedBooking) {
        showWarning('Check-in refusé. Réservation passée en litige.');
        state = ViewState.success(currentData.copyWith(booking: updatedBooking));
      },
    );
  }

  /// Signaler l'absence du locataire (no-show)
  Future<void> signalNoShow({required String commentaire}) async {
    if (_bookingId == null) return;
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.refreshing(currentData);

    final result = await _signalTenantNoshow(
      bookingId: _bookingId!,
      commentaire: commentaire,
    );

    result.fold(
      (failure) {
        showError(failure.message);
        state = ViewState.success(currentData);
      },
      (updatedBooking) {
        showWarning('Non-présentation du locataire signalée.');
        state = ViewState.success(currentData.copyWith(booking: updatedBooking));
      },
    );
  }

  /// Signaler une surcharge (overload) ou bagages non conformes
  Future<void> signalOverload({
    required String motif,
    required String commentaire,
  }) async {
    if (_bookingId == null) return;
    final currentData = state.dataOrNull;
    if (currentData == null) return;

    state = ViewState.refreshing(currentData);

    final result = await _signalOverload(
      bookingId: _bookingId!,
      motif: motif,
      commentaire: commentaire,
    );

    result.fold(
      (failure) {
        showError(failure.message);
        state = ViewState.success(currentData);
      },
      (updatedBooking) {
        showWarning('Surcharge de passagers/bagages signalée.');
        state = ViewState.success(currentData.copyWith(booking: updatedBooking));
      },
    );
  }
}
