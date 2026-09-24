'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { VehicleGallery } from './VehicleGallery';
import { VehicleMainSpecsCard } from './VehicleMainSpecsCard';
import { VehicleOptionsCard } from './VehicleOptionsCard';
import { VehicleEquipmentsGrid } from './VehicleEquipmentsGrid';
import { VehiclePricingTiersCard } from './VehiclePricingTiersCard';
import { VehicleAvailabilityCalendar } from './VehicleAvailabilityCalendar';
import { VehicleOwnerCard } from './VehicleOwnerCard';
import { VehicleConditionsCard } from './VehicleConditionsCard';
import { VehicleBookingSidebar } from './VehicleBookingSidebar';
import { DateSelectionModal } from './DateSelectionModal';
import { VehicleMobileStickyBar } from './VehicleMobileStickyBar';
import { useVehicleDetails } from '../hooks/useVehicleDetails';
import { useUserStore } from '@/src/core/store/useUserStore';
import { useBookingGate } from '@/src/features/reservations/hooks/useBookingGate';
import { ReservationGateModal } from '@/src/features/reservations/components/ReservationGateModal';
import { BookingCheckoutModal } from '@/src/features/reservations/components/checkout/BookingCheckoutModal';
import { getTenantPricePerDay } from '@/lib/utils';

interface TenantVehicleDetailPageProps {
  vehicleId: string;
}

