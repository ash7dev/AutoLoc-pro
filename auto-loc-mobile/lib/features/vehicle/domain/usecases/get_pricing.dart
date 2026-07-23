import '../../../../core/utils/result.dart';
import '../repositories/vehicle_repository.dart';

/// Get Pricing UseCase
///
/// Prévisualisation du tarif dynamique.
class GetPricing {
  final VehicleRepository repository;

  GetPricing(this.repository);

  Future<Result<Map<String, dynamic>>> call({
    required String vehicleId,
    required int days,
    bool? horsDakar,
  }) {
    return repository.getPricing(
      vehicleId: vehicleId,
      days: days,
      horsDakar: horsDakar,
    );
  }
}
