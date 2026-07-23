import 'package:dio/dio.dart';

import '../../../../../core/constants/api_endpoints.dart';
import '../dto/owner_reservation_dto.dart';

/// Remote DataSource pour les réservations du propriétaire
abstract class OwnerReservationsRemoteDataSource {
  Future<List<OwnerReservationDto>> getMyReservations({
    String? vehiculeId,
    int? page,
    int? limit,
  });

  Future<OwnerReservationDto> getReservationById(String id);

  Future<OwnerReservationDto> confirmReservation(String id, String heureDebut);

  Future<OwnerReservationDto> cancelReservation(String id, String raison);
}

class OwnerReservationsRemoteDataSourceImpl implements OwnerReservationsRemoteDataSource {
  final Dio _dio;

  OwnerReservationsRemoteDataSourceImpl(this._dio);

  @override
  Future<List<OwnerReservationDto>> getMyReservations({
    String? vehiculeId,
    int? page,
    int? limit,
  }) async {
    final queryParams = <String, dynamic>{};
    if (vehiculeId != null) queryParams['vehiculeId'] = vehiculeId;
    if (page != null) queryParams['page'] = page;
    if (limit != null) queryParams['limit'] = limit;

    final response = await _dio.get(
      ApiEndpoints.ownerReservations,
      queryParameters: queryParams,
    );

    // L'API retourne une structure paginée: {data: [], total: 0, page: 1, limit: 20}
    // On extrait le tableau 'data'
    if (response.data is! Map<String, dynamic>) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: 'Expected Map but got ${response.data.runtimeType}',
      );
    }

    final responseData = response.data as Map<String, dynamic>;
    final dataList = responseData['data'];

    if (dataList is! List) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: 'Expected List in data field but got ${dataList.runtimeType}',
      );
    }

    final List<dynamic> data = dataList as List<dynamic>;
    return data
        .map((json) => OwnerReservationDto.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<OwnerReservationDto> getReservationById(String id) async {
    final response = await _dio.get('${ApiEndpoints.reservations}/$id');
    return OwnerReservationDto.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<OwnerReservationDto> confirmReservation(String id, String heureDebut) async {
    final response = await _dio.patch(
      '${ApiEndpoints.reservations}/$id/confirm',
      data: {'heureDebut': heureDebut},
    );
    return OwnerReservationDto.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<OwnerReservationDto> cancelReservation(String id, String raison) async {
    final response = await _dio.patch(
      '${ApiEndpoints.reservations}/$id/cancel',
      data: {'raison': raison},
    );
    return OwnerReservationDto.fromJson(response.data as Map<String, dynamic>);
  }
}
