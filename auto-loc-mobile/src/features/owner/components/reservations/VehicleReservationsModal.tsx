import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Linking,
  StatusBar,
  Animated,
  Easing,
  RefreshControl,
  LayoutChangeEvent,
} from 'react-native';
import {
  X,
  Calendar,
  Phone,
  MessageSquare,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  RotateCcw,
  Inbox,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { ownerApi, OwnerVehicle, OwnerBooking } from '../../api/ownerApi';

interface VehicleReservationsModalProps {
  visible: boolean;
  vehicle: OwnerVehicle | null;
  onClose: () => void;
}

type FilterTab = 'TOUS' | 'A_VENIR' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'TOUS', label: 'Toutes' },
  { id: 'A_VENIR', label: 'À venir' },
  { id: 'EN_COURS', label: 'En cours' },
  { id: 'TERMINEE', label: 'Terminées' },
  { id: 'ANNULEE', label: 'Annulées' },
];

const AVATAR_PALETTE = ['#0EA5E9', '#059669', '#7C3AED', '#DC2626', '#D97706', '#DB2777', '#0891B2'];

// ---------- Helpers ----------

const formatFCFA = (amount: number) => `${(amount || 0).toLocaleString('fr-FR')} FCFA`;

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + second).toUpperCase();
};

const getAvatarColor = (name?: string) => {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

// Tente de parser un format dd/mm/yyyy ou yyyy-mm-dd, sinon renvoie null (tri ignoré)
const parseDateSafe = (value?: string): number | null => {
  if (!value) return null;
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  }
  const frMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  }
  const fallback = Date.parse(value);
  return Number.isNaN(fallback) ? null : fallback;
};

// ---------- Sous-composants ----------

const SkeletonCard: React.FC = () => {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.bookingCard, { opacity: pulse }]}>
      <View style={styles.bookingTopRow}>
        <View style={[styles.avatar, styles.skeletonBlock]} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={[styles.skeletonBlock, { width: '55%', height: 12, borderRadius: 6 }]} />
          <View style={[styles.skeletonBlock, { width: '35%', height: 10, borderRadius: 6 }]} />
        </View>
        <View style={[styles.skeletonBlock, { width: 70, height: 22, borderRadius: 999 }]} />
      </View>
      <View style={[styles.skeletonBlock, { height: 34, borderRadius: 10 }]} />
      <View style={[styles.skeletonBlock, { height: 56, borderRadius: 12 }]} />
    </Animated.View>
  );
};

const EmptyState: React.FC<{ tab: FilterTab }> = ({ tab }) => {
  const copy: Record<FilterTab, { title: string; subtitle: string }> = {
    TOUS: {
      title: 'Aucune réservation enregistrée',
      subtitle: "Ce véhicule n'a pas encore de réservations enregistrées sur la plateforme.",
    },
    A_VENIR: { title: 'Rien à venir', subtitle: "Aucune réservation confirmée ou en attente pour l'instant." },
    EN_COURS: { title: 'Aucune location en cours', subtitle: 'Ce véhicule n’est actuellement loué par personne.' },
    TERMINEE: { title: 'Aucune location terminée', subtitle: 'L’historique des locations terminées apparaîtra ici.' },
    ANNULEE: { title: 'Aucune annulation', subtitle: 'Aucune réservation annulée ou refusée pour ce véhicule.' },
  };
  const { title, subtitle } = copy[tab];
  return (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconCircle}>
        <Inbox size={28} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
};

// ---------- Composant principal ----------

