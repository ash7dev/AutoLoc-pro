'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Tag, Calendar, ArrowRight, Car, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SearchFilters {
  q: string;
  ville: string;
  type: string;
  prixMax: string;
  dateReservation: string;
  dateRetour: string;
}

// ─── Données statiques ────────────────────────────────────────────────────────
const ZONES_DAKAR = [
  { value: '',                          label: 'Toutes les zones'                          },
  { value: 'almadies-ngor-mamelles',    label: 'Almadies – Ngor – Mamelles'               },
  { value: 'ouakam-yoff',               label: 'Ouakam – Yoff'                            },
  { value: 'mermoz-sacrecoeur-ckg',     label: 'Mermoz – Sacré-Cœur – Cité Keur Gorgui'  },
  { value: 'plateau-medina-gueuletapee',label: 'Plateau – Médina – Gueule Tapée'          },
  { value: 'liberte-sicap-granddakar',  label: 'Liberté – Sicap – Grand Dakar'            },
  { value: 'parcelles-grandyoff',       label: 'Parcelles Assainies – Grand Yoff'         },
  { value: 'pikine-guediawaye',         label: 'Pikine – Guédiawaye'                      },
  { value: 'keurmassar-rufisque',       label: 'Keur Massar – Rufisque'                   },
];

const TYPES_VEHICULES = [
  { value: '',          label: 'Tous les types' },
  { value: 'BERLINE',   label: 'Berline'        },
  { value: 'SUV',       label: 'SUV'            },
  { value: 'CITADINE',  label: 'Citadine'       },
  { value: '4X4',       label: '4x4'            },
  { value: 'PICKUP',    label: 'Pick-up'        },
  { value: 'MONOSPACE', label: 'Monospace'      },
  { value: 'MINIBUS',   label: 'Minibus'        },
  { value: 'UTILITAIRE',label: 'Utilitaire'     },
  { value: 'LUXE',      label: 'Luxe'           },
];

const PRIX_MAX_OPTIONS = [
  { value: '', label: 'Tous les prix' },
  { value: '15000', label: "Jusqu'à 15 000 FCFA" },
  { value: '30000', label: "Jusqu'à 30 000 FCFA" },
  { value: '50000', label: "Jusqu'à 50 000 FCFA" },
  { value: '100000', label: "Jusqu'à 100 000 FCFA" },
];

// ─── Styles champs ────────────────────────────────────────────────────────────
const FIELD_CLASS = cn(
  'w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5',
  'text-[13.5px] font-medium text-white placeholder-white/40 backdrop-blur-sm transition-all duration-200',
  'focus:border-emerald-400/60 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-emerald-400/40',
);

const LABEL_CLASS =
  'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5';

