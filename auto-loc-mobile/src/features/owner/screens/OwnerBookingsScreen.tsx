import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  History,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  SearchX,
  Clock,
  CalendarClock,
  ShieldCheck,
  XCircle,
  Car,
  X,
  RefreshCw,
} from 'lucide-react-native';
import { useAppStore } from '../../../core/store/useAppStore';
import { useNavigation } from '../../../core/navigation/RootNavigator';
import { OwnerReservationsGlassHeroHeader } from '../components/OwnerReservationsGlassHeroHeader';
import { OwnerReservationsSearchBar } from '../components/OwnerReservationsSearchBar';
import { OwnerBookingCard } from '../components/OwnerBookingCard';
import { OwnerBookingSkeleton } from '../components/OwnerBookingSkeleton';
import { OwnerBooking } from '../api/ownerApi';
import { useOwnerBookings } from '../hooks/useOwnerBookings';

interface OwnerBookingsScreenProps {
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

type FilterTabId = 'TOUTES' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const OwnerBookingsScreen: React.FC<OwnerBookingsScreenProps> = ({
  onSwitchToTenant,
  onProfilePress,
}) => {
  const { navigateToOwnerBookingDetail } = useNavigation();
  const user = useAppStore((state) => state.user);

  // TanStack Query integration with shared memory cache ['owner', 'bookings']
  const { bookings, stats, loading, refreshing, refetch } = useOwnerBookings();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterTabId>('TOUTES');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);

  const handleDetailPress = (bookingId: string) => {
    navigateToOwnerBookingDetail(bookingId);
  };

  const statusCounts = useMemo(() => {
    return {
      TOUTES: bookings.length,
      PENDING: bookings.filter((b) => b.statut === 'PENDING_APPROVAL').length,
      IN_PROGRESS: bookings.filter(
        (b) => b.statut === 'IN_PROGRESS' || b.statut === 'CONFIRMED'
      ).length,
      COMPLETED: bookings.filter((b) => b.statut === 'COMPLETED').length,
      CANCELLED: bookings.filter((b) => b.statut === 'CANCELLED' || b.statut === 'REJECTED').length,
    };
  }, [bookings]);

