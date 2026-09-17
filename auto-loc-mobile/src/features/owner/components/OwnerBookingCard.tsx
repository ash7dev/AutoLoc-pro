import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import { Calendar, Phone, CheckCircle2, XCircle, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react-native';
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
  const isPending = booking.statut === 'PENDING_APPROVAL';

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
    <View style={[styles.card, isPending && styles.cardPending]}>
      {/* En-tête : Code & Statut */}
      <View style={styles.headerRow}>
        <View style={styles.codeGroup}>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>#{booking.codeReservation}</Text>
            {isPending && (
              <View style={styles.urgentTag}>
                <Sparkles size={10} color="#D97706" />
                <Text style={styles.urgentTagText}>Nouvelle demande</Text>
              </View>
            )}
          </View>
          <Text style={styles.dateDemande}>Reçue le {booking.dateDemande}</Text>
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
          <View style={styles.immatRow}>
            <View style={styles.immatPill}>
              <Text style={styles.plateText}>{booking.immatriculation}</Text>
            </View>
            <Text style={styles.datesText}>
              {booking.dateDebut} → {booking.dateFin} ({booking.dureeJours}j)
            </Text>
          </View>
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
                  <View style={styles.kycBadge}>
                    <ShieldCheck size={13} color="#059669" />
                    <Text style={styles.kycText}>Identité vérifiée</Text>
                  </View>
                )}
              </View>
              <Text style={styles.tenantPhone}>{booking.locatairePhone}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Gain Net Propriétaire */}
      <View style={styles.payoutRow}>
        <Text style={styles.payoutLabel}>Gain net propriétaire :</Text>
        <Text style={styles.payoutValue}>
          {formatCurrency(booking.montantNetProprietaire, selectedCurrency)}
        </Text>
      </View>

      {/* Actions */}
      {isPending && (onApprove || onReject) ? (
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
              <CheckCircle2 size={15} color="#4ADE80" />
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
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
    gap: 10,
  },
  cardPending: {
    backgroundColor: '#FAFAF9',
    borderColor: '#FDE68A',
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeGroup: {
    gap: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#041912',
  },
  urgentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#B45309',
  },
  dateDemande: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vehiclePhoto: {
    width: 60,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  vehicleInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  immatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  immatPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  plateText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#0F172A',
  },
  datesText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#059669',
  },
  tenantBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
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
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  avatarFallbackText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#047857',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#0F172A',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  kycText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#047857',
  },
  tenantPhone: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  payoutLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  payoutValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16,
    color: '#047857',
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 5,
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
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#059669',
  },
});

