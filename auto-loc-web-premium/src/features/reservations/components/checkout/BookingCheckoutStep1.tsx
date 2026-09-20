'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Star, Truck, Compass } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { fetchApi } from '@/lib/config';
import { BookingPriceBreakdownCard } from './BookingPriceBreakdownCard';

interface BookingCheckoutStep1Props {
  vehicle: {
    id: string;
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    ville?: string;
    photoUrl?: string;
    photos?: Array<string | { url: string }>;
    prixParJour: number;
    tenantPricePerDay: number;
    joursMinimum?: number;
    proposeLivraisonDakar?: boolean;
    fraisLivraisonDakar?: number | null;
    proposeLivraisonAibd?: boolean;
    fraisLivraisonAibd?: number | null;
    fraisLivraison?: number | null;
    autoriseHorsDakar?: boolean;
    supplementHorsDakarParJour?: number | null;
    transmission?: string;
    carburant?: string;
    nombrePlaces?: number;
    note?: number;
  };
  startDate?: string;
  endDate?: string;
  onDatesChange: (start: string, end?: string) => void;
  typeLivraison: 'AUCUNE' | 'DAKAR' | 'AIBD';
  onSelectTypeLivraison: (type: 'AUCUNE' | 'DAKAR' | 'AIBD') => void;
  adresseLivraison: string;
  onAdresseLivraisonChange: (val: string) => void;
  isHorsDakarSelected: boolean;
  onToggleHorsDakar: (val: boolean) => void;
  onNext: () => void;
}

const formatShortDate = (value: string, withYear = false) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });

