import 'package:dio/dio.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../dto/vehicle_dto.dart';

/// Vehicle Remote DataSource
///
/// Gère les appels API pour les véhicules.
/// Utilise Dio pour les requêtes HTTP.
/// Retourne des DTOs (pas des Entities!).
///
/// NE CONNAÎT PAS:
/// - Les Entities du domain
/// - Les règles métier
/// - Riverpod
///
/// CONNAÎT SEULEMENT:
/// - Dio
/// - Les endpoints API
/// - Les DTOs
abstract class VehicleRemoteDataSource {
  Future<List<VehicleDto>> getVehicles({
    int? page,
    int? limit,
    String? ville,
    String? type,
    double? prixMin,
    double? prixMax,
  });

  Future<VehicleDto> getVehicleById(String id);

  Future<List<VehicleDto>> searchVehicles({
    required String query,
    int? page,
    int? limit,
  });

  Future<List<VehicleDto>> getNearbyVehicles({
    required double latitude,
    required double longitude,
    double? radiusKm,
    int? limit,
  });

  Future<List<VehicleDto>> getFeaturedVehicles({int? limit});

  Future<List<VehicleDto>> getOwnerVehicles({
    required String proprietaireId,
    int? page,
    int? limit,
  });

  Future<bool> checkAvailability({
    required String vehicleId,
    required DateTime startDate,
    required DateTime endDate,
  });

  // NOUVELLES MÉTHODES SYNCHRONISÉES AVEC BACKEND

