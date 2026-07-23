import 'package:freezed_annotation/freezed_annotation.dart';

part 'payment_dto.freezed.dart';
part 'payment_dto.g.dart';

/// Payment Initiation DTO - Data Transfer Object
///
/// Représente la structure JSON retournée par l'API backend lors de l'initiation de paiement.
/// Utilise json_serializable pour la sérialisation automatique.
@freezed
class PaymentInitiationDto with _$PaymentInitiationDto {
  const factory PaymentInitiationDto({
    @JsonKey(name: 'reservationId') required String reservationId,
    @JsonKey(name: 'paymentReference') required String paymentReference,
    @JsonKey(name: 'provider') required String provider,
    @JsonKey(name: 'montant') required String montant,
    @JsonKey(name: 'devise') required String devise,
    @JsonKey(name: 'statut') required String statut,
    @JsonKey(name: 'paymentUrl') String? paymentUrl,
    @JsonKey(name: 'qrCode') String? qrCode,
    @JsonKey(name: 'creeLe') required DateTime creeLe,
  }) = _PaymentInitiationDto;

  factory PaymentInitiationDto.fromJson(Map<String, dynamic> json) =>
      _$PaymentInitiationDtoFromJson(json);
}
