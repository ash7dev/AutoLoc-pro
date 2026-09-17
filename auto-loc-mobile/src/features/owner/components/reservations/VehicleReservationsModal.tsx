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
import { LinearGradient } from 'expo-linear-gradient';
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
  TrendingUp,
  Sparkles,
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

// Helper: Calculer la durée d'une location en jours (ex: 25 au 28 = 3 jours)
const calculateBookingDays = (startStr?: string, endStr?: string, fallbackDays?: number): number => {
  if (startStr && endStr) {
    const t1 = parseDateSafe(startStr);
    const t2 = parseDateSafe(endStr);
    if (t1 !== null && t2 !== null) {
      const diffMs = Math.abs(t2 - t1);
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    }
  }
  return fallbackDays || 1;
};

// Helper: Formater une date ISO ou DD/MM/YYYY en français (ex: 25 août 2026)
const formatFrenchDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const shortMonths = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const monthIdx = parseInt(m, 10) - 1;
    const monthName = shortMonths[monthIdx] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  }
  const frMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    const monthIdx = parseInt(m, 10) - 1;
    const monthName = shortMonths[monthIdx] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  }
  return dateStr;
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

interface EmptyStateProps {
  tab: FilterTab;
  onResetFilter: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ tab, onResetFilter }) => {
  const config: Record<
    FilterTab,
    {
      icon: any;
      iconBg: string;
      iconColor: string;
      title: string;
      subtitle: string;
      ctaText: string;
    }
  > = {
    TOUS: {
      icon: Sparkles,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      title: 'Aucune réservation enregistrée',
      subtitle: 'Ce véhicule n’a pas encore enregistré de réservation sur la plateforme.',
      ctaText: 'Actualiser la liste',
    },
    A_VENIR: {
      icon: Calendar,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      title: 'Aucune réservation à venir',
      subtitle: "Vous n'avez aucune réservation confirmée ou en attente pour les prochains jours.",
      ctaText: 'Voir toutes les réservations',
    },
    EN_COURS: {
      icon: Car,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      title: 'Aucune location en cours',
      subtitle: 'Ce véhicule est actuellement libre et prêt à être loué par un locataire.',
      ctaText: 'Voir toutes les réservations',
    },
    TERMINEE: {
      icon: CheckCircle2,
      iconBg: '#F1F5F9',
      iconColor: '#475569',
      title: 'Aucun historique terminé',
      subtitle: 'L’historique des réservations passées et clôturées apparaîtra ici.',
      ctaText: 'Voir toutes les réservations',
    },
    ANNULEE: {
      icon: ShieldCheck,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      title: 'Aucune annulation à déplorer',
      subtitle: 'Excellente nouvelle ! Aucun trajet n’a été annulé ou refusé pour ce véhicule.',
      ctaText: 'Voir toutes les réservations',
    },
  };

  const current = config[tab];
  const IconComp = current.icon;

  return (
    <View style={styles.emptyCardContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: current.iconBg }]}>
        <IconComp size={26} color={current.iconColor} />
      </View>

      <View style={styles.emptyTextWrapper}>
        <Text style={styles.emptyTitle}>{current.title}</Text>
        <Text style={styles.emptySubtitle}>{current.subtitle}</Text>
      </View>

      <TouchableOpacity
        style={styles.emptyCtaWrapper}
        onPress={onResetFilter}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#0A3E30', '#041912']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyCtaBtn}
        >
          <RotateCcw size={14} color="#34D399" />
          <Text style={styles.emptyCtaText}>{current.ctaText}</Text>
        </LinearGradient>
      </TouchableOpacity>
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
        <StatusBar barStyle="light-content" backgroundColor="#041912" />

        {/* Top Dark Obsidian Glass Navigation Bar */}
        <LinearGradient
          colors={['#072A20', '#041912', '#020F0B']}
          locations={[0, 0.6, 1]}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerThumbBox}>
            {vehicle.photoUrl ? (
              <Image source={{ uri: vehicle.photoUrl }} style={styles.headerThumbImage} resizeMode="cover" />
            ) : (
              <Car size={18} color="#34D399" />
            )}
          </View>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Réservations du véhicule
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {vehicle.marque} {vehicle.modele} • {vehicle.ville} ({vehicle.annee})
            </Text>
          </View>

          {activeCount > 0 && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>{activeCount} en cours</Text>
            </View>
          )}
        </LinearGradient>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchReservations(true)} tintColor="#059669" colors={['#059669']} />
          }
        >
          {/* Top Executive KPI Snapshot Card */}
          <LinearGradient
            colors={['#072A20', '#041912']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.kpiCardContainer}
          >
            {/* Colonne 1: Revenus Nets */}
            <View style={styles.kpiCol}>
              <Text style={styles.kpiLabelDark}>REVENUS NETS HÔTE</Text>
              <Text style={styles.kpiValueEmerald} numberOfLines={1} adjustsFontSizeToFit>
                {totalRevenusNets > 0 ? formatFCFA(totalRevenusNets) : formatFCFA(vehicle.revenusCumules || 0)}
              </Text>
            </View>

            {/* Séparateur Vertical Glass */}
            <View style={styles.kpiGlassDivider} />

            {/* Colonne 2: Locations */}
            <View style={styles.kpiColSmall}>
              <Text style={styles.kpiLabelDark}>LOCATIONS</Text>
              <Text style={styles.kpiValueWhite}>
                {totalCount || completedCount || vehicle.totalReservations || 0}
              </Text>
            </View>
          </LinearGradient>

          {/* Filter Bar — Luxury Pill Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tabCounts[tab.id];
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterPill, isActive ? styles.filterPillActive : styles.filterPillInactive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isActive ? styles.filterPillTextActive : styles.filterPillTextInactive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.filterCountBadge, isActive ? styles.filterCountBadgeActive : styles.filterCountBadgeInactive]}>
                    <Text style={[styles.filterCountText, isActive ? styles.filterCountTextActive : styles.filterCountTextInactive]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
                  {(() => {
                    const days = calculateBookingDays(b.dateDebut, b.dateFin, b.dureeJours);
                    const formattedStart = formatFrenchDate(b.dateDebut);
                    const formattedEnd = formatFrenchDate(b.dateFin);

                    return (
                      <View style={styles.datesBox}>
                        <View style={styles.datesIconBadge}>
                          <Calendar size={14} color="#059669" />
                        </View>
                        <View style={styles.datesTextFlex}>
                          <Text style={styles.datesText}>
                            Du <Text style={styles.dateBold}>{formattedStart}</Text> au{' '}
                            <Text style={styles.dateBold}>{formattedEnd}</Text>
                          </Text>
                        </View>
                        <View style={styles.durationPill}>
                          <Text style={styles.durationPillText}>
                            {days} {days > 1 ? 'jours' : 'jour'}
                          </Text>
                        </View>
                      </View>
                    );
                  })()}

                  {/* Financial Summary Showcase */}
                  <View style={styles.financialCard}>
                    <View style={styles.financialLineRow}>
                      <Text style={styles.financialLineLabel}>Montant brut location</Text>
                      <Text style={styles.financialLineValue}>{formatFCFA(b.montantTotalBrut)}</Text>
                    </View>

                    <View style={styles.financialLineRow}>
                      <Text style={styles.financialLineLabel}>Commission AutoLoc</Text>
                      <Text style={styles.financialLineValueSub}>-{formatFCFA(b.commissionAutoLoc)}</Text>
                    </View>

                    <View style={styles.financialLineDivider} />

                    <LinearGradient
                      colors={['#072A20', '#041912']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.financialNetRowDark}
                    >
                      <Text style={styles.financialNetLabelDark}>REVENU NET HÔTE</Text>
                      <Text style={styles.financialNetValueEmerald}>{formatFCFA(b.montantNetProprietaire)}</Text>
                    </LinearGradient>
                  </View>
                </View>
              ))}
            </Animated.View>
          ) : (
            <EmptyState tab={activeTab} onResetFilter={() => setActiveTab('TOUS')} />
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.25)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerThumbBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerThumbImage: {
    width: '100%',
    height: '100%',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#A8D5C1',
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#34D399',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  kpiCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  kpiCol: {
    flex: 1.8,
    gap: 4,
  },
  kpiColSmall: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  kpiLabelDark: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  kpiValueEmerald: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 20,
    color: '#34D399',
    letterSpacing: -0.3,
  },
  kpiValueWhite: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  kpiGlassDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterPillActive: {
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 12.5,
  },
  filterPillTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  filterPillTextInactive: {
    fontFamily: theme.typography.fontFamily.medium,
    color: '#475569',
  },
  filterCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountBadgeActive: {
    backgroundColor: '#09382B',
  },
  filterCountBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  filterCountText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
  },
  filterCountTextActive: {
    color: '#34D399',
  },
  filterCountTextInactive: {
    color: '#64748B',
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
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontSize: 15,
    color: '#0F172A',
    flexShrink: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
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
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
  },
  datesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datesIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  datesTextFlex: {
    flex: 1,
  },
  datesText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#334155',
  },
  dateBold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#0F172A',
  },
  durationPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#334155',
  },
  financialCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  financialLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  financialLineLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  financialLineValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#0F172A',
  },
  financialLineValueSub: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#DC2626',
  },
  financialLineDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  financialNetRowDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    marginTop: 2,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  financialNetLabelDark: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#A8D5C1',
    letterSpacing: 0.6,
  },
  financialNetValueEmerald: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16,
    color: '#34D399',
    letterSpacing: -0.2,
  },
  emptyCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyCtaWrapper: {
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  emptyCtaText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});