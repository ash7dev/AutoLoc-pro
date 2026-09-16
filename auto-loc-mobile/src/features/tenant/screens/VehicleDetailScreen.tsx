import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VehicleDetailHeader } from '../components/VehicleDetailHeader';
import { VehicleImageGallery } from '../components/VehicleImageGallery';
import { VehicleMainInfoCard } from '../components/VehicleMainInfoCard';
import { VehicleOwnerCard } from '../components/VehicleOwnerCard';
import { VehicleSpecsCard } from '../components/VehicleSpecsCard';
import { VehicleEquipmentsGrid } from '../components/VehicleEquipmentsGrid';
import { VehiclePricingTierCard } from '../components/VehiclePricingTierCard';
import { VehicleRentalConditionsCard } from '../components/VehicleRentalConditionsCard';
import { VehicleAvailabilityCalendarCard } from '../components/VehicleAvailabilityCalendarCard';
import { VehicleStickyBookingBar } from '../components/VehicleStickyBookingBar';
import { VehicleDetailSkeleton } from '../components/VehicleDetailSkeleton';
import { ReservationGateModal } from '../components/gates/ReservationGateModal';
import { BookingCheckoutModal } from '../components/checkout/BookingCheckoutModal';
import { VehicleFeedItem } from '../types';
import { useVehicleDetail } from '../hooks/useVehicleDetail';
import { useAppStore } from '../../../core/store/useAppStore';
import { useBookingGate } from '../hooks/useBookingGate';
import { getTenantPricePerDay } from '../../../core/utils/currency';

interface VehicleDetailScreenProps {
  vehicleId?: string;
  vehicle?: VehicleFeedItem;
  onBack: () => void;
}

