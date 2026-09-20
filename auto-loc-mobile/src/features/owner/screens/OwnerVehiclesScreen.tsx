import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  Plus,
  Car,
  X,
  SearchX,
  CheckCircle2,
  Key,
  ShieldAlert,
  EyeOff,
} from 'lucide-react-native';
import { OwnerVehicleCard } from '../components/OwnerVehicleCard';
import { OwnerVehiclesGlassHeroHeader } from '../components/OwnerVehiclesGlassHeroHeader';
import { OwnerVehicleQuickActionModal } from '../components/OwnerVehicleQuickActionModal';
import { OwnerVehicleSkeleton } from '../components/OwnerVehicleSkeleton';
import { OwnerVehicle } from '../api/ownerApi';
import { useHostGate } from '../hooks/useHostGate';
import { useOwnerVehicles } from '../hooks/useOwnerVehicles';
import { useOwnerMutations } from '../hooks/useOwnerMutations';
import { ReservationGateModal } from '../../tenant/components/gates/ReservationGateModal';
import { AddVehicleWizardScreen } from './AddVehicleWizardScreen';
import { VehicleCalendarModal } from '../components/calendar/VehicleCalendarModal';
import { VehicleReservationsModal } from '../components/reservations/VehicleReservationsModal';
import { becomeAutoLocHost } from '../../tenant/api/tenantProfileApi';
import { useAppStore } from '../../../core/store/useAppStore';
import { secureStorage } from '../../../core/storage/secureStore';

interface OwnerVehiclesScreenProps {
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

export const OwnerVehiclesScreen: React.FC<OwnerVehiclesScreenProps> = ({
  onSwitchToTenant,
  onProfilePress,
}) => {
  const user = useAppStore((state) => state.user);
  const setAuth = useAppStore((state) => state.setAuth);
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);

