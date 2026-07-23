import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Get Profile UseCase
///
/// Récupère le profil de l'utilisateur connecté.
class GetProfile {
  final AuthRepository repository;

  GetProfile(this.repository);

  Future<Result<AuthUser>> call() {
    return repository.getProfile();
  }
}
