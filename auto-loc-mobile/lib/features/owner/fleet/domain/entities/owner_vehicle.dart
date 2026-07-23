import 'package:freezed_annotation/freezed_annotation.dart';

part 'owner_vehicle.freezed.dart';

/// Entité représentant un véhicule du propriétaire
///
/// Contient toutes les informations nécessaires pour afficher
/// et gérer un véhicule dans la flotte du propriétaire.
@freezed
class OwnerVehicle with _$OwnerVehicle {
  const factory OwnerVehicle({
    required String id,
    required String marque,
    required String modele,
    required int annee,
    required String immatriculation,
    required String couleur,
    required int nombrePlaces,
    required String typeCarburant,
    required String typeBoite,
    required double prixParJour,
    required String statut, // DISPONIBLE, RESERVE, MAINTENANCE, SUSPENDU
    required bool estValide,
    @Default([]) List<String> photos,
    @Default(0) int totalReservations,
    @Default(0) int reservationsActives,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _OwnerVehicle;

  const OwnerVehicle._();

  /// Vérifie si le véhicule est disponible
  bool get isAvailable => statut == 'DISPONIBLE' && estValide;

  /// Vérifie si le véhicule est en réservation
  bool get isReserved => statut == 'RESERVE';

  /// Vérifie si le véhicule est en maintenance
  bool get isMaintenance => statut == 'MAINTENANCE';

  /// Vérifie si le véhicule est suspendu
  bool get isSuspended => statut == 'SUSPENDU';

  /// Retourne la photo principale ou null
  String? get mainPhoto => photos.isNotEmpty ? photos.first : null;

  /// Retourne le nom complet du véhicule
  String get fullName => '$marque $modele ($annee)';

  /// Retourne la couleur du statut pour l'UI
  String get statusColor {
    switch (statut) {
      case 'DISPONIBLE':
        return '#34D399'; // kEmerald
      case 'RESERVE':
        return '#3B82F6'; // Blue
      case 'MAINTENANCE':
        return '#F59E0B'; // Orange
      case 'SUSPENDU':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  }

  /// Retourne le label du statut en français
  String get statusLabel {
    switch (statut) {
      case 'DISPONIBLE':
        return 'Disponible';
      case 'RESERVE':
        return 'Réservé';
      case 'MAINTENANCE':
        return 'Maintenance';
      case 'SUSPENDU':
        return 'Suspendu';
      default:
        return statut;
    }
  }
}
