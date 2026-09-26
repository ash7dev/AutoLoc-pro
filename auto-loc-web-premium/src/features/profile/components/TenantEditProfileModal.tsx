'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { UserProfileData, UpdateProfileDto } from '../../../core/api/userApi';

export interface TenantEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData;
  onSubmit: (dto: UpdateProfileDto) => Promise<any>;
}

const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const JOURS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface BirthDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
}

const BirthDatePicker: React.FC<BirthDatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const today = new Date();

  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() || today.getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

  useEffect(() => {
    if (isOpen) {
      setViewYear(selectedDate?.getFullYear() || today.getFullYear() - 25);
      setViewMonth(selectedDate?.getMonth() ?? today.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const yearOptions: number[] = [];
  for (let y = today.getFullYear() - 16; y >= today.getFullYear() - 100; y--) {
    yearOptions.push(y);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const shiftMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const displayLabel = selectedDate
    ? selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Sélectionner une date';

  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-left text-[13px] transition-colors hover:border-slate-300 focus:border-brand-main focus:outline-none focus:ring-2 focus:ring-brand-main/10 cursor-pointer"
      >
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
        <span className={selectedDate ? 'font-medium text-brand-dark' : 'text-slate-400'}>
          {displayLabel}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-full min-w-[280px] rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-dark cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="flex-1 rounded-lg border-none bg-slate-50 px-2 py-1.5 text-center text-[12.5px] font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-main/20"
            >
              {MOIS_FR.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="w-[84px] rounded-lg border-none bg-slate-50 px-2 py-1.5 text-center text-[12.5px] font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-main/20"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-dark cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10.5px] font-semibold text-slate-400">
            {JOURS_FR.map((j, i) => (
              <span key={`${j}-${i}`}>{j}</span>
            ))}
          </div>

          <div className="mt-1.5 grid grid-cols-7 gap-1">
            {cells.map((day, idx) =>
              day === null ? (
                <span key={`empty-${idx}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                    isSelected(day)
                      ? 'bg-brand-dark text-champagne'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const TenantEditProfileModal: React.FC<TenantEditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSubmit,
}) => {
  const [prenom, setPrenom] = useState(profile.prenom || '');
  const [nom, setNom] = useState(profile.nom || '');
  const [dateNaissance, setDateNaissance] = useState(
    profile.dateNaissance ? profile.dateNaissance.split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrenom(profile.prenom || '');
      setNom(profile.nom || '');
      setDateNaissance(profile.dateNaissance ? profile.dateNaissance.split('T')[0] : '');
      setErrorMsg(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const isKycVerified = profile.statutKyc === 'VALIDE' || profile.statutKyc === 'VERIFIE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!prenom.trim() || !nom.trim()) {
      setErrorMsg('Le prénom et le nom sont obligatoires.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance ? new Date(dateNaissance).toISOString() : null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour des informations.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 pb-4 pt-5 sm:px-8 rounded-t-3xl bg-white">
          <div>
            <h3 className="font-fraunces text-xl leading-tight text-brand-dark">Modifier le profil</h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500">Mettez à jour vos identifiants personnels</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5 sm:px-8">
          {/* Avertissement KYC */}
          {isKycVerified && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/70 p-3.5 text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-[12px] leading-relaxed">
                <strong className="font-semibold">Avertissement de sécurité KYC :</strong> toute modification de votre nom, prénom ou date de naissance réinitialisera votre statut de vérification. Vous devrez re-soumettre un document officiel valide.
              </p>
            </div>
          )}

          {/* Erreur */}
          {errorMsg && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-[12.5px] font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-slate-500">
                Prénom <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex : Ousmane"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-medium text-brand-dark placeholder:text-slate-300 focus:border-brand-main focus:outline-none focus:ring-2 focus:ring-brand-main/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-slate-500">
                Nom <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Diallo"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-medium text-brand-dark placeholder:text-slate-300 focus:border-brand-main focus:outline-none focus:ring-2 focus:ring-brand-main/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-slate-500">
                Date de naissance
              </label>
              <BirthDatePicker value={dateNaissance} onChange={setDateNaissance} />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Doit correspondre exactement à votre pièce d'identité.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-2.5 text-[12.5px] font-semibold text-champagne transition-colors hover:bg-brand-main disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />}
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
