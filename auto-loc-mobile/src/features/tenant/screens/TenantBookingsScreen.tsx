import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CalendarX,
  RefreshCw,
  Search,
  X,
  SearchX,
  Car,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Compass,
  History,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { TenantHeader } from '../../../shared/components';
import { useNavigation } from '../../../core/navigation/RootNavigator';
import {
  TenantBookingCard,
  TenantBookingItem,
} from '../components/TenantBookingCard';
import { BookingCardSkeleton } from '../components/BookingCardSkeleton';
import {
  useTenantBookings,
  BookingStatusFilter,
} from '../hooks/useTenantBookings';

export const TenantBookingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<BookingStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const { bookings, loading, refreshing, error, refetch } = useTenantBookings(activeTab);

  const handlePressDetails = (booking: TenantBookingItem) => {
    navigation.navigateToBookingDetail(booking.id);
  };

  const handleExploreVehicles = () => {
    navigation.navigateToTab('EXPLORER');
  };

  // Filtrage dynamique selon la recherche de l'utilisateur
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter((b) => {
      const marque = (b.vehicule?.marque || '').toLowerCase();
      const modele = (b.vehicule?.modele || '').toLowerCase();
      const ville = (b.vehicule?.ville || '').toLowerCase();
      const idStr = (b.id || '').toLowerCase();
      const hostName = `${b.proprietaire?.prenom || ''} ${b.proprietaire?.nom || ''}`.toLowerCase();
      const statutStr = (b.statut || '').toLowerCase();

      return (
        marque.includes(q) ||
        modele.includes(q) ||
        ville.includes(q) ||
        idStr.includes(q) ||
        hostName.includes(q) ||
        statutStr.includes(q)
      );
    });
  }, [bookings, searchQuery]);

  // Séparation entre réservations actives et réservations passées / annulées
  const { activeBookings, historyBookings } = useMemo(() => {
    const PAST_STATUSES = ['TERMINEE', 'ANNULEE', 'LITIGE'];
    const active: TenantBookingItem[] = [];
    const history: TenantBookingItem[] = [];

    filteredBookings.forEach((b) => {
      const s = (b.statut || '').toUpperCase();
      if (PAST_STATUSES.includes(s)) {
        history.push(b);
      } else {
        active.push(b);
      }
    });

    return { activeBookings: active, historyBookings: history };
  }, [filteredBookings]);

  // Génération contextualisée du composant d'état vide
  const renderEmptyState = () => {
    // Cas 1 : Recherche sans résultat
    if (searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <SearchX size={26} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucun résultat pour "{searchQuery}"</Text>
          <Text style={styles.emptySubtitle}>
            Aucune réservation ne correspond à votre recherche. Vérifiez l'orthographe ou tentez une recherche par marque, modèle ou ville.
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

    // Cas 2 : Onglet "Confirmées" vide
    if (activeTab === 'CONFIRMED') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <CalendarCheck size={26} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucune réservation confirmée</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez pas de location à venir confirmée pour le moment. Réservez un véhicule pour votre prochain déplacement.
          </Text>
          <View style={styles.emptyBtnStack}>
            <TouchableOpacity style={styles.emptyPrimaryBtn} onPress={handleExploreVehicles} activeOpacity={0.8}>
              <Compass size={15} color="#4ADE80" strokeWidth={2.25} />
              <Text style={styles.emptyPrimaryBtnText}>Explorer les véhicules</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.emptySecondaryBtn} onPress={() => setActiveTab('ALL')} activeOpacity={0.8}>
              <Text style={styles.emptySecondaryBtnText}>Voir toutes les réservations</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Cas 3 : Onglet "En cours" vide
    if (activeTab === 'IN_PROGRESS') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <Clock size={26} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucune location en cours</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez actuellement aucun véhicule en cours d'utilisation.
          </Text>
          <View style={styles.emptyBtnStack}>
            <TouchableOpacity style={styles.emptyPrimaryBtn} onPress={handleExploreVehicles} activeOpacity={0.8}>
              <Compass size={15} color="#4ADE80" strokeWidth={2.25} />
              <Text style={styles.emptyPrimaryBtnText}>Explorer les véhicules</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.emptySecondaryBtn} onPress={() => setActiveTab('ALL')} activeOpacity={0.8}>
              <Text style={styles.emptySecondaryBtnText}>Voir toutes les réservations</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Cas 4 : Onglet "Terminées" vide
    if (activeTab === 'COMPLETED') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <ShieldCheck size={26} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucune location terminée</Text>
          <Text style={styles.emptySubtitle}>
            Vos historiques de séjours et locations passées s'afficheront dans cet onglet dès qu'elles seront complétées.
          </Text>
          <TouchableOpacity style={styles.emptySecondaryBtn} onPress={() => setActiveTab('ALL')} activeOpacity={0.8}>
            <Text style={styles.emptySecondaryBtnText}>Voir toutes les réservations</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Cas 5 : Aucune réservation du tout ('ALL')
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBadge}>
          <Car size={26} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.emptyTitle}>Aucune réservation pour le moment</Text>
        <Text style={styles.emptySubtitle}>
          {error || "Trouvez le véhicule idéal pour vos déplacements à Dakar et partout au Sénégal."}
        </Text>
        <View style={styles.emptyBtnStack}>
          <TouchableOpacity style={styles.emptyPrimaryBtn} onPress={handleExploreVehicles} activeOpacity={0.8}>
            <Compass size={15} color="#4ADE80" strokeWidth={2.25} />
            <Text style={styles.emptyPrimaryBtnText}>Explorer les véhicules</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emptySecondaryBtn} onPress={refetch} activeOpacity={0.8}>
            <RefreshCw size={13} color="#64748B" />
            <Text style={styles.emptySecondaryBtnText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* En-tête d'Écran avec Typographie Fraunces 600 & Support Emerald 24/7 */}
      <TenantHeader
        variant="MANAGEMENT"
        title="Mes Réservations"
        subtitle="Suivi de vos locations et acomptes réglés"
      />

      {/* Barre de Recherche Fonctionnelle */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarWrap}>
          <Search size={16} color="#64748B" strokeWidth={2.25} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher véhicule, hôte, ville, n°..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={13} color="#64748B" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Barre de Filtres par Statut (Style Airbnb Pill Tabs) */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'ALL' && styles.activeTabChip]}
            onPress={() => setActiveTab('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.activeTabText]}>
              Toutes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'CONFIRMED' && styles.activeTabChip]}
            onPress={() => setActiveTab('CONFIRMED')}
            activeOpacity={0.8}
          >
            <View style={styles.tabBadgeDot} />
            <Text style={[styles.tabText, activeTab === 'CONFIRMED' && styles.activeTabText]}>
              Confirmées
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'IN_PROGRESS' && styles.activeTabChip]}
            onPress={() => setActiveTab('IN_PROGRESS')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'IN_PROGRESS' && styles.activeTabText]}>
              En cours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'COMPLETED' && styles.activeTabChip]}
            onPress={() => setActiveTab('COMPLETED')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.activeTabText]}>
              Terminées
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            tintColor={theme.colors.brand.main}
            colors={[theme.colors.brand.main]}
          />
        }
      >
        {loading && !refreshing ? (
          <BookingCardSkeleton count={2} />
        ) : filteredBookings.length === 0 ? (
          renderEmptyState()
        ) : activeTab === 'ALL' && historyBookings.length > 0 ? (
          <>
            {/* Carte luxury d'information si aucune réservation active en cours */}
            {activeBookings.length === 0 && (
              <View style={styles.noActiveCard}>
                <View style={styles.noActiveIconBadge}>
                  <Sparkles size={16} color="#4ADE80" strokeWidth={2.25} />
                </View>
                <View style={styles.noActiveTextGroup}>
                  <Text style={styles.noActiveTitle}>Aucune location active</Text>
                  <Text style={styles.noActiveSub}>
                    Vous n'avez pas de réservation en cours d'utilisation. Retrouvez vos séjours passés ci-dessous.
                  </Text>
                </View>
              </View>
            )}

            {/* 1. Réservations actives (Confirmées, En cours, En attente) */}
            {activeBookings.map((booking) => (
              <TenantBookingCard
                key={booking.id}
                booking={booking}
                onPressDetails={handlePressDetails}
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
                  <History size={18} color="#4ADE80" strokeWidth={2.25} />
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
                  <TenantBookingCard
                    key={booking.id}
                    booking={booking}
                    onPressDetails={handlePressDetails}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          filteredBookings.map((booking) => (
            <TenantBookingCard
              key={booking.id}
              booking={booking}
              onPressDetails={handlePressDetails}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13.5,
    color: '#041912',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  activeTabChip: {
    backgroundColor: '#072A20', // Forest 950
  },
  tabBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#475569',
  },
  activeTabText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  container: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
    paddingBottom: 140,
  },
  /* Carte luxury d'information si aucune réservation active */
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
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  noActiveTextGroup: {
    flex: 1,
    gap: 3,
  },
  noActiveTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.2,
  },
  noActiveSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#5F6B59',
    lineHeight: 17,
  },
  /* Accordéon Historique */
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
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  historyTextContainer: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.2,
  },
  historySubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
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
    gap: theme.spacing[4],
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 42,
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
    borderColor: 'rgba(74, 222, 128, 0.35)',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17.5,
    color: '#041912',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  emptyBtnStack: {
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    width: '100%',
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#041912',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  emptyPrimaryBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptySecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptySecondaryBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#475569',
  },
});
