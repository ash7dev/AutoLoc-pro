'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Calendar,
  DollarSign,
  Edit,
  Archive,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Fuel,
  Settings,
  Users,
  Layers,
  AlertTriangle,
  MapPin,
  Plane,
  Home,
} from 'lucide-react';
import { useCacheInvalidator } from '@/src/core/hooks/useCacheInvalidator';
import { useVehicleDetails } from '../../hooks/useVehicleDetails';
import { VehicleMobileHeader } from '../mobile/VehicleMobileHeader';
import { OwnerVehicleHeroGallery } from './OwnerVehicleHeroGallery';
import { OwnerVehicleAvailabilityManager } from './OwnerVehicleAvailabilityManager';
import { OwnerVehicleDocumentsCard } from './OwnerVehicleDocumentsCard';
import { OwnerReservationCard } from '../../../reservations/components/OwnerReservationCard';
import { vehicleService } from '../../services/vehicleService';
import { formatCurrency } from '@/lib/utils';

export interface OwnerVehicleDetailViewProps {
  vehicleId: string;
}

const TABS = [
  { key: 'overview', label: "Vue d'ensemble" },
  { key: 'availability', label: 'Disponibilité' },
  { key: 'pricing', label: 'Tarification' },
  { key: 'reservations', label: 'Réservations' },
] as const;