  const filterTabs: Array<{ id: FilterTabId; label: string }> = [
    { id: 'TOUTES', label: 'Toutes' },
    { id: 'PENDING', label: 'En attente' },
    { id: 'IN_PROGRESS', label: 'En cours' },
    { id: 'COMPLETED', label: 'Terminées' },
    { id: 'CANCELLED', label: 'Annulées' },
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.codeReservation.toLowerCase().includes(q) ||
        b.locataireName.toLowerCase().includes(q) ||
        b.vehicleTitle.toLowerCase().includes(q) ||
        b.immatriculation.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (activeFilter === 'TOUTES') return true;
      if (activeFilter === 'PENDING') return b.statut === 'PENDING_APPROVAL';
      if (activeFilter === 'IN_PROGRESS')
        return b.statut === 'IN_PROGRESS' || b.statut === 'CONFIRMED';
      if (activeFilter === 'COMPLETED') return b.statut === 'COMPLETED';
      if (activeFilter === 'CANCELLED')
        return b.statut === 'CANCELLED' || b.statut === 'REJECTED';
      return true;
    });
  }, [bookings, searchQuery, activeFilter]);

  // Séparation entre réservations actives et historiques (passées / annulées)
  const { activeBookings, historyBookings } = useMemo(() => {
    const PAST_STATUSES = ['COMPLETED', 'CANCELLED', 'REJECTED'];
    const active: OwnerBooking[] = [];
    const history: OwnerBooking[] = [];

    filteredBookings.forEach((b) => {
      if (PAST_STATUSES.includes(b.statut)) {
        history.push(b);
      } else {
        active.push(b);
      }
    });

    return { activeBookings: active, historyBookings: history };
  }, [filteredBookings]);

  // Rendu contextualisé premium des états vides
  const renderEmptyState = () => {
    if (searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <SearchX size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucun résultat pour "{searchQuery}"</Text>
          <Text style={styles.emptySubtitle}>
            Aucune réservation ne correspond à votre recherche. Vérifiez l'orthographe ou essayez par nom de locataire, code ou immatriculation.
          </Text>
          <TouchableOpacity
            style={styles.emptyPrimaryBtn}
            onPress={() => setSearchQuery('')}
            activeOpacity={0.8}
          >
            <X size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.emptyPrimaryBtnText}>Réinitialiser la recherche</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'PENDING') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <Clock size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez aucune réservation en attente de réponse. Vos demandes à valider s'afficheront ici.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUTES')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toutes les réservations</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'IN_PROGRESS') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <CalendarClock size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucune location en cours</Text>
          <Text style={styles.emptySubtitle}>
            Aucun de vos véhicules n'est actuellement loué ou confirmé pour un départ imminence.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUTES')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toutes les réservations</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'COMPLETED') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <ShieldCheck size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucune location terminée</Text>
          <Text style={styles.emptySubtitle}>
            Vos réservations complétées et vos gains générés s'afficheront dans cet onglet.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUTES')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toutes les réservations</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'CANCELLED') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <XCircle size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucune réservation annulée</Text>
          <Text style={styles.emptySubtitle}>
            Aucune réservation n'a été annulée ou refusée sur vos véhicules.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUTES')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toutes les réservations</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBadge}>
          <Car size={26} color="#34D399" strokeWidth={2.25} />
        </View>
        <Text style={styles.emptyTitle}>Aucune réservation pour le moment</Text>
        <Text style={styles.emptySubtitle}>
          Dès qu'un locataire réservera un de vos véhicules, le dossier complet de réservation apparaîtra ici.
        </Text>
        <TouchableOpacity
          style={styles.emptyPrimaryBtn}
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <RefreshCw size={14} color="#FFFFFF" strokeWidth={2.25} />
          <Text style={styles.emptyPrimaryBtnText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#041912" />

      {/* Header VIP Glassmorphic pour l'écran des Réservations */}
      <OwnerReservationsGlassHeroHeader
        user={user}
        stats={stats}
        onProfilePress={onProfilePress}
        onSwitchToTenant={onSwitchToTenant}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            tintColor="#34D399"
          />
        }
      >
        {/* Section Recherche & Filtres */}
        <View style={styles.searchSection}>
          <OwnerReservationsSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher par locataire, code ou véhicule..."
          />

          {/* Barre de Filtres Horizontale */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollRow}
          >
            {filterTabs.map((f) => {
              const isActive = activeFilter === f.id;
              const count = statusCounts[f.id] || 0;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveFilter(f.id)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive && styles.filterPillTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                  <View
                    style={[styles.badgeCount, isActive && styles.badgeCountActive]}
                  >
                    <Text
                      style={[
                        styles.badgeCountText,
                        isActive && styles.badgeCountTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Banner d'accès direct au Simulateur de Réservation VIP */}
        <TouchableOpacity
          style={styles.demoBanner}
          onPress={() => handleDetailPress('demo-res-98421')}
          activeOpacity={0.85}
        >
          <View style={styles.demoIconBadge}>
            <Sparkles size={16} color="#041912" strokeWidth={2.5} />
          </View>
          <View style={styles.demoTextContainer}>
            <Text style={styles.demoTitle}>Simulateur de Réservation VIP</Text>
            <Text style={styles.demoSub}>
              Tester la réservation BMW X5, modaux & actions en direct
            </Text>
          </View>
          <ChevronRight size={18} color="#041912" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Liste des Cartes de Réservations Premium */}
        {loading ? (
          <View style={styles.skeletonList}>
            <OwnerBookingSkeleton />
            <OwnerBookingSkeleton />
            <OwnerBookingSkeleton />
          </View>
        ) : filteredBookings.length === 0 ? (
          renderEmptyState()
        ) : activeFilter === 'TOUTES' && historyBookings.length > 0 ? (
          <>
            {/* Carte luxury d'information si aucune réservation active */}
            {activeBookings.length === 0 && (
              <View style={styles.noActiveCard}>
                <View style={styles.noActiveIconBadge}>
                  <Sparkles size={16} color="#34D399" strokeWidth={2.25} />
                </View>
                <View style={styles.noActiveTextGroup}>
                  <Text style={styles.noActiveTitle}>Aucune location active</Text>
                  <Text style={styles.noActiveSub}>
                    Vous n'avez pas de réservation en cours. Retrouvez vos séjours passés ci-dessous.
                  </Text>
                </View>
              </View>
            )}

            {/* 1. Réservations actives (Confirmées, En cours, En attente) */}
            {activeBookings.map((booking) => (
              <OwnerBookingCard
                key={booking.id}
                booking={booking}
                onDetailPress={handleDetailPress}
              />
            ))}

            {/* 2. Accordéon Dépliable pour l'Historique (Locations passées & annulées) */}
            <TouchableOpacity
              style={styles.historyAccordionHeader}
              onPress={() => setIsHistoryExpanded(!isHistoryExpanded)}
              activeOpacity={0.85}
            >
              <View style={styles.historyTitleGroup}>
                <View style={styles.historyIconBadge}>
                  <History size={18} color="#34D399" strokeWidth={2.25} />
                </View>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyTitle}>Historique & Réservations passées</Text>
                  <Text style={styles.historySubtitle}>
                    {historyBookings.length} location{historyBookings.length > 1 ? 's' : ''} terminée{historyBookings.length > 1 ? 's' : ''} ou annulée{historyBookings.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.chevronCircle}>
                {isHistoryExpanded ? (
                  <ChevronUp size={16} color="#041912" strokeWidth={2.25} />
                ) : (
                  <ChevronDown size={16} color="#041912" strokeWidth={2.25} />
                )}
              </View>
            </TouchableOpacity>

            {/* Contenu Déplié des Réservations Passées & Annulées */}
            {isHistoryExpanded && (
              <View style={styles.historyListStack}>
                {historyBookings.map((booking) => (
                  <OwnerBookingCard
                    key={booking.id}
                    booking={booking}
                    onDetailPress={handleDetailPress}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          filteredBookings.map((booking) => (
            <OwnerBookingCard
              key={booking.id}
              booking={booking}
              onDetailPress={handleDetailPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 14,
  },
  searchSection: {
    gap: 12,
  },
  filterScrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    paddingRight: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  filterPillActive: {
    backgroundColor: '#051B14',
    borderColor: '#051B14',
  },
  filterPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  badgeCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeCountText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#64748B',
  },
  badgeCountTextActive: {
    color: '#FFFFFF',
  },
  skeletonList: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#041912',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#041912',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#041912',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  emptyPrimaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptySecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptySecondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#475569',
  },
  noActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    marginBottom: 4,
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
  noActiveIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  noActiveTextGroup: {
    flex: 1,
    gap: 3,
  },
  noActiveTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
    color: '#041912',
    letterSpacing: -0.2,
  },
  noActiveSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  historyAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  historyTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  historyTextContainer: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
    color: '#041912',
    letterSpacing: -0.2,
  },
  historySubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#64748B',
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  historyListStack: {
    gap: 14,
    marginTop: 4,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  demoIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTextContainer: {
    flex: 1,
    gap: 2,
  },
  demoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13.5,
    color: '#041912',
  },
  demoSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#059669',
  },
});
