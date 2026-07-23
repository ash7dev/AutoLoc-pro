import '../../../../core/utils/result.dart';
import '../entities/user.dart';
import '../repositories/user_repository.dart';

/// UseCase: Obtenir signature Cloudinary pour upload KYC
/// GET /auth/kyc/upload-signature
class GetKycUploadSignature {
  final UserRepository _repository;
  GetKycUploadSignature(this._repository);

  Future<Result<CloudinarySignature>> call({String? detection}) {
    return _repository.getKycUploadSignature(detection: detection);
  }
}