export function TenantVehicleDetailPage({ vehicleId }: TenantVehicleDetailPageProps) {
  const router = useRouter();
  const { vehicle, isLoading, isError } = useVehicleDetails(vehicleId);

  // Authentification et revalidation silencieuse SWR
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const refreshProfileSilently = useUserStore((s) => s.refreshProfileSilently);
  const openGuestModal = useUserStore((s) => s.openGuestModal);

  // Dates sélectionnées pour la réservation
  const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>();
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>();
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [pendingBookingParams, setPendingBookingParams] = useState<{
    startDate?: string;
    endDate?: string;
    horsDakar?: boolean;
    includeDelivery?: boolean;
    totalAmount: number;
    daysCount: number;
  } | null>(null);

  // Revalidation silencieuse en arrière-plan (SWR) au chargement de la page
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfileSilently();
    }
  }, [isAuthenticated, refreshProfileSilently]);

  // S'assurer que le scroll est remis au sommet au chargement et après le reload de la page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && vehicle && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [isLoading, vehicle]);

  // 2ème VERROU : Évaluation instantanée (0ms latence) des verrous de réservation
  const gateEval = useBookingGate(vehicle?.ageMinimum);

  // Titres et informations dynamiques
  const title = vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Chargement du véhicule...';

  // Préparation de la liste des photos réelles
  const photosList: string[] = React.useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
      return vehicle.photos.map((p) => (typeof p === 'string' ? p : p.url));
    }
    if (vehicle.photoUrl) {
      return [vehicle.photoUrl];
    }
    return [];
  }, [vehicle]);

  const handleSelectDates = (start: string, end?: string) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} sur AutoLoc Premium`,
          text: `Découvrez la location de ${title} sur AutoLoc Premium`,
          url: window.location.href,
        });
      } catch (e) {
        // Optionnel: fallback copié dans le presse-papier
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien de l\'annonce copié dans le presse-papier !');
    }
  };

  // Handler du bouton "Réserver" soumis aux 2 verrous
  const handleBookNow = (bookingData: {
    startDate?: string;
    endDate?: string;
    horsDakar?: boolean;
    includeDelivery?: boolean;
    totalAmount: number;
    daysCount: number;
  }) => {
    setPendingBookingParams(bookingData);

    // 1er VERROU : Invité -> Interception immédiate par le Auth Guard (Ouverture Modale Connexion)
    if (!isAuthenticated) {
      openGuestModal(
        'Connectez-vous pour finaliser la réservation de ce véhicule.',
        { action: 'BOOK_VEHICLE', vehicleId: vehicle?.id || vehicleId, payload: bookingData }
      );
      return;
    }

    // 2ème VERROU : Connecté -> Évaluation instantanée des verrous (Profil, Téléphone OTP, KYC Identité, Permis, Âge)
    if (gateEval.canProceed) {
      // Tous les verrous sont levés -> Ouverture directe du tunnel checkout 2 étapes
      setIsCheckoutModalOpen(true);
    } else {
      // Au moins un verrou manque -> Ouverture instantanée de la modale de vérification KYC (ReservationGateModal)
      setIsGateModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-28 sm:pt-32 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Retour au catalogue</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer"
            title="Partager l'annonce"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>

        {/* Skeleton pendant le chargement des données */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="w-full h-80 sm:h-[420px] rounded-3xl bg-slate-200/80" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-10 w-2/3 bg-slate-200/80 rounded-xl" />
                <div className="h-40 bg-slate-200/80 rounded-2xl" />
                <div className="h-40 bg-slate-200/80 rounded-2xl" />
              </div>
              <div className="h-96 bg-slate-200/80 rounded-3xl" />
            </div>
          </div>
        )}

        {/* Message en cas d'erreur de chargement */}
        {isError && !isLoading && (
          <div className="p-8 sm:p-12 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-4 shadow-sm max-w-2xl mx-auto my-12">
            <h3 className="text-xl font-bold font-display">Véhicule non disponible</h3>
            <p className="text-sm text-rose-600">
              Impossible de charger les informations du véhicule #{vehicleId}. Ce véhicule est peut-être indisponible ou a été archivé.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Explorer les autres véhicules disponibles
            </Link>
          </div>
        )}

        {/* Contenu principal si véhicule disponible */}
        {!isLoading && vehicle && (
          <>
            {/* 1. Galerie Photo Haute Définition en premier */}
            <VehicleGallery
              images={photosList}
              title={title}
              vehicleType={vehicle.type}
            />

            {/* 2. Header du véhicule (Titre, Type, Note, Ville, Avis, Locations) placé APRÈS la Galerie */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  {vehicle.type}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {Number(vehicle.note || 4.9).toFixed(1)}
                  <span className="text-slate-400 font-normal">
                    ({vehicle.totalAvis || 12} avis)
                  </span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {vehicle.ville || 'Dakar'}
                </span>
                {vehicle.totalLocations ? (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {vehicle.totalLocations} locations réussies
                    </span>
                  </>
                ) : null}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-fraunces font-normal text-[#041912] tracking-tight">
                {title}{' '}
                <span className="text-slate-400 font-normal text-2xl sm:text-3xl lg:text-4xl">
                  ({vehicle.annee})
                </span>
              </h1>
            </div>

            {/* 3. Layout Master 2 Colonnes (Gauche: Détails / Droite: Widget Réservation) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2 items-start">
              
              {/* Colonne de Gauche (Flux d'informations enrichies) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 2.1 Spécifications Clés */}
                <VehicleMainSpecsCard
                  transmission={vehicle.transmission}
                  carburant={vehicle.carburant}
                  nombrePlaces={vehicle.nombrePlaces}
                  ageMinimum={vehicle.ageMinimum}
                  joursMinimum={vehicle.joursMinimum}
                />

                {/* 2.2 Options Premium (Hors Dakar & Livraison) */}
                <VehicleOptionsCard
                  autoriseHorsDakar={vehicle.autoriseHorsDakar}
                  supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour}
                  proposeLivraisonDakar={vehicle.proposeLivraisonDakar}
                  fraisLivraisonDakar={vehicle.fraisLivraisonDakar}
                  proposeLivraisonAibd={vehicle.proposeLivraisonAibd}
                  fraisLivraisonAibd={vehicle.fraisLivraisonAibd}
                  fraisLivraison={vehicle.fraisLivraison}
                />

                {/* 2.3 Équipements & Confort */}
                <VehicleEquipmentsGrid equipements={vehicle.equipements} />

                {/* 2.4 Tarifs Dégressifs Longue Durée */}
                <VehiclePricingTiersCard
                  tarifsProgressifs={vehicle.tarifsProgressifs}
                  basePrice={vehicle.prixParJour}
                />

                {/* 2.5 Calendrier de Disponibilité en temps réel */}
                <VehicleAvailabilityCalendar
                  vehicleId={vehicle.id}
                  ville={vehicle.ville}
                  startDate={selectedStartDate}
                  endDate={selectedEndDate}
                  onSelectDates={handleSelectDates}
                />

                {/* 2.6 Carte de l'Hôte Partenaire */}
                <VehicleOwnerCard
                  proprietaire={vehicle.proprietaire}
                  onViewProfile={() => {
                    alert('Ouverture du profil de l\'hôte...');
                  }}
                />

                {/* 2.7 Conditions & Garanties de Location */}
                <VehicleConditionsCard
                  assurance={vehicle.assurance}
                  carburantCondition={vehicle.carburantCondition}
                  zoneConduite={vehicle.zoneConduite}
                  reglesSpecifiques={vehicle.reglesSpecifiques}
                />

              </div>

              {/* Colonne de Droite (Widget Sticky de Réservation Desktop) */}
              <div className="lg:col-span-1">
                <VehicleBookingSidebar
                  vehicleId={vehicle.id}
                  baseOwnerPrice={vehicle.prixParJour}
                  autoriseHorsDakar={vehicle.autoriseHorsDakar}
                  supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour}
                  proposeLivraisonDakar={vehicle.proposeLivraisonDakar}
                  fraisLivraisonDakar={vehicle.fraisLivraisonDakar}
                  proposeLivraisonAibd={vehicle.proposeLivraisonAibd}
                  fraisLivraisonAibd={vehicle.fraisLivraisonAibd}
                  fraisLivraison={vehicle.fraisLivraison}
                  tarifsProgressifs={vehicle.tarifsProgressifs}
                  joursMinimum={vehicle.joursMinimum}
                  startDate={selectedStartDate}
                  endDate={selectedEndDate}
                  onSelectDatesClick={() => {
                    setIsDateModalOpen(true);
                    const calEl = document.querySelector('#availability-calendar');
                    if (calEl) {
                      calEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  onBookNow={handleBookNow}
                />
              </div>

            </div>

            {/* Modale de sélection de dates avec dates bloquées */}
            <DateSelectionModal
              isOpen={isDateModalOpen}
              onClose={() => setIsDateModalOpen(false)}
              vehicleId={vehicle.id}
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              onSelectDates={handleSelectDates}
              joursMinimum={vehicle.joursMinimum}
            />

            {/* Barre de réservation fixe sur Mobile (< 1024px) */}
            <VehicleMobileStickyBar
              baseOwnerPrice={vehicle.prixParJour}
              autoriseHorsDakar={vehicle.autoriseHorsDakar}
              supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour}
              fraisLivraison={vehicle.fraisLivraison}
              tarifsProgressifs={vehicle.tarifsProgressifs}
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              onOpenDatesModal={() => setIsDateModalOpen(true)}
              onBookNow={handleBookNow}
            />

            {/* Modale Modulaire de Vérification de Réservation & KYC (Gates) */}
            <ReservationGateModal
              visible={isGateModalOpen}
              vehicleTitle={title}
              vehicleMinimumAge={vehicle.ageMinimum}
              missingSteps={gateEval.missingSteps}
              userAge={gateEval.userAge}
              onClose={() => setIsGateModalOpen(false)}
              onAllCompleted={() => {
                setIsGateModalOpen(false);
                setIsCheckoutModalOpen(true);
              }}
            />

            {/* Modale de Checkout Réservation en 2 Étapes (Utilisateur KYC Conforme) */}
            {vehicle && (
              <BookingCheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                vehicle={{
                  id: vehicle.id,
                  marque: vehicle.marque,
                  modele: vehicle.modele,
                  annee: vehicle.annee,
                  type: vehicle.type,
                  ville: vehicle.ville,
                  photoUrl: vehicle.photoUrl,
                  photos: vehicle.photos,
                  prixParJour: vehicle.prixParJour,
                  tenantPricePerDay: getTenantPricePerDay(vehicle.prixParJour),
                  joursMinimum: vehicle.joursMinimum,
                  proposeLivraisonDakar: vehicle.proposeLivraisonDakar,
                  fraisLivraisonDakar: vehicle.fraisLivraisonDakar,
                  proposeLivraisonAibd: vehicle.proposeLivraisonAibd,
                  fraisLivraisonAibd: vehicle.fraisLivraisonAibd,
                  fraisLivraison: vehicle.fraisLivraison,
                  autoriseHorsDakar: vehicle.autoriseHorsDakar,
                  supplementHorsDakarParJour: vehicle.supplementHorsDakarParJour,
                  transmission: vehicle.transmission,
                  carburant: vehicle.carburant,
                  nombrePlaces: vehicle.nombrePlaces,
                  note: vehicle.note,
                }}
                initialStartDate={pendingBookingParams?.startDate || selectedStartDate}
                initialEndDate={pendingBookingParams?.endDate || selectedEndDate}
                initialHorsDakar={pendingBookingParams?.horsDakar}
                initialIncludeDelivery={pendingBookingParams?.includeDelivery}
                onBookingSuccess={(resId) => {
                  router.push(`/reservations/${resId}`);
                }}
              />
            )}
          </>
        )}

      </div>
    </div>
  );
}

