import '../../../../core/utils/result.dart';
import '../entities/user.dart';

/// Repository pour la gestion du profil utilisateur
/// Interface pure (Domain layer) - Implémentée dans Data layer
abstract class UserRepository {
  /// GET /users/me/profile
  /// Récupère le profil complet de l'utilisateur connecté
  /// 
  /// Retourne:
  /// - Success: User complet avec tous les champs
  /// - Failure: NetworkFailure, UnauthorizedFailure, UnexpectedFailure
  Future<Result<User>> getProfile();

  /// PATCH /users/me/profile
  /// Met à jour le profil de l'utilisateur
  /// 
  /// Params:
  /// - prenom: Prénom (optionnel)
  /// - nom: Nom (optionnel)
  /// - avatarUrl: URL avatar (optionnel)
  /// - dateNaissance: Date de naissance (optionnel)
  /// 
  /// Note: Si prenom/nom/dateNaissance changent et que KYC != NON_VERIFIE,
  /// le backend reset automatiquement le KYC à NON_VERIFIE
  /// 
  /// Retourne:
  /// - Success: User mis à jour
  /// - Failure: ValidationFailure, NetworkFailure, UnexpectedFailure
  Future<Result<User>> updateProfile({
    String? prenom,
    String? nom,
    String? avatarUrl,
    DateTime? dateNaissance,
  });

  /// POST /users/me/avatar
  /// Upload une photo de profil (Cloudinary)
  /// 
  /// Params:
  /// - imagePath: Chemin local de l'image à uploader
  /// 
  /// Workflow:
  /// 1. Upload vers Cloudinary via le backend
  /// 2. Suppression automatique de l'ancien avatar si existant
  /// 3. Mise à jour de avatarUrl et avatarPublicId dans la DB
  /// 
  /// Retourne:
  /// - Success: URL Cloudinary de l'avatar
  /// - Failure: ValidationFailure (format invalide), NetworkFailure, UnexpectedFailure
  Future<Result<String>> uploadAvatar(String imagePath);

  /// DELETE /users/me/avatar
  /// Supprime la photo de profil de l'utilisateur
  /// 
  /// Workflow:
  /// 1. Suppression de Cloudinary
  /// 2. Mise à NULL de avatarUrl et avatarPublicId
  /// 
  /// Retourne:
  /// - Success: true si supprimé
  /// - Failure: ValidationFailure (pas d'avatar), NetworkFailure
  Future<Result<bool>> deleteAvatar();

  /// GET /auth/kyc/upload-signature
  /// Obtient une signature Cloudinary pour upload direct KYC
  /// 
  /// Params:
  /// - detection: Type de détection (ex: 'adv_face' pour selfie)
  /// 
  /// Retourne:
  /// - Success: CloudinarySignature avec signature, timestamp, apiKey, etc.
  /// - Failure: NetworkFailure, UnauthorizedFailure
  Future<Result<CloudinarySignature>> getKycUploadSignature({String? detection});

  /// POST /auth/kyc/submit-links
  /// Soumet le KYC avec des URLs Cloudinary déjà uploadées
  /// 
  /// Params:
  /// - documentFrontUrl: URL du recto de la pièce d'identité
  /// - documentBackUrl: URL du verso de la pièce d'identité
  /// - selfieUrl: URL du selfie (optionnel)
  /// 
  /// Workflow:
  /// 1. Valide que les URLs sont bien sur Cloudinary
  /// 2. Met à jour statutKyc = EN_ATTENTE
  /// 3. Sauvegarde les URLs dans kycDocumentUrl, kycDocumentBackUrl, kycSelfieUrl
  /// 
  /// Retourne:
  /// - Success: User mis à jour avec statutKyc = EN_ATTENTE
  /// - Failure: ValidationFailure, NetworkFailure
  Future<Result<User>> submitKyc({
    required String documentFrontUrl,
    required String documentBackUrl,
    String? selfieUrl,
  });

  /// POST /auth/permis/link
  /// Lie un permis de conduire déjà uploadé sur Cloudinary
  /// 
  /// Params:
  /// - url: URL Cloudinary du permis
  /// - publicId: Public ID Cloudinary pour suppression future
  /// 
  /// Workflow:
  /// 1. Suppression de l'ancien permis si existant
  /// 2. Sauvegarde de permisUrl et permisPublicId
  /// 
  /// Retourne:
  /// - Success: true si lié
  /// - Failure: ValidationFailure, NetworkFailure
  Future<Result<bool>> linkPermis({
    required String url,
    required String publicId,
  });
}
