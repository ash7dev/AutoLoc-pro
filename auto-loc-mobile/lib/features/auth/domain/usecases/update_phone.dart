import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Update Phone UseCase
///
/// Met à jour le numéro de téléphone.
class UpdatePhone {
  final AuthRepository repository;

  UpdatePhone(this.repository);

  Future<Result<AuthUser>> call({
    required String telephone,
  }) {
    return repository.updatePhone(telephone: telephone);
  }
}