export const OwnerVehicleDetailView: React.FC<OwnerVehicleDetailViewProps> = ({ vehicleId }) => {
  const router = useRouter();
  const { invalidateVehicles } = useCacheInvalidator();
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'pricing' | 'reservations'>('overview');
  const [isArchiving, setIsArchiving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    vehicle,
    indisponibilites,
    vehicleReservations,
    isLoading,
    isError,
    mutate,
    mutateIndispos,
  } = useVehicleDetails(vehicleId);

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      await vehicleService.archiveVehicle(vehicleId);
      await invalidateVehicles();
      setShowArchiveConfirm(false);
      router.push('/dashboard/vehicles');
    } catch (err) {
      console.error('Erreur archivage véhicule:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      try {
        await vehicleService.purgeVehicle(vehicleId);
      } catch {
        // Fallback archive si la purge stricte (e.g. réservations en cours) échoue
        await vehicleService.archiveVehicle(vehicleId);
      }
      await invalidateVehicles();
      setShowDeleteConfirm(false);
      router.push('/dashboard/vehicles');
    } catch (err) {
      console.error('Erreur suppression véhicule:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-0">
        <div className="h-12 w-48 rounded-2xl bg-slate-200" />
        <div className="h-72 w-full rounded-3xl bg-slate-200" />
        <div className="h-24 w-full rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="font-fraunces text-xl font-normal text-[#041912]">Véhicule introuvable</h3>
        <p className="text-xs text-slate-500 sm:text-sm">
          Ce véhicule n'existe pas ou vous n'avez pas les autorisations requises pour y accéder.
        </p>
        <Link
          href="/dashboard/vehicles"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#041912] px-5 py-2.5 text-xs font-bold text-[#4ADE80]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Retour à la flotte</span>
        </Link>
      </div>
    );
  }

  const isVerifie = vehicle.statut === 'VERIFIE' || vehicle.statut === 'DISPONIBLE';
  const nbReservations = (vehicle as any)._count?.reservations || vehicleReservations.length || 0;

  return (
    <div className="pt-16 sm:pt-0 space-y-6 sm:space-y-8 pb-16">
      {/* Header Mobile Dédié */}
      <VehicleMobileHeader
        vehicleId={vehicleId}
        marque={vehicle.marque}
        modele={vehicle.modele}
        immatriculation={vehicle.immatriculation}
        statut={vehicle.statut}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      {/* Fil d'ariane Desktop */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <Link href="/dashboard/vehicles" className="hover:text-[#041912] transition-colors">
            Flotte
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-[#041912]">
            {vehicle.marque} {vehicle.modele}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/vehicles/${vehicleId}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Edit className="h-3.5 w-3.5 text-[#059669]" />
            Modifier l'annonce
          </Link>

          <button
            type="button"
            onClick={() => setShowArchiveConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-2 text-[13px] font-semibold text-amber-800 transition-colors hover:bg-amber-100/80 cursor-pointer"
          >
            <Archive className="h-3.5 w-3.5" />
            Archiver
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-[13px] font-semibold text-rose-600 transition-colors hover:bg-rose-100 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Hero Galerie */}
      <OwnerVehicleHeroGallery vehicle={vehicle} />

      {/* Bandeau de métriques clés — une seule bande, pas 4 cartes dupliquées */}
      <div className="grid grid-cols-2 divide-y divide-slate-100 rounded-2xl border border-[#041912]/8 bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="flex flex-col gap-1 p-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <DollarSign className="h-3.5 w-3.5" />
            Tarif journalier
          </span>
          <p className="font-fraunces text-xl text-[#041912] sm:text-2xl">
            {formatCurrency(vehicle.prixParJour || 0)}
          </p>
        </div>

        <div className="flex flex-col gap-1 p-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            Réservations
          </span>
          <p className="font-fraunces text-xl text-[#041912] sm:text-2xl">{nbReservations}</p>
        </div>

        <div className="flex flex-col gap-1 p-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Dates bloquées
          </span>
          <p className="font-fraunces text-xl text-[#041912] sm:text-2xl">{indisponibilites.length}</p>
        </div>

        <div className="flex flex-col gap-1 p-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            {isVerifie ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0A3D2E]" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-amber-600" />
            )}
            Statut
          </span>
          <p className="truncate text-[15px] font-semibold text-[#041912] sm:text-base">
            {isVerifie ? 'Actif & disponible' : vehicle.statut || 'En révision'}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors ${activeTab === tab.key
                ? 'bg-[#041912] text-[#F1DFB6] shadow-sm'
                : 'text-slate-500 hover:text-[#041912]'
              }`}
          >
            {tab.label}
            {tab.key === 'availability' && indisponibilites.length > 0 && ` (${indisponibilites.length})`}
            {tab.key === 'reservations' && vehicleReservations.length > 0 && ` (${vehicleReservations.length})`}
          </button>
        ))}
      </div>

      {/* Onglet 1 : Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8">
            <h3 className="font-fraunces text-xl leading-tight text-[#041912]">Caractéristiques</h3>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-100 py-4 sm:grid-cols-4">
              <div className="flex items-center gap-2.5">
                <Fuel className="h-4 w-4 shrink-0 text-[#059669]" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">Carburant</p>
                  <p className="truncate text-[13px] font-semibold capitalize text-[#041912]">
                    {vehicle.carburant || 'Essence'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 shrink-0 text-[#059669]" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">Transmission</p>
                  <p className="truncate text-[13px] font-semibold capitalize text-[#041912]">
                    {vehicle.transmission || 'AUTOMATIQUE'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0 text-[#059669]" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">Places</p>
                  <p className="truncate text-[13px] font-semibold text-[#041912]">
                    {vehicle.nombrePlaces || 5} places
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 shrink-0 text-[#059669]" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">Catégorie</p>
                  <p className="truncate text-[13px] font-semibold capitalize text-[#041912]">
                    {vehicle.type || 'SUV'}
                  </p>
                </div>
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-4">
                <h4 className="text-[13px] font-semibold text-[#041912]">Description de l'annonce</h4>
                <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-slate-600">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>

          <OwnerVehicleDocumentsCard
            carteGriseUrl={(vehicle as any).carteGriseUrl}
            assuranceDocUrl={(vehicle as any).assuranceDocUrl}
            hasCarteGrise={(vehicle as any).hasCarteGrise}
            hasAssuranceDoc={(vehicle as any).hasAssuranceDoc}
            statut={vehicle.statut}
          />
        </div>
      )}

      {/* Onglet 2 : Disponibilité */}
      {activeTab === 'availability' && (
        <OwnerVehicleAvailabilityManager
          vehicleId={vehicleId}
          indisponibilites={indisponibilites}
          onRefresh={mutateIndispos}
        />
      )}

      {/* Onglet 3 : Tarification & conditions */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Tarif de base & conditions */}
          <div className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8">
            <h3 className="font-fraunces text-xl leading-tight text-[#041912]">
              Tarif de base & conditions
            </h3>

            <div className="mt-4 grid grid-cols-1 divide-y divide-slate-100 border-y border-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="py-4 sm:px-5 sm:py-1 sm:first:pl-0">
                <span className="text-[11px] text-slate-400">Tarif journalier standard</span>
                <p className="mt-1 font-fraunces text-2xl text-[#041912]">
                  {formatCurrency(vehicle.prixParJour || 0)}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">Tarif de référence (1 à 2 jours)</p>
              </div>

              <div className="py-4 sm:px-5 sm:py-1">
                <span className="text-[11px] text-slate-400">Durée minimale</span>
                <p className="mt-1 font-fraunces text-2xl text-[#041912]">
                  {vehicle.joursMinimum || 1} {vehicle.joursMinimum && vehicle.joursMinimum > 1 ? 'jours' : 'jour'}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">Minimum par réservation</p>
              </div>

              <div className="py-4 sm:px-5 sm:py-1">
                <span className="text-[11px] text-slate-400">Âge minimal requis</span>
                <p className="mt-1 font-fraunces text-2xl text-[#041912]">
                  {vehicle.ageMinimum || 21} ans
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">Avec permis validé</p>
              </div>
            </div>
          </div>

          {/* Réductions longs séjours */}
          <div className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8">
            <h3 className="font-fraunces text-xl leading-tight text-[#041912]">
              Réductions longs séjours
            </h3>
            <p className="mt-1 text-[13px] text-slate-500">
              Ajustements de prix automatiques configurés pour encourager les réservations de longue durée.
            </p>

            {vehicle.tarifsProgressifs && vehicle.tarifsProgressifs.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {vehicle.tarifsProgressifs.map((tier) => {
                  const tierPrix = typeof tier.prix === 'string' ? parseFloat(tier.prix) : tier.prix;
                  const basePrix = vehicle.prixParJour || 1;
                  const discountPct = Math.max(0, Math.round(((basePrix - tierPrix) / basePrix) * 100));

                  const durationLabel = tier.joursMax
                    ? `${tier.joursMin} à ${tier.joursMax} jours`
                    : `${tier.joursMin}+ jours`;

                  return (
                    <div
                      key={tier.id}
                      className="rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-semibold text-[#041912]">{durationLabel}</span>
                        {discountPct > 0 && (
                          <span className="rounded-full bg-[#0A3D2E]/8 px-2 py-0.5 text-[10.5px] font-bold text-[#0A3D2E]">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-fraunces text-xl text-[#041912]">
                        {formatCurrency(tierPrix)}
                        <span className="ml-1 text-[11px] font-sans font-normal text-slate-400">/ jour</span>
                      </p>
                      <p className="mt-1 text-[11.5px] text-slate-500">
                        Économie de {formatCurrency(basePrix - tierPrix)} / jour pour le locataire
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 py-6 text-center">
                <p className="text-[13px] font-medium text-slate-600">Aucun tarif dégressif configuré</p>
                <p className="mx-auto mt-1 max-w-md text-[12px] text-slate-400">
                  Le tarif journalier de base de {formatCurrency(vehicle.prixParJour || 0)} s'applique quelle que soit la durée du séjour.
                </p>
              </div>
            )}
          </div>

          {/* Options & services de livraison */}
          <div className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8">
            <h3 className="font-fraunces text-xl leading-tight text-[#041912]">
              Options & services de livraison
            </h3>

            <div className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
              <div className="flex items-start gap-3.5 py-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13.5px] font-semibold text-[#041912]">Déplacement hors Dakar</span>
                    <span className={`text-[11.5px] font-semibold ${vehicle.autoriseHorsDakar ? 'text-[#0A3D2E]' : 'text-slate-400'}`}>
                      {vehicle.autoriseHorsDakar ? 'Autorisé' : 'Dakar uniquement'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Supplément pour déplacements en région (Mbour, Thiès, Saly, Saint-Louis...)
                  </p>
                  {vehicle.autoriseHorsDakar && (
                    <p className="mt-1 text-[13px] font-medium text-[#041912]">
                      {vehicle.supplementHorsDakarParJour || (vehicle as any).prixParJourHorsDakar
                        ? `+ ${formatCurrency(vehicle.supplementHorsDakarParJour || (vehicle as any).prixParJourHorsDakar || 0)} / jour`
                        : 'Inclus (0 FCFA)'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Plane className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13.5px] font-semibold text-[#041912]">Livraison aéroport AIBD</span>
                    <span className={`text-[11.5px] font-semibold ${vehicle.proposeLivraisonAibd ? 'text-[#0A3D2E]' : 'text-slate-400'}`}>
                      {vehicle.proposeLivraisonAibd ? 'Proposé' : 'Non proposé'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Remise des clés directement à la sortie du terminal AIBD (Diass)
                  </p>
                  {vehicle.proposeLivraisonAibd && (
                    <p className="mt-1 text-[13px] font-medium text-[#041912]">
                      {vehicle.fraisLivraisonAibd ? formatCurrency(vehicle.fraisLivraisonAibd) : 'Gratuit'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Home className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13.5px] font-semibold text-[#041912]">Livraison à domicile / Dakar</span>
                    <span className={`text-[11.5px] font-semibold ${vehicle.proposeLivraisonDakar ? 'text-[#0A3D2E]' : 'text-slate-400'}`}>
                      {vehicle.proposeLivraisonDakar ? 'Proposé' : 'Retrait sur place'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Livraison du véhicule au domicile ou à l'hôtel du locataire à Dakar
                  </p>
                  {vehicle.proposeLivraisonDakar && (
                    <p className="mt-1 text-[13px] font-medium text-[#041912]">
                      {vehicle.fraisLivraisonDakar ? formatCurrency(vehicle.fraisLivraisonDakar) : 'Gratuit'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet 4 : Historique des réservations */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <h3 className="font-fraunces text-xl leading-tight text-[#041912]">
            Réservations liées à ce véhicule ({vehicleReservations.length})
          </h3>

          {vehicleReservations.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <Car className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Aucune réservation pour le moment</p>
              <p className="text-xs text-slate-500 mt-1">
                Les demandes de location effectuées pour ce véhicule apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicleReservations.map((item: any) => (
                <OwnerReservationCard key={item.id} reservation={{ ...item, vehicule: item.vehicule || vehicle }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Confirmation Archivage — iOS Alert Style */}
      <AnimatePresence>
        {showArchiveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
            onClick={() => setShowArchiveConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-[300px] sm:w-[325px] overflow-hidden rounded-[24px] bg-white/95 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 pb-4 flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 mb-3 shadow-xs">
                  <Archive className="h-5 w-5" />
                </div>
                <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-snug">
                  Archiver le véhicule ?
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
                  L'annonce ne sera plus visible sur AutoLoc. Vous pourrez la réactiver à tout moment.
                </p>
              </div>

              {/* iOS Hairline Action Buttons */}
              <div className="grid grid-cols-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex h-11 items-center justify-center border-r border-slate-200/80 text-[15px] font-normal text-slate-600 transition-colors active:bg-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="flex h-11 items-center justify-center text-[15px] font-semibold text-amber-600 transition-colors active:bg-amber-50 hover:bg-amber-50/50 disabled:opacity-50 cursor-pointer"
                >
                  {isArchiving ? 'Archivage...' : 'Archiver'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmation Suppression Définitive — iOS Alert Style */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-md"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              className="w-[300px] sm:w-[325px] overflow-hidden rounded-[24px] bg-white/95 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 pb-4 flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200/80 mb-3 shadow-xs">
                  <Trash2 className="h-5 w-5 stroke-[2.2]" />
                </div>
                <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-snug">
                  Supprimer ce véhicule ?
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
                  Cette action est <strong className="text-rose-600 font-medium">irréversible</strong>. Toutes les données associées seront retirées de votre garage.
                </p>
              </div>

              {/* iOS Hairline Action Buttons */}
              <div className="grid grid-cols-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex h-11 items-center justify-center border-r border-slate-200/80 text-[15px] font-normal text-slate-600 transition-colors active:bg-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex h-11 items-center justify-center text-[15px] font-semibold text-rose-600 transition-colors active:bg-rose-50 hover:bg-rose-50/50 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};