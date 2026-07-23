import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../dto/user_dto.dart';

/// User Remote DataSource
///
/// Responsable des appels API pour le profil utilisateur.
/// Synchronisé avec les endpoints du backend NestJS.
class UserRemoteDataSource {
  final Dio _dio;

  UserRemoteDataSource(this._dio);

  /// GET /users/me/profile
  /// Récupère le profil complet de l'utilisateur connecté.
  Future<UserDto> getProfile() async {
    final response = await _dio.get(ApiEndpoints.profile);
    return UserDto.fromJson(response.data);
  }

  /// PATCH /users/me/profile
  /// Met à jour le profil de l'utilisateur.
  Future<UserDto> updateProfile({
    String? prenom,
    String? nom,
    String? avatarUrl,
    DateTime? dateNaissance,
  }) async {
    final response = await _dio.patch(
      ApiEndpoints.updateProfile,
      data: {
        if (prenom != null) 'prenom': prenom,
        if (nom != null) 'nom': nom,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
        if (dateNaissance != null) 'dateNaissance': dateNaissance.toIso8601String(),
      },
    );
    return UserDto.fromJson(response.data);
  }

  /// POST /users/me/avatar
  /// Upload une photo de profil (Cloudinary).
  Future<Map<String, String>> uploadAvatar(String imagePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(imagePath),
    });

    final response = await _dio.post(
      ApiEndpoints.uploadAvatar,
      data: formData,
    );

    return {
      'avatarUrl': response.data['avatarUrl'],
      'publicId': response.data['publicId'],
    };
  }

  /// DELETE /users/me/avatar
  /// Supprime la photo de profil de l'utilisateur.
  Future<void> deleteAvatar() async {
    await _dio.delete(ApiEndpoints.uploadAvatar);
  }

  /// GET /auth/kyc/upload-signature
  /// Obtient une signature Cloudinary pour upload direct KYC.
  Future<Map<String, dynamic>> getKycUploadSignature({String? detection}) async {
    final response = await _dio.get(
      ApiEndpoints.kycUploadSignature,
      queryParameters: {
        if (detection != null) 'detection': detection,
      },
    );
    return response.data;
  }

  /// POST /auth/kyc/submit-links
  /// Soumet le KYC avec des URLs Cloudinary déjà uploadées.
  Future<UserDto> submitKyc({
    required String documentFrontUrl,
    required String documentBackUrl,
    String? selfieUrl,
  }) async {
    final response = await _dio.post(
      ApiEndpoints.kycSubmitLinks,
      data: {
        'documentFrontUrl': documentFrontUrl,
        'documentBackUrl': documentBackUrl,
        if (selfieUrl != null) 'selfieUrl': selfieUrl,
      },
    );
    return UserDto.fromJson(response.data);
  }

  /// POST /auth/permis/link
  /// Lie un permis de conduire déjà uploadé sur Cloudinary.
  Future<void> linkPermis({
    required String url,
    required String publicId,
  }) async {
    await _dio.post(
      ApiEndpoints.permisLink,
      data: {
        'url': url,
        'publicId': publicId,
      },
    );
  }
}
