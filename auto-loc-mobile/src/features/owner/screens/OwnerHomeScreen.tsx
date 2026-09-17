import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { OwnerGlassHeroHeader } from '../components/OwnerGlassHeroHeader';
import { OwnerPerformanceWidget } from '../components/OwnerPerformanceWidget';
import { OwnerDailyScheduleWidget } from '../components/OwnerDailyScheduleWidget';
import { OwnerPendingRequestsWidget } from '../components/OwnerPendingRequestsWidget';
import { OwnerFleetPreviewWidget } from '../components/OwnerFleetPreviewWidget';
import { OwnerQuickActionsWidget } from '../components/OwnerQuickActionsWidget';
import { OwnerHomeSkeleton } from '../components/OwnerHomeSkeleton';
import { ownerApi, OwnerDashboardStats, OwnerBooking, OwnerVehicle } from '../api/ownerApi';
import { useHostGate } from '../hooks/useHostGate';
import { ReservationGateModal } from '../../tenant/components/gates/ReservationGateModal';
import { AddVehicleWizardScreen } from './AddVehicleWizardScreen';
import { becomeAutoLocHost } from '../../tenant/api/tenantProfileApi';
import { secureStorage } from '../../../core/storage/secureStore';

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
  const setAuth = useAppStore((state) => state.setAuth);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);

  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [allBookings, setAllBookings] = useState<OwnerBooking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<OwnerBooking[]>([]);
  const [vehicles, setVehicles] = useState<OwnerVehicle[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gateModalVisible, setGateModalVisible] = useState(false);
  const [addWizardVisible, setAddWizardVisible] = useState(false);

  const hostGate = useHostGate();

  const handleAddVehiclePress = async () => {
    const allowed = triggerGuestAuthGuard(
      'Connectez-vous pour ajouter votre véhicule et commencer à recevoir des réservations.',
      { action: 'ADD_VEHICLE' }
    );
    if (!allowed) return;

    if (!hostGate.canProceed) {
      setGateModalVisible(true);
      return;
    }

    await openCreationFlow();
  };

  const openCreationFlow = async () => {
    if (user && user.role !== 'PROPRIETAIRE') {
      try {
        const result = await becomeAutoLocHost();
        await secureStorage.setRefreshToken(result.refreshToken);
        await setAuth(result.accessToken, { ...user, role: result.role });
      } catch {
        // En cas de problème de token
      }
    }
    setAddWizardVisible(true);
  };

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#041912" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor="#34D399"
          />
        }
      >
        {/* Full-bleed Dark Glassmorphic Header */}
        <OwnerGlassHeroHeader
          user={user}
          stats={stats}
          selectedCurrency={selectedCurrency}
          onProfilePress={onProfilePress}
          onSwitchToTenant={onSwitchToTenant}
        />

        <View style={styles.bodyContent}>
          {loading && !refreshing ? (
            <OwnerHomeSkeleton />
          ) : (
            <>
              {/* Raccourcis d'actions rapides */}
              <OwnerQuickActionsWidget
                pendingBookingsCount={pendingBookings.length}
                onAddVehiclePress={handleAddVehiclePress}
                onBookingsPress={() => onNavigateToTab?.('RESERVATIONS')}
                onRevenuesPress={() => onNavigateToTab?.('WALLET')}
              />

              {/* Widget Performance Générale Hôte */}
              <OwnerPerformanceWidget stats={stats} />

              {/* 📅 Widget Planning du Jour — Check-ins & Check-outs */}
              <OwnerDailyScheduleWidget
                bookings={allBookings}
                onSelectBooking={() => onNavigateToTab?.('RESERVATIONS')}
                onViewFullCalendar={() => onNavigateToTab?.('RESERVATIONS')}
              />

              {/* ⏳ Widget Demandes en attente d'approbation */}
              <OwnerPendingRequestsWidget
                pendingBookings={pendingBookings}
                onApproveBooking={handleApprove}
                onRejectBooking={handleReject}
                onViewAllPress={() => onNavigateToTab?.('RESERVATIONS')}
              />

              {/* Aperçu Premium de la Flotte */}
              <OwnerFleetPreviewWidget
                vehicles={vehicles}
                selectedCurrency={selectedCurrency}
                onNavigateToFleet={() => onNavigateToTab?.('VEHICULES')}
                onAddVehicle={handleAddVehiclePress}
                onSelectVehicle={() => onNavigateToTab?.('VEHICULES')}
              />
            </>
          )}
        </View>
      </ScrollView>

      <ReservationGateModal
        visible={gateModalVisible}
        vehicleTitle="Votre profil Hôte"
        missingSteps={hostGate.missingSteps}
        userAge={hostGate.userAge}
        customTitle="Vérification requise pour ajouter un véhicule"
        customSubtitle="Pour la sécurité des locataires et la couverture assurance AutoLoc, complétez votre profil hôte avant de publier votre annonce."
        onClose={() => setGateModalVisible(false)}
        onAllCompleted={() => {
          setGateModalVisible(false);
          openCreationFlow();
        }}
      />

      <AddVehicleWizardScreen
        visible={addWizardVisible}
        onClose={() => setAddWizardVisible(false)}
        onVehicleCreated={() => {
          setAddWizardVisible(false);
          loadData();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#041912',
  },
  scrollContent: {
    paddingBottom: 110,
    backgroundColor: theme.colors.surface.page,
  },
  bodyContent: {
    padding: theme.spacing[4],
    gap: 18,
  },
});
