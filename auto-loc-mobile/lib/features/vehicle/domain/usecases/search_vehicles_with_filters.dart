import '../../../../core/utils/result.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Search Vehicles With Filters UseCase
///
/// Recherche de véhicules avec filtres.
class SearchVehiclesWithFilters {
  final VehicleRepository repository;

  SearchVehiclesWithFilters(this.repository);

  Future<Result<List<Vehicle>>> call({
    String? ville,
    String? type,
    DateTime? dateDebut,
    DateTime? dateFin,
    int? joursMinimum,
    double? prixMin,
    double? prixMax,
    bool? horsDakar,
    int? page,
    int? limit,
  }) {
    return repository.searchVehiclesWithFilters(
      ville: ville,
      type: type,
      dateDebut: dateDebut,
      dateFin: dateFin,
      joursMinimum: joursMinimum,
      prixMin: prixMin,
      prixMax: prixMax,
      horsDakar: horsDakar,
      page: page,
      limit: limit,
    );
  }
}
