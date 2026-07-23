import 'package:freezed_annotation/freezed_annotation.dart';

part 'withdrawal.freezed.dart';

/// Entité pour une demande de retrait
@freezed
class WithdrawalRequest with _$WithdrawalRequest {
  const factory WithdrawalRequest({
    required double montant,
    required WithdrawalMethod methode,
    required String numeroDestinataire,
  }) = _WithdrawalRequest;

  const WithdrawalRequest._();

  /// Validation du montant
  bool get isValidAmount => montant >= 500;

  /// Validation du numéro (regex: /^\+?[0-9\s]{7,15}$/)
  bool isValidPhoneNumber() {
    final regex = RegExp(r'^\+?[0-9\s]{7,15}$');
    return regex.hasMatch(numeroDestinataire);
  }
}

/// Méthode de retrait
enum WithdrawalMethod {
  wave, // WAVE - Automatique
  orangeMoney, // ORANGE_MONEY - Manuel
}

/// Extension pour conversion API
extension WithdrawalMethodX on WithdrawalMethod {
  String get apiValue {
    switch (this) {
      case WithdrawalMethod.wave:
        return 'WAVE';
      case WithdrawalMethod.orangeMoney:
        return 'ORANGE_MONEY';
    }
  }

  String get displayName {
    switch (this) {
      case WithdrawalMethod.wave:
        return 'Wave';
      case WithdrawalMethod.orangeMoney:
        return 'Orange Money';
    }
  }

  String get logo {
    switch (this) {
      case WithdrawalMethod.wave:
        return 'assets/logos/wave.png'; // TODO: Ajouter logo
      case WithdrawalMethod.orangeMoney:
        return 'assets/logos/orange_money.png'; // TODO: Ajouter logo
    }
  }
}
