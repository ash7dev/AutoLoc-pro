import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Filter State Model
class FilterState {
  const FilterState({
    this.dateDebut,
    this.dateFin,
    this.zone = '',
    this.type = '',
    this.budgetMin,
    this.budgetMax,
    this.fuel = '',
    this.transmission = '',
    this.places,
    this.noteMin,
    this.equipements = const [],
    this.nearMe = false,
  });

  final DateTime? dateDebut;
  final DateTime? dateFin;
  final String zone;
  final String type;
  final double? budgetMin;
  final double? budgetMax;
  final String fuel;
  final String transmission;
  final int? places;
  final double? noteMin;
  final List<String> equipements;
  final bool nearMe;

  bool get hasActiveFilters =>
      zone.isNotEmpty ||
      type.isNotEmpty ||
      budgetMin != null ||
      budgetMax != null ||
      fuel.isNotEmpty ||
      transmission.isNotEmpty ||
      places != null ||
      noteMin != null ||
      equipements.isNotEmpty ||
      nearMe ||
      dateDebut != null ||
      dateFin != null;

  int get activeFilterCount {
    int count = 0;
    if (zone.isNotEmpty) count++;
    if (type.isNotEmpty) count++;
    if (budgetMin != null || budgetMax != null) count++;
    if (fuel.isNotEmpty) count++;
    if (transmission.isNotEmpty) count++;
    if (places != null) count++;
    if (noteMin != null) count++;
    if (equipements.isNotEmpty) count++;
    if (nearMe) count++;
    if (dateDebut != null || dateFin != null) count++;
    return count;
  }

  FilterState copyWith({
    DateTime? dateDebut,
    DateTime? dateFin,
    String? zone,
    String? type,
    double? budgetMin,
    double? budgetMax,
    String? fuel,
    String? transmission,
    int? places,
    double? noteMin,
    List<String>? equipements,
    bool? nearMe,
    bool clearDateDebut = false,
    bool clearDateFin = false,
    bool clearBudgetMin = false,
    bool clearBudgetMax = false,
    bool clearPlaces = false,
    bool clearNoteMin = false,
  }) {
    return FilterState(
      dateDebut: clearDateDebut ? null : (dateDebut ?? this.dateDebut),
      dateFin: clearDateFin ? null : (dateFin ?? this.dateFin),
      zone: zone ?? this.zone,
      type: type ?? this.type,
      budgetMin: clearBudgetMin ? null : (budgetMin ?? this.budgetMin),
      budgetMax: clearBudgetMax ? null : (budgetMax ?? this.budgetMax),
      fuel: fuel ?? this.fuel,
      transmission: transmission ?? this.transmission,
      places: clearPlaces ? null : (places ?? this.places),
      noteMin: clearNoteMin ? null : (noteMin ?? this.noteMin),
      equipements: equipements ?? this.equipements,
      nearMe: nearMe ?? this.nearMe,
    );
  }
}

/// Filter Notifier
class FilterNotifier extends StateNotifier<FilterState> {
  FilterNotifier() : super(const FilterState());

  void updateFilters(FilterState newState) {
    state = newState;
  }

  void reset() {
    state = const FilterState();
  }
}

/// Filter Provider
final filterProvider = StateNotifierProvider<FilterNotifier, FilterState>((ref) {
  return FilterNotifier();
});

/// Active Filter Count Provider
final activeFilterCountProvider = Provider<int>((ref) {
  return ref.watch(filterProvider).activeFilterCount;
});

// ─── Static Data ─────────────────────────────────────────────────────────────

class Zone {
  const Zone({required this.value, required this.label});
  final String value;
  final String label;
}

class VehicleType {
  const VehicleType({required this.value, required this.label});
  final String value;
  final String label;
}

class FuelType {
  const FuelType({required this.value, required this.label});
  final String value;
  final String label;
}

class TransmissionType {
  const TransmissionType({required this.value, required this.label});
  final String value;
  final String label;
}

class Equipment {
  const Equipment({required this.value, required this.label});
  final String value;
  final String label;
}

const List<Zone> kZones = [
  Zone(value: '', label: 'Toutes les zones'),
  Zone(value: 'almadies-ngor-mamelles', label: 'Almadies – Ngor – Mamelles'),
  Zone(value: 'ouakam-yoff', label: 'Ouakam – Yoff'),
  Zone(value: 'mermoz-sacrecoeur-ckg', label: 'Mermoz – Sacré-Cœur – CKG'),
  Zone(value: 'plateau-medina-gueuletapee', label: 'Plateau – Médina – Gueule Tapée'),
  Zone(value: 'liberte-sicap-granddakar', label: 'Liberté – Sicap – Grand Dakar'),
  Zone(value: 'parcelles-grandyoff', label: 'Parcelles Assainies – Grand Yoff'),
  Zone(value: 'pikine-guediawaye', label: 'Pikine – Guédiawaye'),
  Zone(value: 'keurmassar-rufisque', label: 'Keur Massar – Rufisque'),
];

const List<VehicleType> kVehicleTypes = [
  VehicleType(value: 'CITADINE', label: 'Citadine'),
  VehicleType(value: 'BERLINE', label: 'Berline'),
  VehicleType(value: 'SUV', label: 'SUV'),
  VehicleType(value: 'PICKUP', label: 'Pick-up'),
  VehicleType(value: 'MINIVAN', label: 'Minivan'),
  VehicleType(value: 'MONOSPACE', label: 'Monospace'),
  VehicleType(value: 'MINIBUS', label: 'Minibus'),
  VehicleType(value: 'UTILITAIRE', label: 'Utilitaire'),
  VehicleType(value: 'LUXE', label: 'Luxe'),
  VehicleType(value: 'FOUR_X_FOUR', label: '4x4'),
];

const List<FuelType> kFuelTypes = [
  FuelType(value: 'ESSENCE', label: 'Essence'),
  FuelType(value: 'DIESEL', label: 'Diesel'),
  FuelType(value: 'HYBRIDE', label: 'Hybride'),
  FuelType(value: 'ELECTRIQUE', label: 'Électrique'),
];

const List<TransmissionType> kTransmissions = [
  TransmissionType(value: 'AUTOMATIQUE', label: 'Automatique'),
  TransmissionType(value: 'MANUELLE', label: 'Manuelle'),
];

const List<int> kBudgetPresets = [15000, 30000, 50000, 100000];

const List<Equipment> kEquipments = [
  Equipment(value: 'GPS', label: 'GPS'),
  Equipment(value: 'CLIMATISATION', label: 'Climatisation'),
  Equipment(value: 'BLUETOOTH', label: 'Bluetooth'),
  Equipment(value: 'CAMERA_RECUL', label: 'Caméra de recul'),
  Equipment(value: 'SIEGE_ENFANT', label: 'Siège enfant'),
  Equipment(value: 'TOIT_OUVRANT', label: 'Toit ouvrant'),
  Equipment(value: 'RADAR_STATIONNEMENT', label: 'Radar stationnement'),
  Equipment(value: 'REGULATEUR_VITESSE', label: 'Rég. de vitesse'),
];

const List<int> kPlacesOptions = [2, 4, 5, 7];

const List<double> kNoteOptions = [3, 3.5, 4, 4.5];
