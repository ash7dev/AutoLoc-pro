import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Switch Role UseCase
///
/// Change le rôle actif (LOCATAIRE ↔ PROPRIETAIRE).
class SwitchRole {
  final AuthRepository repository;

  SwitchRole(this.repository);

  Future<Result<AuthUser>> call({
    required String role,
  }) {
    return repository.switchRole(role: role);
  }
}