  Future<VehicleDto> createVehicle({
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

  Future<VehicleDto> updateVehicle({
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

  Future<VehicleDto> archiveVehicle(String vehicleId);

  Future<bool> deleteVehiclePermanently(String vehicleId);

  Future<List<VehicleDto>> getMyVehicles({int? limit});

  Future<Map<String, dynamic>> getMyVehiclesSummary();

  Future<List<VehicleDto>> searchVehiclesWithFilters({
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

  Future<Map<String, dynamic>> getHomeFeed();

  Future<Map<String, dynamic>> getMobileFeed();

  Future<Map<String, dynamic>> getUploadSignature();

  Future<List<Map<String, dynamic>>> getBlockedDates(String vehicleId);

  Future<Map<String, dynamic>> getPricing({
    required String vehicleId,
    required int days,
    bool? horsDakar,
  });

  Future<Map<String, dynamic>> createIndisponibilite({
    required String vehicleId,
    required DateTime dateDebut,
    required DateTime dateFin,
    String? motif,
  });

  Future<List<Map<String, dynamic>>> getIndisponibilites(String vehicleId);

  Future<bool> deleteIndisponibilite({
    required String vehicleId,
    required String indispoId,
  });

  Future<Map<String, dynamic>> addPhoto({
    required String vehicleId,
    required String imagePath,
  });

  Future<Map<String, dynamic>> linkPhoto({
    required String vehicleId,
    required String url,
    required String publicId,
  });

  Future<Map<String, dynamic>> updatePhoto({
    required String vehicleId,
    required String photoId,
    int? position,
    bool? estPrincipale,
  });

  Future<bool> deletePhoto({
    required String vehicleId,
    required String photoId,
  });
}

/// Implémentation de VehicleRemoteDataSource
class VehicleRemoteDataSourceImpl implements VehicleRemoteDataSource {
  final Dio _dio;

  VehicleRemoteDataSourceImpl(this._dio);

  @override
  Future<List<VehicleDto>> getVehicles({
    int? page,
    int? limit,
    String? ville,
    String? type,
    double? prixMin,
    double? prixMax,
  }) async {
    final queryParams = <String, dynamic>{
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
      if (ville != null) 'ville': ville,
      if (type != null) 'type': type,
      if (prixMin != null) 'prixMin': prixMin,
      if (prixMax != null) 'prixMax': prixMax,
    };

    final response = await _dio.get(
      ApiEndpoints.vehiclesFeedMobile, // Utilise le bon endpoint backend
      queryParameters: queryParams,
    );

    // Le backend retourne: { premium: [...], nouveautes: [...], topNotes: [...], ... }
    // On extrait tous les véhicules de toutes les catégories
    final List<dynamic> allVehicles = [];
    final categories = ['premium', 'nouveautes', 'topNotes', 'economiques', 'luxe', 'dakar', 'suvMoment', 'berlinesPopulaires'];
    
    for (final category in categories) {
      if (response.data[category] != null) {
        allVehicles.addAll(response.data[category]);
      }
    }
    
    return allVehicles.map((json) => VehicleDto.fromJson(json)).toList();
  }

  @override
  Future<VehicleDto> getVehicleById(String id) async {
    final response = await _dio.get(ApiEndpoints.vehicleById(id));

    // Le backend retourne directement l'objet ou { data: {...} }
    final json = response.data['data'] ?? response.data;
    return VehicleDto.fromJson(json);
  }

  @override
  Future<List<VehicleDto>> searchVehicles({
    required String query,
    int? page,
    int? limit,
  }) async {
    final queryParams = <String, dynamic>{
      'q': query,
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
    };

    final response = await _dio.get(
      ApiEndpoints.vehiclesSearch, // Endpoint correct du backend
      queryParameters: queryParams,
    );

    final List<dynamic> data = response.data['data'] ?? response.data;
    return data.map((json) => VehicleDto.fromJson(json)).toList();
  }

  @override
  Future<List<VehicleDto>> getNearbyVehicles({
    required double latitude,
    required double longitude,
    double? radiusKm,
    int? limit,
  }) async {
    // TODO: Vérifier si le backend a un endpoint pour nearby vehicles
    // Pour l'instant on utilise feed avec filtres
    final queryParams = <String, dynamic>{
      'lat': latitude,
      'lng': longitude,
      if (radiusKm != null) 'radius': radiusKm,
      if (limit != null) 'limit': limit,
    };

    final response = await _dio.get(
      ApiEndpoints.vehiclesFeedMobile,
      queryParameters: queryParams,
    );

    final List<dynamic> data = response.data['items'] ?? response.data['data'] ?? response.data;
    return data.map((json) => VehicleDto.fromJson(json)).toList();
  }

  @override
  Future<List<VehicleDto>> getFeaturedVehicles({int? limit}) async {
    // Featured vehicles sont dans le feed avec isFeatured=true
    final queryParams = <String, dynamic>{
      'featured': true,
      if (limit != null) 'limit': limit,
    };

    final response = await _dio.get(
      ApiEndpoints.vehiclesFeedMobile,
      queryParameters: queryParams,
    );

    final List<dynamic> data = response.data['items'] ?? response.data['data'] ?? response.data;
    return data.map((json) => VehicleDto.fromJson(json)).toList();
  }

  @override
  Future<List<VehicleDto>> getOwnerVehicles({
    required String proprietaireId,
    int? page,
    int? limit,
  }) async {
    final queryParams = <String, dynamic>{
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
    };

    // Utilise /vehicles/me pour les véhicules du propriétaire connecté
    final response = await _dio.get(
      ApiEndpoints.myVehicles, // Endpoint correct
      queryParameters: queryParams,
    );

    final List<dynamic> data = response.data['data'] ?? response.data;
    return data.map((json) => VehicleDto.fromJson(json)).toList();
  }

  @override
  Future<bool> checkAvailability({
    required String vehicleId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    // Utilise l'endpoint blocked-dates pour vérifier la disponibilité
    final response = await _dio.get(
      ApiEndpoints.vehicleBlockedDates(vehicleId),
      queryParameters: {
        'dateDebut': startDate.toIso8601String(),
        'dateFin': endDate.toIso8601String(),
      },
    );

    // Si pas de dates bloquées, le véhicule est disponible
    final List<dynamic> blockedDates = response.data['data'] ?? [];
    return blockedDates.isEmpty;
  }

  // NOUVELLES IMPLÉMENTATIONS SYNCHRONISÉES AVEC BACKEND

  @override
  Future<VehicleDto> createVehicle({
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
  }) async {
    final response = await _dio.post(
      '/vehicles',
      data: {
        'marque': marque,
        'modele': modele,
        'annee': annee,
        'type': type,
        'immatriculation': immatriculation,
        'prixParJour': prixParJour,
        'ville': ville,
        'adresse': adresse,
        if (carburant != null) 'carburant': carburant,
        if (transmission != null) 'transmission': transmission,
        if (nombrePlaces != null) 'nombrePlaces': nombrePlaces,
        if (joursMinimum != null) 'joursMinimum': joursMinimum,
        if (ageMinimum != null) 'ageMinimum': ageMinimum,
        if (assurance != null) 'assurance': assurance,
        if (reglesSpecifiques != null) 'reglesSpecifiques': reglesSpecifiques,
        if (zoneConduite != null) 'zoneConduite': zoneConduite,
        if (assuranceDocUrl != null) 'assuranceDocUrl': assuranceDocUrl,
        if (assuranceDocPublicId != null) 'assuranceDocPublicId': assuranceDocPublicId,
        if (carteGriseUrl != null) 'carteGriseUrl': carteGriseUrl,
        if (carteGrisePublicId != null) 'carteGrisePublicId': carteGrisePublicId,
        if (fraisLivraison != null) 'fraisLivraison': fraisLivraison,
        if (autoriseHorsDakar != null) 'autoriseHorsDakar': autoriseHorsDakar,
        if (supplementHorsDakarParJour != null) 'supplementHorsDakarParJour': supplementHorsDakarParJour,
        if (carburantCondition != null) 'carburantCondition': carburantCondition,
        if (equipements != null) 'equipements': equipements,
        if (tarifs != null) 'tarifs': tarifs,
        if (photos != null) 'photos': photos,
      },
    );
    return VehicleDto.fromJson(response.data);
  }

  @override
  Future<VehicleDto> updateVehicle({
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
  }) async {
    final response = await _dio.patch(
      '/vehicles/$vehicleId',
      data: {
        if (marque != null) 'marque': marque,
        if (modele != null) 'modele': modele,
        if (annee != null) 'annee': annee,
        if (type != null) 'type': type,
        if (carburant != null) 'carburant': carburant,
        if (transmission != null) 'transmission': transmission,
        if (nombrePlaces != null) 'nombrePlaces': nombrePlaces,
        if (immatriculation != null) 'immatriculation': immatriculation,
        if (prixParJour != null) 'prixParJour': prixParJour,
        if (ville != null) 'ville': ville,
        if (adresse != null) 'adresse': adresse,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (joursMinimum != null) 'joursMinimum': joursMinimum,
        if (ageMinimum != null) 'ageMinimum': ageMinimum,
        if (assurance != null) 'assurance': assurance,
        if (reglesSpecifiques != null) 'reglesSpecifiques': reglesSpecifiques,
        if (zoneConduite != null) 'zoneConduite': zoneConduite,
        if (assuranceDocUrl != null) 'assuranceDocUrl': assuranceDocUrl,
        if (assuranceDocPublicId != null) 'assuranceDocPublicId': assuranceDocPublicId,
        if (carteGriseUrl != null) 'carteGriseUrl': carteGriseUrl,
        if (carteGrisePublicId != null) 'carteGrisePublicId': carteGrisePublicId,
        if (fraisLivraison != null) 'fraisLivraison': fraisLivraison,
        if (autoriseHorsDakar != null) 'autoriseHorsDakar': autoriseHorsDakar,
        if (supplementHorsDakarParJour != null) 'supplementHorsDakarParJour': supplementHorsDakarParJour,
        if (carburantCondition != null) 'carburantCondition': carburantCondition,
        if (equipements != null) 'equipements': equipements,
        if (tarifs != null) 'tarifs': tarifs,
      },
    );
    return VehicleDto.fromJson(response.data);
  }

  @override
  Future<VehicleDto> archiveVehicle(String vehicleId) async {
    final response = await _dio.delete('/vehicles/$vehicleId');
    return VehicleDto.fromJson(response.data);
  }

  @override
  Future<bool> deleteVehiclePermanently(String vehicleId) async {
    await _dio.delete('/vehicles/$vehicleId/purge');
    return true;
  }

  @override
  Future<List<VehicleDto>> getMyVehicles({int? limit}) async {
    final queryParams = <String, dynamic>{};
    if (limit != null) queryParams['limit'] = limit;

    final response = await _dio.get(
      '/vehicles/me',
      queryParameters: queryParams,
    );
    final List<dynamic> data = response.data['data'] ?? response.data;
    return data.map((json) => VehicleDto.fromJson(json)).toList();
  }

  @override
  Future<Map<String, dynamic>> getMyVehiclesSummary() async {
    final response = await _dio.get('/vehicles/me/summary');
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<List<VehicleDto>> searchVehiclesWithFilters({
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
  }) async {
    final queryParams = <String, dynamic>{
      if (ville != null) 'ville': ville,
      if (type != null) 'type': type,
      if (dateDebut != null) 'dateDebut': dateDebut.toIso8601String(),
      if (dateFin != null) 'dateFin': dateFin.toIso8601String(),
      if (joursMinimum != null) 'joursMinimum': joursMinimum,
      if (prixMin != null) 'prixMin': prixMin,
      if (prixMax != null) 'prixMax': prixMax,
      if (horsDakar != null) 'horsDakar': horsDakar,
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
    };

    final response = await _dio.get(
      '/vehicles/search',
      queryParameters: queryParams,
    );
    final List<dynamic> data = response.data['data'] ?? response.data;
    return data.map((json) => VehicleDto.fromJson(json)).toList();
  }

  @override
  Future<Map<String, dynamic>> getHomeFeed() async {
    final response = await _dio.get('/vehicles/feed');
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<Map<String, dynamic>> getMobileFeed() async {
    final response = await _dio.get('/vehicles/feed/mobile');
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<Map<String, dynamic>> getUploadSignature() async {
    final response = await _dio.get('/vehicles/upload-signature');
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<List<Map<String, dynamic>>> getBlockedDates(String vehicleId) async {
    final response = await _dio.get('/vehicles/$vehicleId/blocked-dates');
    final List<dynamic> data = response.data['blockedRanges'] ?? response.data['data'] ?? response.data;
    return data.map((json) => Map<String, dynamic>.from(json)).toList();
  }

  @override
  Future<Map<String, dynamic>> getPricing({
    required String vehicleId,
    required int days,
    bool? horsDakar,
  }) async {
    final queryParams = <String, dynamic>{
      'days': days,
      if (horsDakar != null) 'horsDakar': horsDakar,
    };
    final response = await _dio.get(
      '/vehicles/$vehicleId/pricing',
      queryParameters: queryParams,
    );
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<Map<String, dynamic>> createIndisponibilite({
    required String vehicleId,
    required DateTime dateDebut,
    required DateTime dateFin,
    String? motif,
  }) async {
    final response = await _dio.post(
      '/vehicles/$vehicleId/indisponibilites',
      data: {
        'dateDebut': dateDebut.toIso8601String(),
        'dateFin': dateFin.toIso8601String(),
        if (motif != null) 'motif': motif,
      },
    );
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<List<Map<String, dynamic>>> getIndisponibilites(String vehicleId) async {
    final response = await _dio.get('/vehicles/$vehicleId/indisponibilites');
    final List<dynamic> data = response.data['data'] ?? response.data;
    return data.map((json) => Map<String, dynamic>.from(json)).toList();
  }

  @override
  Future<bool> deleteIndisponibilite({
    required String vehicleId,
    required String indispoId,
  }) async {
    await _dio.delete('/vehicles/$vehicleId/indisponibilites/$indispoId');
    return true;
  }

  @override
  Future<Map<String, dynamic>> addPhoto({
    required String vehicleId,
    required String imagePath,
  }) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(imagePath),
    });
    final response = await _dio.post(
      '/vehicles/$vehicleId/photos',
      data: formData,
    );
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<Map<String, dynamic>> linkPhoto({
    required String vehicleId,
    required String url,
    required String publicId,
  }) async {
    final response = await _dio.post(
      '/vehicles/$vehicleId/photos/link',
      data: {
        'url': url,
        'publicId': publicId,
      },
    );
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<Map<String, dynamic>> updatePhoto({
    required String vehicleId,
    required String photoId,
    int? position,
    bool? estPrincipale,
  }) async {
    final response = await _dio.patch(
      '/vehicles/$vehicleId/photos/$photoId',
      data: {
        if (position != null) 'position': position,
        if (estPrincipale != null) 'estPrincipale': estPrincipale,
      },
    );
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Future<bool> deletePhoto({
    required String vehicleId,
    required String photoId,
  }) async {
    await _dio.delete('/vehicles/$vehicleId/photos/$photoId');
    return true;
  }
}
