import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Calendar, Phone, CheckCircle2, XCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';
import { OwnerBooking } from '../api/ownerApi';

interface OwnerBookingCardProps {
  booking: OwnerBooking;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onDetailPress?: (bookingId: string) => void;
}

export const OwnerBookingCard: React.FC<OwnerBookingCardProps> = ({
  booking,
  onApprove,
  onReject,
  onDetailPress,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const getStatusBadge = () => {
    switch (booking.statut) {
      case 'PENDING_APPROVAL':
        return { label: 'En attente', bg: '#FEF3C7', text: '#B45309', icon: Clock };
      case 'CONFIRMED':
        return { label: 'Confirmée', bg: '#ECFDF5', text: '#047857', icon: CheckCircle2 };
      case 'IN_PROGRESS':
        return { label: 'En cours', bg: '#EFF6FF', text: '#1D4ED8', icon: Calendar };
      case 'COMPLETED':
        return { label: 'Terminée', bg: '#F3F4F6', text: '#374151', icon: CheckCircle2 };
      case 'REJECTED':
      case 'CANCELLED':
        return { label: 'Annulée', bg: '#FEF2F2', text: '#DC2626', icon: XCircle };
      default:
        return { label: booking.statut, bg: '#F3F4F6', text: '#4B5563', icon: Clock };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <View style={styles.card}>
      {/* En-tête : Code & Statut */}
      <View style={styles.headerRow}>
        <View style={styles.codeGroup}>
          <Text style={styles.codeText}>{booking.codeReservation}</Text>
          <Text style={styles.dateDemande}>{booking.dateDemande}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <StatusIcon size={12} color={status.text} />
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      {/* Info Véhicule */}
      <View style={styles.vehicleRow}>
        <Image source={{ uri: booking.vehiclePhoto }} style={styles.vehiclePhoto} />
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle} numberOfLines={1}>
            {booking.vehicleTitle}
          </Text>
          <Text style={styles.plateText}>{booking.immatriculation}</Text>
          <Text style={styles.datesText}>
            {booking.dateDebut} → {booking.dateFin} ({booking.dureeJours}j)
          </Text>
        </View>
      </View>

      {/* Info Locataire */}
      <View style={styles.tenantBox}>
        <View style={styles.tenantHeader}>
          <View style={styles.tenantLeft}>
            {booking.locataireAvatar ? (
              <Image source={{ uri: booking.locataireAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {booking.locataireName.charAt(0)}
                </Text>
              </View>
            )}
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.tenantName}>{booking.locataireName}</Text>
                {booking.locataireKycVerified && (
                  <ShieldCheck size={14} color="#10B981" />
                )}
              </View>
              <Text style={styles.tenantPhone}>{booking.locatairePhone}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Financial Net Payout Summary */}
      <View style={styles.payoutRow}>
        <Text style={styles.payoutLabel}>Gain net propriétaire :</Text>
        <Text style={styles.payoutValue}>
          {formatCurrency(booking.montantNetProprietaire, selectedCurrency)}
        </Text>
      </View>

      {/* Actions */}
      {booking.statut === 'PENDING_APPROVAL' && (onApprove || onReject) ? (
        <View style={styles.actionsRow}>
          {onReject && (
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => onReject(booking.id)}
              activeOpacity={0.8}
            >
              <XCircle size={15} color="#DC2626" />
              <Text style={styles.rejectBtnText}>Refuser</Text>
            </TouchableOpacity>
          )}
          {onApprove && (
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => onApprove(booking.id)}
              activeOpacity={0.8}
            >
              <CheckCircle2 size={15} color="#FFFFFF" />
              <Text style={styles.approveBtnText}>Accepter la réservation</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => onDetailPress?.(booking.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.detailBtnText}>Voir le dossier de réservation</Text>
          <ArrowRight size={14} color="#059669" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeGroup: {
    gap: 2,
  },
  codeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#041912',
  },
  dateDemande: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 14,
  },
  vehiclePhoto: {
    width: 64,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  vehicleInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#041912',
  },
  plateText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#6B7280',
  },
  datesText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11.5,
    color: '#059669',
  },
  tenantBox: {
    backgroundColor: '#FFFFFF',
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#047857',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tenantName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#1F2937',
  },
  tenantPhone: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#6B7280',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  payoutLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#4B5563',
  },
  payoutValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16,
    color: '#047857',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 6,
  },
  rejectBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#DC2626',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#051B14',
    gap: 6,
  },
  approveBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  detailBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#059669',
  },
});
