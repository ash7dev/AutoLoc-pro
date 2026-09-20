import React, { useState } from 'react';
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
import { useHostGate } from '../hooks/useHostGate';
import { useOwnerDashboard } from '../hooks/useOwnerDashboard';
import { useOwnerMutations } from '../hooks/useOwnerMutations';
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

  const [gateModalVisible, setGateModalVisible] = useState(false);
  const [addWizardVisible, setAddWizardVisible] = useState(false);

  const hostGate = useHostGate();

  // Integrated TanStack Query cache & SWR strategy
  const {
    stats,
    allBookings,
    pendingBookings,
    vehicles,
    loading,
    refreshing,
    refetch,
  } = useOwnerDashboard();

  const { respondBookingMutation } = useOwnerMutations();

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
        if (result.accessToken && result.refreshToken) {
          await secureStorage.setRefreshToken(result.refreshToken);
          await setAuth(result.accessToken, { ...user, role: result.role });
        }
      } catch {
        // En cas de problème de token
      }
    }
    setAddWizardVisible(true);
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await respondBookingMutation.mutateAsync({ bookingId, accept: true });
      Alert.alert('Réservation confirmée !', 'Le locataire a été notifié.');
    } catch {
      Alert.alert('Erreur', 'Impossible de confirmer la réservation pour le moment.');
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await respondBookingMutation.mutateAsync({ bookingId, accept: false });
      Alert.alert('Demande refusée', 'La réservation a été déclinée.');
    } catch {
      Alert.alert('Erreur', 'Impossible de décliner la réservation.');
    }
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
            onRefresh={refetch}
            tintColor="#34D399"
          />
        }
      >
        {/* Full-bleed Dark Glassmorphic Header */}
        <OwnerGlassHeroHeader
          user={user}
          stats={stats}
          allBookings={allBookings}
          selectedCurrency={selectedCurrency}
          onProfilePress={onProfilePress}
          onSwitchToTenant={onSwitchToTenant}
        />

        <View style={styles.bodyContent}>
          {loading ? (
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
          refetch();
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
