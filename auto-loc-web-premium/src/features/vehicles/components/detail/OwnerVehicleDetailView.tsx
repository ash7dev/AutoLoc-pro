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
  ShieldCheck,
  Fuel,
  Gauge,
  Users,
  Layers,
  Settings,
  AlertTriangle,
  Info,
} from 'lucide-react';
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

export const OwnerVehicleDetailView: React.FC<OwnerVehicleDetailViewProps> = ({ vehicleId }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'pricing' | 'reservations'>('overview');
  const [isArchiving, setIsArchiving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

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
      setShowArchiveConfirm(false);
      router.push('/dashboard/vehicles');
    } catch (err) {
      console.error('Erreur archivage véhicule:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-0">
        <div className="h-12 w-48 rounded-2xl bg-slate-200" />
        <div className="h-72 w-full rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
        </div>
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

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Header Mobile Dédié */}
      <VehicleMobileHeader
        vehicleId={vehicleId}
        marque={vehicle.marque}
        modele={vehicle.modele}
        immatriculation={vehicle.immatriculation}
        statut={vehicle.statut}
      />

      {/* Fil d'ariane Desktop */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/dashboard/vehicles" className="hover:text-slate-900 transition-colors">
            Flotte Automobile
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">
            {vehicle.marque} {vehicle.modele}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/vehicles/${vehicleId}/edit`}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Edit className="h-3.5 w-3.5 text-[#059669]" />
            <span>Modifier l'annonce</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowArchiveConfirm(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Archiver</span>
          </button>
        </div>
      </div>

      {/* Hero Galerie */}
      <OwnerVehicleHeroGallery vehicle={vehicle} />

      {/* Grille Résumé Métriques Clés */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tarif Journalier
            </span>
            <DollarSign className="h-4 w-4 text-[#059669]" />
          </div>
          <p className="mt-2 font-fraunces text-2xl text-[#041912]">
            {formatCurrency(vehicle.prixParJour || 0)}
          </p>
          <span className="text-[10px] text-slate-400">Prix de base / jour</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Réservations
            </span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 font-fraunces text-2xl text-[#041912]">
            {(vehicle as any)._count?.reservations || vehicleReservations.length || 0}
          </p>
          <span className="text-[10px] text-slate-400">Locations réalisées</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Dates Bloquées
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 font-fraunces text-2xl text-[#041912]">
            {indisponibilites.length}
          </p>
          <span className="text-[10px] text-slate-400">Périodes d'indisponibilité</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Statut Général
            </span>
            {isVerifie ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Clock className="h-4 w-4 text-amber-600" />
            )}
          </div>
          <p className="mt-2 text-sm font-bold text-[#041912] truncate">
            {isVerifie ? 'Actif & Disponible' : vehicle.statut || 'En révision'}
          </p>
          <span className="text-[10px] text-slate-400">Conformité AutoLoc</span>
        </div>
      </div>

      {/* Barre d'Onglets de Navigation */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#041912] text-[#4ADE80] shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Vue d'ensemble & Specs
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('availability')}
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'availability'
              ? 'bg-[#041912] text-[#4ADE80] shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Disponibilité & Calendrier ({indisponibilites.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'pricing'
              ? 'bg-[#041912] text-[#4ADE80] shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tarification & Conditions
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'reservations'
              ? 'bg-[#041912] text-[#4ADE80] shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Historique Réservations ({vehicleReservations.length})
        </button>
      </div>

      {/* Contenu de l'Onglet 1 : Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Spécifications Techniques */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 space-y-6">
            <h3 className="font-fraunces text-xl font-normal text-[#041912]">
              Caractéristiques Techniques
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Fuel className="h-4 w-4 text-[#059669]" />
                  <span>Carburant</span>
                </div>
                <p className="text-xs font-bold text-slate-900 capitalize">
                  {vehicle.carburant || 'Essence'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Settings className="h-4 w-4 text-[#059669]" />
                  <span>Transmission</span>
                </div>
                <p className="text-xs font-bold text-slate-900 capitalize">
                  {vehicle.boiteVitesse || 'Automatique'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Users className="h-4 w-4 text-[#059669]" />
                  <span>Places</span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {vehicle.nombrePlaces || 5} places
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Gauge className="h-4 w-4 text-[#059669]" />
                  <span>Kilométrage</span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {vehicle.kilometrage ? `${vehicle.kilometrage.toLocaleString()} km` : 'Non renseigné'}
                </p>
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description de l'annonce
                </h4>
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>

          {/* Documents Administratifs */}
          <OwnerVehicleDocumentsCard
            carteGriseUrl={(vehicle as any).carteGriseUrl}
            assuranceDocUrl={(vehicle as any).assuranceDocUrl}
            hasCarteGrise={(vehicle as any).hasCarteGrise}
            hasAssuranceDoc={(vehicle as any).hasAssuranceDoc}
            statut={vehicle.statut}
          />
        </div>
      )}

      {/* Contenu de l'Onglet 2 : Disponibilité & Calendrier */}
      {activeTab === 'availability' && (
        <OwnerVehicleAvailabilityManager
          vehicleId={vehicleId}
          indisponibilites={indisponibilites}
          onRefresh={mutateIndispos}
        />
      )}

      {/* Contenu de l'Onglet 3 : Tarification & Conditions */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Tarification de base & Conditions de location */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 space-y-6">
            <h3 className="font-fraunces text-xl font-normal text-[#041912]">
              Tarif de Base & Conditions de Location
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tarif Journalier Standard
                </span>
                <p className="font-fraunces text-3xl font-normal text-[#041912]">
                  {formatCurrency(vehicle.prixParJour || 0)}
                </p>
                <p className="text-xs text-slate-500">Tarif de référence (1 à 2 jours de location)</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Durée Minimale
                </span>
                <p className="font-fraunces text-3xl font-normal text-[#041912]">
                  {vehicle.joursMinimum || 1} {vehicle.joursMinimum && vehicle.joursMinimum > 1 ? 'jours' : 'jour'}
                </p>
                <p className="text-xs text-slate-500">Minimum de jours par réservation</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Âge Minimal Requis
                </span>
                <p className="font-fraunces text-3xl font-normal text-[#041912]">
                  {vehicle.ageMinimum || 21} ans
                </p>
                <p className="text-xs text-slate-500">Âge minimum du locataire avec permis validé</p>
              </div>
            </div>
          </div>

          {/* Réductions Longs Séjours (Tarifs Dégressifs) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 space-y-6">
            <div>
              <h3 className="font-fraunces text-xl font-normal text-[#041912]">
                Réductions Longs Séjours (Tarifs Dégressifs)
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Ajustements de prix automatiques configurés pour encourager les réservations de longue durée.
              </p>
            </div>

            {vehicle.tarifsProgressifs && vehicle.tarifsProgressifs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {vehicle.tarifsProgressifs.map((tier) => {
                  const tierPrix = typeof tier.prix === 'string' ? parseFloat(tier.prix) : tier.prix;
                  const basePrix = vehicle.prixParJour || 1;
                  const discountPct = Math.max(0, Math.round(((basePrix - tierPrix) / basePrix) * 100));

                  const durationLabel =
                    tier.joursMax
                      ? `${tier.joursMin} à ${tier.joursMax} jours`
                      : `${tier.joursMin}+ jours (Long séjour)`;

                  return (
                    <div
                      key={tier.id}
                      className="relative flex flex-col justify-between rounded-2xl border border-emerald-200/90 bg-emerald-50/30 p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A3D2E]">
                          {durationLabel}
                        </span>
                        {discountPct > 0 && (
                          <span className="rounded-full bg-[#059669] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            -{discountPct}%
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="font-fraunces text-2xl font-normal text-[#041912]">
                          {formatCurrency(tierPrix)} <span className="text-xs font-sans text-slate-500">/ jour</span>
                        </p>
                        <p className="text-[11px] text-emerald-800 font-medium mt-1">
                          Économie de {formatCurrency(basePrix - tierPrix)} par jour pour le locataire
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-500 space-y-2">
                <p className="text-xs font-semibold text-slate-700">Aucun tarif dégressif configuré</p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Le tarif journalier de base de {formatCurrency(vehicle.prixParJour || 0)} s'applique quelle que soit la durée du séjour.
                </p>
              </div>
            )}
          </div>

          {/* Options de Déplacement & Services de Livraison */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 space-y-6">
            <h3 className="font-fraunces text-xl font-normal text-[#041912]">
              Options & Services de Livraison (Sénégal)
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Option Hors Dakar */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Déplacement Hors Dakar
                  </span>
                  {vehicle.autoriseHorsDakar ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Autorisé
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Dakar uniquement
                    </span>
                  )}
                </div>
                <p className="font-fraunces text-2xl font-normal text-[#041912]">
                  {vehicle.autoriseHorsDakar && (vehicle.supplementHorsDakarParJour || (vehicle as any).prixParJourHorsDakar)
                    ? `+ ${formatCurrency(vehicle.supplementHorsDakarParJour || (vehicle as any).prixParJourHorsDakar || 0)} / j`
                    : vehicle.autoriseHorsDakar
                    ? 'Inclus (0 FCFA)'
                    : 'Non autorisé'}
                </p>
                <p className="text-xs text-slate-500">Supplément pour déplacements en région (Mbour, Thiès, Saly, Saint-Louis...)</p>
              </div>

              {/* Livraison Aéroport AIBD */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Livraison Aéroport AIBD
                  </span>
                  {vehicle.proposeLivraisonAibd ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Proposé
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Non proposé
                    </span>
                  )}
                </div>
                <p className="font-fraunces text-2xl font-normal text-[#041912]">
                  {vehicle.proposeLivraisonAibd && vehicle.fraisLivraisonAibd
                    ? formatCurrency(vehicle.fraisLivraisonAibd)
                    : vehicle.proposeLivraisonAibd
                    ? 'Gratuit'
                    : 'Non disponible'}
                </p>
                <p className="text-xs text-slate-500">Remise des clés directement à la sortie du terminal AIBD (Diass)</p>
              </div>

              {/* Livraison à Domicile / Dakar */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Livraison à Domicile / Dakar
                  </span>
                  {vehicle.proposeLivraisonDakar ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Proposé
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Retrait sur place
                    </span>
                  )}
                </div>
                <p className="font-fraunces text-2xl font-normal text-[#041912]">
                  {vehicle.proposeLivraisonDakar && vehicle.fraisLivraisonDakar
                    ? formatCurrency(vehicle.fraisLivraisonDakar)
                    : vehicle.proposeLivraisonDakar
                    ? 'Gratuit'
                    : 'Sur place uniquement'}
                </p>
                <p className="text-xs text-slate-500">Livraison du véhicule au domicile ou à l'hôtel du locataire à Dakar</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu de l'Onglet 4 : Historique des Réservations */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <h3 className="font-fraunces text-xl font-normal text-[#041912]">
            Réservations liées à ce véhicule ({vehicleReservations.length})
          </h3>

          {vehicleReservations.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <Car className="mx-auto h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Aucune réservation pour le moment</p>
              <p className="text-xs text-slate-500 mt-1">
                Les demandes de location effectuées pour ce véhicule apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicleReservations.map((item: any) => (
                <OwnerReservationCard key={item.id} reservation={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Confirmation Archivage */}
      <AnimatePresence>
        {showArchiveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <Archive className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-fraunces text-xl font-normal text-slate-900">
                  Archiver ce véhicule ?
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  L'annonce ne sera plus visible par les locataires. Vous pourrez réactiver ou consulter le véhicule à tout moment depuis votre garage.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="flex-1 rounded-2xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {isArchiving ? 'Archivage...' : 'Confirmer l’archivage'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
