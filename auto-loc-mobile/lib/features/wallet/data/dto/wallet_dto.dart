import 'package:freezed_annotation/freezed_annotation.dart';

part 'wallet_dto.freezed.dart';
part 'wallet_dto.g.dart';

@freezed
class WalletDto with _$WalletDto {
  const factory WalletDto({
    required WalletBalanceDto balance,
    required List<WalletTransactionDto> transactions,
    @JsonKey(name: 'totalPenalites') required int totalPenalites,
    @JsonKey(name: 'penaltiesCount') required int penaltiesCount,
  }) = _WalletDto;
  factory WalletDto.fromJson(Map<String, dynamic> json) => _$WalletDtoFromJson(json);
}

@freezed
class WalletBalanceDto with _$WalletBalanceDto {
  const factory WalletBalanceDto({
    required String soldeDisponible,
    required String soldeRetirable,
    required String soldeWave,
    required String soldeOrangeMoney,
    required String enAttente,
    required String totalGagne,
  }) = _WalletBalanceDto;
  factory WalletBalanceDto.fromJson(Map<String, dynamic> json) => _$WalletBalanceDtoFromJson(json);
}

@freezed
class WalletTransactionDto with _$WalletTransactionDto {
  const factory WalletTransactionDto({
    required String id,
    required String type,
    required String sens,
    required String montant,
    required String soldeApres,
    required DateTime creeLe,
    String? reservationId,
    String? fournisseur,
  }) = _WalletTransactionDto;
  factory WalletTransactionDto.fromJson(Map<String, dynamic> json) => _$WalletTransactionDtoFromJson(json);
}

@freezed
class WithdrawalDto with _$WithdrawalDto {
  const factory WithdrawalDto({
    required String id,
    required String walletId,
    required String montant,
    required String methode,
    required String destinataire,
    required String statut,
    String? raisonRejet,
    String? idTransactionFournisseur,
    required DateTime demandeeLe,
    DateTime? traiteLe,
  }) = _WithdrawalDto;
  factory WithdrawalDto.fromJson(Map<String, dynamic> json) => _$WithdrawalDtoFromJson(json);
}

@freezed
class PenaltyDto with _$PenaltyDto {
  const factory PenaltyDto({
    required String id,
    required String utilisateurId,
    required String reservationId,
    required String montant,
    required String raison,
    required DateTime creeLe,
    DateTime? preleveleLe,
  }) = _PenaltyDto;
  factory PenaltyDto.fromJson(Map<String, dynamic> json) => _$PenaltyDtoFromJson(json);
}
