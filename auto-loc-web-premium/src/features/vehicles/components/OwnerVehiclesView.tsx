'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Plus, Sparkles } from 'lucide-react';
import { OwnerVehiclesHeader, OwnerVehicleStats } from './OwnerVehiclesHeader';
import { OwnerVehicleCard } from './OwnerVehicleCard';
import { OwnerVehicleCardSkeleton } from './OwnerVehicleCardSkeleton';
import { useOwnerVehicles } from '../hooks/useOwnerVehicles';
import { useUserStore } from '../../../core/store/useUserStore';
import { useHostGate } from '../../owner/hooks/useHostGate';
import { useCacheInvalidator } from '../../../core/hooks/useCacheInvalidator';
import { ReservationGateModal } from '../../reservations/components/ReservationGateModal';
import { AddVehicleWizardModal } from './wizard/AddVehicleWizardModal';

export const OwnerVehiclesView: React.FC = () => {
  const { vehicles, isLoading, isRefreshing, lastRefreshedAt, isForbidden, mutate: fetchVehicles } = useOwnerVehicles(100, 0);
  const { invalidateVehicles } = useCacheInvalidator();
  const switchRole = useUserStore((s) => s.switchRole);
  const { canProceed, missingSteps, userAge } = useHostGate();

  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  const handleOpenAddVehicle = () => {
    if (!canProceed && missingSteps.length > 0) {
      setIsGateOpen(true);
    } else {
      setIsAddWizardOpen(true);
    }
  };

  const stats: OwnerVehicleStats = useMemo(() => {
    let verifies = 0;
    let enAttente = 0;
    let brouillons = 0;
    let archives = 0;
    let enCirculation = 0;

    vehicles.forEach((v) => {
      const s = (v.statut || '').toUpperCase();
      if (s === 'VERIFIE' || s === 'DISPONIBLE') verifies++;
      else if (s === 'EN_ATTENTE_VALIDATION') enAttente++;
      else if (s === 'BROUILLON') brouillons++;
      else if (s === 'ARCHIVE') archives++;

      if ((v as any).estVerrouille) enCirculation++;
    });

    return { total: vehicles.length, verifies, enAttente, brouillons, archives, enCirculation };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedStatus !== 'ALL') {
        const s = (v.statut || '').toUpperCase();
        if (selectedStatus === 'VERIFIE' && s !== 'VERIFIE' && s !== 'DISPONIBLE') return false;
        if (selectedStatus === 'EN_ATTENTE_VALIDATION' && s !== 'EN_ATTENTE_VALIDATION') return false;
        if (selectedStatus === 'BROUILLON' && s !== 'BROUILLON') return false;
        if (selectedStatus === 'ARCHIVE' && s !== 'ARCHIVE') return false;
      }

      if (searchQuery.trim()) {
        const normalizedQuery = searchQuery
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();
        const words = normalizedQuery.split(/\s+/).filter(Boolean);

        const searchableText = [
          v.marque,
          v.modele,
          `${v.marque} ${v.modele}`,
          v.immatriculation,
          v.ville,
          v.type,
          v.carburant,
          v.transmission,
          v.annee?.toString(),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return words.every((word) => searchableText.includes(word));
      }

      return true;
    });
  }, [vehicles, selectedStatus, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header principal */}
      <OwnerVehiclesHeader
        stats={stats}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddVehicle={handleOpenAddVehicle}
        onRefresh={fetchVehicles}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
      />

      {/* Alerte : rôle Hôte non actif */}
      {isForbidden ? (
        <div className="flex flex-col items-center rounded-3xl border border-amber-100 bg-amber-50/60 p-8 text-center sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-fraunces text-xl leading-tight text-[#041912]">
            Activation de l'espace hôte nécessaire
          </h3>
          <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-slate-600">
            Votre compte est actuellement configuré en mode locataire. Activez votre rôle propriétaire pour accéder à votre flotte de véhicules.
          </p>
          <button
            type="button"
            disabled={isSwitching}
            onClick={async () => {
              setIsSwitching(true);
              await switchRole('PROPRIETAIRE');
              await fetchVehicles();
              setIsSwitching(false);
            }}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#041912] px-6 py-3 text-[13px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E] disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-[#4ADE80]" />
            {isSwitching ? 'Bascule en cours…' : 'Activer mon espace hôte'}
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <OwnerVehicleCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        /* État vide */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A3D2E]/8 text-[#0A3D2E]">
            <Car className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-fraunces text-xl leading-tight text-[#041912]">
            {searchQuery || selectedStatus !== 'ALL'
              ? 'Aucun véhicule ne correspond à vos filtres'
              : 'Aucun véhicule dans votre flotte'}
          </h3>
          <p className="mt-1.5 max-w-md text-[13.5px] text-slate-500">
            {searchQuery || selectedStatus !== 'ALL'
              ? 'Essayez de modifier votre recherche ou de réinitialiser vos filtres.'
              : 'Commencez dès maintenant en ajoutant votre premier véhicule pour recevoir des réservations.'}
          </p>
          <div className="mt-6 flex items-center gap-2.5">
            {(searchQuery || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Réinitialiser les filtres
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAddVehicle}
              className="inline-flex items-center gap-2 rounded-xl bg-[#041912] px-5 py-2.5 text-[12.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E]"
            >
              <Plus className="h-4 w-4 text-[#4ADE80]" />
              Ajouter un véhicule
            </button>
          </div>
        </motion.div>
      ) : (
        /* Grille des véhicules */
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle) => (
              <OwnerVehicleCard key={vehicle.id} vehicle={vehicle} onRefresh={fetchVehicles} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <ReservationGateModal
        visible={isGateOpen}
        mode="OWNER"
        missingSteps={missingSteps}
        userAge={userAge}
        onClose={() => setIsGateOpen(false)}
        onAllCompleted={() => {
          setIsGateOpen(false);
          setIsAddWizardOpen(true);
        }}
      />

      <AddVehicleWizardModal
        isOpen={isAddWizardOpen}
        onClose={() => setIsAddWizardOpen(false)}
        onSuccess={async () => {
          setIsAddWizardOpen(false);
          await invalidateVehicles();
          fetchVehicles();
        }}
      />
    </div>
  );
};