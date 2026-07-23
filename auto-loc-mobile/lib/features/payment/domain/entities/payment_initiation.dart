import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/payment_status.dart';

part 'payment_initiation.freezed.dart';

/// Payment Initiation Entity
///
/// Représente l'initiation d'un paiement avec Wave ou Orange Money.
/// Synchronisé avec le backend lors de la création de réservation.
@freezed
class PaymentInitiation with _$PaymentInitiation {
  const factory PaymentInitiation({
    required String reservationId,
    required String paymentReference,
    required PaymentProvider provider,
    required double montant,
    required String devise,
    required PaymentStatus statut,
    String? paymentUrl,
    String? qrCode,
    required DateTime creeLe,
  }) = _PaymentInitiation;

  const PaymentInitiation._();

  /// Est un paiement Wave
  bool get isWave => provider == PaymentProvider.wave;

  /// Est un paiement Orange Money
  bool get isOrangeMoney => provider == PaymentProvider.orangeMoney;

  /// Montant formatté
  String get montantFormatte => '${montant.toStringAsFixed(0)} $devise';

  /// Est en attente de paiement
  bool get isPending => statut == PaymentStatus.pending;

  /// Est payé
  bool get isPaid => statut == PaymentStatus.confirmed;

  /// Est échoué
  bool get isFailed => statut == PaymentStatus.failed;

  /// Est remboursé
  bool get isRefunded => statut == PaymentStatus.refunded;
}
