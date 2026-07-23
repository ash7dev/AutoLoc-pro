import '../../../../core/utils/result.dart';
import '../repositories/auth_repository.dart';

/// Check Availability UseCase
///
/// Vérifie la disponibilité d'un email ou téléphone.
class CheckAvailability {
  final AuthRepository repository;

  CheckAvailability(this.repository);

  Future<Result<bool>> call({
    String? email,
    String? phone,
  }) {
    return repository.checkAvailability(email: email, phone: phone);
  }
}
