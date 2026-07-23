import 'package:dio/dio.dart';

import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/errors/exceptions.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../mappers/auth_mapper.dart';

/// Auth Repository Implementation
///
/// Implémente AuthRepository (interface du domain).
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<bool>> checkAvailability({
    String? email,
    String? phone,
  }) async {
    try {
      final available = await _remoteDataSource.checkAvailability(
        email: email,
        phone: phone,
      );
      return success(available);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> getProfile() async {
    try {
      final dto = await _remoteDataSource.getProfile();
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> logout() async {
    try {
      final loggedOut = await _remoteDataSource.logout();
      return success(loggedOut);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> loginWithSupabase({
    required String accessToken,
  }) async {
    try {
      final dto = await _remoteDataSource.loginWithSupabase(
        accessToken: accessToken,
      );
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> refreshToken({
    required String refreshToken,
  }) async {
    try {
      final dto = await _remoteDataSource.refreshToken(
        refreshToken: refreshToken,
      );
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> completeProfile({
    required String prenom,
    required String nom,
    String? telephone,
    DateTime? dateNaissance,
  }) async {
    try {
      final dto = await _remoteDataSource.completeProfile(
        prenom: prenom,
        nom: nom,
        telephone: telephone,
        dateNaissance: dateNaissance,
      );
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> switchRole({
    required String role,
  }) async {
    try {
      final dto = await _remoteDataSource.switchRole(role: role);
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<int>> sendPhoneOtp() async {
    try {
      final expiresIn = await _remoteDataSource.sendPhoneOtp();
      return success(expiresIn);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> updatePhone({
    required String telephone,
  }) async {
    try {
      final dto = await _remoteDataSource.updatePhone(telephone: telephone);
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> verifyPhoneOtp({
    required String code,
  }) async {
    try {
      final dto = await _remoteDataSource.verifyPhoneOtp(code: code);
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<int>> sendPhoneLoginOtp({
    required String phone,
  }) async {
    try {
      final expiresIn = await _remoteDataSource.sendPhoneLoginOtp(phone: phone);
      return success(expiresIn);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<AuthUser>> verifyPhoneLoginOtp({
    required String phone,
    required String code,
  }) async {
    try {
      final dto = await _remoteDataSource.verifyPhoneLoginOtp(
        phone: phone,
        code: code,
      );
      final user = AuthMapper.toEntity(dto);
      return success(user);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } on ServerException catch (e) {
      return failure(ServerFailure(message: e.message));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

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
