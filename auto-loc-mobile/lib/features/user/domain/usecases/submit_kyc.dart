import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../entities/user.dart';
import '../repositories/user_repository.dart';

/// UseCase: Soumettre le KYC avec URLs Cloudinary
/// POST /auth/kyc/submit-links
class SubmitKyc {
  final UserRepository _repository;
  SubmitKyc(this._repository);

  Future<Result<User>> call(SubmitKycParams params) {
    // Validation: URLs requises
    if (params.documentFrontUrl.isEmpty || params.documentBackUrl.isEmpty) {
      return Future.value(failure(const ValidationFailure('Documents recto/verso requis')));
    }

    return _repository.submitKyc(
      documentFrontUrl: params.documentFrontUrl,
      documentBackUrl: params.documentBackUrl,
      selfieUrl: params.selfieUrl,
    );
  }
}

class SubmitKycParams {
  final String documentFrontUrl;
  final String documentBackUrl;
  final String? selfieUrl;

  SubmitKycParams({
    required this.documentFrontUrl,
    required this.documentBackUrl,
    this.selfieUrl,
  });
}
