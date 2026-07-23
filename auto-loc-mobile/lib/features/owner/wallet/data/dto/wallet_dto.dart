import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/wallet.dart';

part 'wallet_dto.freezed.dart';
part 'wallet_dto.g.dart';

/// DTO pour la réponse GET /wallet/me
@freezed
class WalletResponseDto with _$WalletResponseDto {
  const factory WalletResponseDto({
    @JsonKey(name: 'balance') required BalanceDto balance,
    @JsonKey(name: 'transactions') required List<TransactionDto> transactions,
    @JsonKey(name: 'totalPenalites') dynamic totalPenalites,
    @JsonKey(name: 'penaltiesCount') int? penaltiesCount,
  }) = _WalletResponseDto;

  const WalletResponseDto._();

  factory WalletResponseDto.fromJson(Map<String, dynamic> json) =>
      _$WalletResponseDtoFromJson(json);

  /// Conversion vers l'entité Domain
  Wallet toEntity() {
    return Wallet(
      soldeDisponible: _parseDecimal(balance.soldeDisponible),
      soldeRetirable: _parseDecimal(balance.soldeRetirable),
      soldeWave: _parseDecimal(balance.soldeWave),
      soldeOrangeMoney: _parseDecimal(balance.soldeOrangeMoney),
      enAttente: _parseDecimal(balance.enAttente),
      totalGagne: _parseDecimal(balance.totalGagne),
      totalPenalites: _parseDecimal(totalPenalites),
      penaltiesCount: penaltiesCount ?? 0,
      transactions: transactions.map((t) => t.toEntity()).toList(),
    );
  }

  double _parseDecimal(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}

/// DTO pour le balance object
@freezed
class BalanceDto with _$BalanceDto {
  const factory BalanceDto({
    @JsonKey(name: 'soldeDisponible') dynamic soldeDisponible,
    @JsonKey(name: 'soldeRetirable') dynamic soldeRetirable,
    @JsonKey(name: 'soldeWave') dynamic soldeWave,
    @JsonKey(name: 'soldeOrangeMoney') dynamic soldeOrangeMoney,
    @JsonKey(name: 'enAttente') dynamic enAttente,
    @JsonKey(name: 'totalGagne') dynamic totalGagne,
  }) = _BalanceDto;

  factory BalanceDto.fromJson(Map<String, dynamic> json) =>
      _$BalanceDtoFromJson(json);
}

/// DTO pour une transaction
@freezed
class TransactionDto with _$TransactionDto {
  const factory TransactionDto({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: 'type') String? type,
    @JsonKey(name: 'sens') String? sens,
    @JsonKey(name: 'montant') dynamic montant,
    @JsonKey(name: 'soldeApres') dynamic soldeApres,
    @JsonKey(name: 'creeLe') String? creeLe,
    @JsonKey(name: 'reservationId') String? reservationId,
    @JsonKey(name: 'fournisseur') String? fournisseur,
  }) = _TransactionDto;

  const TransactionDto._();

  factory TransactionDto.fromJson(Map<String, dynamic> json) =>
      _$TransactionDtoFromJson(json);

  /// Conversion vers l'entité Domain
  WalletTransaction toEntity() {
    return WalletTransaction(
      id: id ?? '',
      type: _parseTransactionType(type),
      sens: _parseTransactionDirection(sens),
      montant: _parseDecimal(montant),
      soldeApres: _parseDecimal(soldeApres),
      creeLe: creeLe != null ? DateTime.parse(creeLe!) : DateTime.now(),
      reservationId: reservationId,
      fournisseur: fournisseur,
    );
  }

  TransactionType _parseTransactionType(String? value) {
    switch (value?.toUpperCase()) {
      case 'CREDIT_LOCATION':
        return TransactionType.creditLocation;
      case 'DEBIT_PENALITE':
        return TransactionType.debitPenalite;
      case 'DEBIT_RETRAIT':
        return TransactionType.debitRetrait;
      default:
        return TransactionType.creditLocation; // Fallback
    }
  }

  TransactionDirection _parseTransactionDirection(String? value) {
    switch (value?.toUpperCase()) {
      case 'CREDIT':
        return TransactionDirection.credit;
      case 'DEBIT':
        return TransactionDirection.debit;
      default:
        return TransactionDirection.credit; // Fallback
    }
  }

  double _parseDecimal(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}
