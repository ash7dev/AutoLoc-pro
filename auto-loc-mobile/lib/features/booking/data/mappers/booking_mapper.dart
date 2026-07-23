import '../../../../shared/enums/booking_status.dart';
import '../../../../shared/enums/checkin_source.dart';
import '../../../../shared/enums/payment_status.dart';
import '../../../../shared/enums/photo_categorie.dart';
import '../../domain/entities/booking.dart';
import '../dto/booking_dto.dart';

/// Booking Mapper
///
/// Convertit entre BookingDto (data layer) et Booking (domain layer).
/// Responsabilités:
/// - Mapping DTO → Entity (fromJson → Domain)
/// - Mapping Entity → DTO (Domain → toJson)
/// - Conversion des enums String ↔ BookingStatus
class BookingMapper {
  /// Convertit un BookingDto en Booking (Entity)
  static Booking toEntity(BookingDto dto) {
    return Booking(
      id: dto.id,
      vehiculeId: dto.vehiculeId,
      locataireId: dto.locataireId,
      proprietaireId: dto.proprietaireId,
      dateDebut: dto.dateDebut,
      dateFin: dto.dateFin,
      prixParJour: dto.prixParJour,
      totalBase: dto.totalBase,
      tauxCommission: dto.tauxCommission,
      montantCommission: dto.montantCommission,
      totalLocataire: dto.totalLocataire,
      netProprietaire: dto.netProprietaire,
      statut: _mapBookingStatus(dto.statut),
      paymentUrl: dto.paymentUrl,
      delaiSignature: dto.delaiSignature,
      annuleParId: dto.annuleParId,
      annuleLe: dto.annuleLe,
      raisonAnnulation: dto.raisonAnnulation,
      confirmeeLe: dto.confirmeeLe,
      checkinLe: dto.checkinLe,
      checkoutLe: dto.checkoutLe,
      closeLe: dto.closeLe,
      updatedBySystem: dto.updatedBySystem,
      creeLe: dto.creeLe,
      misAJourLe: dto.misAJourLe,
      contratPublicId: dto.contratPublicId,
      contratUrl: dto.contratUrl,
      checkinLocataireLe: dto.checkinLocataireLe,
      checkinProprietaireLe: dto.checkinProprietaireLe,
      adresseLivraison: dto.adresseLivraison,
      fraisLivraison: dto.fraisLivraison,
      horsDakar: dto.horsDakar,
      supplementHorsDakar: dto.supplementHorsDakar,
      tacitCheckinDeadlineLe: dto.tacitCheckinDeadlineLe,
      checkinLocataireSource: dto.checkinLocataireSource != null
          ? _mapCheckinSource(dto.checkinLocataireSource!)
          : null,
      absenceSignalee: dto.absenceSignalee,
      occupantsSignales: dto.occupantsSignales,
      walletCredite: dto.walletCredite,
      paiement: dto.paiement != null ? _mapPayment(dto.paiement!) : null,
      photosEtatLieu: dto.photosEtatLieu.map(_mapPhotoEtatLieu).toList(),
    );
  }

