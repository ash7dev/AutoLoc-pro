import React, { useState, useEffect } from 'react';
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
import { Search, Plus, Car, Filter } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerHeader } from '../../../shared/components';
import { OwnerVehicleCard } from '../components/OwnerVehicleCard';
import { AddVehicleModal } from '../components/AddVehicleModal';
import { ownerApi, OwnerVehicle } from '../api/ownerApi';

interface OwnerVehiclesScreenProps {
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

export const OwnerVehiclesScreen: React.FC<OwnerVehiclesScreenProps> = ({
  onSwitchToTenant,
  onProfilePress,
}) => {
  const [vehicles, setVehicles] = useState<OwnerVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'TOUS' | 'DISPONIBLE' | 'EN_LOCATION'>('TOUS');
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const loadVehicles = async () => {
    try {
      const data = await ownerApi.getOwnerVehicles();
      setVehicles(data);
    } catch {
      // Handled via mock
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleToggleStatus = async (vehicleId: string, currentStatus: OwnerVehicle['statut']) => {
    const nextStatus = currentStatus === 'DISPONIBLE' ? 'DESACTIVE' : 'DISPONIBLE';
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, statut: nextStatus } : v))
    );
    await ownerApi.updateVehicleStatus(vehicleId, nextStatus);
  };

  const handleVehicleAdded = (newVehicle: OwnerVehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.modele.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.immatriculation.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'TOUS') return matchesSearch;
    return matchesSearch && v.statut === activeFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <OwnerHeader
        variant="MANAGEMENT"
        title="Ma Flotte AutoLoc"
        subtitle={`${vehicles.length} véhicules enregistrés`}
        onProfilePress={onProfilePress}
      />

      <View style={styles.container}>
        {/* Barre de Recherche & Bouton Ajouter */}
        <View style={styles.topBar}>
          <View style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par marque, modèle..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Filtres par statut */}
        <View style={styles.filtersRow}>
          {[
            { id: 'TOUS', label: `Tous (${vehicles.length})` },
            { id: 'DISPONIBLE', label: 'Disponibles' },
            { id: 'EN_LOCATION', label: 'En location' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id as any)}
            >
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Liste des véhicules */}
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
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <OwnerVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onToggleStatus={handleToggleStatus}
                onEditPress={() => Alert.alert('Modification', `Éditer les paramètres de ${vehicle.marque} ${vehicle.modele}`)}
              />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Car size={36} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Aucun véhicule trouvé</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Aucun résultat ne correspond à votre recherche.'
                  : 'Ajoutez votre premier véhicule pour commencer à recevoir des réservations.'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <AddVehicleModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onVehicleAdded={handleVehicleAdded}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#1F2937',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#051B14',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    gap: 6,
  },
  addBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  filterText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#6B7280',
  },
  filterTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#047857',
  },
  scrollList: {
    paddingBottom: 110,
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
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#374151',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
