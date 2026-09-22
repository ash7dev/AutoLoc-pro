'use client';

import React, { useState } from 'react';
import { Shield, Fuel, FileText, Check, ChevronDown } from 'lucide-react';
import { Step4Data } from '../../stores/useVehicleDraftStore';

interface WizardStep4ConditionsProps {
  data: Step4Data;
  onChange: (updated: Partial<Step4Data>) => void;
}

const INSURANCE_OPTIONS = [
  {
    id: 'Locataire responsable',
    title: 'Locataire responsable',
    sub: "Le locataire est responsable des dommages selon les conditions d'assurance de base.",
  },
  {
    id: 'Tous risques AutoLoc',
    title: 'Tous risques AutoLoc',
    sub: "Couverture maximale incluant bris de glace, vol et tous dommages matériels.",
  },
];

const FUEL_OPTIONS = [
  {
    id: 'Plein à plein',
    title: 'Plein à plein',
    sub: 'Le véhicule est fourni avec le réservoir plein et doit être restitué plein.',
  },
  {
    id: 'Même niveau au départ',
    title: 'Même niveau au départ',
    sub: 'Le locataire doit rendre le véhicule avec le même niveau de carburant qu au départ.',
  },
];

export const WizardStep4Conditions: React.FC<WizardStep4ConditionsProps> = ({ data, onChange }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    assurance: true,
    carburant: true,
    regles: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-1 sm:space-y-2 pb-1 sm:pb-2">
        <div className="mx-auto hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-[#041912] border border-[#4ADE80]/30 text-[#4ADE80] shadow-md">
          <Shield className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h2 className="font-fraunces font-normal text-xl sm:text-3xl text-slate-900 tracking-tight">Protection & Conditions</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Définissez la formule d'assurance et la politique de carburant
        </p>
      </div>

      <div className="space-y-3">
        {/* Accordion 1: Formule d'Assurance */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleSection('assurance')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/60 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#059669] border border-[#059669]/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-sm font-semibold text-slate-900">
                  Formule d'Assurance <span className="text-[#059669]">*</span>
                </h3>
                {data.assurance && (
                  <p className="text-xs text-[#059669] font-medium truncate max-w-[180px] sm:max-w-none">
                    {data.assurance}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F0FDF4] text-[#047857] border border-[#059669]/20">
                {data.assurance || 'À choisir'}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                  openSections.assurance ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openSections.assurance && (
            <div className="p-4 pt-2 space-y-2.5 border-t border-slate-100">
              {INSURANCE_OPTIONS.map((opt) => {
                const isSelected = data.assurance === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ assurance: opt.id })}
                    className={`flex items-start justify-between text-left w-full p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#059669] bg-[#F0FDF4] shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className={`font-fraunces text-sm font-semibold ${isSelected ? 'text-[#047857]' : 'text-slate-900'}`}>
                        {opt.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{opt.sub}</p>
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#059669] text-white mt-0.5">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accordion 2: Politique de Carburant */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleSection('carburant')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/60 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#059669] border border-[#059669]/20">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-sm font-semibold text-slate-900">
                  Politique de Carburant <span className="text-[#059669]">*</span>
                </h3>
                {data.carburantCondition && (
                  <p className="text-xs text-[#059669] font-medium truncate max-w-[180px] sm:max-w-none">
                    {data.carburantCondition}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F0FDF4] text-[#047857] border border-[#059669]/20">
                {data.carburantCondition || 'À choisir'}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                  openSections.carburant ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openSections.carburant && (
            <div className="p-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100">
              {FUEL_OPTIONS.map((opt) => {
                const isSelected = data.carburantCondition === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ carburantCondition: opt.id })}
                    className={`flex flex-col justify-between text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#059669] bg-[#F0FDF4] shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-fraunces text-xs font-semibold ${isSelected ? 'text-[#047857]' : 'text-slate-900'}`}>
                        {opt.title}
                      </h4>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#059669] text-white">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{opt.sub}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accordion 3: Consignes particulières */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleSection('regles')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/60 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#059669] border border-[#059669]/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-sm font-semibold text-slate-900">
                  Règles & Consignes particulières
                </h3>
                <p className="text-xs text-slate-500">
                  {data.reglesSpecifiques ? 'Consignes renseignées' : 'Optionnel'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {data.reglesSpecifiques ? 'Renseigné' : 'Optionnel'}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                  openSections.regles ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openSections.regles && (
            <div className="p-4 pt-2 border-t border-slate-100 space-y-2">
              <textarea
                rows={3}
                value={data.reglesSpecifiques || ''}
                onChange={(e) => onChange({ reglesSpecifiques: e.target.value })}
                placeholder="Ex: Interdiction de fumer à bord, pas d'animaux de compagnie, lavage obligatoire avant retour..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 focus:border-[#059669] focus:bg-white focus:outline-none placeholder:text-slate-400 transition-all"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
