import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Car,
  Phone,
  Lock,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';
import { OwnerBooking } from '../api/ownerApi';

export interface OwnerBookingCardProps {
  booking: OwnerBooking;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onDetailPress?: (bookingId: string) => void;
  onPress?: (bookingId: string) => void;
}

export const OwnerBookingCard: React.FC<OwnerBookingCardProps> = ({
  booking,
  onApprove,
  onReject,
  onDetailPress,
  onPress,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isPending = booking.statut === 'PENDING_APPROVAL';

  // Règle AutoLoc de confidentialité du numéro de téléphone :
  // Déverrouillé uniquement si EN_COURS ou CONFIRMEE <= 24h avant le début
  const isPhoneVisible = React.useMemo(() => {
    if (
      booking.statut === 'CANCELLED' ||
      booking.statut === 'REJECTED' ||
      booking.statut === 'COMPLETED'
    ) {
      return false;
    }
    if (booking.statut === 'IN_PROGRESS') {
      return true;
    }
    if (booking.statut === 'CONFIRMED') {
      if (!booking.dateDebut) return false;
      const debut = new Date(booking.dateDebut);
      const now = new Date();
      const diffHours = (debut.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }
    return false;
  }, [booking.statut, booking.dateDebut]);

  const handlePress = () => {
    if (onDetailPress) {
      onDetailPress(booking.id);
    } else if (onPress) {
      onPress(booking.id);
    }
  };

  const getStatusConfig = () => {
    switch (booking.statut) {
      case 'PENDING_APPROVAL':
        return {
          label: 'En attente',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          text: '#D97706',
          dot: '#F59E0B',
          icon: Clock,
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmée',
          bg: 'rgba(52, 211, 153, 0.12)',
          border: 'rgba(52, 211, 153, 0.3)',
          text: '#047857',
          dot: '#34D399',
          icon: CheckCircle2,
        };
      case 'IN_PROGRESS':
        return {
          label: 'En cours',
          bg: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.3)',
          text: '#1D4ED8',
          dot: '#3B82F6',
          icon: Calendar,
        };
      case 'COMPLETED':
        return {
          label: 'Terminée',
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#334155',
          dot: '#64748B',
          icon: CheckCircle2,
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          label: 'Annulée',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: '#DC2626',
          dot: '#EF4444',
          icon: XCircle,
        };
      default:
        return {
          label: booking.statut,
          bg: '#F1F5F9',
          border: '#E2E8F0',
          text: '#475569',
          dot: '#94A3B8',
          icon: Clock,
        };
    }
  };

  const status = getStatusConfig();

  return (
    <TouchableOpacity
      style={[styles.cardContainer, isPending && styles.cardContainerPending]}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      {/* 1. Header VIP : Code Réservation + Badge Statut */}
      <View style={styles.cardHeader}>
        <View style={styles.codeGroup}>
          <View style={styles.codeBadgeRow}>
            <Text style={styles.codeText}>#{booking.codeReservation}</Text>
            {isPending && (
              <View style={styles.urgentPill}>
                <Sparkles size={11} color="#D97706" />
                <Text style={styles.urgentPillText}>Demande VIP</Text>
              </View>
            )}
          </View>
          <Text style={styles.dateSubtext}>Reçue le {booking.dateDemande}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
          <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
          <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      {/* 2. Hero Véhicule Card */}
      <View style={styles.vehicleHeroBox}>
        {booking.vehiclePhoto ? (
          <Image source={{ uri: booking.vehiclePhoto }} style={styles.vehicleThumbnail} />
        ) : (
          <View style={styles.vehicleThumbnailFallback}>
            <Car size={22} color="#059669" />
          </View>
        )}

        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleTitle} numberOfLines={1}>
            {booking.vehicleTitle}
          </Text>

          <View style={styles.immatRow}>
            <View style={styles.plateBadge}>
              <Text style={styles.plateText}>{booking.immatriculation}</Text>
            </View>
            <View style={styles.datesPill}>
              <Calendar size={11} color="#059669" />
              <Text style={styles.datesText}>
                {booking.dateDebut} → {booking.dateFin} ({booking.dureeJours}j)
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Section Profile Locataire & Téléphone Masqué/Visible */}
      <View style={styles.tenantSection}>
        <View style={styles.tenantLeftRow}>
          <View style={styles.avatarRing}>
            {booking.locataireAvatar ? (
              <Image source={{ uri: booking.locataireAvatar }} style={styles.tenantAvatar} />
            ) : (
              <View style={styles.tenantAvatarFallback}>
                <Text style={styles.tenantAvatarInitials}>
                  {booking.locataireName ? booking.locataireName.charAt(0).toUpperCase() : 'L'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tenantInfo}>
            <View style={styles.tenantNameRow}>
              <Text style={styles.tenantName} numberOfLines={1}>
                {booking.locataireName}
              </Text>
              {booking.locataireKycVerified && (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color="#059669" />
                  <Text style={styles.verifiedBadgeText}>Vérifié</Text>
                </View>
              )}
            </View>

            {/* Téléphone sécurisé selon la politique de confidentialité AutoLoc */}
            {isPhoneVisible ? (
              <View style={styles.phoneVisibleRow}>
                <Phone size={11} color="#059669" />
                <Text style={styles.tenantPhone}>{booking.locatairePhone}</Text>
              </View>
            ) : (
              <View style={styles.phoneMaskedRow}>
                <Phone size={11} color="#94A3B8" />
                <Text style={styles.tenantPhoneMasked}>•••••••</Text>
                <View style={styles.maskedBadge}>
                  <Lock size={9} color="#64748B" />
                  <Text style={styles.maskedBadgeText}>
                    {booking.statut === 'CONFIRMED' ? '24h avant' : 'Masqué'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 4. Gain Net Propriétaire Section */}
      <View style={styles.payoutSection}>
        <Text style={styles.payoutLabel}>Gain net estimé :</Text>
        <Text style={styles.payoutAmount}>
          {formatCurrency(booking.montantNetProprietaire, selectedCurrency)}
        </Text>
      </View>

      {/* 5. Bouton Unique VIP : Voir détails réservation */}
      <View style={styles.ctaRow}>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Voir le dossier de réservation</Text>
          <View style={styles.ctaIconCircle}>
            <ChevronRight size={14} color="#059669" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContainerPending: {
    backgroundColor: '#FAFAF9',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1.5,
  },

  // 1. Header VIP
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  codeGroup: {
    gap: 2,
  },
  codeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeText: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.2,
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  urgentPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#B45309',
  },
  dateSubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },

  // 2. Hero Véhicule
  vehicleHeroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vehicleThumbnail: {
    width: 68,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
  },
  vehicleThumbnailFallback: {
    width: 68,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleDetails: {
    flex: 1,
    gap: 4,
  },
  vehicleTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14.5,
    color: '#0F172A',
  },
  immatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  plateBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  plateText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  datesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  datesText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#059669',
  },

  // 3. Section Locataire
  tenantSection: {
    paddingVertical: 2,
  },
  tenantLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    padding: 1,
  },
  tenantAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  tenantAvatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantAvatarInitials: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#059669',
  },
  tenantInfo: {
    flex: 1,
    gap: 2,
  },
  tenantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#047857',
  },
  phoneVisibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tenantPhone: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11.5,
    color: '#047857',
  },
  phoneMaskedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantPhoneMasked: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  maskedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  maskedBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#64748B',
    textTransform: 'uppercase',
  },

  // 4. Section Payout
  payoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  payoutLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  payoutAmount: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16.5,
    color: '#047857',
    fontVariant: ['tabular-nums'],
  },

  // 5. Bouton Unique VIP
  ctaRow: {
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#041912',
    gap: 8,
  },
  ctaButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  ctaIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

