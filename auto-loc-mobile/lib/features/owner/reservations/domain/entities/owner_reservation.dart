import 'package:freezed_annotation/freezed_annotation.dart';

part 'owner_reservation.freezed.dart';

/// Entité Domain pour une réservation côté propriétaire
@freezed
class OwnerReservation with _$OwnerReservation {
  const factory OwnerReservation({
    required String id,
    required String vehiculeId,
    required String locataireId,
    required DateTime dateDebut,
    required DateTime dateFin,
    required double prixParJour,
    required double totalBase,
    required double montantCommission,
    required double netProprietaire,
    required String statut,
    // Infos véhicule
    String? vehiculeMarque,
    String? vehiculeModele,
    String? vehiculeImmatriculation,
    String? vehiculePhoto,
    // Infos locataire
    String? locataireNom,
    String? locatairePrenom,
    String? locatairePhoto,
    String? locataireTelephone,
    // Dates importantes
    DateTime? confirmeeLe,
    DateTime? checkinLe,
    DateTime? checkoutLe,
    DateTime? annuleLe,
    String? raisonAnnulation,
    String? adresseLivraison,
    DateTime? creeLe,
  }) = _OwnerReservation;

  const OwnerReservation._();

  /// Nombre de jours de location
  int get nombreJours {
    return dateFin.difference(dateDebut).inDays;
  }

  /// Nom complet du locataire
  String get locataireNomComplet {
    if (locatairePrenom != null && locataireNom != null) {
      return '$locatairePrenom $locataireNom';
    }
    return 'Locataire inconnu';
  }

  /// Nom du véhicule
  String get vehiculeNom {
    if (vehiculeMarque != null && vehiculeModele != null) {
      return '$vehiculeMarque $vehiculeModele';
    }
    return 'Véhicule';
  }

  /// Badge de statut
  bool get isEnCours {
    return statut == 'CONFIRMEE' || statut == 'EN_COURS';
  }

  bool get isTerminee {
    return statut == 'TERMINEE' || statut == 'CLOSE';
  }

  bool get isAnnulee {
    return statut == 'ANNULEE';
  }

  bool get isLitige {
    return statut == 'LITIGE';
  }

  bool get isEnAttente {
    return statut == 'EN_ATTENTE_PAIEMENT' || statut == 'PAYEE';
  }

  /// Couleur du badge de statut
  String get statusColor {
    if (isEnCours) return 'blue';
    if (isTerminee) return 'green';
    if (isAnnulee) return 'grey';
    if (isLitige) return 'red';
    if (isEnAttente) return 'orange';
    return 'grey';
  }

  /// Label du statut en français
  String get statusLabel {
    switch (statut) {
      case 'EN_ATTENTE_PAIEMENT':
        return 'En attente paiement';
      case 'PAYEE':
        return 'Payée';
      case 'CONFIRMEE':
        return 'Confirmée';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINEE':
        return 'Terminée';
      case 'CLOSE':
        return 'Clôturée';
      case 'ANNULEE':
        return 'Annulée';
      case 'LITIGE':
        return 'Litige';
      default:
        return statut;
    }
  }
}
