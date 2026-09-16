import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Search, Plus, Car, X, Filter } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerHeader } from '../../../shared/components';
import { OwnerVehicleCard } from '../components/OwnerVehicleCard';
import { OwnerFleetHeaderWidget } from '../components/OwnerFleetHeaderWidget';
import { OwnerVehicleQuickActionModal } from '../components/OwnerVehicleQuickActionModal';
import { OwnerVehicleSkeleton } from '../components/OwnerVehicleSkeleton';
import { ownerApi, OwnerVehicle } from '../api/ownerApi';
import { useHostGate } from '../hooks/useHostGate';
import { ReservationGateModal } from '../../tenant/components/gates/ReservationGateModal';
import { AddVehicleWizardScreen } from './AddVehicleWizardScreen';
import { VehicleCalendarModal } from '../components/calendar/VehicleCalendarModal';
import { becomeAutoLocHost } from '../../tenant/api/tenantProfileApi';
import { useAppStore } from '../../../core/store/useAppStore';
import { secureStorage } from '../../../core/storage/secureStore';

interface OwnerVehiclesScreenProps {
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

export const OwnerVehiclesScreen: React.FC<OwnerVehiclesScreenProps> = ({
  onProfilePress,
}) => {
  const user = useAppStore((state) => state.user);
  const setAuth = useAppStore((state) => state.setAuth);
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const [vehicles, setVehicles] = useState<OwnerVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'TOUS' | 'DISPONIBLE' | 'EN_LOCATION' | 'EN_ATTENTE_VALIDATION' | 'DESACTIVE'>('TOUS');
  const [refreshing, setRefreshing] = useState(false);
  const [gateModalVisible, setGateModalVisible] = useState(false);
  const [addWizardVisible, setAddWizardVisible] = useState(false);

  // Quick Action & Edit Modal State
  const [quickActionVehicle, setQuickActionVehicle] = useState<OwnerVehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<OwnerVehicle | null>(null);
  const [calendarVehicle, setCalendarVehicle] = useState<OwnerVehicle | null>(null);

  const handleEditVehicle = (vehicle: OwnerVehicle) => {
    setQuickActionVehicle(null);
    setEditingVehicle(vehicle);
  };

  const hostGate = useHostGate();

  const loadVehicles = useCallback(async () => {
    try {
      const data = await ownerApi.getOwnerVehicles();
      setVehicles(data);
    } catch (err) {
      console.warn('Erreur lors du chargement de la flotte:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

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

  const handleToggleStatus = async (vehicleId: string, currentStatus: OwnerVehicle['statut']) => {
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    const vehicleName = targetVehicle ? `${targetVehicle.marque} ${targetVehicle.modele}` : 'ce véhicule';

    const executeToggle = async (nextStatus: OwnerVehicle['statut']) => {
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, statut: nextStatus } : v))
      );
      try {
        await ownerApi.updateVehicleStatus(vehicleId, nextStatus);
      } catch {
        // Revert if error
        loadVehicles();
      }
    };

    if (currentStatus === 'DISPONIBLE') {
      Alert.alert(
        'Désactiver l’annonce ?',
        `En désactivant ${vehicleName}, votre véhicule ne sera plus disponible dans les recherches ni réservable par les locataires.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Désactiver',
            style: 'destructive',
            onPress: () => executeToggle('DESACTIVE'),
          },
        ]
      );
    } else {
      executeToggle('DISPONIBLE');
    }
  };

  const handleArchiveVehicle = (vehicle: OwnerVehicle) => {
    Alert.alert(
      'Archiver le véhicule',
      `Voulez-vous vraiment masquer ${vehicle.marque} ${vehicle.modele} (${vehicle.immatriculation}) du catalogue public ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Archiver',
          style: 'destructive',
          onPress: async () => {
            setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
            try {
              await ownerApi.archiveVehicle(vehicle.id);
            } catch {
              loadVehicles();
            }
          },
        },
      ]
    );
  };

