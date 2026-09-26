'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, Clock, Check, X } from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { formatDateFr } from '@/lib/utils';
import { AutoCalendar, BlockedRange } from '@/src/shared/components/AutoCalendar';

export interface IndisponibiliteItem {
  id: string;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  type?: string;
  createdAt?: string;
}

export interface OwnerVehicleAvailabilityManagerProps {
  vehicleId: string;
  indisponibilites?: IndisponibiliteItem[];
  onRefresh?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  USAGE_PERSONNEL: 'Usage personnel',
  ENTRETIEN: 'Entretien',
  REPARATION: 'Réparation',
  AUTRE: 'Autre',
};

export const OwnerVehicleAvailabilityManager: React.FC<OwnerVehicleAvailabilityManagerProps> = ({
  vehicleId,
  indisponibilites = [],
  onRefresh,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [motif, setMotif] = useState('');
  const [type, setType] = useState('USAGE_PERSONNEL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const list: IndisponibiliteItem[] = Array.isArray(indisponibilites)
    ? indisponibilites
    : Array.isArray((indisponibilites as any)?.data)
      ? (indisponibilites as any).data
      : [];

  // Transform backend list to AutoCalendar BlockedRange[]
  const blockedRanges: BlockedRange[] = useMemo(() => {
    return list.map((item) => ({
      from: item.dateDebut,
      to: item.dateFin,
      type: item.type || 'BLOCKED',
    }));
  }, [list]);

  const handleSelectDatesFromCalendar = (start: string, end?: string) => {
    setDateDebut(start);
    setDateFin(end || start);
    setIsAdding(true);
  };

  const resetForm = () => {
    setDateDebut('');
    setDateFin('');
    setMotif('');
    setType('USAGE_PERSONNEL');
    setIsAdding(false);
  };

  const handleAddIndisponibilite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateDebut || !dateFin) return;

    try {
      setIsSubmitting(true);
      await vehicleService.createIndisponibilite(vehicleId, {
        dateDebut: new Date(dateDebut).toISOString(),
        dateFin: new Date(dateFin).toISOString(),
        motif: motif.trim() || 'Indisponibilité hôte',
        type,
      });

      resetForm();
      onRefresh?.();
    } catch (err) {
      console.error('Erreur lors de la création de l’indisponibilité:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (indispoId: string) => {
    try {
      setDeletingId(indispoId);
      await vehicleService.deleteIndisponibilite(vehicleId, indispoId);
      onRefresh?.();
    } catch (err) {
      console.error('Erreur suppression indisponibilité:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-brand-dark/8 bg-white p-6 shadow-[0_1px_2px_rgba(4,25,18,0.04),0_12px_28px_-14px_rgba(4,25,18,0.14)] sm:p-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-fraunces text-xl leading-tight text-brand-dark">
            Disponibilité du véhicule
          </h3>
          <p className="mt-1 max-w-md text-[13px] text-slate-500">
            Sélectionnez des dates sur le calendrier pour bloquer une période où le véhicule ne sera pas louable.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-2.5 text-[13px] font-semibold text-champagne transition-colors hover:bg-brand-main"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            Bloquer une période
          </button>
        )}
      </div>

      {/* Calendrier */}
      <div className="mt-5 rounded-2xl border border-slate-100 p-3 sm:p-4">
        <AutoCalendar
          vehicleId={vehicleId}
          blockedRanges={blockedRanges}
          startDate={dateDebut}
          endDate={dateFin}
          onSelectDates={handleSelectDatesFromCalendar}
        />
      </div>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <form
          onSubmit={handleAddIndisponibilite}
          className="mt-5 space-y-4 rounded-2xl border border-brand-main/12 bg-[#F6F5EF] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-semibold text-brand-dark">
              Nouveau blocage
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-900/5 hover:text-slate-600"
              aria-label="Fermer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <Calendar className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="text-[12.5px] font-medium text-brand-dark">
              {dateDebut ? formatDateFr(dateDebut) : 'Date de début'}
            </span>
            <span className="text-slate-300">→</span>
            <span className="text-[12.5px] font-medium text-brand-dark">
              {dateFin ? formatDateFr(dateFin) : 'Date de fin'}
            </span>
            {!dateDebut && (
              <span className="ml-auto text-[11px] text-slate-400">Cliquez sur le calendrier</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                Motif
              </label>
              <input
                type="text"
                placeholder="Entretien, usage familial..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-brand-main focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                Catégorie
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] text-slate-900 focus:border-brand-main focus:outline-none"
              >
                <option value="USAGE_PERSONNEL">Usage personnel</option>
                <option value="ENTRETIEN">Entretien / révision</option>
                <option value="REPARATION">Réparation mécanique</option>
                <option value="AUTRE">Autre raison</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !dateDebut || !dateFin}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-2 text-[13px] font-semibold text-champagne transition-colors hover:bg-brand-main disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              {isSubmitting ? 'Enregistrement...' : 'Valider le blocage'}
            </button>
          </div>
        </form>
      )}

      {/* Liste des périodes bloquées */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-semibold text-brand-dark">
            Périodes bloquées
          </h4>
          <span className="text-[12px] text-slate-400">{list.length}</span>
        </div>

        {list.length === 0 ? (
          <div className="mt-3 flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-slate-200 py-8 text-center">
            <Clock className="h-5 w-5 text-slate-300" />
            <p className="text-[13px] font-medium text-slate-600">Aucune date bloquée</p>
            <p className="text-[12px] text-slate-400">
              Le véhicule est ouvert à la réservation en continu.
            </p>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-slate-100">
            {list.map((item) => {
              const isDeleting = deletingId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-brand-dark">
                      {formatDateFr(item.dateDebut)} → {formatDateFr(item.dateFin)}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-slate-500">
                      {item.motif || TYPE_LABELS[item.type || ''] || 'Bloqué'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting}
                    aria-label="Supprimer le blocage"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};