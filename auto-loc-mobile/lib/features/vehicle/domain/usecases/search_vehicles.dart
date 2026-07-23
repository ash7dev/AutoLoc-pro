import '../../../../core/utils/result.dart';
import '../../../../core/errors/failures.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// UseCase: Search Vehicles
///
/// Recherche des véhicules par mots-clés.
/// Applique les règles métier:
/// - Validation du query (minimum 2 caractères)
/// - Recherche fulltext (marque, modèle, ville)
/// - Pagination
/// - Sauvegarde de l'historique de recherche
///
/// Exemple:
/// ```dart
/// final result = await searchVehicles(
///   SearchVehiclesParams(query: 'Toyota Dakar', limit: 20),
/// );
/// ```
class SearchVehicles {
  final VehicleRepository _repository;

  SearchVehicles(this._repository);

  Future<Result<List<Vehicle>>> call(SearchVehiclesParams params) {
    // Validation: minimum 2 caractères
    if (params.query.trim().length < 2) {
      return Future.value(
        failure(
          const ValidationFailure('La recherche doit contenir au moins 2 caractères'),
        ),
      );
    }

    // TODO: Sauvegarder dans l'historique de recherche
    return _repository.searchVehicles(
      query: params.query,
      page: params.page,
      limit: params.limit,
    );
  }
}

/// Paramètres pour SearchVehicles
class SearchVehiclesParams {
  final String query;
  final int? page;
  final int? limit;

  const SearchVehiclesParams({
    required this.query,
    this.page,
    this.limit,
  });
}
