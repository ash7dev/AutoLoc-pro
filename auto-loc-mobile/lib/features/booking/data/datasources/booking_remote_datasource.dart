import 'package:dio/dio.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/errors/exceptions.dart';
import '../dto/booking_dto.dart';

/// Booking Remote DataSource Interface
///
/// Définit les appels API pour les réservations.
abstract class BookingRemoteDataSource {
  Future<BookingDto> createBooking({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    required String fournisseur,
    required String targetPayment,
    required String payerPhone,
    String? adresseLivraison,
    bool? horsDakar,
  });

  Future<List<BookingDto>> getMyBookings({
    int? page,
    int? limit,
    String? statut,
  });

  Future<List<BookingDto>> getOwnerBookings({
    int? page,
    int? limit,
    String? statut,
  });

  Future<BookingDto> getBookingById(String id);

  Future<BookingDto> cancelBooking({
    required String bookingId,
    required String raison,
  });

  Future<BookingDto> checkin({
    required String bookingId,
    required List<String> photoUrls,
  });

  Future<BookingDto> checkout({
    required String bookingId,
    required List<String> photoUrls,
  });

  Future<bool> checkAvailability({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
  });

  Future<Map<String, dynamic>> calculateCost({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    bool? horsDakar,
    bool? avecLivraison,
  });

  Future<List<String>> uploadPhotosEtatLieu({
    required String bookingId,
    required List<String> photoPaths,
    required bool isCheckin,
  });

  Future<BookingDto> confirm({
    required String bookingId,
    required String heureDebut,
  });

  Future<BookingDto> refuseCheckin({
    required String bookingId,
    required String motif,
    required String commentaire,
  });

  Future<BookingDto> signalTenantNoshow({
    required String bookingId,
    required String commentaire,
  });

  Future<BookingDto> signalOverload({
    required String bookingId,
    required String motif,
    required String commentaire,
  });

  Future<Map<String, dynamic>> getLocataireDocs({
    required String bookingId,
  });
}

