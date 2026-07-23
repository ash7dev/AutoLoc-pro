import 'package:dio/dio.dart';

import '../../../../../core/constants/api_endpoints.dart';
import '../dto/owner_vehicle_dto.dart';

/// DataSource distant pour la gestion de la flotte
abstract class FleetRemoteDataSource {
  Future<List<OwnerVehicleDto>> getMyVehicles();
  Future<OwnerVehicleDto> getVehicleById(String id);
  Future<void> deleteVehicle(String id);
}

/// Implémentation du DataSource distant
class FleetRemoteDataSourceImpl implements FleetRemoteDataSource {
  final Dio _dio;

  const FleetRemoteDataSourceImpl(this._dio);

  @override
  Future<List<OwnerVehicleDto>> getMyVehicles() async {
    final response = await _dio.get(ApiEndpoints.myVehicles);

    // Vérifier que la réponse est bien une liste
    if (response.data is! List) {
      // Si c'est un objet (probablement une erreur), lancer une exception
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: 'Expected List but got ${response.data.runtimeType}',
      );
    }

    // L'API retourne une liste de véhicules
    final List<dynamic> data = response.data as List<dynamic>;

    return data
        .map((json) => OwnerVehicleDto.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<OwnerVehicleDto> getVehicleById(String id) async {
    final response = await _dio.get(ApiEndpoints.vehicleById(id));

    return OwnerVehicleDto.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<void> deleteVehicle(String id) async {
    await _dio.delete(ApiEndpoints.deleteVehicle(id));
  }
}
