import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Calendar,
  CheckCircle,
  MapPin,
  Clock,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react-native';
import { formatCurrency } from '@autoloc/shared';
import { theme } from '../../../core/theme';
import { AutoCard } from '../../../shared/components';

const DEFAULT_CAR_THUMB =
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80';

export interface TenantBookingItem {
  id: string;
  statut:
    | 'EN_ATTENTE_PAIEMENT'
    | 'PAYEE'
    | 'CONFIRMEE'
    | 'EN_COURS'
    | 'TERMINEE'
    | 'ANNULEE'
    | 'LITIGE'
    | string;
  dateDebut: string | Date;
  dateFin: string | Date;
  nbJours?: number;
  prixParJour?: string | number;
  prixTotal?: string | number;
  modePaiement?: 'ACOMPTE_SOLDE_CHECKIN' | 'TOTAL_EN_LIGNE' | string;
  tauxAcompte?: string | number;
  montantPayeEnLigne?: string | number;
  montantSoldeCheckin?: string | number;
  discountLabel?: string;
  creeLe?: string | Date;
  contratUrl?: string;
  vehicule?: {
    id: string;
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    ville?: string;
    photos?: Array<{ url: string }> | string[];
    photoUrl?: string;
  };
  proprietaire?: {
    id?: string;
    prenom?: string;
    nom?: string;
    telephone?: string;
  };
  paiement?: {
    statut?: string;
    montant?: string | number;
    fournisseur?: string;
  };
}

export interface TenantBookingCardProps {
  booking: TenantBookingItem;
  onPressDetails?: (booking: TenantBookingItem) => void;
  onContactHost?: (booking: TenantBookingItem) => void;
}

