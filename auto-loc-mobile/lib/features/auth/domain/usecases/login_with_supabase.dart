import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Login With Supabase UseCase
///
/// Login avec Supabase.
class LoginWithSupabase {
  final AuthRepository repository;

  LoginWithSupabase(this.repository);

  Future<Result<AuthUser>> call({
    required String accessToken,
  }) {
    return repository.loginWithSupabase(accessToken: accessToken);
  }
}
