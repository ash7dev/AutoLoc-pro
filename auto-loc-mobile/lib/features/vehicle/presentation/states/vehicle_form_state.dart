import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/fuel_type.dart';
import '../../../../shared/enums/transmission.dart';
import '../../../../shared/enums/vehicle_type.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/vehicle.dart';

part 'vehicle_form_state.freezed.dart';

/// Type alias pour l'état du formulaire de véhicule
typedef VehicleFormState = ViewState<VehicleFormData>;

/// Données du formulaire de création / modification d'un véhicule
@freezed
class VehicleFormData with _$VehicleFormData {
  const factory VehicleFormData({
    /// Véhicule existant (si modification)
    Vehicle? vehicle,

    /// Marque (ex: Toyota)
    @Default('') String marque,

    /// Modèle (ex: Yaris)
    @Default('') String modele,

    /// Année de construction
    @Default(2020) int annee,

    /// Type de carrosserie
    VehicleType? type,

    /// Type de carburant
    FuelType? carburant,

    /// Type de transmission (Manuelle / Automatique)
    Transmission? transmission,

    /// Nombre de places
    @Default(5) int nombrePlaces,

    /// Plaque d'immatriculation
    @Default('') String immatriculation,

    /// Prix journalier de base (FCFA)
    @Default(0.0) double prixParJour,

    /// Ville de stationnement du véhicule
    @Default('') String ville,

    /// Adresse exacte
    @Default('') String adresse,

    /// Latitude optionnelle
    double? latitude,

    /// Longitude optionnelle
    double? longitude,

    /// Nombre de jours minimum requis pour louer
    @Default(1) int joursMinimum,

    /// Âge minimum requis du locataire
    @Default(18) int ageMinimum,

    /// Type de couverture d'assurance
    String? assurance,

    /// Règles de vie à bord
    String? reglesSpecifiques,

    /// Zone autorisée de conduite
    String? zoneConduite,

    /// URL du document d'assurance
    String? assuranceDocUrl,

    /// Public ID Cloudinary du document d'assurance
    String? assuranceDocPublicId,

    /// URL de la carte grise
    String? carteGriseUrl,

    /// Public ID Cloudinary de la carte grise
    String? carteGrisePublicId,

    /// Frais de livraison (si proposé)
    double? fraisLivraison,

    /// Permet la conduite hors Dakar
    @Default(false) bool autoriseHorsDakar,

    /// Tarif journalier supplémentaire hors Dakar
    double? supplementHorsDakarParJour,

    /// Consigne de carburant (plein/plein, etc.)
    String? carburantCondition,

    /// Équipements du véhicule (ex: Clim, Bluetooth)
    @Default([]) List<String> equipements,

    /// Tarifs spéciaux dégressifs
    @Default([]) List<Map<String, dynamic>> tarifs,

    /// Liste des photos associées
    @Default([]) List<PhotoVehicule> photos,

    /// Status d'upload en cours pour les médias
    @Default(false) bool isUploading,

    /// Progression de l'upload courant (0.0 à 1.0)
    @Default(0.0) double uploadProgress,
  }) = _VehicleFormData;

  const VehicleFormData._();

  // ===========================================================================
  // OOP VALIDATION LOGIC
  // ===========================================================================

  bool get isMarqueValid => marque.trim().isNotEmpty;
  bool get isModeleValid => modele.trim().isNotEmpty;
  bool get isAnneeValid => annee >= 1900 && annee <= (DateTime.now().year + 1);
  bool get isTypeValid => type != null;
  bool get isImmatriculationValid => immatriculation.trim().isNotEmpty;
  bool get isPrixValid => prixParJour > 0;
  bool get isVilleValid => ville.trim().isNotEmpty;
  bool get isAdresseValid => adresse.trim().isNotEmpty;
  bool get isJoursMinimumValid => joursMinimum >= 1;
  bool get isAgeMinimumValid => ageMinimum >= 18;

  /// Vérifie si l'ensemble du formulaire est valide pour envoi
  bool get canSubmit =>
      isMarqueValid &&
      isModeleValid &&
      isAnneeValid &&
      isTypeValid &&
      isImmatriculationValid &&
      isPrixValid &&
      isVilleValid &&
      isAdresseValid &&
      isJoursMinimumValid &&
      isAgeMinimumValid;
}
