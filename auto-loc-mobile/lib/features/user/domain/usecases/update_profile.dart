import '../../../../core/utils/result.dart';
import '../entities/user.dart';
import '../repositories/user_repository.dart';

/// UseCase: Mettre à jour le profil utilisateur
/// PATCH /users/me/profile
class UpdateProfile {
  final UserRepository _repository;
  UpdateProfile(this._repository);

  Future<Result<User>> call(UpdateProfileParams params) {
    return _repository.updateProfile(
      prenom: params.prenom,
      nom: params.nom,
      avatarUrl: params.avatarUrl,
      dateNaissance: params.dateNaissance,
    );
  }
}

class UpdateProfileParams {
  final String? prenom;
  final String? nom;
  final String? avatarUrl;
  final DateTime? dateNaissance;

  UpdateProfileParams({this.prenom, this.nom, this.avatarUrl, this.dateNaissance});
}
