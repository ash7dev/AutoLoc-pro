import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../entities/vehicle.dart';

/// Vehicle Repository Interface (Domain)
///
/// Définit le contrat pour accéder aux données des véhicules.
/// Ne connaît RIEN de l'implémentation (Dio, API, cache, etc.).
/// L'implémentation se trouve dans la couche data.
///
/// Suit le principe de Dependency Inversion (SOLID):
/// - Le domain définit l'interface
/// - La data implémente l'interface
abstract class VehicleRepository {
  /// Récupère la liste de tous les véhicules disponibles
  ///
  /// Retourne:
  /// - Success: Liste de véhicules
  /// - Failure: NetworkFailure, ServerFailure, etc.
  Future<Result<List<Vehicle>>> getVehicles({
    int? page,
    int? limit,
    String? ville,
    String? type,
    double? prixMin,
    double? prixMax,
  });

  /// Récupère un véhicule par son ID
  ///
  /// Retourne:
  /// - Success: Véhicule trouvé
  /// - Failure: NotFoundFailure si véhicule inexistant
  Future<Result<Vehicle>> getVehicleById(String id);

  /// Recherche des véhicules par critères
  ///
  /// Retourne:
  /// - Success: Liste de véhicules correspondants
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<List<Vehicle>>> searchVehicles({
    required String query,
    int? page,
    int? limit,
  });

  /// Récupère les véhicules à proximité d'une position
  ///
  /// Utilise la géolocalisation pour trouver les véhicules proches.
  ///
  /// Retourne:
  /// - Success: Liste de véhicules triés par distance
  /// - Failure: NetworkFailure, LocationFailure, etc.
  Future<Result<List<Vehicle>>> getNearbyVehicles({
    required double latitude,
    required double longitude,
    double? radiusKm,
    int? limit,
  });

  /// Récupère les véhicules mis en avant (featured)
  ///
  /// Retourne:
  /// - Success: Liste de véhicules featured
  /// - Failure: NetworkFailure, etc.
  Future<Result<List<Vehicle>>> getFeaturedVehicles({
    int? limit,
  });

  /// Récupère les véhicules d'un propriétaire
  ///
  /// Retourne:
  /// - Success: Liste de véhicules du propriétaire
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<List<Vehicle>>> getOwnerVehicles({
    required String proprietaireId,
    int? page,
    int? limit,
  });

  /// Vérifie la disponibilité d'un véhicule pour une période
  ///
  /// Retourne:
  /// - Success: true si disponible, false sinon
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<bool>> checkAvailability({
    required String vehicleId,
    required DateTime startDate,
    required DateTime endDate,
  });

  /// Crée un nouveau véhicule (PROPRIETAIRE)
  ///
  /// Endpoint: POST /vehicles
  ///
  /// Retourne:
  /// - Success: Véhicule créé
  /// - Failure: ValidationFailure, UnauthorizedFailure, etc.
  Future<Result<Vehicle>> createVehicle({
    required String marque,
    required String modele,
    required int annee,
    required String type,
    required String immatriculation,
    required double prixParJour,
    required String ville,
    required String adresse,
    String? carburant,
    String? transmission,
    int? nombrePlaces,
    int? joursMinimum,
    int? ageMinimum,
    String? assurance,
    String? reglesSpecifiques,
    String? zoneConduite,
    String? assuranceDocUrl,
    String? assuranceDocPublicId,
    String? carteGriseUrl,
    String? carteGrisePublicId,
    double? fraisLivraison,
    bool? autoriseHorsDakar,
    double? supplementHorsDakarParJour,
    String? carburantCondition,
    List<String>? equipements,
    List<Map<String, dynamic>>? tarifs,
    List<Map<String, dynamic>>? photos,
  });

  /// Modifie un véhicule (PROPRIETAIRE)
  ///
  /// Endpoint: PATCH /vehicles/:id
  ///
  /// Retourne:
  /// - Success: Véhicule modifié
  /// - Failure: ValidationFailure, UnauthorizedFailure, etc.
  Future<Result<Vehicle>> updateVehicle({
    required String vehicleId,
    String? marque,
    String? modele,
    int? annee,
    String? type,
    String? carburant,
    String? transmission,
    int? nombrePlaces,
    String? immatriculation,
    double? prixParJour,
    String? ville,
    String? adresse,
    double? latitude,
    double? longitude,
    int? joursMinimum,
    int? ageMinimum,
    String? assurance,
    String? reglesSpecifiques,
    String? zoneConduite,
    String? assuranceDocUrl,
    String? assuranceDocPublicId,
    String? carteGriseUrl,
    String? carteGrisePublicId,
    double? fraisLivraison,
    bool? autoriseHorsDakar,
    double? supplementHorsDakarParJour,
    String? carburantCondition,
    List<String>? equipements,
    List<Map<String, dynamic>>? tarifs,
  });

  /// Archive un véhicule (statut → ARCHIVE)
  ///
  /// Endpoint: DELETE /vehicles/:id
  ///
  /// Retourne:
  /// - Success: Véhicule archivé
  /// - Failure: UnauthorizedFailure, NotFoundFailure, etc.
  Future<Result<Vehicle>> archiveVehicle(String vehicleId);

  /// Supprime définitivement un véhicule (BROUILLON / ARCHIVE uniquement)
  ///
  /// Endpoint: DELETE /vehicles/:id/purge
  ///
  /// Retourne:
  /// - Success: true si supprimé
  /// - Failure: UnauthorizedFailure, ValidationFailure, etc.
  Future<Result<bool>> deleteVehiclePermanently(String vehicleId);

