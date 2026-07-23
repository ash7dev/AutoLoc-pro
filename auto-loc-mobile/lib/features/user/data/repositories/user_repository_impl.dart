import 'package:dio/dio.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/user_remote_datasource.dart';
import '../mappers/user_mapper.dart';

/// User Repository Implementation
///
/// Implémentation du repository pour le profil utilisateur.
/// Orchestre le DataSource + Mapper + Gestion des erreurs.
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource _remoteDataSource;

  UserRepositoryImpl({required UserRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;

  @override
  Future<Result<User>> getProfile() async {
    try {
      final dto = await _remoteDataSource.getProfile();
      return success(UserMapper.toEntity(dto));
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<User>> updateProfile({
    String? prenom,
    String? nom,
    String? avatarUrl,
    DateTime? dateNaissance,
  }) async {
    try {
      final dto = await _remoteDataSource.updateProfile(
        prenom: prenom,
        nom: nom,
        avatarUrl: avatarUrl,
        dateNaissance: dateNaissance,
      );
      return success(UserMapper.toEntity(dto));
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<String>> uploadAvatar(String imagePath) async {
    try {
      final result = await _remoteDataSource.uploadAvatar(imagePath);
      return success(result['avatarUrl']!);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> deleteAvatar() async {
    try {
      await _remoteDataSource.deleteAvatar();
      return success(true);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<CloudinarySignature>> getKycUploadSignature({String? detection}) async {
    try {
      final data = await _remoteDataSource.getKycUploadSignature(detection: detection);
      final signature = CloudinarySignature(
        signature: data['signature'] as String,
        timestamp: data['timestamp'] as int,
        apiKey: data['apiKey'] as String,
        cloudName: data['cloudName'] as String,
        folder: data['folder'] as String,
        detection: data['detection'] as String?,
      );
      return success(signature);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<User>> submitKyc({
    required String documentFrontUrl,
    required String documentBackUrl,
    String? selfieUrl,
  }) async {
    try {
      final dto = await _remoteDataSource.submitKyc(
        documentFrontUrl: documentFrontUrl,
        documentBackUrl: documentBackUrl,
        selfieUrl: selfieUrl,
      );
      return success(UserMapper.toEntity(dto));
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<Result<bool>> linkPermis({
    required String url,
    required String publicId,
  }) async {
    try {
      await _remoteDataSource.linkPermis(url: url, publicId: publicId);
      return success(true);
    } on DioException catch (e) {
      return failure(_handleDioException(e));
    } catch (e) {
      return failure(UnexpectedFailure(e.toString()));
    }
  }

  /// Gère les exceptions Dio et les convertit en Failure
  Failure _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkFailure(message: 'Délai de connexion dépassé');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final message = e.response?.data?['message'] as String? ?? 'Erreur serveur';

        if (statusCode == 401) {
          return UnauthorizedFailure(message);
        } else if (statusCode == 403) {
          return ForbiddenFailure(message);
        } else if (statusCode == 400) {
          return ValidationFailure(message);
        } else {
          return ServerFailure(message: message);
        }
      case DioExceptionType.cancel:
        return const UnexpectedFailure('Requête annulée');
      case DioExceptionType.unknown:
        return const NetworkFailure(message: 'Erreur de connexion');
      default:
        return UnexpectedFailure(e.message ?? 'Erreur inconnue');
    }
  }
}
