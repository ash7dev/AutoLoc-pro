import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Zap,
  Sparkles,
  Star,
  Tag,
  MapPin,
  Compass,
  Car,
  Heart,
  X,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { useNavigation } from '../../../core/navigation/RootNavigator';
import { TenantHeader } from '../../../shared/components';
import { WhereToSearchTrigger } from '../components/WhereToSearchTrigger';
import { AirbnbSearchModal } from '../components/AirbnbSearchModal';
import { useMobileFeed } from '../hooks/useMobileFeed';
import { FeedSection } from '../components/FeedSection';
import { FeedSkeleton } from '../components/FeedSkeleton';
import { CategoryChipsBar, CategoryFilterKey } from '../components/CategoryChipsBar';
import { VehicleFeedItem } from '../types';

export const TenantHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);
  const searchFilters = useAppStore((state) => state.searchFilters);
  const setSearchFilters = useAppStore((state) => state.setSearchFilters);

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('ALL');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const { data: feedData, loading, refreshing, refetch } = useMobileFeed();

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

  const datesSummaryText = searchFilters.dateDebut
    ? searchFilters.dateFin
      ? `${searchFilters.dateDebut.split('-').slice(1).join('/')} - ${searchFilters.dateFin.split('-').slice(1).join('/')}`
      : `À partir du ${searchFilters.dateDebut.split('-').slice(1).join('/')}`
    : undefined;

  const showAll = selectedCategory === 'ALL';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header Principal Tenant */}
      <TenantHeader variant="DISCOVERY" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            tintColor="#059669"
            colors={['#059669']}
          />
        }
      >
        {/* 1. Widget Déclencheur "Où & quand louer ?" */}
        <View style={styles.triggerWrapper}>
          <WhereToSearchTrigger
            onPress={() => setSearchModalVisible(true)}
            selectedZone={searchFilters.zone}
            selectedType={searchFilters.type}
            selectedDatesSummary={datesSummaryText}
          />
        </View>

        {/* 2. Barre de Filtres Rapides par Catégorie */}
        <CategoryChipsBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Badge Filtre Actif avec bouton de réinitialisation */}
        {!showAll && (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterText}>
              Filtre actif : <Text style={styles.activeFilterVal}>{selectedCategory}</Text>
            </Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => setSelectedCategory('ALL')}
            >
              <X size={12} color="#059669" />
              <Text style={styles.resetFilterText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Banner Promotionnel / Mobile Money */}
        <View style={styles.bannerBox}>
          <View style={styles.bannerHeader}>
            <Zap size={18} color={theme.primitives.emerald[300]} />
            <Text style={styles.bannerTag}>PAIEMENT SÉCURISÉ MOBILE MONEY</Text>
          </View>
          <Text style={styles.bannerTitle}>Acompte garanti de 30% à la réservation</Text>
          <Text style={styles.bannerSubtitle}>
            Payer instantanément par Orange Money ou Wave. Solde réglé lors de la remise des clés.
          </Text>
        </View>

        {/* 4. Zone des Sections */}
        {loading && !feedData ? (
          <FeedSkeleton />
        ) : (
          <>
            {/* Section 1: Sélection Premium */}
            {(showAll || selectedCategory === 'PREMIUM') &&
              feedData?.premium &&
              feedData.premium.length > 0 && (
                <FeedSection
                  title="Sélection Premium"
                  subtitle="Véhicules d'exception vérifiés par nos experts"
                  icon={<Sparkles size={18} color="#059669" />}
                  vehicles={feedData.premium}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              )}

            {/* Section 2: Populaires à Dakar */}
            {(showAll || selectedCategory === 'DAKAR') &&
              feedData?.dakar &&
              feedData.dakar.length > 0 && (
                <FeedSection
                  title="Populaires à Dakar"
                  subtitle="Disponibles immédiatement dans la capitale"
                  icon={<MapPin size={18} color="#059669" />}
                  vehicles={feedData.dakar}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              )}

            {/* Section 3: Les mieux notés */}
            {(showAll || selectedCategory === 'TOP_RATED') &&
              feedData?.topNotes &&
              feedData.topNotes.length > 0 && (
                <FeedSection
                  title="Les mieux notés"
                  subtitle="Recommandés par la communauté des locataires"
                  icon={<Star size={18} color="#059669" />}
                  vehicles={feedData.topNotes}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              )}

            {/* Section 4: Bons plans & Économiques */}
            {(showAll || selectedCategory === 'ECONOMIC') &&
              feedData?.economiques &&
              feedData.economiques.length > 0 && (
                <FeedSection
                  title="Bons plans & Économiques"
                  subtitle="Tarifs dégressifs les plus avantageux"
                  icon={<Tag size={18} color="#059669" />}
                  vehicles={feedData.economiques}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              )}

            {/* Section 5: Vient d'arriver */}
            {showAll && feedData?.nouveautes && feedData.nouveautes.length > 0 && (
              <FeedSection
                title="Vient d'arriver"
                subtitle="Dernières annonces fraîchement publiées"
                icon={<Zap size={18} color="#059669" />}
                vehicles={feedData.nouveautes}
                onVehiclePress={handleVehiclePress}
                onFavoriteToggle={handleFavoriteToggle}
                favoritesMap={favorites}
              />
            )}

            {/* Section 6: 4×4 & Tout-Terrain */}
            {(showAll || selectedCategory === 'FOUR_X_FOUR') &&
              feedData?.luxe &&
              feedData.luxe.length > 0 && (
                <FeedSection
                  title="4×4 & Tout-Terrain"
                  subtitle="Prêts pour vos pistes & aventures régionales"
                  icon={<Compass size={18} color="#059669" />}
                  vehicles={feedData.luxe}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              )}

            {/* Section 7: SUV du moment */}
            {(showAll || selectedCategory === 'SUV') &&
              feedData?.suvMoment &&
              feedData.suvMoment.length > 0 && (
                <FeedSection
                  title="SUV du moment"
                  subtitle="Confort familial & espace garanti"
                  icon={<Car size={18} color="#059669" />}
                  vehicles={feedData.suvMoment}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              )}

            {/* Section 8: Berlines populaires */}
            {(showAll || selectedCategory === 'BERLINE') &&
              feedData?.berlinesPopulaires &&
              feedData.berlinesPopulaires.length > 0 && (
                <FeedSection
                  title="Berlines populaires"
                  subtitle="Élégance et sobriété pour la ville"
                  icon={<Car size={18} color="#059669" />}
                  vehicles={feedData.berlinesPopulaires}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              )}

            {/* Section 9: Recommandés pour vous */}
            {showAll && feedData?.recommended?.items && feedData.recommended.items.length > 0 && (
              <FeedSection
                title="Recommandés pour vous"
                subtitle="Sélection sur mesure AutoLoc"
                icon={<Heart size={18} color="#059669" />}
                vehicles={feedData.recommended.items}
                onVehiclePress={handleVehiclePress}
                onFavoriteToggle={handleFavoriteToggle}
                favoritesMap={favorites}
              />
            )}
          </>
        )}
      </ScrollView>

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
  container: {
    paddingVertical: 10,
    paddingBottom: 110,
  },
  triggerWrapper: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  activeFilterVal: {
    color: '#0F172A',
    fontWeight: '700',
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  resetFilterText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  bannerBox: {
    backgroundColor: '#072A20',
    borderRadius: theme.radius.card,
    padding: theme.spacing[4],
    marginHorizontal: 16,
    marginVertical: 10,
    ...theme.elevation.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    marginBottom: theme.spacing[2],
  },
  bannerTag: {
    ...theme.typography.textStyles.overline,
    fontSize: 10,
    color: theme.primitives.emerald[300],
  },
  bannerTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: theme.typography.fontSize.lg,
    color: '#F8FBF4',
    marginBottom: theme.spacing[1],
  },
  bannerSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: '#A8D5C1',
    lineHeight: 18,
  },
});