  /// Convertit un Booking (Entity) en BookingDto
  static BookingDto toDto(Booking entity) {
    return BookingDto(
      id: entity.id,
      vehiculeId: entity.vehiculeId,
      locataireId: entity.locataireId,
      proprietaireId: entity.proprietaireId,
      dateDebut: entity.dateDebut,
      dateFin: entity.dateFin,
      prixParJour: entity.prixParJour,
      totalBase: entity.totalBase,
      tauxCommission: entity.tauxCommission,
      montantCommission: entity.montantCommission,
      totalLocataire: entity.totalLocataire,
      netProprietaire: entity.netProprietaire,
      statut: entity.statut.toPrismaString(),
      paymentUrl: entity.paymentUrl,
      delaiSignature: entity.delaiSignature,
      annuleParId: entity.annuleParId,
      annuleLe: entity.annuleLe,
      raisonAnnulation: entity.raisonAnnulation,
      confirmeeLe: entity.confirmeeLe,
      checkinLe: entity.checkinLe,
      checkoutLe: entity.checkoutLe,
      closeLe: entity.closeLe,
      updatedBySystem: entity.updatedBySystem,
      creeLe: entity.creeLe,
      misAJourLe: entity.misAJourLe,
      contratPublicId: entity.contratPublicId,
      contratUrl: entity.contratUrl,
      checkinLocataireLe: entity.checkinLocataireLe,
      checkinProprietaireLe: entity.checkinProprietaireLe,
      adresseLivraison: entity.adresseLivraison,
      fraisLivraison: entity.fraisLivraison,
      horsDakar: entity.horsDakar,
      supplementHorsDakar: entity.supplementHorsDakar,
      tacitCheckinDeadlineLe: entity.tacitCheckinDeadlineLe,
      checkinLocataireSource:
          entity.checkinLocataireSource?.toPrismaString(),
      absenceSignalee: entity.absenceSignalee,
      occupantsSignales: entity.occupantsSignales,
      walletCredite: entity.walletCredite,
      paiement: entity.paiement != null
          ? _mapPaymentToDto(entity.paiement!)
          : null,
      photosEtatLieu: entity.photosEtatLieu.map(_mapPhotoEtatLieuToDto).toList(),
    );
  }

  // ===========================================================================
  // MAPPERS PRIVÉS - Enums
  // ===========================================================================

  static BookingStatus _mapBookingStatus(String value) {
    return BookingStatus.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => BookingStatus.waitingPayment,
    );
  }

  static CheckinSource _mapCheckinSource(String value) {
    return CheckinSource.values.firstWhere(
      (e) => e.toPrismaString() == value,
      orElse: () => CheckinSource.manual,
    );
  }

  // ===========================================================================
  // MAPPERS PRIVÉS - Nested Objects
  // ===========================================================================

  static PhotoEtatLieu _mapPhotoEtatLieu(PhotoEtatLieuDto dto) {
    return PhotoEtatLieu(
      id: dto.id,
      url: dto.url,
      estCheckin: dto.estCheckin,
      publicId: dto.publicId,
      categorie: dto.categorie != null
          ? PhotoCategorie.fromString(dto.categorie!)
          : null,
      creeLe: dto.creeLe,
    );
  }

  static PhotoEtatLieuDto _mapPhotoEtatLieuToDto(PhotoEtatLieu entity) {
    return PhotoEtatLieuDto(
      id: entity.id,
      url: entity.url,
      estCheckin: entity.estCheckin,
      publicId: entity.publicId,
      categorie: entity.categorie?.toPrismaString(),
      creeLe: entity.creeLe,
    );
  }

  static Payment _mapPayment(PaymentDto dto) {
    return Payment(
      id: dto.id,
      reservationId: dto.reservationId,
      montant: dto.montant,
      devise: dto.devise,
      fournisseur: dto.fournisseur,
      idTransactionFournisseur: dto.idTransactionFournisseur,
      statut: PaymentStatus.fromString(dto.statut),
      telephonePaiement: dto.telephonePaiement,
      creeLe: dto.creeLe,
      rembourseLe: dto.rembourseLe,
      montantRembourse: dto.montantRembourse,
    );
  }

  static PaymentDto _mapPaymentToDto(Payment entity) {
    return PaymentDto(
      id: entity.id,
      reservationId: entity.reservationId,
      montant: entity.montant,
      devise: entity.devise,
      fournisseur: entity.fournisseur,
      idTransactionFournisseur: entity.idTransactionFournisseur,
      statut: entity.statut.toPrismaString(),
      telephonePaiement: entity.telephonePaiement,
      creeLe: entity.creeLe,
      rembourseLe: entity.rembourseLe,
      montantRembourse: entity.montantRembourse,
    );
  }
}
