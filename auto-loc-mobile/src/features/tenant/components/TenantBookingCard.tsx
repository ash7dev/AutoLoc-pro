import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Calendar,
  CheckCircle,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Sparkles,
  ArrowRight,
  KeyRound,
  PhoneCall,
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
}

// Parsing numérique sûr : jamais de NaN affiché à l'utilisateur
const safeNumber = (val: unknown, fallback = 0): number => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

export const TenantBookingCard: React.FC<TenantBookingCardProps> = ({
  booking,
  onPressDetails,
}) => {
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

  const thumbUrl = React.useMemo(() => {
    if (booking.vehicule?.photos && booking.vehicule.photos.length > 0) {
      const first = booking.vehicule.photos[0];
      return typeof first === 'string' ? first : first?.url;
    }
    return booking.vehicule?.photoUrl || DEFAULT_CAR_THUMB;
  }, [booking.vehicule]);

  const paidOnline = safeNumber(booking.montantPayeEnLigne ?? booking.paiement?.montant);
  const remainingSolde = safeNumber(booking.montantSoldeCheckin);
  const totalAmount = safeNumber(booking.prixTotal, paidOnline + remainingSolde);

  const onlinePercent = totalAmount > 0 ? Math.min(100, Math.max(0, Math.round((paidOnline / totalAmount) * 100))) : 0;
  const remainingPercent = 100 - onlinePercent;

  const statusCode = (booking.statut || '').toUpperCase();

  // Pastille "Dans X jours" façon Airbnb, uniquement pour les séjours à venir et actifs
  const upcomingChip = React.useMemo(() => {
    if (!['PAYEE', 'CONFIRMEE'].includes(statusCode)) return null;
    const start = new Date(booking.dateDebut);
    if (isNaN(start.getTime())) return null;

    const now = new Date();
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((startMidnight.getTime() - todayMidnight.getTime()) / 86400000);

    if (diffDays < 0) return null;
    if (diffDays === 0) return 'Aujourd’hui';
    if (diffDays === 1) return 'Demain';
    if (diffDays <= 30) return `Dans ${diffDays} jours`;
    return null;
  }, [statusCode, booking.dateDebut]);

  const renderStatusBadge = () => {
    switch (statusCode) {
      case 'CONFIRMEE':
        return (
          <View style={styles.badgeSuccess}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.badgeSuccessText}>CONFIRMÉE</Text>
          </View>
        );
      case 'PAYEE':
        return (
          <View style={styles.badgeInfo}>
            <View style={[styles.statusDot, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.badgeInfoText}>PAIEMENT REÇU</Text>
          </View>
        );
      case 'EN_COURS':
        return (
          <View style={styles.badgeInProgress}>
            <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.badgeInProgressText}>EN COURS</Text>
          </View>
        );
      case 'TERMINEE':
        return (
          <View style={styles.badgeCompleted}>
            <View style={[styles.statusDot, { backgroundColor: '#64748B' }]} />
            <Text style={styles.badgeCompletedText}>TERMINÉE</Text>
          </View>
        );
      case 'LITIGE':
      case 'ANNULEE':
        return (
          <View style={styles.badgeDanger}>
            <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.badgeDangerText}>{statusCode === 'LITIGE' ? 'LITIGE' : 'ANNULÉE'}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.badgePending}>
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
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

  const ownerFirstName = booking.proprietaire?.prenom;
  const ownerPhone = booking.proprietaire?.telephone;

  const handleContactOwner = async () => {
    if (!ownerPhone) return;
    const url = `tel:${ownerPhone.replace(/\s+/g, '')}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('tel: non supporté');
      await Linking.openURL(url);
    } catch (error) {
      console.warn('[TenantBookingCard] Appel hôte impossible:', error);
      Alert.alert('Appel impossible', 'Le numéro de l’hôte n’est pas disponible pour le moment.');
    }
  };

  const carLabel = `${booking.vehicule?.marque || ''} ${booking.vehicule?.modele || ''}`.trim();
  const shortBookingId = booking.id ? `REF #${booking.id.slice(-6).toUpperCase()}` : '';

  return (
    <AutoCard variant="elevated" style={styles.bookingCard}>
      {/* 1. Ligne En-tête : Badge statut & Code Référence */}
      <View style={styles.topHeaderRow}>
        {renderStatusBadge()}
        {shortBookingId ? (
          <View style={styles.refCodeBadge}>
            <Text style={styles.refCodeText}>{shortBookingId}</Text>
          </View>
        ) : null}
      </View>

      {/* 2. Banner Véhicule & Hôte */}
      <View style={styles.carRow}>
        <View style={styles.carThumbWrap}>
          <Image
            source={{ uri: thumbUrl }}
            style={styles.carThumb}
            contentFit="cover"
            transition={180}
            accessibilityLabel={carLabel ? `Photo du véhicule ${carLabel}` : 'Photo du véhicule'}
          />
          {booking.vehicule?.type ? (
            <View style={styles.carTypeBadge}>
              <Text style={styles.carTypeText}>{booking.vehicule.type.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.carInfo}>
          <Text style={styles.carName} numberOfLines={1}>
            {booking.vehicule?.marque} {booking.vehicule?.modele}{' '}
            {booking.vehicule?.annee ? `(${booking.vehicule.annee})` : ''}
          </Text>

          <View style={styles.locRow}>
            <MapPin size={12.5} color="#059669" strokeWidth={2} />
            <Text style={styles.carLocation}>
              {booking.vehicule?.ville || 'Dakar'} • Sénégal
            </Text>
          </View>

          {ownerFirstName ? (
            <View style={styles.ownerRow}>
              <View style={styles.ownerAvatarBadge}>
                <UserCheck size={11} color="#041912" strokeWidth={2.2} />
              </View>
              <Text style={styles.ownerText} numberOfLines={1}>
                Proposé par <Text style={styles.ownerNameHighlight}>{ownerFirstName}</Text>
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 3. Bloc Parcours de Dates & Durée (Trip Passage Box) */}
      <View style={styles.tripBox}>
        {upcomingChip ? (
          <View style={styles.upcomingBanner}>
            <Sparkles size={11} color="#B45309" strokeWidth={2.2} />
            <Text style={styles.upcomingBannerText}>{upcomingChip}</Text>
          </View>
        ) : null}

        <View style={styles.tripDatesRow}>
          <View style={styles.tripDateCol}>
            <Text style={styles.tripLabel}>PRISE EN MAIN</Text>
            <Text style={styles.tripDateVal}>{startDateFormatted}</Text>
          </View>

          <View style={styles.tripCenterCol}>
            <View style={styles.tripLine} />
            <View style={styles.tripDurationBadge}>
              <ArrowRight size={11} color="#059669" strokeWidth={2.5} />
              <Text style={styles.tripDurationText}>
                {booking.nbJours ? `${booking.nbJours}j` : 'Séjour'}
              </Text>
            </View>
            <View style={styles.tripLine} />
          </View>

          <View style={[styles.tripDateCol, styles.tripDateColRight]}>
            <Text style={styles.tripLabel}>RESTITUTION</Text>
            <Text style={styles.tripDateVal}>{endDateFormatted}</Text>
          </View>
        </View>
      </View>

      {/* 4. Carte Récapitulatif & Barre de Progression Dark Obsidian (#041912) */}
      <View style={styles.recapCardDark}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleBadgeRow}>
            <ShieldCheck size={13} color="#4ADE80" strokeWidth={2.2} />
            <Text style={styles.recapBlockTitle}>PAIEMENT SÉCURISÉ AUTOLOC</Text>
          </View>
          {booking.discountLabel ? (
            <View style={styles.discountPill}>
              <Text style={styles.discountPillText}>{booking.discountLabel}</Text>
            </View>
          ) : null}
        </View>

        {/* Barre de Progression du Règlement (uniquement pour les séjours actifs/à venir) */}
        {['CONFIRMEE', 'PAYEE', 'EN_COURS', 'EN_ATTENTE_PAIEMENT'].includes(statusCode) &&
          booking.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' &&
          totalAmount > 0 ? (
          <View style={styles.paymentProgressContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFilled, { width: `${onlinePercent}%` }]}>
                <CheckCircle2 size={10} color="#041912" strokeWidth={2.5} />
              </View>
              {remainingPercent > 0 && (
                <View style={[styles.progressBarRemaining, { width: `${remainingPercent}%` }]}>
                  <KeyRound size={10} color="#4ADE80" strokeWidth={2.5} />
                </View>
              )}
            </View>
            <View style={styles.progressLabelsRow}>
              <Text style={styles.progressLabelLeft}>Acompte {onlinePercent}% réglé</Text>
              <Text style={styles.progressLabelRight}>Solde {remainingPercent}% au check-in</Text>
            </View>
          </View>
        ) : null}

        {paidOnline > 0 ? (
          <View style={styles.recapLine}>
            <View style={styles.recapLineLabelRow}>
              <CheckCircle2 size={13} color="#4ADE80" strokeWidth={2.2} />
              <Text style={styles.recapLabel} numberOfLines={1} ellipsizeMode="tail">
                {booking.modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                  ? `Acompte réglé (${paymentProviderLabel})`
                  : `Règlement total (${paymentProviderLabel})`}
              </Text>
            </View>
            <Text style={styles.recapPaidVal}>{formatCurrency(paidOnline)}</Text>
          </View>
        ) : null}

        {remainingSolde > 0 ? (
          <View style={styles.recapLine}>
            <View style={styles.recapLineLabelRow}>
              <KeyRound size={13} color="#FBBF24" strokeWidth={2.2} />
              <Text style={styles.recapLabel} numberOfLines={1} ellipsizeMode="tail">
                Solde à la remise des clés
              </Text>
            </View>
            <Text style={styles.recapRemainingVal}>{formatCurrency(remainingSolde)}</Text>
          </View>
        ) : null}

        <View style={styles.recapDivider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Séjour :</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      {/* 5. Boutons d'Action */}
      <View style={styles.actionsRow}>
        {ownerPhone ? (
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={handleContactOwner}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Contacter ${ownerFirstName || 'l’hôte'} par téléphone`}
          >
            <PhoneCall size={14} color="#041912" strokeWidth={2.2} />
            <Text style={styles.actionBtnSecondaryText}>Contacter</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.actionBtnPrimary, ownerPhone && styles.actionBtnPrimaryFlex]}
          onPress={() => onPressDetails?.(booking)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Gérer la réservation ${carLabel}`}
        >
          <Text style={styles.actionBtnPrimaryText}>Gérer la réservation</Text>
          <ChevronRight size={15} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </AutoCard>
  );
};

const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgeSuccessText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#047857',
    letterSpacing: 0.4,
  },
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgeInfoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#4338CA',
    letterSpacing: 0.4,
  },
  badgeInProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgeInProgressText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#1D4ED8',
    letterSpacing: 0.4,
  },
  badgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
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
    backgroundColor: 'rgba(239, 68, 68, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
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
    backgroundColor: 'rgba(245, 158, 11, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgePendingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#D97706',
    letterSpacing: 0.4,
  },
  refCodeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refCodeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  carRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  carThumbWrap: {
    position: 'relative',
    width: 92,
    height: 92,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  carThumb: {
    width: '100%',
    height: '100%',
  },
  carTypeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(4, 25, 18, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  carTypeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  carInfo: {
    flex: 1,
    gap: 6,
  },
  carName: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: '#041912',
    letterSpacing: -0.3,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carLocation: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ownerAvatarBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  ownerText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#475569',
  },
  ownerNameHighlight: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#041912',
  },
  tripBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upcomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  upcomingBannerText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#B45309',
  },
  tripDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripDateCol: {
    flex: 1,
    gap: 2,
  },
  tripDateColRight: {
    alignItems: 'flex-end',
  },
  tripLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  tripDateVal: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13,
    color: '#041912',
  },
  tripCenterCol: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  tripLine: {
    width: 12,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  tripDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  tripDurationText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#047857',
  },
  recapCardDark: {
    backgroundColor: '#041912',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.22)',
  },
  recapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recapBlockTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 10,
    color: '#A8D5C1',
    letterSpacing: 0.8,
  },
  discountPill: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  discountPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#4ADE80',
  },
  paymentProgressContainer: {
    gap: 6,
    marginVertical: 2,
  },
  progressBarTrack: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 2,
    gap: 2,
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarRemaining: {
    height: '100%',
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelLeft: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#4ADE80',
  },
  progressLabelRight: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#A8D5C1',
  },
  recapLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  recapLineLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexShrink: 1,
  },
  recapLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#A8D5C1',
    flexShrink: 1,
  },
  recapPaidVal: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontVariant: ['tabular-nums'],
    fontSize: 13.5,
    color: '#FFFFFF',
    flexShrink: 0,
    textAlign: 'right',
  },
  recapRemainingVal: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontVariant: ['tabular-nums'],
    fontSize: 13.5,
    color: '#4ADE80',
    flexShrink: 0,
    textAlign: 'right',
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
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  totalValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontVariant: ['tabular-nums'],
    fontSize: 20,
    color: '#4ADE80',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 15,
    minHeight: 46,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnSecondaryText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13,
    color: '#041912',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#041912',
    minHeight: 46,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtnPrimaryFlex: {
    flex: 1,
  },
  actionBtnPrimaryText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});