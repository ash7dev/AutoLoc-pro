import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../../shared/enums/kyc_status.dart';
import '../../../../shared/enums/role_profile.dart';

part 'user.freezed.dart';

/// Entité User (Utilisateur) - Synchronisée avec Prisma model Utilisateur
/// Représente le profil complet de l'utilisateur connecté
@freezed
class User with _$User {
  const factory User({
    required String id,
    required String userId, // Clerk user ID
    required String email,
    required String telephone,
    required String prenom,
    required String nom,
    String? avatarUrl,
    DateTime? dateNaissance,
    required KycStatus statutKyc,
    required bool actif,
    DateTime? bloqueJusqua,
    required double noteLocataire,
    required double noteProprietaire,
    required int totalAvis,
    required DateTime creeLe,
    required DateTime misAJourLe,
    required bool phoneVerified,
    required bool profileCompleted,
    required RoleProfile role,
    
    // Documents KYC
    String? kycDocumentUrl,
    String? kycDocumentBackUrl,
    String? kycSelfieUrl,
    String? kycRejectionReason,
    
    // Permis de conduire
    String? permisUrl,
    String? permisPublicId,
  }) = _User;

  const User._();

  /// Nom complet de l'utilisateur
  String get nomComplet => '$prenom $nom';

  /// Vérifie si l'utilisateur peut louer un véhicule
  bool get peutLouer => actif && phoneVerified && statutKyc == KycStatus.verified && permisUrl != null;

  /// Vérifie si l'utilisateur peut mettre un véhicule en location
  bool get peutLouerVehicule => actif && phoneVerified && statutKyc == KycStatus.verified;

  /// Vérifie si le KYC est en attente
  bool get kycEnAttente => statutKyc == KycStatus.pending;

  /// Vérifie si le KYC est rejeté
  bool get kycRejete => statutKyc == KycStatus.rejected;

  /// Vérifie si le profil est complet (prenom + nom remplis)
  bool get isProfileComplete => profileCompleted;

  /// Note moyenne (locataire + propriétaire)
  double get noteMoyenne {
    if (totalAvis == 0) return 0;
    return (noteLocataire + noteProprietaire) / 2;
  }
}

/// Données pour soumettre le KYC
@freezed
class KycSubmission with _$KycSubmission {
  const factory KycSubmission({
    required String documentFrontUrl,
    required String documentBackUrl,
    String? selfieUrl,
  }) = _KycSubmission;
}

/// Résultat de signature Cloudinary pour upload KYC
@freezed
class CloudinarySignature with _$CloudinarySignature {
  const factory CloudinarySignature({
    required String signature,
    required int timestamp,
    required String apiKey,
    required String cloudName,
    required String folder,
    String? detection,
  }) = _CloudinarySignature;
}
