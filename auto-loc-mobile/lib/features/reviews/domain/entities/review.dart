import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/review_type.dart';

part 'review.freezed.dart';

/// Review Entity (Avis dans le backend)
///
/// Entité métier représentant un avis entre utilisateurs.
/// Synchronisée avec: apps/auto-loc-backend/prisma/schema.prisma (model Avis)
///
/// Cette entité est immutable et contient toute la logique métier
/// liée aux avis (validations, calculs).
@freezed
class Review with _$Review {
  const factory Review({
    required String id,
    required String reservationId,
    required String auteurId,
    required String cibleId,
    required int note,
    String? commentaire,
    required ReviewType typeAvis,
    required DateTime creeLe,
  }) = _Review;

  const Review._();

  /// Vérifie si la note est excellente (5 étoiles)
  bool get isExcellent => note == 5;

  /// Vérifie si la note est bonne (4-5 étoiles)
  bool get isGood => note >= 4;

  /// Vérifie si la note est moyenne (3 étoiles)
  bool get isAverage => note == 3;

  /// Vérifie si la note est mauvaise (1-2 étoiles)
  bool get isPoor => note <= 2;

  /// Vérifie si l'avis est du locataire vers le propriétaire
  bool get isTenantToOwner => typeAvis == ReviewType.tenantNotesOwner;

  /// Vérifie si l'avis est du propriétaire vers le locataire
  bool get isOwnerToTenant => typeAvis == ReviewType.ownerNotesTenant;

  /// Note formatée avec étoiles
  String get noteStars => '⭐' * note;

  /// Note formatée en texte
  String get noteText {
    return switch (note) {
      5 => 'Excellent',
      4 => 'Très bien',
      3 => 'Bien',
      2 => 'Moyen',
      1 => 'Mauvais',
      _ => 'Non noté',
    };
  }
}
