import 'package:freezed_annotation/freezed_annotation.dart';

part 'booking_dto.freezed.dart';
part 'booking_dto.g.dart';

/// Booking DTO - Data Transfer Object
///
/// Représente la structure JSON retournée par l'API backend.
/// Synchronisé avec le model Prisma Reservation + les endpoints NestJS.
/// Utilise json_serializable pour la sérialisation automatique.
@freezed
class BookingDto with _$BookingDto {
  const factory BookingDto({
    required String id,
    required String vehiculeId,
    required String locataireId,
    required String proprietaireId,
    required DateTime dateDebut,
    required DateTime dateFin,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double prixParJour,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double totalBase,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double tauxCommission,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double montantCommission,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double totalLocataire,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double netProprietaire,
    required String statut,
    String? paymentUrl,
    required DateTime delaiSignature,
    String? annuleParId,
    DateTime? annuleLe,
    String? raisonAnnulation,
    DateTime? confirmeeLe,
    DateTime? checkinLe,
    DateTime? checkoutLe,
    DateTime? closeLe,
    @Default(false) bool updatedBySystem,
    required DateTime creeLe,
    required DateTime misAJourLe,
    String? contratPublicId,
    String? contratUrl,
    DateTime? checkinLocataireLe,
    DateTime? checkinProprietaireLe,
    String? adresseLivraison,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimalNullable)
    double? fraisLivraison,
    @Default(false) bool horsDakar,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimalNullable)
    double? supplementHorsDakar,
    DateTime? tacitCheckinDeadlineLe,
    String? checkinLocataireSource,
    @Default(false) bool absenceSignalee,
    @Default(false) bool occupantsSignales,
    @Default(false) bool walletCredite,
    // Relations
    PaymentDto? paiement,
    @Default([]) List<PhotoEtatLieuDto> photosEtatLieu,
  }) = _BookingDto;

  factory BookingDto.fromJson(Map<String, dynamic> json) =>
      _$BookingDtoFromJson(json);
}

/// Photo État des Lieux DTO
@freezed
class PhotoEtatLieuDto with _$PhotoEtatLieuDto {
  const factory PhotoEtatLieuDto({
    required String id,
    required String url,
    required bool estCheckin,
    String? publicId,
    String? categorie, // String qui sera convertie en PhotoCategorie par le mapper
    required DateTime creeLe,
  }) = _PhotoEtatLieuDto;

  factory PhotoEtatLieuDto.fromJson(Map<String, dynamic> json) =>
      _$PhotoEtatLieuDtoFromJson(json);
}

/// Payment DTO
@freezed
class PaymentDto with _$PaymentDto {
  const factory PaymentDto({
    required String id,
    required String reservationId,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimal)
    required double montant,
    @Default('XOF') String devise,
    required String fournisseur,
    String? idTransactionFournisseur,
    required String statut,
    String? telephonePaiement,
    required DateTime creeLe,
    DateTime? rembourseLe,
    @JsonKey(fromJson: _decimalToDouble, toJson: _doubleToDecimalNullable)
    double? montantRembourse,
  }) = _PaymentDto;

  factory PaymentDto.fromJson(Map<String, dynamic> json) =>
      _$PaymentDtoFromJson(json);
}

// =============================================================================
// HELPERS pour Prisma Decimal → Dart double
// =============================================================================

/// Convertit un Decimal Prisma (peut être String ou num) en double
double _decimalToDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}

/// Convertit un double en String pour Prisma Decimal
String _doubleToDecimal(double value) {
  return value.toStringAsFixed(2);
}

/// Convertit un double nullable en String nullable pour Prisma Decimal
String? _doubleToDecimalNullable(double? value) {
  if (value == null) return null;
  return value.toStringAsFixed(2);
}
