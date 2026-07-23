import 'dart:io';

import 'package:dio/dio.dart';

import 'exceptions.dart';
import 'failures.dart';

/// Mapper qui convertit les Exceptions en Failures
/// Utilisé par tous les repositories pour gérer les erreurs de manière uniforme
class ErrorMapper {
  ErrorMapper._();

  /// Convertit une Exception en Failure
  static Failure toFailure(Exception exception) {
    // Dio Exceptions (erreurs réseau)
    if (exception is DioException) {
      return _mapDioException(exception);
    }

    // Exceptions métier custom
    if (exception is NetworkException) {
      return NetworkFailure(
        message: exception.message,
        userMessage: exception.message,
        code: exception.statusCode?.toString(),
      );
    }

    if (exception is ServerException) {
      return ServerFailure(
        message: exception.message,
        userMessage: 'Une erreur serveur est survenue.',
        statusCode: exception.statusCode,
      );
    }

    if (exception is AuthException) {
      if (exception.statusCode == 401) {
        return AuthFailure.tokenExpired();
      }
      if (exception.statusCode == 403) {
        return AuthFailure.forbidden();
      }
      return AuthFailure(
        message: exception.message,
        userMessage: exception.message,
      );
    }

    if (exception is ValidationException) {
      if (exception.errors != null) {
        return ValidationFailure.fromMap(exception.errors!);
      }
      return ValidationFailure(exception.message);
    }

    if (exception is NotFoundException) {
      return NotFoundFailure(
        message: exception.message,
        userMessage: exception.message,
      );
    }

    if (exception is CacheException) {
      return CacheFailure(
        message: exception.message,
        userMessage: 'Erreur de cache locale.',
      );
    }

    if (exception is StorageException) {
      return StorageFailure(
        message: exception.message,
        userMessage: 'Erreur de stockage local.',
      );
    }

    if (exception is TimeoutException) {
      return NetworkFailure.timeout();
    }

    if (exception is ConnectionException) {
      return NetworkFailure.offline();
    }

    if (exception is ParseException) {
      return ParseFailure.json();
    }

    if (exception is PermissionException) {
      return PermissionFailure(
        message: exception.message,
        permission: exception.permission,
      );
    }

    // Socket Exception (pas de connexion)
    if (exception is SocketException) {
      return NetworkFailure.offline();
    }

    // Format Exception
    if (exception is FormatException) {
      return ParseFailure.json();
    }

    // Erreur inconnue
    return UnknownFailure(exception.toString());
  }

  /// Mappe les DioException en Failures
  static Failure _mapDioException(DioException exception) {
    switch (exception.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkFailure.timeout();

      case DioExceptionType.connectionError:
        return NetworkFailure.offline();

      case DioExceptionType.badResponse:
        return _mapHttpError(exception);

      case DioExceptionType.cancel:
        return const NetworkFailure(
          message: 'Request cancelled',
          userMessage: 'La requête a été annulée.',
        );

      case DioExceptionType.unknown:
        if (exception.error is SocketException) {
          return NetworkFailure.offline();
        }
        return NetworkFailure.unknown();

      default:
        return NetworkFailure.unknown();
    }
  }

  /// Mappe les erreurs HTTP en fonction du status code
  static Failure _mapHttpError(DioException exception) {
    final statusCode = exception.response?.statusCode;
    final data = exception.response?.data;

    // Essayer d'extraire le message du backend
    String? errorMessage;
    if (data is Map<String, dynamic>) {
      errorMessage = data['message'] as String?;

      // Gérer les erreurs de validation du backend
      if (data['errors'] != null && data['errors'] is Map) {
        return ValidationFailure.fromMap(data['errors'] as Map<String, dynamic>);
      }
    }

    switch (statusCode) {
      case 400:
        return ValidationFailure(
          errorMessage ?? 'Invalid request',
          userMessage: errorMessage ?? 'Requête invalide.',
        );

      case 401:
        // Vérifier si c'est une erreur d'OTP
        if (errorMessage?.toLowerCase().contains('otp') == true) {
          return AuthFailure.invalidOtp();
        }
        return AuthFailure.unauthorized();

      case 403:
        return AuthFailure.forbidden();

      case 404:
        return NotFoundFailure(
          message: errorMessage ?? 'Resource not found',
          userMessage: errorMessage ?? 'Ressource introuvable.',
        );

      case 409:
        // Conflit (ex: téléphone/email déjà existant)
        if (errorMessage?.toLowerCase().contains('phone') == true ||
            errorMessage?.toLowerCase().contains('téléphone') == true) {
          return AuthFailure.phoneAlreadyExists();
        }
        if (errorMessage?.toLowerCase().contains('email') == true) {
          return AuthFailure.emailAlreadyExists();
        }
        return ValidationFailure(
          errorMessage ?? 'Conflict',
          userMessage: errorMessage ?? 'Conflit de données.',
        );

      case 422:
        // Unprocessable Entity
        return ValidationFailure(
          errorMessage ?? 'Unprocessable entity',
          userMessage: errorMessage ?? 'Données invalides.',
        );

      case 429:
        return const NetworkFailure(
          message: 'Too many requests',
          userMessage: 'Trop de requêtes. Veuillez patienter un moment.',
          code: 'TOO_MANY_REQUESTS',
        );

      case 500:
      case 502:
      case 503:
      case 504:
        if (statusCode == 503) {
          return ServerFailure.maintenance();
        }
        return ServerFailure.internal();

      default:
        return ServerFailure(
          message: errorMessage ?? 'Server error',
          userMessage: errorMessage ?? 'Une erreur est survenue.',
          statusCode: statusCode,
        );
    }
  }

  /// Convertit une Failure en message utilisateur
  static String getErrorMessage(Failure failure) {
    return failure.displayMessage;
  }

  /// Vérifie si c'est une erreur réseau
  static bool isNetworkError(Failure failure) {
    return failure is NetworkFailure;
  }

  /// Vérifie si c'est une erreur d'authentification
  static bool isAuthError(Failure failure) {
    return failure is AuthFailure;
  }

  /// Vérifie si on est hors ligne
  static bool isOffline(Failure failure) {
    return failure is NetworkFailure && failure.code == 'OFFLINE';
  }
}
