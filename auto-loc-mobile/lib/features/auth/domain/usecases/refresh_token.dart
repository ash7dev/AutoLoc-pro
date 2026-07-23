import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Refresh Token UseCase
///
/// Rafraîchit le token.
class RefreshToken {
  final AuthRepository repository;

  RefreshToken(this.repository);

  Future<Result<AuthUser>> call({
    required String refreshToken,
  }) {
    return repository.refreshToken(refreshToken: refreshToken);
  }
}
