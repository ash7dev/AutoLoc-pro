import '../../../../core/utils/result.dart';
import '../repositories/auth_repository.dart';

/// Send Phone Login OTP UseCase
///
/// Envoie un OTP pour login par téléphone (non authentifié).
class SendPhoneLoginOtp {
  final AuthRepository repository;

  SendPhoneLoginOtp(this.repository);

  Future<Result<int>> call({
    required String phone,
  }) {
    return repository.sendPhoneLoginOtp(phone: phone);
  }
}
