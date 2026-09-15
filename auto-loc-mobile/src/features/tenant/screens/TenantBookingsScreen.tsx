import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CalendarX, RefreshCw } from 'lucide-react-native';
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

  const { bookings, loading, refreshing, error, refetch } = useTenantBookings(activeTab);

  const handleContactHost = (booking: TenantBookingItem) => {
    const phone = booking.proprietaire?.telephone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Linking.openURL(`https://wa.me/221770000000?text=Bonjour,%20je%20vous%20contacte%20au%20sujet%20de%20la%20réservation%20%23${booking.id}`);
    }
  };

  const handlePressDetails = (booking: TenantBookingItem) => {
    navigation.navigateToBookingDetail(booking.id);
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
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <CalendarX size={32} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>Aucune réservation trouvée</Text>
            <Text style={styles.emptySubtitle}>{error || "Vous n'avez actuellement aucune réservation dans cette catégorie."}</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={refetch} activeOpacity={0.8}>
              <RefreshCw size={14} color="#FFFFFF" />
              <Text style={styles.refreshBtnText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map((booking) => (
            <TenantBookingCard
              key={booking.id}
              booking={booking}
              onContactHost={handleContactHost}
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
    paddingBottom: 110,
  },
  loaderContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: theme.primitives.forest[800],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primitives.forest[800],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    gap: 8,
    marginTop: 8,
  },
  refreshBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