export const VehicleReservationsModal: React.FC<VehicleReservationsModalProps> = ({
  visible,
  vehicle,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('TOUS');

  // Layouts des chips pour l'indicateur animé du segmented control
  const [chipLayouts, setChipLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  // Animation d'entrée pour la liste
  const listFade = useRef(new Animated.Value(0)).current;

  const fetchReservations = useCallback(
    async (isRefresh = false) => {
      if (!vehicle?.id) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        const list = await ownerApi.getVehicleReservations(vehicle.id);
        setBookings(list);
      } catch (err) {
        console.warn('Erreur lors de la récupération des réservations du véhicule:', err);
        setError("Impossible de charger les réservations. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [vehicle?.id]
  );

  useEffect(() => {
    if (visible && vehicle) {
      setActiveTab('TOUS');
      fetchReservations();
    }
  }, [visible, vehicle, fetchReservations]);

  useEffect(() => {
    if (!loading && visible) {
      listFade.setValue(0);
      Animated.timing(listFade, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [loading, activeTab, visible, listFade]);

  useEffect(() => {
    const layout = chipLayouts[activeTab];
    if (layout) {
      Animated.parallel([
        Animated.spring(indicatorX, { toValue: layout.x, useNativeDriver: false, speed: 18, bounciness: 6 }),
        Animated.spring(indicatorWidth, { toValue: layout.width, useNativeDriver: false, speed: 18, bounciness: 6 }),
      ]).start();
    }
  }, [activeTab, chipLayouts, indicatorX, indicatorWidth]);

  const handleChipLayout = (id: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setChipLayouts((prev) => ({ ...prev, [id]: { x, width } }));
  };

  // Counts pour chaque onglet
  const tabCounts = useMemo(() => {
    return {
      TOUS: bookings.length,
      A_VENIR: bookings.filter((b) => b.statut === 'CONFIRMED' || b.statut === 'PENDING_APPROVAL').length,
      EN_COURS: bookings.filter((b) => b.statut === 'IN_PROGRESS').length,
      TERMINEE: bookings.filter((b) => b.statut === 'COMPLETED').length,
      ANNULEE: bookings.filter((b) => b.statut === 'CANCELLED' || b.statut === 'REJECTED').length,
    };
  }, [bookings]);

  // Filtrer + trier (plus récent en premier lorsque la date est exploitable)
  const filteredBookings = useMemo(() => {
    const filtered = bookings.filter((b) => {
      if (activeTab === 'A_VENIR') return b.statut === 'CONFIRMED' || b.statut === 'PENDING_APPROVAL';
      if (activeTab === 'EN_COURS') return b.statut === 'IN_PROGRESS';
      if (activeTab === 'TERMINEE') return b.statut === 'COMPLETED';
      if (activeTab === 'ANNULEE') return b.statut === 'CANCELLED' || b.statut === 'REJECTED';
      return true;
    });
    return [...filtered].sort((a, b) => {
      const dateA = parseDateSafe(a.dateDebut);
      const dateB = parseDateSafe(b.dateDebut);
      if (dateA === null || dateB === null) return 0;
      return dateB - dateA;
    });
  }, [bookings, activeTab]);

  if (!visible || !vehicle) return null;

  // Statistiques
  const totalRevenusNets = bookings
    .filter((b) => b.statut === 'COMPLETED' || b.statut === 'IN_PROGRESS' || b.statut === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.montantNetProprietaire || 0), 0);

  const completedCount = bookings.filter((b) => b.statut === 'COMPLETED').length;
  const activeCount = bookings.filter((b) => b.statut === 'IN_PROGRESS').length;
  const totalCount = bookings.length;

  const handleCallTenant = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() => {
      Alert.alert('Erreur', "Impossible de passer l'appel.");
    });
  };

  const handleWhatsAppTenant = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}`).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir WhatsApp.");
    });
  };

  const renderStatusBadge = (statut: OwnerBooking['statut']) => {
    switch (statut) {
      case 'PENDING_APPROVAL':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={11} color="#B45309" />
            <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>En attente</Text>
          </View>
        );
      case 'CONFIRMED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle2 size={11} color="#059669" />
            <Text style={[styles.statusBadgeText, { color: '#047857' }]}>Confirmée</Text>
          </View>
        );
      case 'IN_PROGRESS':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF' }]}>
            <Car size={11} color="#2563EB" />
            <Text style={[styles.statusBadgeText, { color: '#1D4ED8' }]}>En cours</Text>
          </View>
        );
      case 'COMPLETED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
            <CheckCircle2 size={11} color="#475569" />
            <Text style={[styles.statusBadgeText, { color: '#334155' }]}>Terminée</Text>
          </View>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
            <XCircle size={11} color="#DC2626" />
            <Text style={[styles.statusBadgeText, { color: '#991B1B' }]}>Annulée</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Top Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Réservations du Véhicule
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {vehicle.marque} {vehicle.modele} • {vehicle.immatriculation}
            </Text>
          </View>

          {activeCount > 0 && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>{activeCount} en cours</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchReservations(true)} tintColor="#059669" colors={['#059669']} />
          }
        >
          {/* Top KPI Snapshot */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
                {totalRevenusNets > 0 ? formatFCFA(totalRevenusNets) : formatFCFA(vehicle.revenusCumules || 0)}
              </Text>
              <Text style={styles.kpiLabel}>Revenus nets générés</Text>
            </View>

            <View style={styles.kpiCardSmall}>
              <Text style={styles.kpiValueSmall}>{totalCount || completedCount || vehicle.totalReservations || 0}</Text>
              <Text style={styles.kpiLabel}>Locations</Text>
            </View>
          </View>

          {/* Filter Bar — segmented control avec indicateur animé */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <Animated.View
                style={[
                  styles.filterIndicator,
                  {
                    transform: [{ translateX: indicatorX }],
                    width: indicatorWidth,
                  },
                ]}
              />
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tabCounts[tab.id];
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onLayout={handleChipLayout(tab.id)}
                    style={styles.filterChip}
                    onPress={() => setActiveTab(tab.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {tab.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Body */}
          {loading ? (
            <View style={{ gap: 16 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <FileText size={30} color="#DC2626" />
              <Text style={styles.errorTitle}>Oups, une erreur est survenue</Text>
              <Text style={styles.errorSubtitle}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReservations()} activeOpacity={0.85}>
                <RotateCcw size={14} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : filteredBookings.length > 0 ? (
            <Animated.View style={{ opacity: listFade, gap: 16 }}>
              {filteredBookings.map((b) => (
                <View key={b.id} style={styles.bookingCard}>
                  {/* Header Carte : Locataire */}
                  <View style={styles.bookingTopRow}>
                    {b.locataireAvatar ? (
                      <Image source={{ uri: b.locataireAvatar }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: getAvatarColor(b.locataireName) }]}>
                        <Text style={styles.avatarFallbackText}>{getInitials(b.locataireName)}</Text>
                      </View>
                    )}

                    <View style={styles.tenantMetaBox}>
                      <View style={styles.tenantNameRow}>
                        <Text style={styles.tenantName} numberOfLines={1}>
                          {b.locataireName}
                        </Text>
                        {b.locataireKycVerified && (
                          <View style={styles.kycBadge}>
                            <ShieldCheck size={11} color="#047857" />
                            <Text style={styles.kycBadgeText}>Vérifié</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.bookingCodeText}>Réf : #{b.codeReservation}</Text>
                    </View>

                    {renderStatusBadge(b.statut)}
                  </View>

                  {/* Dates & Durée */}
                  <View style={styles.datesBox}>
                    <Calendar size={15} color="#059669" />
                    <Text style={styles.datesText}>
                      Du <Text style={styles.dateBold}>{b.dateDebut}</Text> au{' '}
                      <Text style={styles.dateBold}>{b.dateFin}</Text> ({b.dureeJours} {b.dureeJours > 1 ? 'jours' : 'jour'})
                    </Text>
                  </View>

                  {/* Financial Summary Box */}
                  <View style={styles.financialRow}>
                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>Montant brut</Text>
                      <Text style={styles.financialValueBrut}>{formatFCFA(b.montantTotalBrut)}</Text>
                    </View>

                    <View style={styles.financialDivider} />

                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>Commission</Text>
                      <Text style={styles.financialValueSub}>-{formatFCFA(b.commissionAutoLoc)}</Text>
                    </View>

                    <View style={styles.financialDivider} />

                    <View style={styles.financialColRight}>
                      <Text style={styles.financialLabelNet}>Net hôte</Text>
                      <Text style={styles.financialValueNet}>{formatFCFA(b.montantNetProprietaire)}</Text>
                    </View>
                  </View>

                  {/* Contact & Action Buttons */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => handleCallTenant(b.locatairePhone)}
                      activeOpacity={0.75}
                    >
                      <Phone size={13} color="#0F172A" />
                      <Text style={styles.contactBtnText}>Appeler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.whatsappBtn}
                      onPress={() => handleWhatsAppTenant(b.locatairePhone)}
                      activeOpacity={0.75}
                    >
                      <MessageSquare size={13} color="#25D366" />
                      <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Animated.View>
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  liveBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#1D4ED8',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiCardSmall: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#059669',
  },
  kpiValueSmall: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#0F172A',
  },
  kpiLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterScroll: {
    paddingHorizontal: 12,
    gap: 8,
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 999,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  filterChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  filterChipTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  errorTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#0F172A',
  },
  errorSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonBlock: {
    backgroundColor: '#E2E8F0',
  },
  bookingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  tenantMetaBox: {
    flex: 1,
  },
  tenantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantName: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14.5,
    color: '#0F172A',
    flexShrink: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  kycBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#047857',
  },
  bookingCodeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
  },
  datesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  datesText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#334155',
    flexShrink: 1,
  },
  dateBold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#0F172A',
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  financialCol: {
    gap: 2,
  },
  financialColRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  financialDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  financialLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#64748B',
  },
  financialLabelNet: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#047857',
  },
  financialValueBrut: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#0F172A',
  },
  financialValueSub: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#DC2626',
  },
  financialValueNet: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#059669',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  contactBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  whatsappBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#15803D',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#0F172A',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});