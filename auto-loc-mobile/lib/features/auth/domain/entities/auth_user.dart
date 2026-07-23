import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/role_profile.dart';

part 'auth_user.freezed.dart';

/// Auth User Entity
///
/// Représente l'utilisateur authentifié avec son profil.
/// Synchronisé avec ProfileResponse du backend.
@freezed
class AuthUser with _$AuthUser {
  const factory AuthUser({
    required String userId,
    required String email,
    String? telephone,
    required RoleProfile role,
    required bool phoneVerified,
    String? prenom,
    String? nom,
    DateTime? dateNaissance,
    String? avatarUrl,
    required bool hasUtilisateur,
    KycStatus? statutKyc,
    String? kycDocumentUrl,
    String? kycDocumentBackUrl,
    String? kycSelfieUrl,
    String? kycRejectionReason,
    String? accessToken,
    String? refreshToken,
  }) = _AuthUser;

  const AuthUser._();

  String get nomComplet {
    if (prenom != null && nom != null) {
      return '$prenom $nom';
    }
    return email;
  }

  bool get isProfileComplete {
    return prenom != null &&
           nom != null &&
           dateNaissance != null &&
           phoneVerified;
  }
}

/// KYC Status
enum KycStatus {
  notSubmitted,
  pending,
  verified,
  rejected,
}
