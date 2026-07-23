import '../../../../shared/enums/kyc_status.dart';
import '../../../../shared/enums/role_profile.dart';
import '../../domain/entities/user.dart';
import '../dto/user_dto.dart';

/// Mapper: DTO ↔ Entity pour User
class UserMapper {
  /// Convertit UserDto → User (Entity)
  static User toEntity(UserDto dto) {
    return User(
      id: dto.id,
      userId: dto.userId,
      email: dto.email,
      telephone: dto.telephone,
      prenom: dto.prenom,
      nom: dto.nom,
      avatarUrl: dto.avatarUrl,
      dateNaissance: dto.dateNaissance != null ? DateTime.tryParse(dto.dateNaissance!) : null,
      statutKyc: KycStatus.fromPrismaString(dto.statutKyc),
      actif: true, // Toujours true si user connecté
      bloqueJusqua: null,
      noteLocataire: dto.noteLocataire,
      noteProprietaire: dto.noteProprietaire,
      totalAvis: dto.totalAvis,
      creeLe: DateTime.parse(dto.creeLe),
      misAJourLe: DateTime.now(), // Pas retourné par l'API, on met now()
      phoneVerified: dto.phoneVerified,
      profileCompleted: dto.profileCompleted,
      role: RoleProfile.fromPrismaString(dto.role),
      kycDocumentUrl: dto.kycDocumentUrl,
      kycDocumentBackUrl: dto.kycDocumentBackUrl,
      kycSelfieUrl: dto.kycSelfieUrl,
      kycRejectionReason: null, // Pas retourné par GET profile
      permisUrl: dto.permisUrl,
      permisPublicId: null, // Pas retourné par GET profile
    );
  }

  /// Convertit CloudinarySignatureDto → CloudinarySignature (Entity)
  static CloudinarySignature toCloudinarySignature(CloudinarySignatureDto dto) {
    return CloudinarySignature(
      signature: dto.signature,
      timestamp: dto.timestamp,
      apiKey: dto.apiKey,
      cloudName: dto.cloudName,
      folder: dto.folder,
      detection: dto.detection,
    );
  }
}