// ─── Bannière Hero ────────────────────────────────────────────────────────────
export function BannerSection(): React.ReactElement {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    ville: '',
    type: '',
    prixMax: '',
    dateReservation: '',
    dateRetour: '',
  });

  function handleChange(field: keyof SearchFilters, value: string): void {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.ville) params.set('zone', filters.ville);
    if (filters.type) params.set('type', filters.type);
    if (filters.prixMax) params.set('prixMax', filters.prixMax);
    if (filters.dateReservation) params.set('debut', filters.dateReservation);
    if (filters.dateRetour) params.set('fin', filters.dateRetour);
    router.push(`/vehicle?${params.toString()}`);
  }

  const today = new Date().toISOString().split('T')[0];

  // Badge filtres actifs (hors texte)
  const activeFiltersCount = [
    filters.ville,
    filters.type,
    filters.prixMax,
    filters.dateReservation,
    filters.dateRetour,
  ].filter(Boolean).length;

  return (
    <div className="px-4 pt-1 lg:px-8 lg:pt-2 lg:pb-[56px]">
      <section className="relative overflow-visible rounded-[2rem]">

        {/* ── Bannière photo ── */}
        <div className="relative min-h-[65vh] lg:min-h-[82vh] overflow-hidden rounded-[2rem]">

          <Image
            src="/banner.JPG"
            alt="Location de véhicules au Sénégal — AutoLoc"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

          <div className="relative z-10 flex min-h-[65vh] lg:min-h-[82vh] flex-col justify-end px-8 pb-20 pt-16 lg:px-16 lg:pb-24 lg:pt-20">
            <div className="max-w-2xl mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 mb-5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Disponible partout au Sénégal
                </span>
              </div>

              <h1 className="flex flex-col gap-3">
                <span className="text-5xl font-black leading-[1.0] tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
                  <span className="text-white">Vous cherchez </span>
                  <span className="text-emerald-400">un véhicule</span>
                  <span className="text-white"> ?</span>
                </span>
                <span className="text-2xl font-semibold leading-snug tracking-tight text-white/60 lg:text-3xl xl:text-[2rem]">
                  Vous êtes à{' '}
                  <span className="text-emerald-400/80 font-bold">l&apos;endroit parfait.</span>
                </span>
              </h1>

              <p className="mt-4 text-[15px] font-medium text-white/60 max-w-md leading-relaxed">
                Des centaines d&apos;annonces vérifiées, partout au Sénégal.
                Réservez en quelques clics.
              </p>
            </div>
          </div>
        </div>

        {/* ── Filtre flottant ── */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            // Mobile : carte en flux normal, juste sous le banner
            'w-full rounded-2xl border border-white/10 bg-slate-950 mt-3',
            // Desktop : flottant centré qui déborde sur le contenu suivant
            'lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:bottom-0 lg:translate-y-1/2 lg:z-20',
            'lg:w-[calc(100%-3rem)] lg:max-w-5xl lg:bg-black/80 lg:mt-0',
            'shadow-2xl shadow-black/40 backdrop-blur-xl',
          )}
        >

          {/* ── MOBILE : recherche + sheet filtres ── */}
          <div className="lg:hidden flex flex-col gap-3 p-4">

            {/* Label */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Search className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Rechercher un véhicule
              </span>
            </div>

            {/* Champ texte */}
            <input
              type="text"
              placeholder="Berline, SUV, Toyota Prado..."
              value={filters.q}
              onChange={(e) => handleChange('q', e.target.value)}
              className={FIELD_CLASS}
            />

            {/* Boutons */}
            <div className="flex gap-2">

              {/* Filtres → Sheet du bas */}
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl px-4',
                      'border border-white/15 bg-white/10 text-white',
                      'text-[13px] font-medium tracking-tight',
                      'hover:bg-white/15 active:bg-white/20 transition-all duration-200',
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-emerald-400 text-black text-[10px] font-bold flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="bottom"
                  className="bg-slate-950 border-white/10 text-white rounded-t-2xl px-4 pb-8"
                >
                  <SheetHeader className="mb-5">
                    <SheetTitle className="text-white text-[15px] font-bold tracking-tight">
                      Filtres de recherche
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-4">
                    {/* Ville */}
                    <div>
                      <label className={LABEL_CLASS}>
                        <MapPin className="h-3 w-3" /> Ville
                      </label>
                      <select
                        value={filters.ville}
                        onChange={(e) => handleChange('ville', e.target.value)}
                        className={FIELD_CLASS}
                      >
                        {ZONES_DAKAR.map(({ value, label }) => (
                          <option key={value} value={value} className="bg-slate-900 text-white">
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Type */}
                    <div>
                      <label className={LABEL_CLASS}>
                        <Car className="h-3 w-3" /> Type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className={FIELD_CLASS}
                      >
                        {TYPES_VEHICULES.map(({ value, label }) => (
                          <option key={value} value={value} className="bg-slate-900 text-white">
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className={LABEL_CLASS}>
                        <Tag className="h-3 w-3" /> Budget / jour
                      </label>
                      <select
                        value={filters.prixMax}
                        onChange={(e) => handleChange('prixMax', e.target.value)}
                        className={FIELD_CLASS}
                      >
                        {PRIX_MAX_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value} className="bg-slate-900 text-white">
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS}>
                          <Calendar className="h-3 w-3" /> Prise en charge
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={filters.dateReservation}
                          onChange={(e) => handleChange('dateReservation', e.target.value)}
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>
                          <Calendar className="h-3 w-3" /> Date de retour
                        </label>
                        <input
                          type="date"
                          min={filters.dateReservation || today}
                          value={filters.dateRetour}
                          onChange={(e) => handleChange('dateRetour', e.target.value)}
                          className={FIELD_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Soumettre */}
              <button
                type="submit"
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl px-4',
                  'bg-black border border-emerald-400/30 text-emerald-400',
                  'text-[13px] font-semibold tracking-tight',
                  'hover:bg-emerald-400 hover:text-black hover:border-emerald-400',
                  'transition-all duration-200',
                )}
              >
                Trouver
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── DESKTOP : filtre complet inchangé ── */}
          <div className="hidden lg:flex items-end gap-3 p-5">

            {/* Ville */}
            <div className="flex-1 min-w-0">
              <label className={LABEL_CLASS}>
                <MapPin className="h-3 w-3" /> Ville
              </label>
              <select
                value={filters.ville}
                onChange={(e) => handleChange('ville', e.target.value)}
                className={FIELD_CLASS}
              >
                {ZONES_DAKAR.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-slate-900 text-white">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-10 w-px bg-white/10 self-end mb-[2px]" />

            {/* Type */}
            <div className="flex-1 min-w-0">
              <label className={LABEL_CLASS}>
                <Car className="h-3 w-3" /> Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={FIELD_CLASS}
              >
                {TYPES_VEHICULES.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-slate-900 text-white">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-10 w-px bg-white/10 self-end mb-[2px]" />

            {/* Prix */}
            <div className="flex-1 min-w-0">
              <label className={LABEL_CLASS}>
                <Tag className="h-3 w-3" /> Budget / jour
              </label>
              <select
                value={filters.prixMax}
                onChange={(e) => handleChange('prixMax', e.target.value)}
                className={FIELD_CLASS}
              >
                {PRIX_MAX_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-slate-900 text-white">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-10 w-px bg-white/10 self-end mb-[2px]" />

            {/* Prise en charge */}
            <div className="flex-1 min-w-0">
              <label className={LABEL_CLASS}>
                <Calendar className="h-3 w-3" /> Prise en charge
              </label>
              <input
                type="date"
                min={today}
                value={filters.dateReservation}
                onChange={(e) => handleChange('dateReservation', e.target.value)}
                className={FIELD_CLASS}
              />
            </div>

            <div className="h-10 w-px bg-white/10 self-end mb-[2px]" />

            {/* Date de retour */}
            <div className="flex-1 min-w-0">
              <label className={LABEL_CLASS}>
                <Calendar className="h-3 w-3" /> Date de retour
              </label>
              <input
                type="date"
                min={filters.dateReservation || today}
                value={filters.dateRetour}
                onChange={(e) => handleChange('dateRetour', e.target.value)}
                className={FIELD_CLASS}
              />
            </div>

            {/* Bouton */}
            <button
              type="submit"
              className={cn(
                'shrink-0 inline-flex items-center justify-center gap-2 h-10 rounded-xl px-5',
                'bg-black border border-emerald-400/30 text-emerald-400',
                'text-[13px] font-semibold tracking-tight',
                'hover:bg-emerald-400 hover:text-black hover:border-emerald-400',
                'shadow-md shadow-black/20 hover:shadow-lg hover:shadow-emerald-400/25',
                'hover:-translate-y-px active:translate-y-0',
                'transition-all duration-200 self-end',
              )}
            >
              Trouver
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </form>

      </section>
    </div>
  );
}
