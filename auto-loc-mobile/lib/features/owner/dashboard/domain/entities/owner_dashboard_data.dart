import 'package:freezed_annotation/freezed_annotation.dart';

part 'owner_dashboard_data.freezed.dart';

/// Owner Dashboard Data Entity
///
/// Contient toutes les données du dashboard propriétaire :
/// - Statistiques des véhicules
/// - Réservations actives
/// - Taux d'occupation
/// - Revenus mensuels
/// - Revenus cumulés
/// - Actions urgentes (todos)
@freezed
class OwnerDashboardData with _$OwnerDashboardData {
  const factory OwnerDashboardData({
    required int totalVehicles,
    required int activeReservations,
    required double occupancyRate,
    required double monthlyRevenue,
    required double cumulativeRevenue,
    // Actions urgentes / Todos (avec valeurs par défaut)
    @Default(0) int pendingConfirmations,
    @Default(0) int upcomingCheckins,
    @Default(0) int upcomingCheckouts,
    @Default(0) int openDisputes,
  }) = _OwnerDashboardData;

  const OwnerDashboardData._();

  /// Vérifie si le dashboard a des données significatives
  /// Note: On retourne toujours true pour afficher le header même avec des valeurs à 0
  bool get hasData {
    return true; // Toujours afficher le dashboard, même si vide
  }

  /// Vérifie si le propriétaire a des véhicules
  bool get hasVehicles => totalVehicles > 0;

  /// Vérifie si le propriétaire a des réservations actives
  bool get hasActiveReservations => activeReservations > 0;

  /// Vérifie si le propriétaire a généré des revenus
  bool get hasRevenue => monthlyRevenue > 0 || cumulativeRevenue > 0;

  /// Vérifie s'il y a des actions urgentes à faire
  bool get hasTodos {
    return pendingConfirmations > 0 ||
           upcomingCheckins > 0 ||
           upcomingCheckouts > 0 ||
           openDisputes > 0;
  }

  /// Nombre total d'actions urgentes
  int get totalTodos {
    return pendingConfirmations + upcomingCheckins + upcomingCheckouts + openDisputes;
  }
}
