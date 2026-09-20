import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapPin, List, SearchX, RotateCcw, SlidersHorizontal, X } from 'lucide-react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { useNavigation } from '../../../core/navigation/RootNavigator';

import { WhereToSearchTrigger } from '../components/WhereToSearchTrigger';
import { AirbnbSearchModal } from '../components/AirbnbSearchModal';
import { CategoryChipsBar, CategoryFilterKey } from '../components/CategoryChipsBar';
import { AirbnbVehicleCard } from '../components/AirbnbVehicleCard';
import { ExploreMapViewer } from '../components/ExploreMapViewer';
import { ExploreRefinementModal } from '../components/ExploreRefinementModal';
import { FeedSkeleton } from '../components/FeedSkeleton';
import { useExploreFeed } from '../hooks/useExploreFeed';
import { useFavoriteVehicles } from '../hooks/useFavoriteVehicles';
import { VehicleFeedItem } from '../types';

export const TenantExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);
  const searchFilters = useAppStore((state) => state.searchFilters);
  const setSearchFilters = useAppStore((state) => state.setSearchFilters);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [refinementModalVisible, setRefinementModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('ALL');
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('LIST');
  const { favoriteIds, toggleFavorite } = useFavoriteVehicles();

  // BottomSheet References & Snap Points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const listRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '92%'], []);

  // Merge store filters with selected category chip
  const activeFilters = useMemo(() => {
    return {
      zone: searchFilters.zone,
      type: selectedCategory !== 'ALL' ? selectedCategory : searchFilters.type,
      dateDebut: searchFilters.dateDebut,
      dateFin: searchFilters.dateFin,
      prixMin: searchFilters.prixMin,
      prixMax: searchFilters.prixMax,
      carburant: searchFilters.carburant,
      transmission: searchFilters.transmission,
      sort: searchFilters.sort,
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
    hasMore,
    total,
    error,
  } = useExploreFeed(activeFilters);

  const handleFavoriteToggle = useCallback((vehicleId: string) => {
    const allowed = triggerGuestAuthGuard(
      'Ajoutez ce véhicule à vos favoris pour le retrouver facilement plus tard.',
      { action: 'ADD_FAVORITE', vehicleId }
    );
    if (allowed) {
      toggleFavorite(vehicleId);
    }
  }, [toggleFavorite, triggerGuestAuthGuard]);

  const handleVehiclePress = (vehicle: VehicleFeedItem) => {
    navigation.navigateToVehicleDetail(vehicle.id, vehicle);
  };

  const handleSearchInArea = useCallback((region?: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => {
    if (!region) return;
    const minLat = region.latitude - region.latitudeDelta / 2;
    const maxLat = region.latitude + region.latitudeDelta / 2;
    const minLng = region.longitude - region.longitudeDelta / 2;
    const maxLng = region.longitude + region.longitudeDelta / 2;

    setSearchFilters({
      ...searchFilters,
      bbox: { minLat, maxLat, minLng, maxLng },
    });
  }, [searchFilters, setSearchFilters]);

  const handleToggleViewMode = async () => {
    if (viewMode === 'LIST') {
      await requestLocationPermission();
      setViewMode('MAP');
      bottomSheetRef.current?.snapToIndex(0); // 15% — carte plein écran
    } else {
      setViewMode('LIST');
      bottomSheetRef.current?.snapToIndex(1); // 50%
    }
  };

  // Callback quand un marqueur est cliqué sur la carte → scroll BottomSheet vers le véhicule
  const handleMarkerSelectVehicle = useCallback((vehicle: VehicleFeedItem) => {
    const index = vehicles.findIndex((v) => v.id === vehicle.id);
    if (index !== -1) {
      // Ouvrir le sheet à 50% si en mode MAP
      if (viewMode === 'MAP') {
        bottomSheetRef.current?.snapToIndex(1); // 50%
        setViewMode('LIST');
      }
      // Scroll vers la carte du véhicule dans la liste
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index, animated: true, viewOffset: 20 });
      }, 300);
    }
  }, [vehicles, viewMode]);

  const datesSummaryText = searchFilters.dateDebut
    ? searchFilters.dateFin
      ? `${searchFilters.dateDebut.split('-').slice(1).join('/')} - ${searchFilters.dateFin.split('-').slice(1).join('/')}`
      : `À partir du ${searchFilters.dateDebut.split('-').slice(1).join('/')}`
    : undefined;

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchFilters({ zone: '', type: '', prixMin: undefined, prixMax: undefined, carburant: '', transmission: '', sort: 'RELEVANCE' });
  };

