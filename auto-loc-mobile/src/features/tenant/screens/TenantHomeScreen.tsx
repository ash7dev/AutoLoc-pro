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
import { TenantHeroHeaderSection } from '../components/TenantHeroHeaderSection';
import { HostMonetizeBannerCard } from '../components/HostMonetizeBannerCard';
import { ReservationGateModal } from '../components/gates/ReservationGateModal';
import { useHostGate } from '../../owner/hooks/useHostGate';
import { becomeAutoLocHost } from '../api/tenantProfileApi';
import { AddVehicleWizardScreen } from '../../owner/screens/AddVehicleWizardScreen';
import { secureStorage } from '../../../core/storage/secureStore';
import { VehicleFeedItem } from '../types';

export const TenantHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);
  const searchFilters = useAppStore((state) => state.searchFilters);
  const setSearchFilters = useAppStore((state) => state.setSearchFilters);
  const user = useAppStore((state) => state.user);
  const setAuth = useAppStore((state) => state.setAuth);

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('ALL');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Tunnel Hôte & KYC Modal States
  const [hostGateModalVisible, setHostGateModalVisible] = useState(false);
  const [addVehicleWizardVisible, setAddVehicleWizardVisible] = useState(false);

  const hostGate = useHostGate();
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

  // Handler du tunnel au clic sur le CTA "Votre voiture dort ? Faites-la bosser !"
  const handleHostMonetizePress = async () => {
    // 1. Gardien Authentification Invité
    const allowed = triggerGuestAuthGuard(
      'Connectez-vous pour publier votre véhicule et commencer à générer des revenus sur AutoLoc.',
      { action: 'ADD_VEHICLE' }
    );
    if (!allowed) return;

    // 2. Vérification KYC & Profil Hôte
    if (!hostGate.canProceed) {
      setHostGateModalVisible(true);
      return;
    }

    // 3. Passage à la création de véhicule
    await openVehicleCreationFlow();
  };

  const openVehicleCreationFlow = async () => {
    if (user && user.role !== 'PROPRIETAIRE') {
      try {
        const result = await becomeAutoLocHost();
        await secureStorage.setRefreshToken(result.refreshToken);
        await setAuth(result.accessToken, { ...user, role: result.role });
      } catch {
        // Fallback si problème réseau token
      }
    }
    setAddVehicleWizardVisible(true);
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
        {/* 1. Masterpiece Hero Header Section (Recherche + Garantie Acompte 30% Unifiés) */}
        <TenantHeroHeaderSection
          onSearchPress={() => setSearchModalVisible(true)}
          selectedZone={searchFilters.zone}
          selectedType={searchFilters.type}
          selectedDatesSummary={datesSummaryText}
        />

        {/* 2. Barre de Filtres Rapides par Catégorie */}
        <CategoryChipsBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Badge Filtre Actif avec bouton de réinitialisation */}
        {!showAll ? (
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
        ) : null}

        {/* 4. Zone des Sections du Feed */}
        {loading && !feedData ? (
          <FeedSkeleton />
        ) : (
          <>
            {/* Section 1: Sélection Premium */}
            {(showAll || selectedCategory === 'PREMIUM') &&
              feedData?.premium &&
              feedData.premium.length > 0 ? (
                <FeedSection
                  title="Sélection Premium"
                  subtitle="Véhicules d'exception vérifiés par nos experts"
                  icon={<Sparkles size={18} color="#059669" />}
                  vehicles={feedData.premium}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              ) : null}

            {/* Section 2: Populaires à Dakar */}
            {(showAll || selectedCategory === 'DAKAR') &&
              feedData?.dakar &&
              feedData.dakar.length > 0 ? (
                <FeedSection
                  title="Populaires à Dakar"
                  subtitle="Disponibles immédiatement dans la capitale"
                  icon={<MapPin size={18} color="#059669" />}
                  vehicles={feedData.dakar}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              ) : null}

            {/* Section 3: Les mieux notés */}
            {(showAll || selectedCategory === 'TOP_RATED') &&
              feedData?.topNotes &&
              feedData.topNotes.length > 0 ? (
                <FeedSection
                  title="Les mieux notés"
                  subtitle="Recommandés par la communauté des locataires"
                  icon={<Star size={18} color="#059669" />}
                  vehicles={feedData.topNotes}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              ) : null}

            {/* Section 4: Bons plans & Économiques */}
            {(showAll || selectedCategory === 'ECONOMIC') &&
              feedData?.economiques &&
              feedData.economiques.length > 0 ? (
                <FeedSection
                  title="Bons plans & Économiques"
                  subtitle="Tarifs dégressifs les plus avantageux"
                  icon={<Tag size={18} color="#059669" />}
                  vehicles={feedData.economiques}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              ) : null}

            {/* Section 5: Vient d'arriver */}
            {showAll && feedData?.nouveautes && feedData.nouveautes.length > 0 ? (
              <FeedSection
                title="Vient d'arriver"
                subtitle="Dernières annonces fraîchement publiées"
                icon={<Zap size={18} color="#059669" />}
                vehicles={feedData.nouveautes}
                onVehiclePress={handleVehiclePress}
                onFavoriteToggle={handleFavoriteToggle}
                favoritesMap={favorites}
              />
            ) : null}

            {/* Section 6: 4×4 & Tout-Terrain */}
            {(showAll || selectedCategory === 'FOUR_X_FOUR') &&
              feedData?.luxe &&
              feedData.luxe.length > 0 ? (
                <FeedSection
                  title="4×4 & Tout-Terrain"
                  subtitle="Prêts pour vos pistes & aventures régionales"
                  icon={<Compass size={18} color="#059669" />}
                  vehicles={feedData.luxe}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              ) : null}

            {/* Section 7: SUV du moment */}
            {(showAll || selectedCategory === 'SUV') &&
              feedData?.suvMoment &&
              feedData.suvMoment.length > 0 ? (
                <FeedSection
                  title="SUV du moment"
                  subtitle="Confort familial & espace garanti"
                  icon={<Car size={18} color="#059669" />}
                  vehicles={feedData.suvMoment}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              ) : null}

            {/* Section 8: Berlines populaires */}
            {(showAll || selectedCategory === 'BERLINE') &&
              feedData?.berlinesPopulaires &&
              feedData.berlinesPopulaires.length > 0 ? (
                <FeedSection
                  title="Berlines populaires"
                  subtitle="Élégance et sobriété pour la ville"
                  icon={<Car size={18} color="#059669" />}
                  vehicles={feedData.berlinesPopulaires}
                  onVehiclePress={handleVehiclePress}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoritesMap={favorites}
                />
              ) : null}

            {/* Section 9: Recommandés pour vous */}
            {showAll && feedData?.recommended?.items && feedData.recommended.items.length > 0 ? (
              <FeedSection
                title="Recommandés pour vous"
                subtitle="Sélection sur mesure AutoLoc"
                icon={<Heart size={18} color="#059669" />}
                vehicles={feedData.recommended.items}
                onVehiclePress={handleVehiclePress}
                onFavoriteToggle={handleFavoriteToggle}
                favoritesMap={favorites}
              />
            ) : null}

            {/* Banner Card Premium : Votre voiture dort ? Faites-la bosser ! */}
            <HostMonetizeBannerCard onPressStart={handleHostMonetizePress} />
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
          navigation.navigateToTab('EXPLORER');
        }}
      />

      {/* Modal Gate Hôte / Vérification KYC */}
      <ReservationGateModal
        visible={hostGateModalVisible}
        vehicleTitle="Votre profil Hôte"
        missingSteps={hostGate.missingSteps}
        userAge={hostGate.userAge}
        customTitle="Vérification requise pour publier un véhicule"
        customSubtitle="Pour la sécurité des locataires et la couverture assurance AutoLoc, complétez votre profil hôte avant de publier votre annonce."
        onClose={() => setHostGateModalVisible(false)}
        onAllCompleted={() => {
          setHostGateModalVisible(false);
          openVehicleCreationFlow();
        }}
      />

      {/* Wizard de Création de Véhicule */}
      <AddVehicleWizardScreen
        visible={addVehicleWizardVisible}
        mode="CREATE"
        onClose={() => setAddVehicleWizardVisible(false)}
        onVehicleCreated={() => {
          setAddVehicleWizardVisible(false);
          navigation.navigateToOwnerTab('VEHICULES');
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
});
