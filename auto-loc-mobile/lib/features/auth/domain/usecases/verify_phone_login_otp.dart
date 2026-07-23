import '../../../../core/utils/result.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Verify Phone Login OTP UseCase
///
/// Vérifie l'OTP et login par téléphone.
class VerifyPhoneLoginOtp {
  final AuthRepository repository;

  VerifyPhoneLoginOtp(this.repository);

  Future<Result<AuthUser>> call({
    required String phone,
    required String code,
  }) {
    return repository.verifyPhoneLoginOtp(phone: phone, code: code);
  }
}
