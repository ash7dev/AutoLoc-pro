import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Verify Phone OTP UseCase
///
/// Vérifie le code OTP du téléphone.
class VerifyPhoneOtp {
  final AuthRepository repository;

  VerifyPhoneOtp(this.repository);

  Future<Result<AuthUser>> call({
    required String code,
  }) {
    return repository.verifyPhoneOtp(code: code);
  }
}
