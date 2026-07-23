import '../../../../core/utils/result.dart';
import '../repositories/auth_repository.dart';

/// Send Phone OTP UseCase
///
/// Envoie un OTP pour vérification téléphone.
class SendPhoneOtp {
  final AuthRepository repository;

  SendPhoneOtp(this.repository);

  Future<Result<int>> call() {
    return repository.sendPhoneOtp();
  }
}
