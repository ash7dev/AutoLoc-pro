import '../../../../core/utils/result.dart';
import '../entities/booking.dart';

/// Booking Repository Interface (Domain)
///
/// Définit le contrat pour accéder aux données des réservations.
/// Ne connaît RIEN de l'implémentation (Dio, API, cache, etc.).
/// L'implémentation se trouve dans la couche data.
///
/// Suit le principe de Dependency Inversion (SOLID):
/// - Le domain définit l'interface
/// - La data implémente l'interface
abstract class BookingRepository {
  /// Crée une nouvelle réservation
  ///
  /// Retourne:
  /// - Success: Réservation créée avec URL de paiement
  /// - Failure: ValidationFailure, ServerFailure, etc.
  Future<Result<Booking>> createBooking({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    required String fournisseur,
    required String targetPayment,
    required String payerPhone,
    String? adresseLivraison,
    bool? horsDakar,
  });

  /// Récupère les réservations du locataire connecté
  ///
  /// Retourne:
  /// - Success: Liste de réservations
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<List<Booking>>> getMyBookings({
    int? page,
    int? limit,
    String? statut,
  });

  /// Récupère les réservations en tant que propriétaire
  ///
  /// Retourne:
  /// - Success: Liste de réservations
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<List<Booking>>> getOwnerBookings({
    int? page,
    int? limit,
    String? statut,
  });

  /// Récupère une réservation par son ID
  ///
  /// Retourne:
  /// - Success: Réservation trouvée
  /// - Failure: NotFoundFailure si réservation inexistante
  Future<Result<Booking>> getBookingById(String id);

  /// Annule une réservation
  ///
  /// Retourne:
  /// - Success: Réservation annulée
  /// - Failure: BookingFailure si annulation impossible
  Future<Result<Booking>> cancelBooking({
    required String bookingId,
    required String raison,
  });

  /// Effectue le check-in (locataire ou propriétaire)
  ///
  /// Retourne:
  /// - Success: Réservation mise à jour
  /// - Failure: BookingFailure si check-in impossible
  Future<Result<Booking>> checkin({
    required String bookingId,
    required List<String> photoUrls,
  });

  /// Effectue le check-out
  ///
  /// Retourne:
  /// - Success: Réservation mise à jour
  /// - Failure: BookingFailure si check-out impossible
  Future<Result<Booking>> checkout({
    required String bookingId,
    required List<String> photoUrls,
  });

  /// Vérifie la disponibilité d'un véhicule pour une période
  ///
  /// Retourne:
  /// - Success: true si disponible, false sinon
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<bool>> checkAvailability({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
  });

  /// Calcule le coût total d'une réservation
  ///
  /// Retourne:
  /// - Success: Map avec les détails du coût
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<Map<String, dynamic>>> calculateCost({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    bool? horsDakar,
    bool? avecLivraison,
  });

  /// Upload des photos d'état des lieux
  ///
  /// Retourne:
  /// - Success: URLs des photos uploadées
  /// - Failure: ServerFailure, NetworkFailure, etc.
  Future<Result<List<String>>> uploadPhotosEtatLieu({
    required String bookingId,
    required List<String> photoPaths,
    required bool isCheckin,
  });

  /// Confirme une réservation (PAYEE → CONFIRMEE)
  ///
  /// Endpoint: PATCH /reservations/:id/confirm
  ///
  /// Retourne:
  /// - Success: Réservation confirmée
  /// - Failure: BookingFailure si confirmation impossible
  Future<Result<Booking>> confirm({
    required String bookingId,
    required String heureDebut,
  });

  /// Refuse le check-in (non-conformité véhicule)
  ///
  /// Endpoint: POST /reservations/:id/refus-checkin
  ///
  /// Retourne:
  /// - Success: Réservation passée en litige
  /// - Failure: BookingFailure si refus impossible
  Future<Result<Booking>> refuseCheckin({
    required String bookingId,
    required String motif,
    required String commentaire,
  });

  /// Signale que le locataire n'est pas venu (no-show)
  ///
  /// Endpoint: POST /reservations/:id/signal-noshow
  ///
  /// Retourne:
  /// - Success: No-show signalé
  /// - Failure: BookingFailure si signal impossible
  Future<Result<Booking>> signalTenantNoshow({
    required String bookingId,
    required String commentaire,
  });

  /// Signale un dépassement du nombre de voyageurs
  ///
  /// Endpoint: POST /reservations/:id/signal-overload
  ///
  /// Retourne:
  /// - Success: Overload signalé
  /// - Failure: BookingFailure si signal impossible
  Future<Result<Booking>> signalOverload({
    required String bookingId,
    required String motif,
    required String commentaire,
  });

  /// Récupère les documents KYC + permis du locataire
  ///
  /// Endpoint: GET /reservations/:id/locataire-docs
  ///
  /// Retourne:
  /// - Success: Documents du locataire
  /// - Failure: NotFoundFailure, NetworkFailure, etc.
  Future<Result<Map<String, dynamic>>> getLocataireDocs({
    required String bookingId,
  });
}
