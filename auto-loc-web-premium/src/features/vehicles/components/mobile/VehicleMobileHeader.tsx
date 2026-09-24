'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit3, CheckCircle2, Clock, Trash2 } from 'lucide-react';

export interface VehicleMobileHeaderProps {
  vehicleId?: string;
  marque?: string;
  modele?: string;
  immatriculation?: string;
  statut?: string;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const VehicleMobileHeader: React.FC<VehicleMobileHeaderProps> = ({
  vehicleId,
  marque = '',
  modele = '',
  immatriculation = '',
  statut,
  onBack,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  const title = [marque, modele].filter(Boolean).join(' ') || 'Fiche Véhicule';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard/vehicles');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else if (vehicleId) {
      router.push(`/dashboard/vehicles/${vehicleId}/edit`);
    }
  };

  const isVerifie = statut === 'VERIFIE' || statut === 'DISPONIBLE';

  return (
    <header className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 w-full px-3 sm:hidden">
      <div className="pointer-events-auto flex h-14 items-center justify-between rounded-full border border-slate-900/10 bg-white/90 px-2.5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.20)] backdrop-blur-xl">
        {/* Bouton Retour Glassmorphic */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/80 text-[#041912] transition-colors hover:bg-slate-200 active:scale-95 cursor-pointer shrink-0"
        >
          <ChevronLeft className="h-5 w-5 stroke-[2.2]" />
        </button>

        {/* Informations centrales : Marque/Modèle & Immatriculation / Statut */}
        <div className="min-w-0 flex-1 px-2 text-center">
          <div className="flex items-center justify-center gap-1.5 truncate">
            <span className="font-fraunces text-sm font-semibold tracking-tight text-[#041912] truncate max-w-[140px]">
              {title}
            </span>
            {immatriculation && (
              <span className="font-mono text-[10px] font-bold text-[#0A3D2E] bg-emerald-50/90 px-1.5 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                {immatriculation}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1 pt-0.5">
            {isVerifie ? (
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
            )}
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#0A3D2E]/90 truncate max-w-[140px]">
              {isVerifie ? 'Véhicule Vérifié' : statut || 'En attente'}
            </span>
          </div>
        </div>

        {/* Boutons d'Action Droite : Éditer + Supprimer */}
        <div className="flex items-center gap-1.5 shrink-0">
          {vehicleId && (
            <button
              type="button"
              onClick={handleEdit}
              aria-label="Modifier"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95 cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Supprimer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200 transition-colors hover:bg-rose-100 active:scale-95 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
