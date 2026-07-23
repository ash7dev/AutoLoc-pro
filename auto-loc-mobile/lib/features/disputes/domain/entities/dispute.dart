import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/dispute_resolution.dart';
import '../../../../shared/enums/dispute_status.dart';

part 'dispute.freezed.dart';

/// Dispute Entity (Litige)
///
/// Représente un litige entre locataire et propriétaire.
/// Synchronisé avec: model Litige (schema.prisma)
@freezed
class Dispute with _$Dispute {
  const factory Dispute({
    required String id,
    required String reservationId,
    required String auteurId,
    required String motif,
    required String commentaire,
    required DisputeStatus statut,
    DisputeResolution? resolution,
    String? resolutionCommentaire,
    String? arbitreId,
    required DateTime creeLe,
    DateTime? resoluLe,
  }) = _Dispute;

  const Dispute._();

  /// Est en attente
  bool get isPending => statut == DisputeStatus.enAttente;

  /// Est en cours de traitement
  bool get isInProgress => statut == DisputeStatus.enCours;

  /// Est résolu
  bool get isResolved => statut == DisputeStatus.resolu;

  /// Est rejeté
  bool get isRejected => statut == DisputeStatus.rejete;

  /// Est terminé (résolu ou rejeté)
  bool get isClosed => statut.isClosed;

  /// Est favorable au locataire
  bool get isFavorTenant => resolution == DisputeResolution.favorLocataire;

  /// Est favorable au propriétaire
  bool get isFavorOwner => resolution == DisputeResolution.favorProprietaire;

  /// Est un partage des frais
  bool get isShare => resolution == DisputeResolution.partage;

  /// Statut formatté
  String get statutLabel => statut.label;

  /// Résolution formattée
  String get resolutionLabel => resolution?.label ?? 'Non résolu';
}
