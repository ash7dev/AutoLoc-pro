import 'package:dio/dio.dart';

import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/errors/exceptions.dart';
import '../../domain/entities/vehicle.dart';
import '../../domain/repositories/vehicle_repository.dart';
import '../datasources/vehicle_remote_datasource.dart';
import '../mappers/vehicle_mapper.dart';

/// Vehicle Repository Implementation
///
/// Implémente VehicleRepository (interface du domain).
/// Orchestre les DataSources et les Mappers.
/// Convertit les Exceptions en Failures.
///
/// Flow:
/// Repository → DataSource → DTO → Mapper → Entity → Domain
class VehicleRepositoryImpl implements VehicleRepository {
  final VehicleRemoteDataSource _remoteDataSource;
  // TODO: Ajouter VehicleLocalDataSource pour le cache

  VehicleRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<List<Vehicle>>> getVehicles({
    int? page,
    int? limit,
    String? ville,
    String? type,
    double? prixMin,
    double? prixMax,
  }) async {
    try {
      final dtos = await _remoteDataSource.getVehicles(
        page: page,
        limit: limit,
        ville: ville,
        type: type,
        prixMin: prixMin,
        prixMax: prixMax,
      );

      // Convertir DTOs → Entities
      final vehicles = dtos.map(VehicleMapper.toEntity).toList();

      return success(vehicles);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Vehicle>> getVehicleById(String id) async {
    try {
      final dto = await _remoteDataSource.getVehicleById(id);
      final vehicle = VehicleMapper.toEntity(dto);
      return success(vehicle);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return failure(
          const NotFoundFailure(
            message: 'Véhicule non trouvé',
            userMessage: 'Ce véhicule est introuvable.',
          ),
        );
      }
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Vehicle>>> searchVehicles({
    required String query,
    int? page,
    int? limit,
  }) async {
    try {
      final dtos = await _remoteDataSource.searchVehicles(
        query: query,
        page: page,
        limit: limit,
      );

      final vehicles = dtos.map(VehicleMapper.toEntity).toList();
      return success(vehicles);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Vehicle>>> getNearbyVehicles({
    required double latitude,
    required double longitude,
    double? radiusKm,
    int? limit,
  }) async {
    try {
      final dtos = await _remoteDataSource.getNearbyVehicles(
        latitude: latitude,
        longitude: longitude,
        radiusKm: radiusKm,
        limit: limit,
      );

      final vehicles = dtos.map(VehicleMapper.toEntity).toList();
      return success(vehicles);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Vehicle>>> getFeaturedVehicles({
    int? limit,
  }) async {
    try {
      final dtos = await _remoteDataSource.getFeaturedVehicles(limit: limit);
      final vehicles = dtos.map(VehicleMapper.toEntity).toList();
      return success(vehicles);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Vehicle>>> getOwnerVehicles({
    required String proprietaireId,
    int? page,
    int? limit,
  }) async {
    try {
      final dtos = await _remoteDataSource.getOwnerVehicles(
        proprietaireId: proprietaireId,
        page: page,
        limit: limit,
      );

      final vehicles = dtos.map(VehicleMapper.toEntity).toList();
      return success(vehicles);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> checkAvailability({
    required String vehicleId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      final isAvailable = await _remoteDataSource.checkAvailability(
        vehicleId: vehicleId,
        startDate: startDate,
        endDate: endDate,
      );

      return success(isAvailable);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  // NOUVELLES MÉTHODES SYNCHRONISÉES AVEC BACKEND

  @override
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
  }) async {
    try {
      final dto = await _remoteDataSource.createVehicle(
        marque: marque,
        modele: modele,
        annee: annee,
        type: type,
        immatriculation: immatriculation,
        prixParJour: prixParJour,
        ville: ville,
        adresse: adresse,
        carburant: carburant,
        transmission: transmission,
        nombrePlaces: nombrePlaces,
        joursMinimum: joursMinimum,
        ageMinimum: ageMinimum,
        assurance: assurance,
        reglesSpecifiques: reglesSpecifiques,
        zoneConduite: zoneConduite,
        assuranceDocUrl: assuranceDocUrl,
        assuranceDocPublicId: assuranceDocPublicId,
        carteGriseUrl: carteGriseUrl,
        carteGrisePublicId: carteGrisePublicId,
        fraisLivraison: fraisLivraison,
        autoriseHorsDakar: autoriseHorsDakar,
        supplementHorsDakarParJour: supplementHorsDakarParJour,
        carburantCondition: carburantCondition,
        equipements: equipements,
        tarifs: tarifs,
        photos: photos,
      );
      final vehicle = VehicleMapper.toEntity(dto);
      return success(vehicle);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
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
  }) async {
    try {
      final dto = await _remoteDataSource.updateVehicle(
        vehicleId: vehicleId,
        marque: marque,
        modele: modele,
        annee: annee,
        type: type,
        carburant: carburant,
        transmission: transmission,
        nombrePlaces: nombrePlaces,
        immatriculation: immatriculation,
        prixParJour: prixParJour,
        ville: ville,
        adresse: adresse,
        latitude: latitude,
        longitude: longitude,
        joursMinimum: joursMinimum,
        ageMinimum: ageMinimum,
        assurance: assurance,
        reglesSpecifiques: reglesSpecifiques,
        zoneConduite: zoneConduite,
        assuranceDocUrl: assuranceDocUrl,
        assuranceDocPublicId: assuranceDocPublicId,
        carteGriseUrl: carteGriseUrl,
        carteGrisePublicId: carteGrisePublicId,
        fraisLivraison: fraisLivraison,
        autoriseHorsDakar: autoriseHorsDakar,
        supplementHorsDakarParJour: supplementHorsDakarParJour,
        carburantCondition: carburantCondition,
        equipements: equipements,
        tarifs: tarifs,
      );
      final vehicle = VehicleMapper.toEntity(dto);
      return success(vehicle);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Vehicle>> archiveVehicle(String vehicleId) async {
    try {
      final dto = await _remoteDataSource.archiveVehicle(vehicleId);
      final vehicle = VehicleMapper.toEntity(dto);
      return success(vehicle);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> deleteVehiclePermanently(String vehicleId) async {
    try {
      final deleted = await _remoteDataSource.deleteVehiclePermanently(vehicleId);
      return success(deleted);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Vehicle>>> getMyVehicles({int? limit}) async {
    try {
      final dtos = await _remoteDataSource.getMyVehicles(limit: limit);
      final vehicles = dtos.map(VehicleMapper.toEntity).toList();
      return success(vehicles);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> getMyVehiclesSummary() async {
    try {
      final summary = await _remoteDataSource.getMyVehiclesSummary();
      return success(summary);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
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
  }) async {
    try {
      final dtos = await _remoteDataSource.searchVehiclesWithFilters(
        ville: ville,
        type: type,
        dateDebut: dateDebut,
        dateFin: dateFin,
        joursMinimum: joursMinimum,
        prixMin: prixMin,
        prixMax: prixMax,
        horsDakar: horsDakar,
        page: page,
        limit: limit,
      );
      final vehicles = dtos.map(VehicleMapper.toEntity).toList();
      return success(vehicles);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> getHomeFeed() async {
    try {
      final feed = await _remoteDataSource.getHomeFeed();
      return success(feed);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> getMobileFeed() async {
    try {
      final feed = await _remoteDataSource.getMobileFeed();
      return success(feed);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> getUploadSignature() async {
    try {
      final signature = await _remoteDataSource.getUploadSignature();
      return success(signature);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Map<String, dynamic>>>> getBlockedDates(String vehicleId) async {
    try {
      final blockedDates = await _remoteDataSource.getBlockedDates(vehicleId);
      return success(blockedDates);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> getPricing({
    required String vehicleId,
    required int days,
    bool? horsDakar,
  }) async {
    try {
      final pricing = await _remoteDataSource.getPricing(
        vehicleId: vehicleId,
        days: days,
        horsDakar: horsDakar,
      );
      return success(pricing);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> createIndisponibilite({
    required String vehicleId,
    required DateTime dateDebut,
    required DateTime dateFin,
    String? motif,
  }) async {
    try {
      final indispo = await _remoteDataSource.createIndisponibilite(
        vehicleId: vehicleId,
        dateDebut: dateDebut,
        dateFin: dateFin,
        motif: motif,
      );
      return success(indispo);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Map<String, dynamic>>>> getIndisponibilites(String vehicleId) async {
    try {
      final indispos = await _remoteDataSource.getIndisponibilites(vehicleId);
      return success(indispos);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> deleteIndisponibilite({
    required String vehicleId,
    required String indispoId,
  }) async {
    try {
      final deleted = await _remoteDataSource.deleteIndisponibilite(
        vehicleId: vehicleId,
        indispoId: indispoId,
      );
      return success(deleted);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> addPhoto({
    required String vehicleId,
    required String imagePath,
  }) async {
    try {
      final photo = await _remoteDataSource.addPhoto(
        vehicleId: vehicleId,
        imagePath: imagePath,
      );
      return success(photo);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> linkPhoto({
    required String vehicleId,
    required String url,
    required String publicId,
  }) async {
    try {
      final photo = await _remoteDataSource.linkPhoto(
        vehicleId: vehicleId,
        url: url,
        publicId: publicId,
      );
      return success(photo);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> updatePhoto({
    required String vehicleId,
    required String photoId,
    int? position,
    bool? estPrincipale,
  }) async {
    try {
      final photo = await _remoteDataSource.updatePhoto(
        vehicleId: vehicleId,
        photoId: photoId,
        position: position,
        estPrincipale: estPrincipale,
      );
      return success(photo);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> deletePhoto({
    required String vehicleId,
    required String photoId,
  }) async {
    try {
      final deleted = await _remoteDataSource.deletePhoto(
        vehicleId: vehicleId,
        photoId: photoId,
      );
      return success(deleted);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  // ===========================================================================
  // HELPER - Conversion DioException → Failure
  // ===========================================================================

  Failure _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkFailure(
          message: 'Connection timeout',
          userMessage: 'Délai d\'attente dépassé',
        );

      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          return const UnauthorizedFailure('Session expirée');
        } else if (statusCode == 404) {
          return const NotFoundFailure(
            message: 'Resource not found',
            userMessage: 'Ressource non trouvée',
          );
        } else if (statusCode == 403) {
          return const ForbiddenFailure('Accès interdit');
        } else if (statusCode != null && statusCode >= 500) {
          return const ServerFailure(
            message: 'Server error',
            userMessage: 'Erreur serveur',
          );
        }
        return ServerFailure(
          message: e.response?.data['message'] ?? 'Server error',
          userMessage: 'Erreur serveur',
        );

      case DioExceptionType.cancel:
        return const NetworkFailure(
          message: 'Request cancelled',
          userMessage: 'Requête annulée',
        );

      case DioExceptionType.connectionError:
      case DioExceptionType.unknown:
      default:
        return const NetworkFailure(
          message: 'Connection error',
          userMessage: 'Vérifiez votre connexion internet',
        );
    }
  }
}
