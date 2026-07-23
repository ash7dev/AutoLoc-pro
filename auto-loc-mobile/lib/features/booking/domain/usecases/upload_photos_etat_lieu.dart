import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../repositories/booking_repository.dart';

/// UseCase: Upload Photos État des Lieux
///
/// Upload les photos d'état des lieux pour une réservation.
///
/// Utilisation:
/// - Check-in: Photos de l'état initial du véhicule
/// - Check-out: Photos de l'état final du véhicule
///
/// Workflow:
/// 1. Sélection des photos depuis la galerie ou caméra
/// 2. Upload vers Cloudinary via le backend
/// 3. Retourne les URLs publiques des photos uploadées
/// 4. Ces URLs sont ensuite utilisées pour le check-in/check-out
///
/// Règles métier:
/// - Minimum 1 photo requise
/// - Maximum 10 photos autorisées
/// - Formats acceptés: JPG, PNG
/// - Taille maximale: 5 MB par photo
class UploadPhotosEtatLieu {
  final BookingRepository _repository;

  UploadPhotosEtatLieu(this._repository);

  Future<Result<List<String>>> call(UploadPhotosEtatLieuParams params) async {
    // Validation: au moins une photo
    if (params.photoPaths.isEmpty) {
      return failure(
        const ValidationFailure(
          'Vous devez sélectionner au moins une photo',
        ),
      );
    }

    // Validation: maximum 10 photos
    if (params.photoPaths.length > 10) {
      return failure(
        const ValidationFailure(
          'Vous ne pouvez pas uploader plus de 10 photos',
        ),
      );
    }

    // TODO: Valider les formats et tailles des fichiers côté client

    return _repository.uploadPhotosEtatLieu(
      bookingId: params.bookingId,
      photoPaths: params.photoPaths,
      isCheckin: params.isCheckin,
    );
  }
}

/// Paramètres pour UploadPhotosEtatLieu
class UploadPhotosEtatLieuParams {
  /// ID de la réservation
  final String bookingId;

  /// Chemins locaux des photos à uploader
  final List<String> photoPaths;

  /// true = check-in (début), false = check-out (fin)
  final bool isCheckin;

  const UploadPhotosEtatLieuParams({
    required this.bookingId,
    required this.photoPaths,
    required this.isCheckin,
  });
}
