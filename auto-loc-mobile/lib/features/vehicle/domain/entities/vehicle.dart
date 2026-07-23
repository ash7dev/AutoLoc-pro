import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/vehicle_type.dart';
import '../../../../shared/enums/vehicle_status.dart';
import '../../../../shared/enums/fuel_type.dart';
import '../../../../shared/enums/transmission.dart';
import '../../../../core/utils/formatters/money_formatter.dart';

part 'vehicle.freezed.dart';

/// Vehicle Entity - Domaine
///
/// Représente un véhicule dans la logique métier.
/// Immutable, type-safe avec Freezed.
/// Synchronisé avec Prisma model Vehicule du backend.
@freezed
class Vehicle with _$Vehicle {
  const factory Vehicle({
    /// ID unique du véhicule
    required String id,

    /// ID du propriétaire
    required String proprietaireId,

    /// Informations publiques du propriétaire (optionnel)
    VehicleOwner? proprietaire,

    /// Marque du véhicule (ex: Toyota, Mercedes)
    required String marque,

    /// Modèle du véhicule (ex: Corolla, Classe C)
    required String modele,

    /// Année de fabrication
    required int annee,

    /// Type de véhicule (BERLINE, SUV, etc.)
    required VehicleType type,

    /// Type de carburant
    FuelType? carburant,

    /// Type de transmission
    Transmission? transmission,

    /// Nombre de places
    int? nombrePlaces,

    /// Plaque d'immatriculation (unique)
    required String immatriculation,

    /// Prix par jour en FCFA
    required double prixParJour,

    /// Ville où se trouve le véhicule
    required String ville,

    /// Adresse exacte
    required String adresse,

    /// Latitude (optionnel pour localisation)
    double? latitude,

    /// Longitude (optionnel pour localisation)
    double? longitude,

    /// Nombre minimum de jours de location
    @Default(1) int joursMinimum,

    /// Âge minimum du locataire
    @Default(18) int ageMinimum,

    /// Statut du véhicule (EN_ATTENTE_VALIDATION, VERIFIE, etc.)
    @Default(VehicleStatus.pendingValidation) VehicleStatus statut,

    /// Note moyenne (0-5)
    @Default(0.0) double note,

    /// Nombre total d'avis
    @Default(0) int totalAvis,

    /// Nombre total de locations
    @Default(0) int totalLocations,

    /// Date de création
    required DateTime creeLe,

    /// Date de dernière mise à jour
    required DateTime misAJourLe,

    /// Informations sur l'assurance
    String? assurance,

    /// Règles spécifiques du propriétaire
    String? reglesSpecifiques,

    /// Zone de conduite autorisée
    String? zoneConduite,

    /// URL du document d'assurance
    String? assuranceDocUrl,

    /// Public ID Cloudinary du document d'assurance
    String? assuranceDocPublicId,

    /// URL de la carte grise
    String? carteGriseUrl,

    /// Public ID Cloudinary de la carte grise
    String? carteGrisePublicId,

    /// Frais de livraison (optionnel)
    double? fraisLivraison,

    /// Autorise la conduite hors Dakar
    @Default(false) bool autoriseHorsDakar,

    /// Supplément par jour si hors Dakar
    double? supplementHorsDakarParJour,

    /// Condition de carburant (plein à plein, etc.)
    String? carburantCondition,

    /// Date d'archivage (si archivé)
    DateTime? archiveLe,

    /// Véhicule mis en avant (featured)
    @Default(false) bool isFeatured,

    /// Date de fin du featured
    DateTime? featuredUntil,

    /// Photos du véhicule (URLs)
    @Default([]) List<PhotoVehicule> photos,

    /// Équipements du véhicule
    @Default([]) List<String> equipements,

    /// Tarifs par durée (optionnel)
    @Default([]) List<TarifDuree> tarifs,
  }) = _Vehicle;

  const Vehicle._();

  /// Photo principale du véhicule
  String? get photoPrincipale {
    final principale = photos.where((p) => p.estPrincipale).firstOrNull;
    return principale?.url ?? photos.firstOrNull?.url;
  }

  /// Véhicule est disponible (vérifié et non archivé)
  bool get estDisponible {
    return statut == VehicleStatus.verified && archiveLe == null;
  }

  /// Prix formaté en FCFA (SANS commission - prix propriétaire)
  /// ⚠️ DEPRECATED: Utilisez prixFormateLocataire à la place
  String get prixFormate {
    return '${prixParJour.toStringAsFixed(0)} FCFA';
  }

  /// Prix locataire formaté (avec commission 15%)
  /// Exemple: prix proprio 50000 → "57 500 FCFA"
  String get prixFormateLocataire {
    final prixLocataire = (prixParJour * 1.15).round();
    return prixLocataire.fcfa;
  }

  /// Calcule le meilleur tarif progressif (prix propriétaire le plus bas)
  double? get meilleurTarifProprietaire {
    if (tarifs.isEmpty) {
      return null;
    }
    return tarifs
        .map((t) => t.prix)
        .reduce((a, b) => a < b ? a : b);
  }

  /// Calcule l'économie maximale en % avec les tarifs progressifs
  int? get economieMaxPourcentage {
    final meilleurTarif = meilleurTarifProprietaire;
    if (meilleurTarif == null || meilleurTarif >= prixParJour) {
      return null;
    }
    return (((prixParJour - meilleurTarif) / prixParJour) * 100).round();
  }

  /// Jours minimum pour bénéficier du meilleur tarif
  int? get joursMinPourMeilleurTarif {
    if (tarifs.isEmpty) {
      return null;
    }
    final meilleurTarif = meilleurTarifProprietaire;
    if (meilleurTarif == null) return null;

    final tierAvecMeilleurTarif = tarifs
        .firstWhere((t) => t.prix == meilleurTarif);
    return tierAvecMeilleurTarif.joursMin;
  }

  /// Badge d'économies formaté
  /// Exemple: "−10% dès 7j"
  String? get badgeEconomies {
    final economie = economieMaxPourcentage;
    final jours = joursMinPourMeilleurTarif;
    if (economie == null || economie <= 0 || jours == null) {
      return null;
    }
    return '−$economie% dès ${jours}j';
  }

  /// Nom complet du véhicule
  String get nomComplet => '$marque $modele ($annee)';
}

/// Propriétaire du véhicule (données publiques)
@freezed
class VehicleOwner with _$VehicleOwner {
  const factory VehicleOwner({
    String? prenom,
    String? nom,
    String? avatarUrl,
  }) = _VehicleOwner;

  const VehicleOwner._();

  /// Nom complet du propriétaire
  String get nomComplet {
    final parts = [prenom, nom].where((e) => e != null && e.isNotEmpty);
    return parts.isEmpty ? 'Propriétaire' : parts.join(' ');
  }

  /// Initiale pour l'avatar
  String get initiale {
    if (prenom != null && prenom!.isNotEmpty) {
      return prenom![0].toUpperCase();
    }
    if (nom != null && nom!.isNotEmpty) {
      return nom![0].toUpperCase();
    }
    return 'P';
  }
}

/// Photo du véhicule
@freezed
class PhotoVehicule with _$PhotoVehicule {
  const factory PhotoVehicule({
    required String id,
    required String url,
    @Default(0) int position,
    @Default(false) bool estPrincipale,
    String? publicId,
  }) = _PhotoVehicule;
}

/// Tarif par durée
@freezed
class TarifDuree with _$TarifDuree {
  const factory TarifDuree({
    required String id,
    required int joursMin,
    int? joursMax,
    required double prix,
    @Default(0) int position,
  }) = _TarifDuree;
}
