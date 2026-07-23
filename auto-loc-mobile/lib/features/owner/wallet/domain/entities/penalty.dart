import 'package:freezed_annotation/freezed_annotation.dart';

part 'penalty.freezed.dart';

/// Pénalité du propriétaire
@freezed
class Penalty with _$Penalty {
  const factory Penalty({
    required String id,
    required double montant,
    required String raison,
    required DateTime creeLe,
    String? reservationId,
    String? vehicule, // Nom du véhicule
    DateTime? dateLocation,
  }) = _Penalty;

  const Penalty._();

  /// Formatage de la date de création
  String get formattedDate {
    return '${creeLe.day}/${creeLe.month}/${creeLe.year}';
  }
}
