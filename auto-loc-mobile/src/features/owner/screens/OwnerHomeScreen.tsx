import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  TrendingUp,
  Car,
  Calendar,
  Wallet,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatCurrency } from '../../../core/utils/currency';
import { OwnerHeader } from '../../../shared/components';
import { OwnerStatCard } from '../components/OwnerStatCard';
import { OwnerBookingCard } from '../components/OwnerBookingCard';
import { OwnerDailyScheduleWidget } from '../components/OwnerDailyScheduleWidget';
import { OwnerFleetPreviewWidget } from '../components/OwnerFleetPreviewWidget';
import { ownerApi, OwnerDashboardStats, OwnerBooking, OwnerVehicle } from '../api/ownerApi';

interface OwnerHomeScreenProps {
  onNavigateToTab?: (tab: 'ACCUEIL' | 'VEHICULES' | 'RESERVATIONS' | 'WALLET') => void;
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

export const OwnerHomeScreen: React.FC<OwnerHomeScreenProps> = ({
  onNavigateToTab,
  onSwitchToTenant,
  onProfilePress,
}) => {
  const user = useAppStore((state) => state.user);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [allBookings, setAllBookings] = useState<OwnerBooking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<OwnerBooking[]>([]);
  const [vehicles, setVehicles] = useState<OwnerVehicle[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, vehiclesRes] = await Promise.all([
        ownerApi.getDashboardStats(),
        ownerApi.getOwnerBookings(),
        ownerApi.getOwnerVehicles(),
      ]);

      setStats(statsRes);
      setAllBookings(bookingsRes);
      setPendingBookings(bookingsRes.filter((b) => b.statut === 'PENDING_APPROVAL'));
      setVehicles(vehiclesRes);
    } catch {
      // Fallback est déjà géré dans ownerApi
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (bookingId: string) => {
    await ownerApi.respondToBookingRequest(bookingId, true);
    Alert.alert('Réservation confirmée !', 'Le locataire a été notifié.');
    loadData();
  };

  const handleReject = async (bookingId: string) => {
    await ownerApi.respondToBookingRequest(bookingId, false);
    Alert.alert('Demande refusée', 'La réservation a été déclinée.');
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OwnerHeader
        variant="DISCOVERY"
        onProfilePress={onProfilePress}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={theme.colors.brand.main}
          />
        }
      >
        {/* Banner Bienvenue Hôte */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.welcomeBox}>
              <Text style={styles.welcomeText} numberOfLines={1}>
                Bonjour, {user?.prenom || 'Propriétaire'} 👋
              </Text>
              <Text style={styles.heroSubtitle} numberOfLines={1}>
                Aperçu des performances de votre flotte AutoLoc
              </Text>
            </View>

            <View style={styles.proBadge}>
              <ShieldCheck size={13} color="#34D399" />
              <Text style={styles.proBadgeText}>SuperHost ⚡️</Text>
            </View>
          </View>

          {/* Grand Chiffre Revenu */}
          <View style={styles.revenueBox}>
            <Text style={styles.revenueLabel}>Revenus générés ce mois-ci</Text>
            <View style={styles.revenueRow}>
              <Text style={styles.revenueValue}>
                {formatCurrency(stats?.revenusDuMois ?? 0, selectedCurrency)}
              </Text>
              <View style={styles.trendBadge}>
                <TrendingUp size={12} color="#34D399" />
                <Text style={styles.trendText}>
                  {stats?.variationMoisPourcentage && stats.variationMoisPourcentage > 0
                    ? `+${stats.variationMoisPourcentage}%`
                    : `${stats?.variationMoisPourcentage ?? 0}%`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Raccourcis d'actions rapides */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onNavigateToTab?.('VEHICULES')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <PlusCircle size={20} color="#059669" />
            </View>
            <Text style={styles.quickActionText}>Ajouter véhicule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onNavigateToTab?.('RESERVATIONS')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Clock size={20} color="#D97706" />
            </View>
            <Text style={styles.quickActionText}>Demandes ({pendingBookings.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onNavigateToTab?.('WALLET')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Wallet size={20} color="#2563EB" />
            </View>
            <Text style={styles.quickActionText}>Mes revenus</Text>
          </TouchableOpacity>
        </View>

        {/* Grille de Statistiques Clés */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Générale</Text>
        </View>

        <View style={styles.statsGrid}>
          <OwnerStatCard
            title="Taux d'occupation"
            value={`${stats?.tauxOccupation ?? 0}%`}
            changePercentage={stats?.variationMoisPourcentage ?? 0}
            icon={<Car size={18} color="#059669" />}
            accentColor="#059669"
          />

          <OwnerStatCard
            title="Note moyenne"
            value={stats?.noteMoyenneFlotte ? `${stats.noteMoyenneFlotte.toFixed(1)} ★` : 'N/A ★'}
            badgeText={stats?.noteMoyenneFlotte && stats.noteMoyenneFlotte >= 4.8 ? 'Top 5%' : undefined}
            icon={<Star size={18} color="#D97706" />}
            accentColor="#D97706"
          />
        </View>

        {/* 📅 Widget Planning du Jour — Check-ins & Check-outs */}
        <OwnerDailyScheduleWidget
          bookings={allBookings}
          onSelectBooking={() => onNavigateToTab?.('RESERVATIONS')}
          onViewFullCalendar={() => onNavigateToTab?.('RESERVATIONS')}
        />

        {/* Section Demandes en attente d'approbation */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.sectionTitle}>Demandes en attente</Text>
            {pendingBookings.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{pendingBookings.length}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => onNavigateToTab?.('RESERVATIONS')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {pendingBookings.length > 0 ? (
          pendingBookings.map((booking) => (
            <OwnerBookingCard
              key={booking.id}
              booking={booking}
              onApprove={handleApprove}
              onReject={handleReject}
              onDetailPress={() => onNavigateToTab?.('RESERVATIONS')}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Clock size={28} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
            <Text style={styles.emptySubtitle}>
              Vos véhicules disponibles apparaîtront ici dès qu'une réservation sera effectuée.
            </Text>
          </View>
        )}

        {/* Aperçu Premium de la Flotte */}
        <OwnerFleetPreviewWidget
          vehicles={vehicles}
          selectedCurrency={selectedCurrency}
          onNavigateToFleet={() => onNavigateToTab?.('VEHICULES')}
          onAddVehicle={() => onNavigateToTab?.('VEHICULES')}
          onSelectVehicle={() => onNavigateToTab?.('VEHICULES')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: 110,
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#051B14',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  welcomeBox: {
    flex: 1,
    marginRight: 4,
  },
  welcomeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    gap: 4,
    flexShrink: 0,
  },
  proBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#34D399',
  },
  revenueBox: {
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    borderRadius: 16,
  },
  revenueLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#A7F3D0',
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revenueValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 24,
    color: '#FFFFFF',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  trendText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#34D399',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#1F2937',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#041912',
  },
  countBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#D97706',
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#059669',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#374151',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },

});
