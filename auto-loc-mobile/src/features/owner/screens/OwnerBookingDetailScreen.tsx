import React, { useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { useOwnerBookingDetail } from '../hooks/useOwnerBookingDetail';

// Composants de sections propriétaires modulaires
import { OwnerBookingHeroSection } from '../components/reservations/OwnerBookingHeroSection';
import { OwnerBookingVehicleCard } from '../components/reservations/OwnerBookingVehicleCard';
import { OwnerTenantContactCard } from '../components/reservations/OwnerTenantContactCard';
import { OwnerBookingFinancialCard } from '../components/reservations/OwnerBookingFinancialCard';
import { OwnerBookingLifecyclePanel } from '../components/reservations/OwnerBookingLifecyclePanel';
import { OwnerBookingStickyAction } from '../components/reservations/OwnerBookingStickyAction';

// Modals propriétaires
import { OwnerConfirmBookingModal } from '../components/reservations/OwnerConfirmBookingModal';
import { OwnerTenantDocsModal } from '../components/reservations/OwnerTenantDocsModal';
import { OwnerCheckinModal } from '../components/reservations/OwnerCheckinModal';
import { OwnerCheckoutModal } from '../components/reservations/OwnerCheckoutModal';
import { OwnerSignalNoShowModal } from '../components/reservations/OwnerSignalNoShowModal';
import { OwnerSignalOverloadModal } from '../components/reservations/OwnerSignalOverloadModal';

// Composants partagés
import { BookingContractCard } from '../../tenant/components/BookingContractCard';
import { BookingEtatLieuxPhotos } from '../../tenant/components/BookingEtatLieuxPhotos';
import { BookingEtatLieuxGalleryModal } from '../../tenant/components/BookingEtatLieuxGalleryModal';
import { BookingTimelineSection } from '../../tenant/components/BookingTimelineSection';
import { TenantBookingDetailSkeleton } from '../../tenant/components/TenantBookingDetailSkeleton';

type Props = { reservationId: string; onBack: () => void };

export const OwnerBookingDetailScreen: React.FC<Props> = ({ reservationId, onBack }) => {
  const {
    booking,
    locataireDocs,
    loading,
    refreshing,
    error,
    submitting,
    refetch,
    confirmBooking,
    checkinOwner,
    checkoutOwner,
    signalNoshow,
    signalOverload,
    openDispute,
    linkPhotoEtat,
  } = useOwnerBookingDetail(reservationId);

  // Modals state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [tenantDocsModalVisible, setTenantDocsModalVisible] = useState(false);
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [noshowModalVisible, setNoshowModalVisible] = useState(false);
  const [overloadModalVisible, setOverloadModalVisible] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);

  const vehiclePhoto = useMemo(() => {
    const first = booking?.vehicule?.photos?.[0];
    if (typeof first === 'string') return first;
    return first?.url || booking?.vehicule?.photoUrl;
  }, [booking]);

  const netOwner = Number(booking?.montantProprietaire ?? 0);
  const totalTenant = Number(booking?.prixTotal ?? 0);
  const commission = Number(booking?.commission ?? 0);
  const balanceToCollect = Number(booking?.montantSoldeCheckin ?? 0);

  if (loading) return <TenantBookingDetailSkeleton onBack={onBack} />;
  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorState}>
          <AlertTriangle size={36} color="#B45309" />
          <Text style={styles.errorTitle}>Réservation introuvable</Text>
          <Text style={styles.bodyText}>{error || 'Impossible d’accéder à ce dossier.'}</Text>
          <TouchableOpacity onPress={refetch} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>Réessayer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>Retour aux réservations</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={theme.colors.brand.main} />}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Retour aux réservations">
            <ArrowLeft size={19} color="#072A20" />
          </TouchableOpacity>
          <Text style={styles.reference}>RÉF. #{booking.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        {/* 1. Hero Section */}
        <OwnerBookingHeroSection
          statut={booking.statut}
          creeLe={booking.creeLe}
          vehicleType={booking.vehicule?.type}
          vehicleVille={booking.vehicule?.ville}
          vehicleMarque={booking.vehicule?.marque}
          vehicleModele={booking.vehicule?.modele}
          dateDebut={booking.dateDebut}
          dateFin={booking.dateFin}
          nbJours={booking.nbJours}
          montantProprietaire={netOwner}
        />

        {/* 2. Vehicle Card */}
        <OwnerBookingVehicleCard
          photoUrl={vehiclePhoto}
          marque={booking.vehicule?.marque}
          modele={booking.vehicule?.modele}
          immatriculation={booking.vehicule?.immatriculation}
          adresseLivraison={booking.adresseLivraison}
          ville={booking.vehicule?.ville}
        />

        {/* 3. Tenant Profile & KYC Inspection Card */}
        <OwnerTenantContactCard
          reservationId={booking.id}
          prenom={booking.locataire?.prenom}
          nom={booking.locataire?.nom}
          telephone={booking.locataire?.telephone}
          kycStatus={locataireDocs?.kycStatus}
          statut={booking.statut}
          dateDebut={booking.dateDebut}
          onInspectDocs={() => setTenantDocsModalVisible(true)}
        />

        {/* 4. Contract Card */}
        <BookingContractCard reservationId={booking.id} statut={booking.statut} />

        {/* 5. Lifecycle Action Panel */}
        <OwnerBookingLifecyclePanel
          statut={booking.statut}
          dateDebut={booking.dateDebut}
          hasOwnerCheckin={Boolean(booking.checkinProprietaireLe)}
          hasTenantCheckin={Boolean(booking.checkinLocataireLe)}
          absenceSignalee={booking.absenceSignalee}
          occupantsSignales={booking.occupantsSignales}
          submitting={submitting}
          onOpenConfirm={() => setConfirmModalVisible(true)}
          onOpenCheckin={() => setCheckinModalVisible(true)}
          onOpenCheckout={() => setCheckoutModalVisible(true)}
          onOpenSignalNoshow={() => setNoshowModalVisible(true)}
          onOpenSignalOverload={() => setOverloadModalVisible(true)}
          onOpenDispute={() =>
            Alert.prompt(
              'Signalement de litige',
              'Décrivez le problème constaté avec le locataire :',
              (text) => {
                if (text && text.trim()) {
                  void openDispute('LITIGE_PROPRIETAIRE', text.trim());
                }
              }
            )
          }
        />

        {/* 6. Financial Breakdown Section */}
        <OwnerBookingFinancialCard
          totalTenant={totalTenant}
          commission={commission}
          balanceToCollect={balanceToCollect}
          netOwner={netOwner}
        />

        {/* 7. State Photos Section */}
        <BookingEtatLieuxPhotos
          photos={booking.photosEtatLieu}
          onPress={() => setGalleryModalVisible(true)}
        />

        {/* 8. Timeline Section */}
        <BookingTimelineSection events={booking.historique || []} />
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <OwnerBookingStickyAction
        statut={booking.statut}
        hasOwnerCheckin={Boolean(booking.checkinProprietaireLe)}
        submitting={submitting}
        onOpenConfirm={() => setConfirmModalVisible(true)}
        onOpenCheckin={() => setCheckinModalVisible(true)}
        onOpenCheckout={() => setCheckoutModalVisible(true)}
      />

      {/* Modals */}
      <OwnerConfirmBookingModal
        visible={confirmModalVisible}
        loading={submitting}
        dateDebut={booking.dateDebut}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={async (heureDebut) => {
          if (await confirmBooking(heureDebut)) setConfirmModalVisible(false);
        }}
      />

      <OwnerTenantDocsModal
        visible={tenantDocsModalVisible}
        docs={locataireDocs}
        onClose={() => setTenantDocsModalVisible(false)}
      />

      <OwnerCheckinModal
        visible={checkinModalVisible}
        loading={submitting}
        reservationId={booking.id}
        modePaiement={booking.modePaiement}
        montantSoldeCheckin={booking.montantSoldeCheckin}
        existingPhotos={booking.photosEtatLieu}
        onClose={() => setCheckinModalVisible(false)}
        onConfirm={async (soldeRecu) => {
          if (await checkinOwner(soldeRecu)) setCheckinModalVisible(false);
        }}
        onLinkPhoto={async (url, publicId, type, categorie) => {
          await linkPhotoEtat(url, publicId, type, categorie);
        }}
      />

      <OwnerCheckoutModal
        visible={checkoutModalVisible}
        loading={submitting}
        reservationId={booking.id}
        existingPhotos={booking.photosEtatLieu}
        onClose={() => setCheckoutModalVisible(false)}
        onConfirm={async () => {
          if (await checkoutOwner()) setCheckoutModalVisible(false);
        }}
        onLinkPhoto={async (url, publicId, type, categorie) => {
          await linkPhotoEtat(url, publicId, type, categorie);
        }}
      />

      <OwnerSignalNoShowModal
        visible={noshowModalVisible}
        loading={submitting}
        onClose={() => setNoshowModalVisible(false)}
        onConfirm={async (comment) => {
          if (await signalNoshow(comment)) setNoshowModalVisible(false);
        }}
      />

      <OwnerSignalOverloadModal
        visible={overloadModalVisible}
        loading={submitting}
        maxPlaces={booking.vehicule?.nombrePlaces || 5}
        onClose={() => setOverloadModalVisible(false)}
        onConfirm={async (num, comment) => {
          if (await signalOverload(num, comment)) setOverloadModalVisible(false);
        }}
      />

      <BookingEtatLieuxGalleryModal
        visible={galleryModalVisible}
        photos={booking.photosEtatLieu || []}
        onClose={() => setGalleryModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reference: { fontFamily: theme.typography.fontFamily.mono, fontSize: 11, color: '#475569', fontWeight: '700' },
  bodyText: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 19 },
  errorState: { flex: 1, padding: 28, justifyContent: 'center', alignItems: 'center', gap: 14 },
  errorTitle: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 20 },
  primaryAction: { minHeight: 46, borderRadius: 23, backgroundColor: theme.colors.brand.main, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  primaryActionText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 13 },
  backText: { color: theme.colors.brand.main, fontFamily: theme.typography.fontFamily.bold, fontSize: 13 },
});
