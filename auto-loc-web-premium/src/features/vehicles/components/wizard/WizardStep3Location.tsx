'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin,
  Navigation,
  Compass,
  Truck,
  Plane,
  ChevronRight,
  Check,
  Search,
  X,
  ShieldCheck,
  Coins,
} from 'lucide-react';
import { Step3Data } from '../../stores/useVehicleDraftStore';
import { SENEGAL_LOCATIONS } from '../../constants/vehicleCatalog';

interface WizardStep3LocationProps {
  data: Step3Data;
  onChange: (updated: Partial<Step3Data>) => void;
}

const SUPPLEMENT_PRESETS = [3000, 5000, 10000, 15000];
const LIVRAISON_DAKAR_PRESETS = [0, 5000, 10000, 15000];
const LIVRAISON_AIBD_PRESETS = [15000, 20000, 25000, 30000];

export const WizardStep3Location: React.FC<WizardStep3LocationProps> = ({ data, onChange }) => {
  const [mounted, setMounted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const proposeLivraisonDakar = Boolean(
    data.proposeLivraisonDakar ?? data.proposeLivraison ?? (data.fraisLivraison && data.fraisLivraison > 0)
  );
  const proposeLivraisonAibd = Boolean(data.proposeLivraisonAibd);

  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SENEGAL_LOCATIONS;

    const result: Record<string, string[]> = {};
    Object.entries(SENEGAL_LOCATIONS).forEach(([region, cities]) => {
      const matchingCities = cities.filter((c) => c.toLowerCase().includes(query));
      if (matchingCities.length > 0 || region.toLowerCase().includes(query)) {
        result[region] = matchingCities.length > 0 ? matchingCities : cities;
      }
    });
    return result;
  }, [searchQuery]);

  const handleSelectLocation = (region: string, city: string) => {
    const locationString = region === 'Dakar' ? `Dakar (${city})` : city;
    onChange({ ville: locationString });
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleToggleHorsDakar = (val: boolean) => {
    onChange({
      autoriseHorsDakar: val,
      supplementHorsDakarParJour: val ? data.supplementHorsDakarParJour || 5000 : 0,
    });
  };

  const handleToggleLivraisonDakar = (val: boolean) => {
    const fee = val ? data.fraisLivraisonDakar || data.fraisLivraison || 5000 : 0;
    onChange({
      proposeLivraisonDakar: val,
      fraisLivraisonDakar: fee,
      proposeLivraison: val || proposeLivraisonAibd,
      fraisLivraison: val ? fee : proposeLivraisonAibd ? data.fraisLivraisonAibd || 0 : 0,
    });
  };

  const handleToggleLivraisonAibd = (val: boolean) => {
    const fee = val ? data.fraisLivraisonAibd || 20000 : 0;
    onChange({
      proposeLivraisonAibd: val,
      fraisLivraisonAibd: fee,
      proposeLivraison: proposeLivraisonDakar || val,
    });
  };

  const renderPortal = (content: React.ReactNode) => {
    if (!mounted || typeof window === 'undefined') return null;
    return createPortal(content, document.body);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-1 sm:space-y-2 pb-1 sm:pb-2">
        <div className="mx-auto hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-[#041912] border border-[#4ADE80]/30 text-[#4ADE80] shadow-md">
          <MapPin className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h2 className="font-fraunces font-normal text-xl sm:text-3xl text-slate-900 tracking-tight">Localisation & Logistique</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Définissez le point d'attache principal et vos options de livraison
        </p>
      </div>

      {/* Ville & Quartier */}
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 font-fraunces">
          <MapPin className="h-4 w-4 text-[#059669]" />
          <span>Ville & Zone d’attache *</span>
        </label>
        <p className="text-xs text-slate-500">Sélectionnez la ville principale où le véhicule sera restitué.</p>

        <button
          type="button"
          onClick={() => setModalVisible(true)}
          className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all ${
            data.ville
              ? 'border-[#059669] bg-[#F0FDF4] font-semibold text-[#047857]'
              : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${data.ville ? 'bg-[#041912] text-[#4ADE80]' : 'bg-slate-100 text-slate-500'}`}>
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] block text-slate-500 font-fraunces">Ville principale</span>
              <span>{data.ville || 'Sélectionner une ville (ex: Dakar, Saly...)'}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Adresse Exacte */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 font-fraunces">
          <Navigation className="h-4 w-4 text-[#059669]" />
          <span>Adresse ou Quartier exact *</span>
        </label>
        <p className="text-xs text-slate-500">Indiquez le lieu précis de prise en main (ex: Almadies, Rue des Baronnies).</p>

        <div className={`flex items-center rounded-xl border px-3.5 py-2.5 transition-all ${
          data.adresse ? 'border-[#059669] bg-[#F0FDF4]' : 'border-slate-200 bg-slate-50'
        }`}>
          <Navigation className={`h-4 w-4 mr-2 ${data.adresse ? 'text-[#059669]' : 'text-slate-400'}`} />
          <input
            type="text"
            value={data.adresse}
            onChange={(e) => onChange({ adresse: e.target.value })}
            placeholder="Ex: Almadies, Rue des Baronnies"
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {data.adresse && (
            <button type="button" onClick={() => onChange({ adresse: '' })}>
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Privacy Reassurance Badge */}
        <div className="flex items-start gap-2.5 rounded-xl bg-[#F0FDF4] border border-[#A7F3D0] p-3 text-xs text-[#166534]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#059669] mt-0.5" />
          <span>
            <strong>Confidentialité garantie :</strong> L’adresse exacte n’est partagée qu’après la confirmation de la réservation.
          </span>
        </div>
      </div>

      {/* Voyages Hors Dakar */}
      <div className={`space-y-3 rounded-2xl border p-4 shadow-sm transition-all ${
        data.autoriseHorsDakar ? 'border-[#059669] bg-[#F0FDF4]/60' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              data.autoriseHorsDakar ? 'bg-[#041912] text-[#4ADE80]' : 'bg-sky-100 text-sky-700'
            }`}>
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-sm font-semibold text-slate-900">Voyages Hors Dakar</h3>
              <p className="text-xs text-slate-500">Autoriser le locataire à sortir de la région de Dakar.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.autoriseHorsDakar}
            onClick={() => handleToggleHorsDakar(!data.autoriseHorsDakar)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              data.autoriseHorsDakar ? 'bg-[#059669]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                data.autoriseHorsDakar ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {data.autoriseHorsDakar && (
          <div className="border-t border-[#059669]/20 pt-3 space-y-3">
            <h4 className="font-fraunces text-xs font-semibold text-slate-800">Supplément journalier (FCFA / jour)</h4>
            <div className="flex flex-wrap gap-2">
              {SUPPLEMENT_PRESETS.map((preset) => {
                const isSelected = data.supplementHorsDakarParJour === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChange({ supplementHorsDakarParJour: preset })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected ? 'bg-[#041912] text-[#4ADE80] border-[#041912]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    +{preset.toLocaleString('fr-FR')} F
                  </button>
                );
              })}
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2 bg-white">
              <Coins className="h-4 w-4 text-[#059669] mr-2" />
              <input
                type="number"
                value={data.supplementHorsDakarParJour || ''}
                onChange={(e) => onChange({ supplementHorsDakarParJour: Number(e.target.value) || 0 })}
                placeholder="5000"
                className="flex-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
              />
              <span className="text-xs font-bold text-slate-500">FCFA / jour</span>
            </div>
          </div>
        )}
      </div>

      {/* Livraison Dakar */}
      <div className={`space-y-3 rounded-2xl border p-4 shadow-sm transition-all ${
        proposeLivraisonDakar ? 'border-[#059669] bg-[#F0FDF4]/60' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              proposeLivraisonDakar ? 'bg-[#041912] text-[#4ADE80]' : 'bg-purple-100 text-purple-700'
            }`}>
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-sm font-semibold text-slate-900">Livraison sur Dakar (Ville)</h3>
              <p className="text-xs text-slate-500">Livrer le véhicule à l'adresse ou à l'hôtel du locataire.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={proposeLivraisonDakar}
            onClick={() => handleToggleLivraisonDakar(!proposeLivraisonDakar)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              proposeLivraisonDakar ? 'bg-[#059669]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                proposeLivraisonDakar ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {proposeLivraisonDakar && (
          <div className="border-t border-[#059669]/20 pt-3 space-y-3">
            <h4 className="font-fraunces text-xs font-semibold text-slate-800">Frais de livraison Dakar (FCFA)</h4>
            <div className="flex flex-wrap gap-2">
              {LIVRAISON_DAKAR_PRESETS.map((preset) => {
                const isSelected = (data.fraisLivraisonDakar ?? data.fraisLivraison ?? 0) === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChange({ fraisLivraisonDakar: preset, fraisLivraison: preset })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected ? 'bg-[#041912] text-[#4ADE80] border-[#041912]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset === 0 ? 'Gratuit' : `${preset.toLocaleString('fr-FR')} F`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Livraison Aéroport AIBD */}
      <div className={`space-y-3 rounded-2xl border p-4 shadow-sm transition-all ${
        proposeLivraisonAibd ? 'border-[#059669] bg-[#F0FDF4]/60' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              proposeLivraisonAibd ? 'bg-[#041912] text-[#4ADE80]' : 'bg-amber-100 text-amber-700'
            }`}>
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-sm font-semibold text-slate-900">Livraison Aéroport AIBD (Diass)</h3>
              <p className="text-xs text-slate-500">Remettre le véhicule au parking des arrivées AIBD.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={proposeLivraisonAibd}
            onClick={() => handleToggleLivraisonAibd(!proposeLivraisonAibd)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              proposeLivraisonAibd ? 'bg-[#059669]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                proposeLivraisonAibd ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {proposeLivraisonAibd && (
          <div className="border-t border-[#059669]/20 pt-3 space-y-3">
            <h4 className="font-fraunces text-xs font-semibold text-slate-800">Frais de livraison AIBD (FCFA)</h4>
            <div className="flex flex-wrap gap-2">
              {LIVRAISON_AIBD_PRESETS.map((preset) => {
                const isSelected = (data.fraisLivraisonAibd ?? 0) === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChange({ fraisLivraisonAibd: preset })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected ? 'bg-[#041912] text-[#4ADE80] border-[#041912]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset.toLocaleString('fr-FR')} F
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Sélection Ville / Quartier */}
      {modalVisible && renderPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col my-auto border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-fraunces text-base font-semibold text-slate-900">Choix de la Ville / Zone</h3>
              <button type="button" onClick={() => setModalVisible(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville, Dakar, Saly, Thiès..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-[#059669] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
              {Object.entries(filteredLocations).map(([region, cities]) => (
                <div key={region} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#059669] uppercase tracking-wider font-fraunces">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{region}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {cities.map((city) => {
                      const locationString = region === 'Dakar' ? `Dakar (${city})` : city;
                      const isSelected = data.ville === locationString;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleSelectLocation(region, city)}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                            isSelected ? 'bg-[#F0FDF4] text-[#047857] font-bold border border-[#A7F3D0]' : 'hover:bg-slate-50 border border-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="truncate">{city}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#059669] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
