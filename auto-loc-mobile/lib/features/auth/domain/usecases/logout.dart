import '../../../../core/utils/result.dart';
import '../repositories/auth_repository.dart';

/// Logout UseCase
///
/// Déconnecte l'utilisateur.
class Logout {
  final AuthRepository repository;

  Logout(this.repository);

  Future<Result<bool>> call() {
    return repository.logout();
  }
}