export const TenantBookingCard: React.FC<TenantBookingCardProps> = ({
  booking,
  onPressDetails,
  onContactHost,
}) => {
  // Safe helper for formatting dates
  const formatDateStr = (dateVal?: string | Date) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  const startDateFormatted = formatDateStr(booking.dateDebut);
  const endDateFormatted = formatDateStr(booking.dateFin);

  // Compute thumbnail
  const thumbUrl = React.useMemo(() => {
    if (booking.vehicule?.photos && booking.vehicule.photos.length > 0) {
      const first = booking.vehicule.photos[0];
      return typeof first === 'string' ? first : first?.url;
    }
    return booking.vehicule?.photoUrl || DEFAULT_CAR_THUMB;
  }, [booking.vehicule]);

  // Compute numeric values safely
  const paidOnline = Number(booking.montantPayeEnLigne ?? booking.paiement?.montant ?? 0);
  const remainingSolde = Number(booking.montantSoldeCheckin ?? 0);
  const totalAmount = Number(booking.prixTotal ?? (paidOnline + remainingSolde));

  // Compute display status badge
  const renderStatusBadge = () => {
    const s = (booking.statut || '').toUpperCase();
    switch (s) {
      case 'CONFIRMEE':
      case 'PAYEE':
        return (
          <View style={styles.badgeSuccess}>
            <CheckCircle size={13} color="#059669" />
            <Text style={styles.badgeSuccessText}>CONFIRMÉE</Text>
          </View>
        );
      case 'EN_COURS':
        return (
          <View style={styles.badgeInProgress}>
            <Clock size={13} color="#2563EB" />
            <Text style={styles.badgeInProgressText}>EN COURS</Text>
          </View>
        );
      case 'TERMINEE':
        return (
          <View style={styles.badgeCompleted}>
            <ShieldCheck size={13} color="#475569" />
            <Text style={styles.badgeCompletedText}>TERMINÉE</Text>
          </View>
        );
      case 'LITIGE':
      case 'ANNULEE':
        return (
          <View style={styles.badgeDanger}>
            <AlertTriangle size={13} color="#DC2626" />
            <Text style={styles.badgeDangerText}>{s === 'LITIGE' ? 'LITIGE' : 'ANNULÉE'}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.badgePending}>
            <Clock size={13} color="#D97706" />
            <Text style={styles.badgePendingText}>EN ATTENTE</Text>
          </View>
        );
    }
  };

  const paymentProviderLabel =
    booking.paiement?.fournisseur === 'ORANGE_MONEY'
      ? 'Orange Money'
      : booking.paiement?.fournisseur === 'WAVE'
      ? 'Wave'
      : 'Paiement en ligne';

  return (
    <AutoCard variant="elevated" style={styles.bookingCard}>
      {/* Ligne En-tête : Numéro de réservation Mono & Badge statut */}
      <View style={styles.statusRow}>
        <View style={styles.idGroup}>
          <Text style={styles.idMicroLabel}>RÉSERVATION</Text>
          <Text style={styles.bookingId}>#{booking.id.slice(0, 10).toUpperCase()}</Text>
        </View>

        {renderStatusBadge()}
      </View>

      {/* Infos Véhicule : Thumbnail + Titre Fraunces 600 */}
      <View style={styles.carRow}>
        <Image source={{ uri: thumbUrl }} style={styles.carThumb} contentFit="cover" transition={200} />
        <View style={styles.carInfo}>
          {/* Titre véhicule : Fraunces_600SemiBold (Plafond 600) */}
          <Text style={styles.carName} numberOfLines={1}>
            {booking.vehicule?.marque} {booking.vehicule?.modele}{' '}
            {booking.vehicule?.annee ? `(${booking.vehicule.annee})` : ''}
          </Text>

          {/* Dates & Durée */}
          <View style={styles.dateRow}>
            <Calendar size={13} color={theme.colors.brand.main} />
            <Text style={styles.carDates}>
              {startDateFormatted} - {endDateFormatted}
              {booking.nbJours ? ` (${booking.nbJours}j)` : ''}
            </Text>
          </View>

          {/* Localisation */}
          <View style={styles.locRow}>
            <MapPin size={13} color="#64748B" />
            <Text style={styles.carLocation}>
              {booking.vehicule?.ville || 'Dakar'} • Sénégal
            </Text>
          </View>
        </View>
      </View>

      {/* Carte Récapitulatif Règlements Sombre Surface Forest-950 (#072A20) */}
      <View style={styles.recapCardDark}>
        <View style={styles.recapHeaderRow}>
          <Text style={styles.recapBlockTitle}>DÉTAIL DU RÈGLEMENT</Text>
          {booking.discountLabel ? (
            <Text style={styles.recapDiscountLabel}>{booking.discountLabel}</Text>
          ) : null}
        </View>

        {paidOnline > 0 && (
          <View style={styles.recapLine}>
            <Text style={styles.recapLabel}>
              {booking.modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                ? `Acompte réglé (${paymentProviderLabel}) :`
                : `Total réglé (${paymentProviderLabel}) :`}
            </Text>
            <Text style={styles.recapPaidVal}>{formatCurrency(paidOnline)}</Text>
          </View>
        )}

        {remainingSolde > 0 && (
          <View style={styles.recapLine}>
            <Text style={styles.recapLabel}>Solde à la remise des clés :</Text>
            <Text style={styles.recapRemainingVal}>{formatCurrency(remainingSolde)}</Text>
          </View>
        )}

        <View style={styles.recapDivider} />

        {/* Total Séjour : Inter_800ExtraBold en Émeraude Lumineux #86EFAC */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Séjour :</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      {/* Actions Inférieures (Contacter l'hôte & Détails) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtnSecondary}
          onPress={() => onContactHost?.(booking)}
          activeOpacity={0.8}
        >
          <MessageSquare size={14} color={theme.primitives.forest[800]} />
          <Text style={styles.actionBtnSecondaryText}>Contacter l'hôte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={() => onPressDetails?.(booking)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnPrimaryText}>Détails</Text>
          <ChevronRight size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </AutoCard>
  );
};

const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing[4],
    gap: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idGroup: {
    gap: 2,
  },
  idMicroLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  bookingId: {
    fontFamily: theme.typography.fontFamily.mono,
    fontVariant: ['tabular-nums'],
    fontSize: 13,
    fontWeight: '700',
    color: theme.primitives.forest[800],
    letterSpacing: 0.5,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  badgeSuccessText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#059669',
    letterSpacing: 0.4,
  },
  badgeInProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  badgeInProgressText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  badgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  badgeCompletedText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#475569',
    letterSpacing: 0.4,
  },
  badgeDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  badgeDangerText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#DC2626',
    letterSpacing: 0.4,
  },
  badgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  badgePendingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#D97706',
    letterSpacing: 0.4,
  },
  carRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  carThumb: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  carInfo: {
    flex: 1,
    gap: 5,
  },
  carName: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17.5,
    color: theme.primitives.forest[800],
    letterSpacing: -0.2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  carDates: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: theme.colors.brand.main,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  carLocation: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
  },
  recapCardDark: {
    backgroundColor: '#072A20', // Forest Night Surface
    borderRadius: 16,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  recapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapBlockTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#A8D5C1',
    letterSpacing: 0.8,
  },
  recapDiscountLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#86EFAC',
  },
  recapLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#A8D5C1',
  },
  recapPaidVal: {
    fontFamily: theme.typography.fontFamily.bold,
    fontVariant: ['tabular-nums'],
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  recapRemainingVal: {
    fontFamily: theme.typography.fontFamily.bold,
    fontVariant: ['tabular-nums'],
    fontSize: 13.5,
    color: '#86EFAC',
  },
  recapDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  totalValue: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontVariant: ['tabular-nums'],
    fontSize: 19,
    color: '#86EFAC',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  actionBtnSecondaryText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: theme.primitives.forest[800],
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primitives.forest[800],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  actionBtnPrimaryText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
