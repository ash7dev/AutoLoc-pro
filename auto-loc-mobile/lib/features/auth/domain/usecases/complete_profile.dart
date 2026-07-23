import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Complete Profile UseCase
///
/// Complète le profil utilisateur (aligné sur frontend).
class CompleteProfile {
  final AuthRepository repository;

  CompleteProfile(this.repository);

  Future<Result<AuthUser>> call({
    required String prenom,
    required String nom,
    String? telephone,
    DateTime? dateNaissance,
  }) {
    return repository.completeProfile(
      prenom: prenom,
      nom: nom,
      telephone: telephone,
      dateNaissance: dateNaissance,
    );
  }
}
