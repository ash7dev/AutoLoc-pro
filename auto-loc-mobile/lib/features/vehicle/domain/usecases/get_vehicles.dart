import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// UseCase: Get Vehicles
///
/// Récupère la liste des véhicules avec filtres optionnels.
/// Applique les règles métier:
/// - Pagination
/// - Filtrage par ville, type, prix
/// - Tri par pertinence
///
/// Exemple d'utilisation:
/// ```dart
/// final result = await getVehicles(
///   GetVehiclesParams(ville: 'Dakar', prixMax: 50000),
/// );
/// result.fold(
///   (failure) => print('Erreur: $failure'),
///   (vehicles) => print('${vehicles.length} véhicules trouvés'),
/// );
/// ```
class GetVehicles {
  final VehicleRepository _repository;

  GetVehicles(this._repository);

  Future<Result<List<Vehicle>>> call([GetVehiclesParams? params]) {
    return _repository.getVehicles(
      page: params?.page,
      limit: params?.limit,
      ville: params?.ville,
      type: params?.type,
      prixMin: params?.prixMin,
      prixMax: params?.prixMax,
    );
  }
}

/// Paramètres pour GetVehicles
class GetVehiclesParams {
  final int? page;
  final int? limit;
  final String? ville;
  final String? type;
  final double? prixMin;
  final double? prixMax;

  const GetVehiclesParams({
    this.page,
    this.limit,
    this.ville,
    this.type,
    this.prixMin,
    this.prixMax,
  });
}
