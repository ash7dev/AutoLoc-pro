'use client';

import React, { useState } from 'react';
import { Banknote, TrendingDown, Plus, Trash2, ChevronDown, ChevronUp, Coins } from 'lucide-react';
import { Step5Data, PriceTier } from '../../stores/useVehicleDraftStore';

interface WizardStep5PricingProps {
  data: Step5Data;
  onChange: (updated: Partial<Step5Data>) => void;
}

const PRESET_PRICES = [30000, 35000, 50000, 60000, 75000, 100000];

export const WizardStep5Pricing: React.FC<WizardStep5PricingProps> = ({ data, onChange }) => {
  const prixParJour = data.prixParJour || 0;
  const tiers = data.tiers || [];

  const [discountsExpanded, setDiscountsExpanded] = useState(tiers.length > 0);

  const handlePriceChange = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    onChange({ prixParJour: num });
  };

  const addCustomTier = () => {
    const lastMin = tiers.length > 0 ? tiers[tiers.length - 1].joursMin : 1;
    const newTier: PriceTier = {
      joursMin: lastMin + 3,
      prix: prixParJour > 0 ? Math.round(prixParJour * 0.9) : 20000,
    };
    onChange({ tiers: [...tiers, newTier] });
  };

  const removeTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    onChange({ tiers: updated });
  };

  const updateTierField = (index: number, field: keyof PriceTier, val: number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ tiers: updated });
  };

  const getDiscountPercent = (tierPrice: number) => {
    if (!prixParJour || prixParJour <= 0 || tierPrice >= prixParJour) return 0;
    return Math.round(((prixParJour - tierPrice) / prixParJour) * 100);
  };

  // Host Net Revenue Calculation (e.g. 90% net payout after 10% platform fee)
  const netEarnings3Days = Math.round(prixParJour * 3 * 0.9);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-1 sm:space-y-2 pb-1 sm:pb-2">
        <div className="mx-auto hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-[#041912] border border-[#4ADE80]/30 text-[#4ADE80] shadow-md">
          <Banknote className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h2 className="font-fraunces font-normal text-xl sm:text-3xl text-slate-900 tracking-tight">Tarification & Revenus</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Fixez votre prix de base par jour et optimisez vos revenus avec des réductions
        </p>
      </div>

      {/* Base Daily Price Input Card */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
          <Banknote className="h-4 w-4 text-[#059669]" />
          <span>Prix de base par jour *</span>
        </label>

        <div className="flex items-center justify-between gap-2 rounded-2xl border-2 border-[#059669] bg-[#F0FDF4] p-3 shadow-inner">
          <input
            type="number"
            value={prixParJour > 0 ? prixParJour : ''}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="25000"
            className="w-full min-w-0 flex-1 bg-transparent font-display text-xl sm:text-2xl font-bold text-slate-900 focus:outline-none"
          />
          <span className="shrink-0 whitespace-nowrap font-display text-xs sm:text-sm font-bold text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-xl">
            FCFA / jour
          </span>
        </div>

        {/* Preset Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 font-fraunces">Raccourcis prix fréquents :</span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {PRESET_PRICES.map((price) => {
              const isSelected = prixParJour === price;
              return (
                <button
                  key={price}
                  type="button"
                  onClick={() => onChange({ prixParJour: price })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#041912] text-[#4ADE80] border-[#041912]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {price.toLocaleString('fr-FR')} F
                </button>
              );
            })}
          </div>
        </div>

        {/* Host Net Earnings Simulator Box */}
        {prixParJour > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-[#041912] border border-[#4ADE80]/30 p-3.5 text-white">
            <Coins className="h-5 w-5 text-[#4ADE80] shrink-0" />
            <div className="text-xs space-y-0.5 min-w-0">
              <p className="font-bold text-[#4ADE80] text-xs sm:text-sm">
                Gain estimé : ~{netEarnings3Days.toLocaleString('fr-FR')} FCFA net sur 3 jours
              </p>
              <p className="text-[11px] text-emerald-200/70 leading-normal">
                Vous recevez 90% du prix de la location directement vers votre Mobile Money.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Accordéon Réductions Longue Durée */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <button
          type="button"
          onClick={() => setDiscountsExpanded(!discountsExpanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[#059669]" />
            <h3 className="font-fraunces text-sm font-semibold text-slate-900">Réductions Longue Durée</h3>
            {tiers.length > 0 && !discountsExpanded && (
              <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-bold text-[#047857] border border-[#A7F3D0]">
                {tiers.length} palier{tiers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {discountsExpanded ? <ChevronUp className="h-4 w-4 text-[#059669]" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {discountsExpanded && (
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 font-fraunces">Paliers dégressifs configurés</span>
              <button
                type="button"
                onClick={addCustomTier}
                className="flex items-center gap-1 rounded-xl bg-[#F0FDF4] border border-[#A7F3D0] px-2.5 py-1 text-xs font-bold text-[#047857] hover:bg-[#DCFCE7] transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter un palier
              </button>
            </div>

            {tiers.length > 0 ? (
              <div className="space-y-2.5">
                {tiers.map((tier, index) => {
                  const pct = getDiscountPercent(tier.prix);
                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3"
                    >
                      <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block font-fraunces mb-1">
                            Dès (jours)
                          </label>
                          <input
                            type="number"
                            value={tier.joursMin}
                            onChange={(e) => updateTierField(index, 'joursMin', Number(e.target.value) || 1)}
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-[#059669] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block font-fraunces mb-1 truncate">
                            Prix révisé (FCFA/j)
                          </label>
                          <input
                            type="number"
                            value={tier.prix}
                            onChange={(e) => updateTierField(index, 'prix', Number(e.target.value) || 0)}
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-[#059669] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                        {pct > 0 && (
                          <span className="rounded-lg bg-[#041912] px-2.5 py-1 text-[11px] font-bold text-[#4ADE80] border border-[#4ADE80]/30 shrink-0">
                            -{pct}%
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors shrink-0 ml-auto sm:ml-0"
                          title="Supprimer le palier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Aucun palier configuré. Cliquez sur "+ Ajouter un palier" pour inciter les locations de longue durée.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
