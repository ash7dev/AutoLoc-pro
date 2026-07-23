import '../../../../shared/enums/role_profile.dart';
import '../../domain/entities/auth_user.dart';
import '../dto/auth_user_dto.dart';

/// Auth Mapper
///
/// Convertit entre DTO (couche data) et Entity (couche domain).
class AuthMapper {
  /// Convertit AuthUserDto → AuthUser Entity
  static AuthUser toEntity(AuthUserDto dto) {
    return AuthUser(
      userId: dto.userId,
      email: dto.email,
      telephone: dto.telephone,
      role: _mapRole(dto.role),
      phoneVerified: dto.phoneVerified ?? false,
      prenom: dto.prenom,
      nom: dto.nom,
      dateNaissance: dto.dateNaissance,
      avatarUrl: dto.avatarUrl,
      hasUtilisateur: dto.hasUtilisateur ?? false,
      statutKyc: _mapKycStatus(dto.statutKyc),
      kycDocumentUrl: dto.kycDocumentUrl,
      kycDocumentBackUrl: dto.kycDocumentBackUrl,
      kycSelfieUrl: dto.kycSelfieUrl,
      kycRejectionReason: dto.kycRejectionReason,
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
    );
  }

  /// Convertit AuthUser Entity → AuthUserDto
  static AuthUserDto toDto(AuthUser entity) {
    return AuthUserDto(
      userId: entity.userId,
      email: entity.email,
      telephone: entity.telephone,
      role: entity.role.toPrismaString(),
      phoneVerified: entity.phoneVerified,
      prenom: entity.prenom,
      nom: entity.nom,
      dateNaissance: entity.dateNaissance,
      avatarUrl: entity.avatarUrl,
      hasUtilisateur: entity.hasUtilisateur,
      statutKyc: entity.statutKyc?.toPrismaString(),
      kycDocumentUrl: entity.kycDocumentUrl,
      kycDocumentBackUrl: entity.kycDocumentBackUrl,
      kycSelfieUrl: entity.kycSelfieUrl,
      kycRejectionReason: entity.kycRejectionReason,
      accessToken: entity.accessToken,
      refreshToken: entity.refreshToken,
    );
  }

  static RoleProfile _mapRole(String value) {
    return RoleProfile.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => RoleProfile.locataire,
    );
  }

  static KycStatus _mapKycStatus(String? value) {
    if (value == null) return KycStatus.notSubmitted;
    return KycStatus.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => KycStatus.notSubmitted,
    );
  }
}

extension KycStatusExtension on KycStatus {
  String toPrismaString() {
    switch (this) {
      case KycStatus.notSubmitted:
        return 'NON_VERIFIE';
      case KycStatus.pending:
        return 'EN_ATTENTE';
      case KycStatus.verified:
        return 'VERIFIE';
      case KycStatus.rejected:
        return 'REJETE';
    }
  }
}
