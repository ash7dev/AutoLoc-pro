'use client';

import React from 'react';
import {
  Car,
  MapPin,
  Shield,
  Banknote,
  Images,
  Edit3,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { Step1Data, Step2Data, Step3Data, Step4Data, Step5Data, Step6Data } from '../../stores/useVehicleDraftStore';

interface WizardStep7ReviewProps {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  onJumpToStep: (step: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export const WizardStep7Review: React.FC<WizardStep7ReviewProps> = ({
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
  onJumpToStep,
  onSubmit,
  submitting,
}) => {
  const coverPhoto =
    step6.photos.length > 0
      ? step6.photos[0].uri
      : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-2 pb-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#041912] border border-[#4ADE80]/30 text-[#4ADE80] shadow-md">
          <FileCheck2 className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h2 className="font-fraunces font-normal text-2xl sm:text-3xl text-slate-900 tracking-tight">Récapitulatif & Validation</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Vérifiez l’apparence de votre annonce avant la mise en ligne officielle
        </p>
      </div>

      {/* LIVE VEHICLE CARD PREVIEW */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-lg space-y-0">
        <div className="relative aspect-video w-full bg-slate-100">
          <img src={coverPhoto} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#041912] px-3 py-1 text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/40">
            <Sparkles className="h-3 w-3" />
            <span>APERÇU DE L'ANNONCE</span>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            <Images className="h-3.5 w-3.5" />
            <span>{step6.photos.length} photo{step6.photos.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-fraunces text-lg font-semibold text-slate-900">
                {step1.marque || 'Marque'} {step1.modele || 'Modèle'} ({step1.annee || 2024})
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="h-3.5 w-3.5 text-[#059669]" />
                <span>{step3.ville || 'Dakar'} · Sénégal</span>
              </div>
            </div>

            {Boolean(step1.immatriculation) && (
              <span className="rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1 font-mono font-bold text-xs text-amber-900 tracking-wider">
                {step1.immatriculation.toUpperCase()}
              </span>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>{step2.nombrePlaces} places · {step1.transmission} · {step1.carburant}</span>
            <div className="text-right">
              <span className="font-display text-lg font-bold text-[#059669]">
                {(step5.prixParJour || 25000).toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-slate-500 text-[11px]"> / jour</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECAP SECTIONS */}

      {/* 1. Véhicule */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-fraunces text-sm font-semibold text-slate-900">
            <Car className="h-4 w-4 text-[#059669]" />
            <span>1. Véhicule & Caractéristiques</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(1)}
            className="flex items-center gap-1 text-xs font-bold text-[#047857] hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" /> Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div><span className="text-slate-500">Marque & Modèle :</span> <strong className="text-slate-900">{step1.marque} {step1.modele} ({step1.annee})</strong></div>
          <div><span className="text-slate-500">Immatriculation :</span> <strong className="text-slate-900">{step1.immatriculation || 'N/A'}</strong></div>
          <div><span className="text-slate-500">Transmission & Moteur :</span> <strong className="text-slate-900">{step1.transmission} · {step1.carburant}</strong></div>
          <div><span className="text-slate-500">Équipements :</span> <strong className="text-slate-900">{step2.equipements.length} sélectionné(s)</strong></div>
        </div>
      </div>

      {/* 2. Localisation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-fraunces text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-[#059669]" />
            <span>2. Localisation & Logistique</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="flex items-center gap-1 text-xs font-bold text-[#047857] hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" /> Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div><span className="text-slate-500">Ville principale :</span> <strong className="text-slate-900">{step3.ville}</strong></div>
          <div><span className="text-slate-500">Adresse :</span> <strong className="text-slate-900">{step3.adresse}</strong></div>
          <div>
            <span className="text-slate-500">Hors Dakar :</span>{' '}
            <strong className="text-slate-900">
              {step3.autoriseHorsDakar ? `Autorisé (+${step3.supplementHorsDakarParJour?.toLocaleString('fr-FR')} F/j)` : 'Non'}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Livraison AIBD :</span>{' '}
            <strong className="text-slate-900">
              {step3.proposeLivraisonAibd ? `${(step3.fraisLivraisonAibd || 0).toLocaleString('fr-FR')} FCFA` : 'Non'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Protection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-fraunces text-sm font-semibold text-slate-900">
            <Shield className="h-4 w-4 text-[#059669]" />
            <span>3. Protection & Conditions</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(4)}
            className="flex items-center gap-1 text-xs font-bold text-[#047857] hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" /> Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div><span className="text-slate-500">Formule d'Assurance :</span> <strong className="text-slate-900">{step4.assurance}</strong></div>
          <div><span className="text-slate-500">Politique Carburant :</span> <strong className="text-slate-900">{step4.carburantCondition}</strong></div>
        </div>
      </div>

      {/* 4. Tarification */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-fraunces text-sm font-semibold text-slate-900">
            <Banknote className="h-4 w-4 text-[#059669]" />
            <span>4. Tarification & Remises</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(5)}
            className="flex items-center gap-1 text-xs font-bold text-[#047857] hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" /> Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div><span className="text-slate-500">Tarif journalier de base :</span> <strong className="text-[#059669] font-bold">{step5.prixParJour.toLocaleString('fr-FR')} FCFA / j.</strong></div>
          <div><span className="text-slate-500">Paliers dégressifs :</span> <strong className="text-slate-900">{step5.tiers.length} configuré(s)</strong></div>
        </div>
      </div>

      {/* 5. Photos & Docs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-fraunces text-sm font-semibold text-slate-900">
            <Images className="h-4 w-4 text-[#059669]" />
            <span>5. Photos & Documents Légaux</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(6)}
            className="flex items-center gap-1 text-xs font-bold text-[#047857] hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" /> Modifier
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div><span className="text-slate-500">Photos HD :</span> <strong className="text-slate-900">{step6.photos.length} photo(s)</strong></div>
          <div>
            <span className="text-slate-500">Justificatifs :</span>{' '}
            <strong className="text-slate-900">
              {step6.carteGrise ? '✅ Carte Grise' : '📌 Carte Grise absente'} · {step6.assuranceDoc ? '✅ Assurance' : '📌 Assurance absente'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