function formatLocationPreposition(zone?: string): string {
  if (!zone || !zone.trim() || zone.trim().toLowerCase() === 'sénégal' || zone.trim().toLowerCase() === 'senegal') {
    return 'au Sénégal';
  }

  const trimmed = zone.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('à ') ||
    lower.startsWith('au ') ||
    lower.startsWith('aux ') ||
    lower.startsWith('en ') ||
    lower.startsWith('dans ') ||
    lower.startsWith('hors ')
  ) {
    return trimmed;
  }

  if (lower === 'almadies' || lower === 'les almadies') {
    return 'aux Almadies';
  }

  if (lower === 'maristes' || lower === 'les maristes') {
    return 'aux Maristes';
  }

  if (lower === 'mermoz') {
    return 'à Mermoz';
  }

  if (lower === 'aibd' || lower === 'aéroport aibd') {
    return "à l'Aéroport AIBD";
  }

  if (lower === 'horsdakar' || lower === 'hors dakar') {
    return 'hors de Dakar';
  }

  return `à ${trimmed}`;
}

  const locationText = formatLocationPreposition(searchFilters.zone);
  const countLabel = loading
    ? 'Recherche des véhicules...'
    : (total ?? vehicles.length) > 0
    ? `${total ?? vehicles.length} véhicule${(total ?? vehicles.length) > 1 ? 's' : ''} disponible${(total ?? vehicles.length) > 1 ? 's' : ''} ${locationText}`
    : `Aucun véhicule disponible ${locationText}`;

  const activeFilterCount = [
    selectedCategory !== 'ALL',
    Boolean(searchFilters.prixMin || searchFilters.prixMax),
    Boolean(searchFilters.carburant),
    Boolean(searchFilters.transmission),
    Boolean(searchFilters.sort && searchFilters.sort !== 'RELEVANCE'),
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* En-Tête Supérieur Style Airbnb */}
      <View style={styles.topFilterSection}>
        <WhereToSearchTrigger
          onPress={() => setSearchModalVisible(true)}
          selectedZone={searchFilters.zone}
          selectedType={searchFilters.type}
          selectedDatesSummary={datesSummaryText}
        />
        <View style={styles.exploreControls}>
          <View style={styles.categoryChipsWrapper}>
            <CategoryChipsBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </View>
          <TouchableOpacity
            style={[styles.refineButton, activeFilterCount > 0 && styles.refineButtonActive]}
            onPress={() => setRefinementModalVisible(true)}
            accessibilityLabel="Ouvrir les filtres et le tri"
          >
            <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#FFFFFF' : '#0F172A'} />
            <Text style={[styles.refineButtonText, activeFilterCount > 0 && styles.refineButtonTextActive]}>Filtres</Text>
            {activeFilterCount > 0 ? <View style={styles.filterCountBadge}><Text style={styles.filterCountText}>{activeFilterCount}</Text></View> : null}
          </TouchableOpacity>
        </View>
        {activeFilterCount > 0 ? (
          <TouchableOpacity onPress={handleResetFilters} style={styles.activeFilterSummary}>
            <Text style={styles.activeFilterSummaryText}>{activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} appliqué{activeFilterCount > 1 ? 's' : ''}</Text>
            <X size={13} color={theme.colors.brand.main} />
            <Text style={styles.clearFiltersText}>Effacer</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Zone de Contenu Principale (Carte Plein Écran en Fond d'Écran) */}
      <View style={styles.fullMapBackground}>
        <ExploreMapViewer
          vehicles={vehicles}
          userLocation={userLocation}
          onVehiclePress={handleVehiclePress}
          onSearchInArea={handleSearchInArea}
          onSelectVehicle={handleMarkerSelectVehicle}
        />
      </View>

      {/* Vrai Bottom Sheet Natif avec Gesture Handler */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={(index) => {
          if (index === 0) setViewMode('MAP');
          else setViewMode('LIST');
        }}
        handleIndicatorStyle={styles.sheetHandleIndicator}
        backgroundStyle={styles.sheetBackground}
      >
        {/* Titre Compteur de Véhicules */}
        <View style={styles.countTitleRow}>
          <Text style={styles.countTitleText}>{countLabel}</Text>
        </View>

        {/* Liste des Véhicules via BottomSheetFlatList */}
        <BottomSheetFlatList
          ref={listRef}
          data={loading && vehicles.length === 0 ? [] : vehicles}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.cardItemWrapper}>
              <AirbnbVehicleCard
                vehicle={item}
                onPress={handleVehiclePress}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorited={favoriteIds.has(item.id)}
              />
            </View>
          )}
          contentContainerStyle={styles.listContentContainer}
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
            loading && vehicles.length === 0 ? (
              <View style={[styles.cardItemWrapper, styles.skeletonPadding]}>
                <FeedSkeleton />
              </View>
            ) : error ? (
              <View style={styles.emptyWrapper}>
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>La recherche n’a pas abouti</Text>
                  <Text style={styles.emptySubtitle}>{error}</Text>
                  <TouchableOpacity style={styles.resetBtn} onPress={refetch} activeOpacity={0.8}>
                    <RotateCcw size={15} color="#FFFFFF" />
                    <Text style={styles.resetBtnText}>Réessayer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyWrapper}>
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <SearchX size={32} color="#64748B" />
                  </View>
                  <Text style={styles.emptyTitle}>Aucun véhicule disponible</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchFilters.zone
                      ? `Aucun véhicule ne correspond à votre recherche ${formatLocationPreposition(searchFilters.zone)}. Assurez-vous que l'option Hors Dakar est activée ou réinitialisez les filtres.`
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
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerWrapper}>
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.colors.brand.main} />
                  <Text style={styles.loadingMoreText}>Chargement des véhicules suivants...</Text>
                </View>
              </View>
            ) : (
              <View style={styles.endOfList}>
                {!loading && vehicles.length > 0 && !hasMore ? <Text style={styles.endOfListText}>Vous avez vu tous les véhicules</Text> : null}
              </View>
            )
          }
        />
      </BottomSheet>

      {/* Bouton Flottant Pilule de Bascule Carte ↔ Liste (Style Airbnb) */}
      <View style={styles.floatingToggleContainer}>
        <TouchableOpacity
          style={styles.floatingToggleBtn}
          onPress={handleToggleViewMode}
          activeOpacity={0.85}
        >
          {viewMode === 'MAP' ? (
            <>
              <List size={16} color="#FFFFFF" />
              <Text style={styles.floatingToggleText}>Voir la Liste</Text>
            </>
          ) : (
            <>
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.floatingToggleText}>Voir la Carte</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modales de Recherche & Filtres */}
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
      <ExploreRefinementModal
        visible={refinementModalVisible}
        filters={searchFilters}
        onClose={() => setRefinementModalVisible(false)}
        onApply={(refinements) => setSearchFilters({ ...searchFilters, ...refinements })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topFilterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
    zIndex: 10,
  },
  categoryChipsWrapper: {
    flex: 1,
    marginHorizontal: -16,
  },
  exploreControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refineButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  refineButtonActive: {
    backgroundColor: theme.primitives.forest[800],
    borderColor: theme.primitives.forest[800],
  },
  refineButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  refineButtonTextActive: {
    color: '#FFFFFF',
  },
  filterCountBadge: {
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  filterCountText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: theme.primitives.forest[800],
  },
  activeFilterSummary: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 5,
    marginLeft: 2,
    marginBottom: 2,
  },
  activeFilterSummaryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  clearFiltersText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: theme.colors.brand.main,
  },
  fullMapBackground: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  sheetHandleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  countTitleRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  countTitleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16.5,
    color: theme.primitives.forest[800],
    textAlign: 'center',
  },
  listContentContainer: {
    backgroundColor: '#FFFFFF',
  },
  cardItemWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  emptyWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    minHeight: 350,
  },
  footerWrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 110,
  },
  skeletonPadding: {
    paddingTop: 16,
    paddingBottom: 60,
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
  endOfList: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: 26,
  },
  endOfListText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#072A20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
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
