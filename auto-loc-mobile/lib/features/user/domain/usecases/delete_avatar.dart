import '../../../../core/utils/result.dart';
import '../repositories/user_repository.dart';

/// UseCase: Supprimer l'avatar de profil
/// DELETE /users/me/avatar
class DeleteAvatar {
  final UserRepository _repository;
  DeleteAvatar(this._repository);

  Future<Result<bool>> call() {
    return _repository.deleteAvatar();
  }
}
