import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../repositories/user_repository.dart';

/// UseCase: Upload avatar de profil
/// POST /users/me/avatar
class UploadAvatar {
  final UserRepository _repository;
  UploadAvatar(this._repository);

  Future<Result<String>> call(String imagePath) {
    // Validation: fichier existe
    if (imagePath.isEmpty) {
      return Future.value(failure(const ValidationFailure('Chemin image requis')));
    }

    return _repository.uploadAvatar(imagePath);
  }
}
