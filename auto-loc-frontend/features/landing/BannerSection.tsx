'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Tag, Calendar, ArrowRight, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SearchFilters {
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
    if (filters.ville) params.set('zone', filters.ville);
    if (filters.type) params.set('type', filters.type);
    if (filters.prixMax) params.set('prixMax', filters.prixMax);
    if (filters.dateReservation) params.set('debut', filters.dateReservation);
    if (filters.dateRetour) params.set('fin', filters.dateRetour);
    router.push(`/vehicle?${params.toString()}`);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    /* Wrapper — padding-bottom = moitié de la hauteur du filtre pour que le contenu suivant ne soit pas caché */
    <div className="px-4 pt-1 lg:px-8 lg:pt-2 pb-[80px] lg:pb-[56px]">
      <section className="relative overflow-visible rounded-[2rem]">

        {/* ── Bannière photo ── hauteur fixe, le filtre déborde en bas ── */}
        <div className="relative min-h-[82vh] overflow-hidden rounded-[2rem]">

          {/* Photo de fond */}
          <Image
            src="/banner.JPG"
            alt="Location de véhicules au Sénégal — AutoLoc"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Overlay : fort en bas pour que le texte + le haut du filtre soient lisibles */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

          {/* ── Contenu interne ── */}
          <div className="relative z-10 flex min-h-[82vh] flex-col justify-end px-8 pb-20 pt-16 lg:px-16 lg:pb-24 lg:pt-20">

            {/* Accroche — poussée vers le bas, juste au-dessus du filtre */}
            <div className="max-w-2xl mb-10">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 mb-5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Disponible partout au Sénégal
                </span>
              </div>

              <h1 className="flex flex-col gap-3">
                {/* Ligne 1 — massive, dominante */}
                <span className="text-6xl font-black leading-[1.0] tracking-tight lg:text-7xl xl:text-8xl">
                  <span className="text-white">Vous cherchez </span>
                  <span className="text-emerald-400">un véhicule</span>
                  <span className="text-white"> ?</span>
                </span>

                {/* Ligne 2 — plus petite, légère, comme un murmure qui répond */}
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

        {/* ── Filtre flottant — déborde sur le contenu suivant ── */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            // Positionné en absolu, centré horizontalement, débordant en bas
            'absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-20',
            'w-[calc(100%-3rem)] max-w-5xl',
            // Style
            'flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/80 p-5',
            'shadow-2xl shadow-black/40 backdrop-blur-xl',
            'lg:flex-row lg:items-end lg:gap-3 lg:p-5',
          )}
        >
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

          <div className="hidden h-10 w-px bg-white/10 lg:block self-end mb-[2px]" />

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

          <div className="hidden h-10 w-px bg-white/10 lg:block self-end mb-[2px]" />

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

          <div className="hidden h-10 w-px bg-white/10 lg:block self-end mb-[2px]" />

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

          <div className="hidden h-10 w-px bg-white/10 lg:block self-end mb-[2px]" />

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
              'transition-all duration-200 lg:self-end',
            )}
          >
            Trouver
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

      </section>
    </div>
  );
}