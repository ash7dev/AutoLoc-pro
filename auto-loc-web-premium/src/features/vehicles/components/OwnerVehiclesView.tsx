'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Plus,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  FileEdit,
  Archive,
  Star,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { Vehicle } from '../types/vehicle.types';
import { OwnerVehiclesHeader, OwnerVehicleStats } from './OwnerVehiclesHeader';
import { OwnerVehicleCard } from './OwnerVehicleCard';
import { useOwnerVehicles } from '../hooks/useOwnerVehicles';
import { useUserStore } from '../../../core/store/useUserStore';
import { useHostGate } from '../../owner/hooks/useHostGate';
import { ReservationGateModal } from '../../reservations/components/ReservationGateModal';
import { formatCurrency } from '@/lib/utils';
import { AddVehicleWizardModal } from './wizard/AddVehicleWizardModal';

export const OwnerVehiclesView: React.FC = () => {
  const { vehicles, isLoading, isForbidden, mutate: fetchVehicles } = useOwnerVehicles(100, 0);
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

  // Compute stats
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

    return {
      total: vehicles.length,
      verifies,
      enAttente,
      brouillons,
      archives,
      enCirculation,
    };
  }, [vehicles]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Status filter
      if (selectedStatus !== 'ALL') {
        const s = (v.statut || '').toUpperCase();
        if (selectedStatus === 'VERIFIE' && s !== 'VERIFIE' && s !== 'DISPONIBLE') return false;
        if (selectedStatus === 'EN_ATTENTE_VALIDATION' && s !== 'EN_ATTENTE_VALIDATION') return false;
        if (selectedStatus === 'BROUILLON' && s !== 'BROUILLON') return false;
        if (selectedStatus === 'ARCHIVE' && s !== 'ARCHIVE') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const marque = (v.marque || '').toLowerCase();
        const modele = (v.modele || '').toLowerCase();
        const immat = (v.immatriculation || '').toLowerCase();
        const ville = (v.ville || '').toLowerCase();
        return (
          marque.includes(q) ||
          modele.includes(q) ||
          immat.includes(q) ||
          ville.includes(q)
        );
      }

      return true;
    });
  }, [vehicles, selectedStatus, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header principal */}
      <OwnerVehiclesHeader
        stats={stats}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddVehicle={handleOpenAddVehicle}
        onRefresh={fetchVehicles}
        isLoading={isLoading}
      />

      {/* Alerte 403 : Mode Locataire actif (Rôle insuffisant) */}
      {isForbidden ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-fraunces text-xl font-normal text-amber-950">
            Activation de l’Espace Hôte nécessaire
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-amber-800/90 leading-relaxed">
            Votre compte est actuellement configuré en mode Locataire. Activez votre rôle Propriétaire / Hôte pour accéder à la liste de vos véhicules.
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
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#041912] px-6 py-3 text-sm font-bold text-[#F1DFB6] shadow-md hover:bg-[#0A3D2E] transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-[#4ADE80]" />
            <span>{isSwitching ? 'Bascule en cours…' : 'Activer mon Espace Hôte'}</span>
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 w-full animate-pulse rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="h-44 w-full rounded-2xl bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        /* 3. Empty State */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669]">
            <Car className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-fraunces text-xl font-normal text-[#041912]">
            {searchQuery || selectedStatus !== 'ALL'
              ? 'Aucun véhicule ne correspond à vos filtres'
              : 'Aucun véhicule dans votre flotte'}
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-slate-500">
            {searchQuery || selectedStatus !== 'ALL'
              ? 'Essayez de modifier votre recherche ou de réinitialiser vos filtres.'
              : 'Commencez dès maintenant en ajoutant votre premier véhicule pour recevoir des réservations.'}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {(searchQuery || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                }}
                className="rounded-xl border border-[#0A3D2E]/10 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAddVehicle}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A3D2E] px-5 py-2.5 text-xs font-bold text-[#F1DFB6] shadow-md hover:bg-[#0F4F3B] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un véhicule</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* 4. Grille des véhicules (Mode Liste sur Mobile < sm, Grille sur Desktop >= sm) */
        <div className="grid grid-cols-1 gap-3.5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle) => (
              <OwnerVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onRefresh={fetchVehicles}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modale Host Gate (Profil, Téléphone OTP, KYC, Permis) */}
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

      {/* Wizard Modale pour Ajouter un Véhicule */}
      <AddVehicleWizardModal
        isOpen={isAddWizardOpen}
        onClose={() => setIsAddWizardOpen(false)}
        onSuccess={() => {
          setIsAddWizardOpen(false);
          fetchVehicles();
        }}
      />
    </div>
  );
};