  const handlePurgeVehicle = (vehicle: OwnerVehicle) => {
    Alert.alert(
      'Supprimer ce véhicule ?',
      `Êtes-vous sûr de vouloir supprimer définitivement votre ${vehicle.marque} ${vehicle.modele} (${vehicle.immatriculation}) ?\n\nCette action est irréversible. Toutes les photos, options et l'historique associés seront définitivement retirés de votre flotte.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
            try {
              await ownerApi.purgeVehiclePermanently(vehicle.id);
            } catch {
              loadVehicles();
            }
          },
        },
      ]
    );
  };

  const statusCounts = React.useMemo(() => {
    return {
      TOUS: vehicles.length,
      DISPONIBLE: vehicles.filter((v) => v.statut === 'DISPONIBLE' || v.statut === 'VERIFIE').length,
      EN_LOCATION: vehicles.filter((v) => v.statut === 'EN_LOCATION').length,
      EN_ATTENTE_VALIDATION: vehicles.filter((v) => v.statut === 'EN_ATTENTE_VALIDATION').length,
      DESACTIVE: vehicles.filter((v) => v.statut === 'DESACTIVE' || v.statut === 'ARCHIVE' || v.statut === 'REFUSE' || v.statut === 'MAINTENANCE').length,
    };
  }, [vehicles]);

  const filterTabs = [
    { id: 'TOUS', label: 'Tous' },
    { id: 'DISPONIBLE', label: 'Disponibles' },
    { id: 'EN_LOCATION', label: 'En location' },
    { id: 'EN_ATTENTE_VALIDATION', label: 'En vérification' },
    { id: 'DESACTIVE', label: 'Désactivés' },
  ] as const;

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.modele.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.immatriculation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'TOUS') return true;
    if (activeFilter === 'DISPONIBLE') {
      return v.statut === 'DISPONIBLE' || v.statut === 'VERIFIE';
    }
    if (activeFilter === 'EN_ATTENTE_VALIDATION') {
      return v.statut === 'EN_ATTENTE_VALIDATION';
    }
    if (activeFilter === 'DESACTIVE') {
      return v.statut === 'DESACTIVE' || v.statut === 'ARCHIVE' || v.statut === 'REFUSE' || v.statut === 'MAINTENANCE';
    }
    return v.statut === activeFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <OwnerHeader
        variant="MANAGEMENT"
        title="Ma Flotte AutoLoc"
        subtitle={`${vehicles.length} véhicule${vehicles.length > 1 ? 's' : ''} dans votre flotte`}
        onProfilePress={onProfilePress}
      />

      {loading && !refreshing ? (
        <OwnerVehicleSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadVehicles();
              }}
              tintColor={theme.colors.brand.main}
            />
          }
        >
          <View style={styles.container}>
            {/* Widget Synthese Flotte & Revenus */}
            <OwnerFleetHeaderWidget
              vehicles={vehicles}
              selectedCurrency={selectedCurrency}
              onAddVehicle={handleAddVehiclePress}
            />

            {/* Section Recherche & Filtres Ultra-Pro */}
            <View style={styles.searchFilterSection}>
              {/* Barre de Recherche Dynamique */}
              <View style={[styles.searchBox, isSearchFocused && styles.searchBoxFocused]}>
                <Search size={18} color={isSearchFocused ? '#059669' : '#94A3B8'} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher par immatriculation, marque ou modèle..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearSearchBtn}
                    onPress={() => setSearchQuery('')}
                    hitSlop={10}
                  >
                    <X size={13} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Barre de Filtres Horizontale avec Badges de Compteur */}
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
                      onPress={() => setActiveFilter(f.id as any)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                        {f.label}
                      </Text>
                      <View style={[styles.badgeCount, isActive && styles.badgeCountActive]}>
                        <Text style={[styles.badgeCountText, isActive && styles.badgeCountTextActive]}>
                          {count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Liste des véhicules de flotte */}
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <OwnerVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onToggleStatus={handleToggleStatus}
                  onQuickActionPress={(v) => setQuickActionVehicle(v)}
                  onEditPress={(v) => handleEditVehicle(v)}
                />
              ))
            ) : (
              <TouchableOpacity
                style={styles.emptyBox}
                onPress={handleAddVehiclePress}
                activeOpacity={0.8}
              >
                <Car size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Aucun véhicule trouvé</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Aucun résultat ne correspond à votre recherche par immatriculation ou modèle.'
                    : 'Ajoutez votre premier véhicule pour commencer à recevoir des réservations à Dakar.'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal Quick Actions */}
      <OwnerVehicleQuickActionModal
        visible={!!quickActionVehicle}
        vehicle={quickActionVehicle}
        onClose={() => setQuickActionVehicle(null)}
        onManageCalendar={(v) => {
          setQuickActionVehicle(null);
          setCalendarVehicle(v);
        }}
        onEditVehicle={(v) => handleEditVehicle(v)}
        onViewReservations={(v) => {
          Alert.alert('Réservations', `Consultation des réservations pour ${v.immatriculation}`);
        }}
        onToggleStatus={handleToggleStatus}
        onArchiveVehicle={handleArchiveVehicle}
        onPurgeVehicle={handlePurgeVehicle}
      />

      {/* Modal Calendrier & Indisponibilités */}
      <VehicleCalendarModal
        visible={!!calendarVehicle}
        vehicle={calendarVehicle}
        onClose={() => setCalendarVehicle(null)}
      />

      {/* Modal Verrou Hote */}
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

      {/* Wizard Création Véhicule */}
      <AddVehicleWizardScreen
        visible={addWizardVisible}
        mode="CREATE"
        onClose={() => setAddWizardVisible(false)}
        onVehicleCreated={() => {
          setAddWizardVisible(false);
          loadVehicles();
        }}
      />

      {/* Wizard Modification Véhicule */}
      <AddVehicleWizardScreen
        visible={!!editingVehicle}
        mode="EDIT"
        vehicleToEdit={editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onVehicleUpdated={() => {
          setEditingVehicle(null);
          loadVehicles();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollList: {
    paddingBottom: 110,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchFilterSection: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchBoxFocused: {
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13.5,
    color: '#0F172A',
  },
  clearSearchBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1E293B',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
