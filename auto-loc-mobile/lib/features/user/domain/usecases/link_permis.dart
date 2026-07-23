import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../repositories/user_repository.dart';

/// UseCase: Lier le permis de conduire
/// POST /auth/permis/link
class LinkPermis {
  final UserRepository _repository;
  LinkPermis(this._repository);

  Future<Result<bool>> call(LinkPermisParams params) {
    // Validation: URL et publicId requis
    if (params.url.isEmpty || params.publicId.isEmpty) {
      return Future.value(failure(const ValidationFailure('URL et publicId requis')));
    }

    return _repository.linkPermis(url: params.url, publicId: params.publicId);
  }
}

class LinkPermisParams {
  final String url;
  final String publicId;

  LinkPermisParams({required this.url, required this.publicId});
}
