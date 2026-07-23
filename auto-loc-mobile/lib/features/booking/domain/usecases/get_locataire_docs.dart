import '../../../../core/utils/result.dart';
import '../repositories/booking_repository.dart';

/// Get Locataire Docs UseCase
///
/// Récupère les documents KYC + permis du locataire.
class GetLocataireDocs {
  final BookingRepository repository;

  GetLocataireDocs(this.repository);

  Future<Result<Map<String, dynamic>>> call({
    required String bookingId,
  }) {
    return repository.getLocataireDocs(bookingId: bookingId);
  }
}
