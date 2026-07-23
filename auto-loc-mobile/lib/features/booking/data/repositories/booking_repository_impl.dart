import 'package:dio/dio.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/booking.dart';
import '../../domain/repositories/booking_repository.dart';
import '../datasources/booking_remote_datasource.dart';
import '../mappers/booking_mapper.dart';

/// Booking Repository Implementation
///
/// Implémente BookingRepository en utilisant BookingRemoteDataSource.
/// Responsabilités:
/// - Orchestrer les appels au DataSource
/// - Convertir DTO → Entity avec BookingMapper
/// - Gérer les erreurs et retourner des Result<T>
class BookingRepositoryImpl implements BookingRepository {
  final BookingRemoteDataSource _remoteDataSource;

  // TODO: Ajouter BookingLocalDataSource pour le cache

  BookingRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<Booking>> createBooking({
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
      final dto = await _remoteDataSource.createBooking(
        vehiculeId: vehiculeId,
        dateDebut: dateDebut,
        dateFin: dateFin,
        fournisseur: fournisseur,
        targetPayment: targetPayment,
        payerPhone: payerPhone,
        adresseLivraison: adresseLivraison,
        horsDakar: horsDakar,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Booking>>> getMyBookings({
    int? page,
    int? limit,
    String? statut,
  }) async {
    try {
      final dtos = await _remoteDataSource.getMyBookings(
        page: page,
        limit: limit,
        statut: statut,
      );

      final bookings = dtos.map(BookingMapper.toEntity).toList();
      return success(bookings);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<Booking>>> getOwnerBookings({
    int? page,
    int? limit,
    String? statut,
  }) async {
    try {
      final dtos = await _remoteDataSource.getOwnerBookings(
        page: page,
        limit: limit,
        statut: statut,
      );

      final bookings = dtos.map(BookingMapper.toEntity).toList();
      return success(bookings);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Booking>> getBookingById(String id) async {
    try {
      final dto = await _remoteDataSource.getBookingById(id);
      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return failure(
          const NotFoundFailure(
            message: 'Réservation non trouvée',
            userMessage: 'Cette réservation est introuvable.',
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
  Future<Result<Booking>> cancelBooking({
    required String bookingId,
    required String raison,
  }) async {
    try {
      final dto = await _remoteDataSource.cancelBooking(
        bookingId: bookingId,
        raison: raison,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Booking>> checkin({
    required String bookingId,
    required List<String> photoUrls,
  }) async {
    try {
      final dto = await _remoteDataSource.checkin(
        bookingId: bookingId,
        photoUrls: photoUrls,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Booking>> checkout({
    required String bookingId,
    required List<String> photoUrls,
  }) async {
    try {
      final dto = await _remoteDataSource.checkout(
        bookingId: bookingId,
        photoUrls: photoUrls,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
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
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
  }) async {
    try {
      final isAvailable = await _remoteDataSource.checkAvailability(
        vehiculeId: vehiculeId,
        dateDebut: dateDebut,
        dateFin: dateFin,
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

  @override
  Future<Result<Map<String, dynamic>>> calculateCost({
    required String vehiculeId,
    required DateTime dateDebut,
    required DateTime dateFin,
    bool? horsDakar,
    bool? avecLivraison,
  }) async {
    try {
      final costData = await _remoteDataSource.calculateCost(
        vehiculeId: vehiculeId,
        dateDebut: dateDebut,
        dateFin: dateFin,
        horsDakar: horsDakar,
        avecLivraison: avecLivraison,
      );

      return success(costData);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<List<String>>> uploadPhotosEtatLieu({
    required String bookingId,
    required List<String> photoPaths,
    required bool isCheckin,
  }) async {
    try {
      final photoUrls = await _remoteDataSource.uploadPhotosEtatLieu(
        bookingId: bookingId,
        photoPaths: photoPaths,
        isCheckin: isCheckin,
      );

      return success(photoUrls);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Booking>> confirm({
    required String bookingId,
    required String heureDebut,
  }) async {
    try {
      final dto = await _remoteDataSource.confirm(
        bookingId: bookingId,
        heureDebut: heureDebut,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Booking>> refuseCheckin({
    required String bookingId,
    required String motif,
    required String commentaire,
  }) async {
    try {
      final dto = await _remoteDataSource.refuseCheckin(
        bookingId: bookingId,
        motif: motif,
        commentaire: commentaire,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Booking>> signalTenantNoshow({
    required String bookingId,
    required String commentaire,
  }) async {
    try {
      final dto = await _remoteDataSource.signalTenantNoshow(
        bookingId: bookingId,
        commentaire: commentaire,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Booking>> signalOverload({
    required String bookingId,
    required String motif,
    required String commentaire,
  }) async {
    try {
      final dto = await _remoteDataSource.signalOverload(
        bookingId: bookingId,
        motif: motif,
        commentaire: commentaire,
      );

      final booking = BookingMapper.toEntity(dto);
      return success(booking);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> getLocataireDocs({
    required String bookingId,
  }) async {
    try {
      final docs = await _remoteDataSource.getLocataireDocs(
        bookingId: bookingId,
      );

      return success(docs);
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
        } else if (statusCode == 400) {
          // Erreur de validation du backend
          final message = e.response?.data['message'] ?? 'Données invalides';
          return ValidationFailure(message);
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