  /// Récupère les véhicules du propriétaire connecté
  ///
  /// Endpoint: GET /vehicles/me
  ///
  /// Retourne:
  /// - Success: Liste de véhicules du propriétaire
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<List<Vehicle>>> getMyVehicles({
    int? limit,
  });

  /// Récupère le résumé des véhicules du propriétaire
  ///
  /// Endpoint: GET /vehicles/me/summary
  ///
  /// Retourne:
  /// - Success: Résumé avec statistiques
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<Map<String, dynamic>>> getMyVehiclesSummary();

  /// Recherche de véhicules avec filtres
  ///
  /// Endpoint: GET /vehicles/search
  ///
  /// Retourne:
  /// - Success: Liste de véhicules filtrés
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<List<Vehicle>>> searchVehiclesWithFilters({
    String? ville,
    String? type,
    DateTime? dateDebut,
    DateTime? dateFin,
    int? joursMinimum,
    double? prixMin,
    double? prixMax,
    bool? horsDakar,
    int? page,
    int? limit,
  });

  /// Récupère le feed home (premium, nouveautés, recommandé)
  ///
  /// Endpoint: GET /vehicles/feed
  ///
  /// Retourne:
  /// - Success: Feed avec sections
  /// - Failure: NetworkFailure, etc.
  Future<Result<Map<String, dynamic>>> getHomeFeed();

  /// Récupère le feed mobile ultra-complet
  ///
  /// Endpoint: GET /vehicles/feed/mobile
  ///
  /// Retourne:
  /// - Success: Feed mobile avec 10 sections
  /// - Failure: NetworkFailure, etc.
  Future<Result<Map<String, dynamic>>> getMobileFeed();

  /// Obtient une signature Cloudinary pour upload direct
  ///
  /// Endpoint: GET /vehicles/upload-signature
  ///
  /// Retourne:
  /// - Success: Signature Cloudinary
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<Map<String, dynamic>>> getUploadSignature();

  /// Récupère les dates indisponibles d'un véhicule
  ///
  /// Endpoint: GET /vehicles/:id/blocked-dates
  ///
  /// Retourne:
  /// - Success: Liste de périodes bloquées
  /// - Failure: NetworkFailure, NotFoundFailure, etc.
  Future<Result<List<Map<String, dynamic>>>> getBlockedDates(String vehicleId);

  /// Prévisualisation du tarif dynamique
  ///
  /// Endpoint: GET /vehicles/:id/pricing?days=N&horsDakar=true
  ///
  /// Retourne:
  /// - Success: Détails du tarif
  /// - Failure: NetworkFailure, ValidationFailure, etc.
  Future<Result<Map<String, dynamic>>> getPricing({
    required String vehicleId,
    required int days,
    bool? horsDakar,
  });

  /// Crée une période d'indisponibilité
  ///
  /// Endpoint: POST /vehicles/:id/indisponibilites
  ///
  /// Retourne:
  /// - Success: Période créée
  /// - Failure: ValidationFailure, UnauthorizedFailure, etc.
  Future<Result<Map<String, dynamic>>> createIndisponibilite({
    required String vehicleId,
    required DateTime dateDebut,
    required DateTime dateFin,
    String? motif,
  });

  /// Liste les périodes d'indisponibilité d'un véhicule
  ///
  /// Endpoint: GET /vehicles/:id/indisponibilites
  ///
  /// Retourne:
  /// - Success: Liste de périodes
  /// - Failure: NetworkFailure, UnauthorizedFailure, etc.
  Future<Result<List<Map<String, dynamic>>>> getIndisponibilites(String vehicleId);

  /// Supprime une période d'indisponibilité
  ///
  /// Endpoint: DELETE /vehicles/:id/indisponibilites/:indispoId
  ///
  /// Retourne:
  /// - Success: true si supprimé
  /// - Failure: UnauthorizedFailure, NotFoundFailure, etc.
  Future<Result<bool>> deleteIndisponibilite({
    required String vehicleId,
    required String indispoId,
  });

  /// Ajoute une photo à un véhicule
  ///
  /// Endpoint: POST /vehicles/:id/photos
  ///
  /// Retourne:
  /// - Success: Photo ajoutée
  /// - Failure: ValidationFailure, UnauthorizedFailure, etc.
  Future<Result<Map<String, dynamic>>> addPhoto({
    required String vehicleId,
    required String imagePath,
  });

  /// Lie une photo uploadée directement vers Cloudinary
  ///
  /// Endpoint: POST /vehicles/:id/photos/link
  ///
  /// Retourne:
  /// - Success: Photo liée
  /// - Failure: ValidationFailure, UnauthorizedFailure, etc.
  Future<Result<Map<String, dynamic>>> linkPhoto({
    required String vehicleId,
    required String url,
    required String publicId,
  });

  /// Modifie une photo (position / photo principale)
  ///
  /// Endpoint: PATCH /vehicles/:id/photos/:photoId
  ///
  /// Retourne:
  /// - Success: Photo modifiée
  /// - Failure: ValidationFailure, UnauthorizedFailure, etc.
  Future<Result<Map<String, dynamic>>> updatePhoto({
    required String vehicleId,
    required String photoId,
    int? position,
    bool? estPrincipale,
  });

  /// Supprime une photo d'un véhicule
  ///
  /// Endpoint: DELETE /vehicles/:id/photos/:photoId
  ///
  /// Retourne:
  /// - Success: true si supprimée
  /// - Failure: UnauthorizedFailure, NotFoundFailure, etc.
  Future<Result<bool>> deletePhoto({
    required String vehicleId,
    required String photoId,
  });
}
