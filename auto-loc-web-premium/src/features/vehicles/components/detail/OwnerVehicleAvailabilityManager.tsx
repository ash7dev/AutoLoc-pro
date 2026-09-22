'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock, AlertCircle, ShieldAlert, Check } from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { formatDateFr } from '@/lib/utils';

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

      setDateDebut('');
      setDateFin('');
      setMotif('');
      setIsAdding(false);
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

  const list: IndisponibiliteItem[] = Array.isArray(indisponibilites)
    ? indisponibilites
    : Array.isArray((indisponibilites as any)?.data)
    ? (indisponibilites as any).data
    : [];

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#059669]" />
            <h3 className="font-fraunces text-xl font-normal text-[#041912]">
              Gestion de la disponibilité
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Bloquez des dates pour vos besoins personnels, entretien ou réparations. Les locataires ne pourront pas réserver sur ces périodes.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#041912] px-4 py-2.5 text-xs font-bold text-[#4ADE80] transition-colors hover:bg-[#0A3D2E] shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Bloquer une période</span>
          </button>
        )}
      </div>

      {/* Formulaire d'ajout d'indisponibilité */}
      {isAdding && (
        <form
          onSubmit={handleAddIndisponibilite}
          className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Ajouter une période d'indisponibilité
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-amber-800 hover:underline font-semibold"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#059669] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date de fin *
              </label>
              <input
                type="date"
                required
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#059669] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Motif du blocage
              </label>
              <input
                type="text"
                placeholder="Ex: Entretien technique, usage familial..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#059669] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Catégorie
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#059669] focus:outline-none"
              >
                <option value="USAGE_PERSONNEL">Usage personnel</option>
                <option value="ENTRETIEN">Entretien / Révision</option>
                <option value="REPARATION">Réparation mécanique</option>
                <option value="AUTRE">Autre raison</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#041912] px-5 py-2 text-xs font-bold text-[#4ADE80] transition-colors hover:bg-[#0A3D2E] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Valider le blocage'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Liste des périodes d'indisponibilité actuelles */}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-500">
          <Clock className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">Aucune date bloquée actuellement</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Votre véhicule est disponible à la réservation en continu.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
          {list.map((item) => {
            const isDeleting = deletingId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/60"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      Du {formatDateFr(item.dateDebut)} au {formatDateFr(item.dateFin)}
                    </span>
                    <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {item.motif || item.type || 'Bloqué'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={isDeleting}
                  aria-label="Supprimer le blocage"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
