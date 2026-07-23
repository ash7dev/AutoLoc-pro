import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/role_profile.dart';

part 'auth_user_dto.freezed.dart';
part 'auth_user_dto.g.dart';

/// Auth User DTO
///
/// Représente la structure JSON retournée par l'API backend.
/// Synchronisé avec ProfileResponse du backend.
@freezed
class AuthUserDto with _$AuthUserDto {
  const factory AuthUserDto({
    required String userId,
    required String email,
    String? telephone,
    required String role,
    @JsonKey(name: 'phoneVerified') bool? phoneVerified,
    String? prenom,
    String? nom,
    DateTime? dateNaissance,
    String? avatarUrl,
    @JsonKey(name: 'hasUtilisateur') bool? hasUtilisateur,
    String? statutKyc,
    String? kycDocumentUrl,
    String? kycDocumentBackUrl,
    String? kycSelfieUrl,
    String? kycRejectionReason,
    String? accessToken,
    String? refreshToken,
  }) = _AuthUserDto;

  factory AuthUserDto.fromJson(Map<String, dynamic> json) =>
      _$AuthUserDtoFromJson(json);
}
