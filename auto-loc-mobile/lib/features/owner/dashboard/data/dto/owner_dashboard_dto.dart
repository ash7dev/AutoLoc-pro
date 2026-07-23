import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/owner_dashboard_data.dart';

part 'owner_dashboard_dto.freezed.dart';
part 'owner_dashboard_dto.g.dart';

/// Owner Dashboard DTO
///
/// Data Transfer Object pour les statistiques du dashboard propriétaire.
/// Synchronisé avec la réponse réelle de l'API `/reservations/owner/stats`:
/// - revenusMois (number)
/// - reservationsActives (number)
/// - tauxOccupation (number)
/// - litigesOuverts (number)
@freezed
class OwnerDashboardDto with _$OwnerDashboardDto {
  const factory OwnerDashboardDto({
    @JsonKey(name: 'revenusMois') double? monthlyRevenue,
    @JsonKey(name: 'reservationsActives') int? activeReservations,
    @JsonKey(name: 'tauxOccupation') double? occupancyRate,
    @JsonKey(name: 'totalVehicules') int? totalVehicles,
    @JsonKey(name: 'revenusCumules') double? cumulativeRevenue,
    // Actions urgentes
    @JsonKey(name: 'reservationsEnAttente') int? pendingConfirmations,
    @JsonKey(name: 'checkinsProches') int? upcomingCheckins,
    @JsonKey(name: 'checkoutsProches') int? upcomingCheckouts,
    @JsonKey(name: 'litigesOuverts') int? openDisputes,
  }) = _OwnerDashboardDto;

  const OwnerDashboardDto._();

  factory OwnerDashboardDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerDashboardDtoFromJson(json);

  /// Convertit le DTO en entité du domaine
  OwnerDashboardData toEntity() {
    return OwnerDashboardData(
      totalVehicles: totalVehicles ?? 0,
      activeReservations: activeReservations ?? 0,
      occupancyRate: occupancyRate ?? 0.0,
      monthlyRevenue: monthlyRevenue ?? 0.0,
      cumulativeRevenue: cumulativeRevenue ?? 0.0,
      pendingConfirmations: pendingConfirmations ?? 0,
      upcomingCheckins: upcomingCheckins ?? 0,
      upcomingCheckouts: upcomingCheckouts ?? 0,
      openDisputes: openDisputes ?? 0,
    );
  }
}
