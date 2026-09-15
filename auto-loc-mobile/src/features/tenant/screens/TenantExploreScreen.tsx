import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapPin, List, SearchX, RotateCcw } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { useNavigation } from '../../../core/navigation/RootNavigator';
import { TenantHeader } from '../../../shared/components';
import { WhereToSearchTrigger } from '../components/WhereToSearchTrigger';
import { AirbnbSearchModal } from '../components/AirbnbSearchModal';
import { CategoryChipsBar, CategoryFilterKey } from '../components/CategoryChipsBar';
import { AirbnbVehicleCard } from '../components/AirbnbVehicleCard';
import { ExploreMapViewer } from '../components/ExploreMapViewer';
import { FeedSkeleton } from '../components/FeedSkeleton';
import { useExploreFeed } from '../hooks/useExploreFeed';
import { VehicleFeedItem } from '../types';

export const TenantExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);
  const searchFilters = useAppStore((state) => state.searchFilters);
  const setSearchFilters = useAppStore((state) => state.setSearchFilters);

  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Merge store filters with selected category chip
  const activeFilters = React.useMemo(() => {
    return {
      zone: searchFilters.zone,
      type: selectedCategory !== 'ALL' ? selectedCategory : searchFilters.type,
      dateDebut: searchFilters.dateDebut,
      dateFin: searchFilters.dateFin,
    };
  }, [searchFilters, selectedCategory]);

  const {
    vehicles,
    loading,
    loadingMore,
    refreshing,
    refetch,
    loadMore,
    userLocation,
    requestLocationPermission,
  } = useExploreFeed(activeFilters);

  const handleFavoriteToggle = (vehicleId: string) => {
    const allowed = triggerGuestAuthGuard(
      'Ajoutez ce véhicule à vos favoris pour le retrouver facilement plus tard.',
      { action: 'ADD_FAVORITE', vehicleId }
    );
    if (allowed) {
      setFavorites((prev) => ({ ...prev, [vehicleId]: !prev[vehicleId] }));
    }
  };

  const handleVehiclePress = (vehicle: VehicleFeedItem) => {
    navigation.navigateToVehicleDetail(vehicle.id, vehicle);
  };

  const handleToggleViewMode = async () => {
    if (viewMode === 'LIST') {
      // Trigger contextual location permission when user switches to Map mode
      await requestLocationPermission();
      setViewMode('MAP');
    } else {
      setViewMode('LIST');
    }
  };

  const datesSummaryText = searchFilters.dateDebut
    ? searchFilters.dateFin
      ? `${searchFilters.dateDebut.split('-').slice(1).join('/')} - ${searchFilters.dateFin.split('-').slice(1).join('/')}`
      : `À partir du ${searchFilters.dateDebut.split('-').slice(1).join('/')}`
    : undefined;

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchFilters({ zone: '', type: '' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header Discovery Officiel */}
      <TenantHeader variant="DISCOVERY" />

      {/* Barre Supérieure : Trigger Recherche Airbnb + Catégories */}
      <View style={styles.topFilterSection}>
        <WhereToSearchTrigger
          onPress={() => setSearchModalVisible(true)}
          selectedZone={searchFilters.zone}
          selectedType={selectedCategory !== 'ALL' ? selectedCategory : searchFilters.type}
          selectedDatesSummary={datesSummaryText}
        />

        {/* Categories Chips */}
        <View style={styles.categoryChipsWrapper}>
          <CategoryChipsBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
      </View>

      {/* Zone Principale de Contenu (Vue Liste vs Vue Carte) */}
      {viewMode === 'MAP' ? (
        <ExploreMapViewer
          vehicles={vehicles}
          userLocation={userLocation}
          onVehiclePress={handleVehiclePress}
        />
      ) : loading && vehicles.length === 0 ? (
        <View style={styles.skeletonPadding}>
          <FeedSkeleton />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <AirbnbVehicleCard
              vehicle={item}
              onPress={handleVehiclePress}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorited={Boolean(favorites[item.id])}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor={theme.colors.brand.main}
              colors={[theme.colors.brand.main]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <SearchX size={32} color="#64748B" />
              </View>
              <Text style={styles.emptyTitle}>Aucun véhicule disponible</Text>
              <Text style={styles.emptySubtitle}>
                {searchFilters.zone
                  ? `Aucun véhicule ne correspond à votre recherche à ${searchFilters.zone}. Assurez-vous que l'option Hors Dakar est activée ou réinitialisez les filtres.`
                  : 'Essayez de modifier vos critères de dates ou de catégories pour afficher plus d’annonces.'}
              </Text>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleResetFilters}
                activeOpacity={0.8}
              >
                <RotateCcw size={15} color="#FFFFFF" />
                <Text style={styles.resetBtnText}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.brand.main} />
                <Text style={styles.loadingMoreText}>Chargement des véhicules suivants...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Bouton Flottant Pilule de Bascule Liste / Carte (Style Airbnb) */}
      <View style={styles.floatingToggleContainer}>
        <TouchableOpacity
          style={styles.floatingToggleBtn}
          onPress={handleToggleViewMode}
          activeOpacity={0.85}
        >
          {viewMode === 'LIST' ? (
            <>
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.floatingToggleText}>Carte</Text>
            </>
          ) : (
            <>
              <List size={16} color="#FFFFFF" />
              <Text style={styles.floatingToggleText}>Liste</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Recherche Style Airbnb */}
      <AirbnbSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        initialZone={searchFilters.zone}
        initialType={searchFilters.type}
        initialDateDebut={searchFilters.dateDebut}
        initialDateFin={searchFilters.dateFin}
        onSearch={(filters) => {
          setSearchFilters(filters);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  topFilterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  categoryChipsWrapper: {
    marginHorizontal: -16,
  },
  listContainer: {
    padding: theme.spacing[4],
    paddingBottom: 110,
  },
  skeletonPadding: {
    paddingTop: 16,
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
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primitives.forest[800],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    gap: 8,
    marginTop: 8,
  },
  resetBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  floatingToggleContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    zIndex: 100,
  },
  floatingToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#072A20', // Forest 950 #072A20
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.full, // 9999px
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingToggleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