export function BookingCheckoutStep1({
  vehicle,
  startDate,
  endDate,
  onDatesChange,
  typeLivraison,
  onSelectTypeLivraison,
  adresseLivraison,
  onAdresseLivraisonChange,
  isHorsDakarSelected,
  onToggleHorsDakar,
  onNext,
}: BookingCheckoutStep1Props) {
  const [blockedRanges, setBlockedRanges] = useState<Array<{ from: string; to: string }>>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);

  // Vehicle photo principal
  const photoPrincipal = useMemo(() => {
    if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
      const p = vehicle.photos[0];
      return typeof p === 'string' ? p : p.url;
    }
    return vehicle.photoUrl || '/placeholder-car.jpg';
  }, [vehicle]);

  // Chargement des dates bloquées du véhicule
  useEffect(() => {
    if (vehicle.id) {
      setIsLoadingBlocked(true);
      fetchApi<{ blockedRanges: Array<{ from: string; to: string }> }>(`/vehicles/${vehicle.id}/blocked-dates`)
        .then((res) => {
          if (res?.blockedRanges) {
            setBlockedRanges(res.blockedRanges);
          }
        })
        .catch((err) => {
          console.warn('Erreur chargement dates bloquées:', err);
        })
        .finally(() => {
          setIsLoadingBlocked(false);
        });
    }
  }, [vehicle.id]);

  // Calcul du nombre de jours
  const nbJours = useMemo(() => {
    if (!startDate || !endDate) return vehicle.joursMinimum || 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : vehicle.joursMinimum || 1;
  }, [startDate, endDate, vehicle.joursMinimum]);

  // Vérification si la plage sélectionnée chevauche une période bloquée
  const isDatesBlocked = useMemo(() => {
    if (!startDate || !blockedRanges || blockedRanges.length === 0) return false;

    const parseIsoDate = (s: string): Date => {
      const parts = s.split('T')[0].split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const start = parseIsoDate(startDate);
    const end = endDate ? parseIsoDate(endDate) : start;

    for (const range of blockedRanges) {
      if (!range.from || !range.to) continue;
      const rStart = parseIsoDate(range.from);
      const rEnd = parseIsoDate(range.to);

      if (start <= rEnd && end >= rStart) {
        return true;
      }
    }

    return false;
  }, [startDate, endDate, blockedRanges]);

  return (
    <div className="space-y-6">
      {/* Layout 2 colonnes sur Desktop / 1 colonne sur Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Colonne de Gauche (col-span-7 sur Desktop): Fiche Véhicule & Sélecteur de Dates */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Carte Synthèse Véhicule Hero Showcase */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-100">
              <img
                src={photoPrincipal}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                className="w-full h-full object-cover"
              />
              {vehicle.type && (
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] text-[10px] font-bold uppercase tracking-wider">
                  {vehicle.type}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {Number(vehicle.note || 4.9).toFixed(1)}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {vehicle.ville || 'Dakar'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 leading-tight">
                {vehicle.marque} {vehicle.modele}{' '}
                {vehicle.annee ? (
                  <span className="text-slate-400 font-normal text-lg">({vehicle.annee})</span>
                ) : null}
              </h3>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
                {vehicle.transmission && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {vehicle.transmission}
                  </span>
                )}
                {vehicle.carburant && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {vehicle.carburant}
                  </span>
                )}
                {vehicle.nombrePlaces && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {vehicle.nombrePlaces} places
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-2xl font-display font-extrabold text-[#0A3D2E] tabular-nums">
                  {formatCurrency(vehicle.tenantPricePerDay)}
                </span>
                <span className="text-xs text-slate-500 font-medium">FCFA / jour</span>
              </div>
            </div>
          </div>

          {/* 2. Sélecteur de Dates & Périodes Bloquées */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0A3D2E] text-[#F1DFB6] flex items-center justify-center shrink-0 shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-display font-bold text-slate-900">
                    Dates de location
                  </h4>
                  <p className="text-xs text-slate-500">
                    Minimum {vehicle.joursMinimum || 1} jour(s) de réservation
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {nbJours} jour{nbJours > 1 ? 's' : ''} sélectionné{nbJours > 1 ? 's' : ''}
              </span>
            </div>

            {/* Inputs de dates directes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Date de début (Prise en main)
                </label>
                <input
                  type="date"
                  value={startDate ? startDate.split('T')[0] : ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => onDatesChange(e.target.value, endDate)}
                  className="w-full bg-transparent font-semibold text-slate-900 text-sm focus:outline-none cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Date de fin (Restitution)
                </label>
                <input
                  type="date"
                  value={endDate ? endDate.split('T')[0] : ''}
                  min={startDate ? startDate.split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={(e) => onDatesChange(startDate || '', e.target.value)}
                  className="w-full bg-transparent font-semibold text-slate-900 text-sm focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Alerte si les dates sont bloquées */}
            {isDatesBlocked && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-rose-900 text-sm">Période non disponible</p>
                  <p className="text-rose-700">
                    Ce véhicule est déjà réservé aux dates choisies. Veuillez sélectionner une autre période de disponibilité.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Politique d'Annulation & Sérénité */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 flex items-start gap-4 text-slate-700">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h5 className="font-bold text-slate-900 text-sm">
                Annulation gratuite & Garantie AutoLoc
              </h5>
              <p className="text-slate-600 leading-relaxed">
                Annulation sans frais jusqu'à 48h avant le début de la location. En cas de doute, notre équipe de support dédiée basée à Dakar vous assiste en continu.
              </p>
            </div>
          </div>

        </div>

        {/* Colonne de Droite (col-span-5 sur Desktop): Options & Décomposition Tarifaire */}
        <div className="lg:col-span-5 space-y-6">

          {/* 4. Options & Services Additionnels */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0A3D2E] text-[#F1DFB6] flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-display font-bold text-slate-900">
                  Options & Services
                </h4>
                <p className="text-xs text-slate-500">Personnalisez votre prise en main</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option Livraison Dakar / AIBD */}
              {(vehicle.proposeLivraisonDakar || vehicle.proposeLivraisonAibd || vehicle.fraisLivraison) && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Service de Livraison du véhicule
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
                      <input
                        type="radio"
                        name="typeLivraison"
                        checked={typeLivraison === 'AUCUNE'}
                        onChange={() => onSelectTypeLivraison('AUCUNE')}
                        className="accent-[#0A3D2E]"
                      />
                      <span className="font-semibold text-slate-800">
                        Récupération au point de retrait hôte (Gratuit)
                      </span>
                    </label>

                    {(vehicle.proposeLivraisonDakar || vehicle.fraisLivraison) && (
                      <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="typeLivraison"
                            checked={typeLivraison === 'DAKAR'}
                            onChange={() => onSelectTypeLivraison('DAKAR')}
                            className="accent-[#0A3D2E]"
                          />
                          <span className="font-semibold text-slate-800">
                            Livraison Dakar Métropole
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          +{formatCurrency(Number(vehicle.fraisLivraisonDakar ?? vehicle.fraisLivraison ?? 0))} FCFA
                        </span>
                      </label>
                    )}

                    {vehicle.proposeLivraisonAibd && (
                      <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="typeLivraison"
                            checked={typeLivraison === 'AIBD'}
                            onChange={() => onSelectTypeLivraison('AIBD')}
                            className="accent-[#0A3D2E]"
                          />
                          <span className="font-semibold text-slate-800">
                            Livraison Aéroport AIBD (Diass)
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          +{formatCurrency(Number(vehicle.fraisLivraisonAibd ?? 0))} FCFA
                        </span>
                      </label>
                    )}
                  </div>

                  {typeLivraison !== 'AUCUNE' && (
                    <div className="pt-1">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Adresse ou repère précis de livraison :
                      </label>
                      <input
                        type="text"
                        value={adresseLivraison}
                        onChange={(e) => onAdresseLivraisonChange(e.target.value)}
                        placeholder={
                          typeLivraison === 'AIBD'
                            ? 'Vol / Heure d’arrivée à AIBD'
                            : 'Ex: Mermoz Pyrotechnie, près de la banque...'
                        }
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Option Hors Dakar */}
              {vehicle.autoriseHorsDakar && (
                <label className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                  isHorsDakarSelected
                    ? 'border-[#0A3D2E] bg-[#F1DFB6]/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={isHorsDakarSelected}
                    onChange={(e) => onToggleHorsDakar(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-[#0A3D2E] cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#0A3D2E]" />
                        Trajets Hors Dakar (Régions / Inter-urbain)
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {vehicle.supplementHorsDakarParJour && vehicle.supplementHorsDakarParJour > 0
                          ? `+${formatCurrency(vehicle.supplementHorsDakarParJour)} FCFA/j`
                          : 'Gratuit'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Autorise la circulation vers Thiès, Saint-Louis, Saly, Casamance, etc.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* 5. Décomposition financière */}
          <BookingPriceBreakdownCard
            tenantPricePerDay={vehicle.tenantPricePerDay}
            nbJours={nbJours}
            typeLivraison={typeLivraison}
            fraisLivraisonDakar={vehicle.fraisLivraisonDakar}
            fraisLivraisonAibd={vehicle.fraisLivraisonAibd}
            fraisLivraison={vehicle.fraisLivraison}
            isHorsDakarSelected={isHorsDakarSelected}
            supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour}
          />

          {/* 6. Bouton CTA Étape 1 */}
          <button
            type="button"
            onClick={onNext}
            disabled={isDatesBlocked || !startDate || !endDate}
            className="w-full py-4 px-6 rounded-full bg-[#0A3D2E] hover:bg-[#0F4F3B] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-[#F1DFB6] font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <span>
              {isDatesBlocked
                ? 'Dates indisponibles'
                : 'Continuer vers le paiement'}
            </span>
            <ArrowRight className="w-5 h-5 text-[#F1DFB6]" />
          </button>

        </div>

      </div>
    </div>
  );
}
