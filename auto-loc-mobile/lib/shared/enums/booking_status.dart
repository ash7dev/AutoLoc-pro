/// Booking Status (StatutReservation dans le backend)
/// Statuts des réservations
/// Synchronisé avec: apps/auto-loc-backend/prisma/schema.prisma
enum BookingStatus {
  /// Réservation créée
  initiated('INITIEE'),

  /// En attente de paiement (valeur par défaut)
  waitingPayment('EN_ATTENTE_PAIEMENT'),

  /// Paiement effectué
  paid('PAYEE'),

  /// Réservation confirmée
  confirmed('CONFIRMEE'),

  /// Réservation en cours (check-in effectué)
  inProgress('EN_COURS'),

  /// Réservation terminée (check-out effectué)
  completed('TERMINEE'),

  /// Réservation annulée
  cancelled('ANNULEE'),

  /// Litige en cours
  dispute('LITIGE');

  const BookingStatus(this.value);

  final String value;

  /// Convertit une string en BookingStatus
  static BookingStatus fromString(String value) {
    return BookingStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => BookingStatus.waitingPayment,
    );
  }

  /// Vérifie si la réservation est active
  bool get isActive {
    return this == BookingStatus.confirmed ||
        this == BookingStatus.inProgress ||
        this == BookingStatus.paid;
  }

  /// Vérifie si la réservation est terminée (completed ou cancelled)
  bool get isFinished {
    return this == BookingStatus.completed || this == BookingStatus.cancelled;
  }

  /// Vérifie si la réservation est en attente de paiement
  bool get isPendingPayment => this == BookingStatus.waitingPayment;

  /// Vérifie si la réservation peut être annulée
  bool get canBeCancelled {
    return this == BookingStatus.waitingPayment ||
        this == BookingStatus.paid ||
        this == BookingStatus.confirmed;
  }

  /// Vérifie si la réservation est en litige
  bool get isDisputed => this == BookingStatus.dispute;

  /// Label français pour l'affichage
  String get label {
    return switch (this) {
      BookingStatus.initiated => 'Initiée',
      BookingStatus.waitingPayment => 'En attente de paiement',
      BookingStatus.paid => 'Payée',
      BookingStatus.confirmed => 'Confirmée',
      BookingStatus.inProgress => 'En cours',
      BookingStatus.completed => 'Terminée',
      BookingStatus.cancelled => 'Annulée',
      BookingStatus.dispute => 'Litige',
    };
  }

  /// Description pour l'utilisateur
  String get description {
    return switch (this) {
      BookingStatus.initiated => 'Votre réservation a été créée',
      BookingStatus.waitingPayment =>
        'En attente du paiement pour confirmer la réservation',
      BookingStatus.paid => 'Le paiement a été effectué avec succès',
      BookingStatus.confirmed =>
        'Votre réservation est confirmée et vous pouvez récupérer le véhicule',
      BookingStatus.inProgress => 'Vous avez récupéré le véhicule',
      BookingStatus.completed => 'La location est terminée',
      BookingStatus.cancelled => 'Cette réservation a été annulée',
      BookingStatus.dispute => 'Un litige est en cours pour cette réservation',
    };
  }

  /// Convertit en string Prisma (pour DTO)
  String toPrismaString() => value;
}