/// Booking Remote DataSource Implementation
///
/// Implémente les appels API avec Dio.
/// Synchronisé avec le backend NestJS (ReservationsController).
class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  final Dio _dio;

  BookingRemoteDataSourceImpl(this._dio);

  @override
  Future<BookingDto> createBooking({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    required String fournisseur,
    required String targetPayment,
    required String payerPhone,
    String? adresseLivraison,
    bool? horsDakar,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.createReservation,
        data: {
          'vehiculeId': vehiculeId,
          'dateDebut': dateDebut.toIso8601String(),
          'dateFin': dateFin.toIso8601String(),
          'fournisseur': fournisseur,
          'targetPayment': targetPayment,
          'payerPhone': payerPhone,
          if (adresseLivraison != null) 'adresseLivraison': adresseLivraison,
          if (horsDakar != null) 'horsDakar': horsDakar,
        },
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors de la création de la réservation',
      );
    }
  }

  @override
  Future<List<BookingDto>> getMyBookings({
    int? page,
    int? limit,
    String? statut,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        if (page != null) 'page': page,
        if (limit != null) 'limit': limit,
        if (statut != null) 'statut': statut,
      };

      final response = await _dio.get(
        ApiEndpoints.tenantReservations,
        queryParameters: queryParams,
      );

      // Vérifier si la réponse contient des données valides
      if (response.data is! Map && response.data is! List) {
        throw ServerException(message: 'Format de réponse invalide');
      }

      // Si c'est un objet avec un message d'erreur
      if (response.data is Map && response.data['message'] != null && response.data['data'] == null) {
        throw ServerException(message: response.data['message']);
      }

      final dynamic dataField = response.data is Map ? response.data['data'] : response.data;

      // Si pas de données, retourner liste vide
      if (dataField == null) {
        return [];
      }

      // Vérifier que c'est bien une liste
      if (dataField is! List) {
        throw ServerException(message: 'Format de données invalide');
      }

      return (dataField as List).map((json) => BookingDto.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération des réservations',
        statusCode: e.response?.statusCode ?? 500,
      );
    }
  }

  @override
  Future<List<BookingDto>> getOwnerBookings({
    int? page,
    int? limit,
    String? statut,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        if (page != null) 'page': page,
        if (limit != null) 'limit': limit,
        if (statut != null) 'statut': statut,
      };

      final response = await _dio.get(
        ApiEndpoints.ownerReservations,
        queryParameters: queryParams,
      );

      // Vérifier si la réponse contient des données valides
      if (response.data is! Map && response.data is! List) {
        throw ServerException(message: 'Format de réponse invalide');
      }

      // Si c'est un objet avec un message d'erreur
      if (response.data is Map && response.data['message'] != null && response.data['data'] == null) {
        throw ServerException(message: response.data['message']);
      }

      final dynamic dataField = response.data is Map ? response.data['data'] : response.data;

      // Si pas de données, retourner liste vide
      if (dataField == null) {
        return [];
      }

      // Vérifier que c'est bien une liste
      if (dataField is! List) {
        throw ServerException(message: 'Format de données invalide');
      }

      return (dataField as List).map((json) => BookingDto.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération des réservations',
        statusCode: e.response?.statusCode ?? 500,
      );
    }
  }

  @override
  Future<BookingDto> getBookingById(String id) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.reservationById(id),
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw ServerException(message: 'Réservation non trouvée');
      }
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors de la récupération de la réservation',
      );
    }
  }

  @override
  Future<BookingDto> cancelBooking({
    required String bookingId,
    required String raison,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.cancelReservation(bookingId),
        data: {'raison': raison},
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors de l\'annulation de la réservation',
      );
    }
  }

  @override
  Future<BookingDto> checkin({
    required String bookingId,
    required List<String> photoUrls,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.checkin(bookingId),
        data: {'photoUrls': photoUrls},
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors du check-in',
      );
    }
  }

  @override
  Future<BookingDto> checkout({
    required String bookingId,
    required List<String> photoUrls,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.checkout(bookingId),
        data: {'photoUrls': photoUrls},
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors du check-out',
      );
    }
  }

  @override
  Future<bool> checkAvailability({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
  }) async {
    try {
      // Utilise l'endpoint blocked-dates pour vérifier la disponibilité
      final response = await _dio.get(
        ApiEndpoints.vehicleBlockedDates(vehiculeId),
        queryParameters: {
          'dateDebut': dateDebut.toIso8601String(),
          'dateFin': dateFin.toIso8601String(),
        },
      );

      // Si aucune date bloquée, le véhicule est disponible
      final List<dynamic> blockedDates = response.data['data'] ?? [];
      return blockedDates.isEmpty;
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors de la vérification de disponibilité',
      );
    }
  }

  @override
  Future<Map<String, dynamic>> calculateCost({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    bool? horsDakar,
    bool? avecLivraison,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.vehiclePricing(vehiculeId),
        data: {
          'dateDebut': dateDebut.toIso8601String(),
          'dateFin': dateFin.toIso8601String(),
          if (horsDakar != null) 'horsDakar': horsDakar,
          if (avecLivraison != null) 'avecLivraison': avecLivraison,
        },
      );

      return Map<String, dynamic>.from(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors du calcul du coût',
      );
    }
  }

  @override
  Future<List<String>> uploadPhotosEtatLieu({
    required String bookingId,
    required List<String> photoPaths,
    required bool isCheckin,
  }) async {
    try {
      // 1. Obtenir les signatures d'upload
      final signaturesResponse = await _dio.post(
        ApiEndpoints.reservationPhotosUploadSignature,
        data: {
          'count': photoPaths.length,
          'isCheckin': isCheckin,
        },
      );

      final List<dynamic> signatures = signaturesResponse.data['signatures'];

      // 2. Upload chaque photo vers Cloudinary
      final List<String> uploadedUrls = [];
      for (int i = 0; i < photoPaths.length; i++) {
        final signature = signatures[i];
        final photoPath = photoPaths[i];

        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(photoPath),
          'api_key': signature['apiKey'],
          'timestamp': signature['timestamp'],
          'signature': signature['signature'],
          'folder': signature['folder'],
        });

        final uploadResponse = await _dio.post(
          signature['uploadUrl'],
          data: formData,
        );

        uploadedUrls.add(uploadResponse.data['secure_url']);
      }

      // 3. Lier les photos uploadées à la réservation
      await _dio.post(
        ApiEndpoints.reservationPhotosLink(bookingId),
        data: {
          'photoUrls': uploadedUrls,
          'isCheckin': isCheckin,
        },
      );

      return uploadedUrls;
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors de l\'upload des photos',
      );
    }
  }

  @override
  Future<BookingDto> confirm({
    required String bookingId,
    required String heureDebut,
  }) async {
    try {
      final response = await _dio.patch(
        '/reservations/$bookingId/confirm',
        data: {'heureDebut': heureDebut},
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors de la confirmation de la réservation',
      );
    }
  }

  @override
  Future<BookingDto> refuseCheckin({
    required String bookingId,
    required String motif,
    required String commentaire,
  }) async {
    try {
      final response = await _dio.post(
        '/reservations/$bookingId/refus-checkin',
        data: {
          'motif': motif,
          'commentaire': commentaire,
        },
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors du refus de check-in',
      );
    }
  }

  @override
  Future<BookingDto> signalTenantNoshow({
    required String bookingId,
    required String commentaire,
  }) async {
    try {
      final response = await _dio.post(
        '/reservations/$bookingId/signal-noshow',
        data: {'commentaire': commentaire},
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors du signalement no-show',
      );
    }
  }

  @override
  Future<BookingDto> signalOverload({
    required String bookingId,
    required String motif,
    required String commentaire,
  }) async {
    try {
      final response = await _dio.post(
        '/reservations/$bookingId/signal-overload',
        data: {
          'motif': motif,
          'commentaire': commentaire,
        },
      );

      return BookingDto.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors du signalement overload',
      );
    }
  }

  @override
  Future<Map<String, dynamic>> getLocataireDocs({
    required String bookingId,
  }) async {
    try {
      final response = await _dio.get(
        '/reservations/$bookingId/locataire-docs',
      );

      return Map<String, dynamic>.from(response.data);
    } on DioException catch (e) {
      throw ServerException(message: 
        e.response?.data['message'] ?? 'Erreur lors de la récupération des documents du locataire',
      );
    }
  }
}