export const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({
  vehicleId,
  vehicle: initialVehicle,
  onBack,
}) => {
  const targetId = vehicleId || initialVehicle?.id || '';
  const { data: detail, loading } = useVehicleDetail(targetId);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);
  const refreshProfileSilently = useAppStore((state) => state.refreshProfileSilently);

  const [isFavorited, setIsFavorited] = useState(false);
  const [gateModalVisible, setGateModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  // Revalidation silencieuse en arrière-plan (SWR) au chargement de l'écran
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfileSilently();
    }
  }, [isAuthenticated, refreshProfileSilently]);

  // Évaluation instantanée (0ms latence) des verrous de réservation
  const gateEval = useBookingGate(detail?.ageMinimum);

  // Affichage du Skeleton ultra-fluide pendant le chargement des données réelles de l'API
  if (loading || !detail) {
    return <VehicleDetailSkeleton />;
  }

  // Données combinées avec fallback initial
  const marque = detail?.marque || initialVehicle?.marque || 'Véhicule';
  const modele = detail?.modele || initialVehicle?.modele || '';
  const title = `${marque} ${modele}`.trim();
  const annee = detail?.annee || initialVehicle?.annee;
  const ville = detail?.ville || initialVehicle?.ville || 'Dakar';
  const typeStr = detail?.type || initialVehicle?.type || 'STANDARD';
  const basePrice = Number(detail?.prixParJour || initialVehicle?.prixParJour || 30000);

  // Prix Locataire calculé avec commission AutoLoc dégressive (17.5% à 10%)
  const tenantPricePerDay = getTenantPricePerDay(basePrice);

  // Galerie photo
  const photosList = detail?.photos && detail.photos.length > 0
    ? detail.photos
    : initialVehicle?.photoUrl
    ? [{ id: '1', url: initialVehicle.photoUrl, estPrincipale: true, position: 0, vehiculeId: targetId, creeLe: '' }]
    : [];

  const photoPrincipalUrl = photosList[0]?.url || initialVehicle?.photoUrl;

  const handleFavoriteToggle = (id: string) => {
    const allowed = triggerGuestAuthGuard(
      'Ajoutez ce véhicule à vos favoris pour le retrouver facilement plus tard.',
      { action: 'ADD_FAVORITE', vehicleId: id }
    );
    if (allowed) {
      setIsFavorited((prev) => !prev);
    }
  };

  const handleBookPress = () => {
    // 1. Invité -> Interception immédiate par le AuthGuard
    const allowed = triggerGuestAuthGuard(
      'Connectez-vous pour finaliser la réservation de ce véhicule.',
      { action: 'BOOK_VEHICLE', vehicleId: targetId }
    );
    if (!allowed) return;

    // 2. Connecté -> Évaluation instantanée (0ms) en mémoire vive
    if (gateEval.canProceed) {
      // Tous les verrous sont levés -> Ouverture directe du modal de checkout en 2 étapes
      setCheckoutModalVisible(true);
    } else {
      // Au moins un verrou manque -> Ouverture instantanée du modal de vérification KYC
      setGateModalVisible(true);
    }
  };

  const handleViewProfile = () => {
    triggerGuestAuthGuard(
      'Connectez-vous pour consulter le profil complet de cet hôte.',
      { action: 'VIEW_PROFILE', vehicleId: targetId }
    );
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* 1. Header Flottant (Retour, Partage Natif, Favoris) */}
      <VehicleDetailHeader
        vehicleId={targetId}
        vehicleTitle={title}
        onBack={onBack}
        onFavoriteToggle={handleFavoriteToggle}
        isFavorited={isFavorited}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Galerie Carrousel Auto-Play & Lightbox Plein Écran */}
        <VehicleImageGallery
          photos={photosList}
          vehicleTitle={title}
          autoPlayEnabled={true}
        />

        {/* 3. Carte Titre & Localisation avec effet Drap superposé (Sheet Overlay) */}
        <VehicleMainInfoCard
          marque={marque}
          modele={modele}
          annee={annee}
          ville={ville}
          adresse={detail?.adresse}
          typeStr={typeStr}
          note={detail?.note ? Number(detail.note) : 5.0}
          totalAvis={detail?.totalAvis || 0}
          totalLocations={detail?.totalLocations || detail?._count?.reservations || 0}
          transmission={detail?.transmission}
          carburant={detail?.carburant}
          nombrePlaces={detail?.nombrePlaces}
          joursMinimum={detail?.joursMinimum}
          autoriseHorsDakar={detail?.autoriseHorsDakar}
        />

        {/* 4. Spécifications techniques (5 indicateurs clés unifiés) */}
        <VehicleSpecsCard
          transmission={detail?.transmission}
          carburant={detail?.carburant}
          nombrePlaces={detail?.nombrePlaces}
          ageMinimum={detail?.ageMinimum}
          joursMinimum={detail?.joursMinimum}
        />

        {/* 5. Équipements & Options de confort */}
        <VehicleEquipmentsGrid equipements={detail?.equipements} />

        {/* 6. Tarifs Dégressifs Longue Durée (Données API & Multi-devises) */}
        <VehiclePricingTierCard
          tarifsProgressifs={detail?.tarifsProgressifs}
          baseOwnerPrice={basePrice}
          selectedCurrency={selectedCurrency}
        />

        {/* 6.1. Disponibilité en temps réel & Calendrier */}
        <VehicleAvailabilityCalendarCard
          vehicleId={targetId}
          ville={ville}
        />

        {/* 7. Carte Propriétaire / Hôte Partenaire Vérifié */}
        <View style={styles.sectionPadding}>
          <VehicleOwnerCard
            proprietaire={detail?.proprietaire}
            onViewProfile={handleViewProfile}
          />
        </View>

        {/* 8. Conditions & Garanties de location */}
        <VehicleRentalConditionsCard
          assurance={detail?.assurance}
          carburantCondition={detail?.carburantCondition}
          autoriseHorsDakar={detail?.autoriseHorsDakar}
          supplementHorsDakarParJour={detail?.supplementHorsDakarParJour}
          fraisLivraison={detail?.fraisLivraison}
          zoneConduite={detail?.zoneConduite}
          reglesSpecifiques={detail?.reglesSpecifiques}
          selectedCurrency={selectedCurrency}
        />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 9. Barre de Réservation Fixe Inférieure (Réactive Multi-devises) */}
      <VehicleStickyBookingBar
        tenantPricePerDay={tenantPricePerDay}
        selectedCurrency={selectedCurrency}
        onBookPress={handleBookPress}
      />

      {/* 10. Modal Modulaire de Vérification de Réservation & KYC (Fond Blanc) */}
      <ReservationGateModal
        visible={gateModalVisible}
        vehicleTitle={title}
        vehicleMinimumAge={detail?.ageMinimum}
        missingSteps={gateEval.missingSteps}
        userAge={gateEval.userAge}
        onClose={() => setGateModalVisible(false)}
        onAllCompleted={() => {
          setGateModalVisible(false);
          setCheckoutModalVisible(true);
        }}
      />

      {/* 11. Modal de Checkout de Réservation en 2 Étapes */}
      <BookingCheckoutModal
        visible={checkoutModalVisible}
        onClose={() => setCheckoutModalVisible(false)}
        vehicle={{
          id: targetId,
          marque,
          modele,
          annee,
          typeStr,
          ville,
          photoUrl: photoPrincipalUrl || undefined,
          tenantPricePerDay,
          joursMinimum: detail?.joursMinimum || 1,
          hasDelivery: (detail?.fraisLivraison ?? 0) >= 0,
          fraisLivraison: detail?.fraisLivraison || 0,
          autoriseHorsDakar: detail?.autoriseHorsDakar || false,
          supplementHorsDakarParJour: detail?.supplementHorsDakarParJour || 0,
          transmission: detail?.transmission || undefined,
          carburant: detail?.carburant || undefined,
          nombrePlaces: detail?.nombrePlaces || undefined,
          note: detail?.note ? Number(detail.note) : 5.0,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionPadding: {
    paddingHorizontal: 20,
  },
});

