import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_dto.freezed.dart';
part 'user_dto.g.dart';

/// DTO pour User - Synchronisé avec GET /users/me/profile response
@freezed
class UserDto with _$UserDto {
  const factory UserDto({
    required String id,
    required String userId,
    required String email,
    required String telephone,
    required String prenom,
    required String nom,
    String? avatarUrl,
    String? dateNaissance, // ISO 8601 string
    required String statutKyc,
    required String role,
    required double noteLocataire,
    required double noteProprietaire,
    required int totalAvis,
    required bool phoneVerified,
    required bool profileCompleted,
    required String creeLe, // ISO 8601 string
    String? kycDocumentUrl,
    String? kycDocumentBackUrl,
    String? kycSelfieUrl,
    String? permisUrl,
  }) = _UserDto;

  factory UserDto.fromJson(Map<String, dynamic> json) => _$UserDtoFromJson(json);
}

/// DTO pour UpdateProfile request body
@freezed
class UpdateProfileRequestDto with _$UpdateProfileRequestDto {
  const factory UpdateProfileRequestDto({
    String? prenom,
    String? nom,
    String? avatarUrl,
    String? dateNaissance, // ISO 8601 string
  }) = _UpdateProfileRequestDto;

  factory UpdateProfileRequestDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateProfileRequestDtoFromJson(json);

  Map<String, dynamic> toJson() => {
    if (prenom != null) 'prenom': prenom,
    if (nom != null) 'nom': nom,
    if (avatarUrl != null) 'avatarUrl': avatarUrl,
    if (dateNaissance != null) 'dateNaissance': dateNaissance,
  };
}

/// DTO pour Cloudinary Signature response
@freezed
class CloudinarySignatureDto with _$CloudinarySignatureDto {
  const factory CloudinarySignatureDto({
    required String signature,
    required int timestamp,
    required String apiKey,
    required String cloudName,
    required String folder,
    String? detection,
  }) = _CloudinarySignatureDto;

  factory CloudinarySignatureDto.fromJson(Map<String, dynamic> json) =>
      _$CloudinarySignatureDtoFromJson(json);
}

/// DTO pour Avatar upload response
@freezed
class AvatarUploadResponseDto with _$AvatarUploadResponseDto {
  const factory AvatarUploadResponseDto({
    required String avatarUrl,
    required String publicId,
  }) = _AvatarUploadResponseDto;

  factory AvatarUploadResponseDto.fromJson(Map<String, dynamic> json) =>
      _$AvatarUploadResponseDtoFromJson(json);
}
