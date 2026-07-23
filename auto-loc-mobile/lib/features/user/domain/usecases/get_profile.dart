import '../../../../core/utils/result.dart';
import '../entities/user.dart';
import '../repositories/user_repository.dart';

/// UseCase: Récupérer le profil de l'utilisateur connecté
/// GET /users/me/profile
class GetProfile {
  final UserRepository _repository;
  GetProfile(this._repository);

  Future<Result<User>> call() {
    return _repository.getProfile();
  }
}