  // TanStack Query integration avec pagination infinie (Instagram Smart Scroll)
  const {
    vehicles,
    total,
    loading,
    refreshing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useOwnerVehicles(10);

  const {
    updateVehicleStatusMutation,
    archiveVehicleMutation,
    purgeVehicleMutation,
  } = useOwnerMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'TOUS' | 'DISPONIBLE' | 'EN_LOCATION' | 'EN_ATTENTE_VALIDATION' | 'DESACTIVE'>('TOUS');
  const [gateModalVisible, setGateModalVisible] = useState(false);
  const [addWizardVisible, setAddWizardVisible] = useState(false);

  // Quick Action & Edit Modal State
  const [quickActionVehicle, setQuickActionVehicle] = useState<OwnerVehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<OwnerVehicle | null>(null);
  const [calendarVehicle, setCalendarVehicle] = useState<OwnerVehicle | null>(null);
  const [reservationsVehicle, setReservationsVehicle] = useState<OwnerVehicle | null>(null);

  const handleEditVehicle = (vehicle: OwnerVehicle) => {
    setQuickActionVehicle(null);
    setEditingVehicle(vehicle);
  };

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

  const handleToggleStatus = async (vehicleId: string, currentStatus: OwnerVehicle['statut']) => {
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    const vehicleName = targetVehicle ? `${targetVehicle.marque} ${targetVehicle.modele}` : 'ce véhicule';

    const executeToggle = async (nextStatus: OwnerVehicle['statut']) => {
      try {
        await updateVehicleStatusMutation.mutateAsync({ vehicleId, status: nextStatus });
      } catch {
        Alert.alert('Erreur', 'Impossible de modifier le statut du véhicule.');
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
            try {
              await archiveVehicleMutation.mutateAsync(vehicle.id);
            } catch {
              Alert.alert('Erreur', 'Impossible d’archiver le véhicule.');
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
            try {
              await purgeVehicleMutation.mutateAsync(vehicle.id);
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le véhicule.');
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

  const renderEmptyState = () => {
    if (searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <SearchX size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucun résultat pour "{searchQuery}"</Text>
          <Text style={styles.emptySubtitle}>
            Aucun véhicule ne correspond à cette immatriculation, marque ou modèle. Vérifiez l'orthographe.
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

    if (activeFilter === 'DISPONIBLE') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <CheckCircle2 size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucun véhicule disponible</Text>
          <Text style={styles.emptySubtitle}>
            Tous vos véhicules sont actuellement loués, en cours de vérification ou désactivés.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUS')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toute la flotte</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'EN_LOCATION') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <Key size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucun véhicule en location</Text>
          <Text style={styles.emptySubtitle}>
            Aucun de vos véhicules n'est actuellement en cours d'utilisation par un locataire.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUS')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toute la flotte</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'EN_ATTENTE_VALIDATION') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <ShieldAlert size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucun véhicule en vérification</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez aucun véhicule en attente d'approbation ou de modération administrative.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUS')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toute la flotte</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'DESACTIVE') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <EyeOff size={26} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.emptyTitle}>Aucun véhicule désactivé</Text>
          <Text style={styles.emptySubtitle}>
            Toutes vos annonces sont actives et visibles par les locataires sur AutoLoc.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryBtn}
            onPress={() => setActiveFilter('TOUS')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptySecondaryBtnText}>Voir toute la flotte</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBadge}>
          <Car size={26} color="#34D399" strokeWidth={2.25} />
        </View>
        <Text style={styles.emptyTitle}>Votre flotte est vide</Text>
        <Text style={styles.emptySubtitle}>
          Ajoutez votre premier véhicule pour commencer à recevoir des réservations et générer des revenus sur AutoLoc.
        </Text>
        <TouchableOpacity
          style={styles.emptyPrimaryBtn}
          onPress={handleAddVehiclePress}
          activeOpacity={0.8}
        >
          <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.emptyPrimaryBtnText}>Ajouter un véhicule</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListHeader = () => (
    <View>
      {/* Full-bleed Dark Obsidian Glass Hero Header */}
      <OwnerVehiclesGlassHeroHeader
        user={user}
        vehicles={vehicles}
        onProfilePress={onProfilePress}
        onSwitchToTenant={onSwitchToTenant}
        onAddVehiclePress={handleAddVehiclePress}
      />
      <View style={styles.container}>
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
      </View>
    </View>
  );

  const renderVehicleItem = ({ item }: { item: OwnerVehicle }) => (
    <View style={styles.cardWrapper}>
      <OwnerVehicleCard
        vehicle={item}
        onToggleStatus={handleToggleStatus}
        onQuickActionPress={(v) => setQuickActionVehicle(v)}
        onEditPress={(v) => handleEditVehicle(v)}
      />
    </View>
  );

  const renderListFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#34D399" />
          <Text style={styles.loadingFooterText}>Chargement des véhicules suivants...</Text>
        </View>
      );
    }
    if (!hasNextPage && filteredVehicles.length > 0) {
      return (
        <View style={styles.endFooter}>
          <Text style={styles.endFooterText}>• Toute votre flotte est affichée ({total} véhicule{total > 1 ? 's' : ''}) •</Text>
        </View>
      );
    }
    return null;
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (loading) {
    return <OwnerVehicleSkeleton />;
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#041912" />

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicleItem}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            tintColor="#34D399"
          />
        }
      />

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
          setQuickActionVehicle(null);
          setReservationsVehicle(v);
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

      {/* Modal Historique des Réservations du Véhicule */}
      <VehicleReservationsModal
        visible={!!reservationsVehicle}
        vehicle={reservationsVehicle}
        onClose={() => setReservationsVehicle(null)}
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
          refetch();
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
          refetch();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#041912',
  },
  scrollList: {
    paddingBottom: 110,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingFooterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#059669',
  },
  endFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  endFooterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 0.2,
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
    marginHorizontal: 16,
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
});

