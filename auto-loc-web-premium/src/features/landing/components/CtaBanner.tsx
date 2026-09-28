'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/src/core/store/useUserStore';
import { IntentEngine } from '@/src/core/auth/intentEngine';
import { useHostGate } from '@/src/features/owner/hooks/useHostGate';
import { ReservationGateModal } from '@/src/features/reservations/components/ReservationGateModal';

export type CtaAction = {
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
};

export type CtaBannerProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  highlights?: string[];
  primary?: CtaAction;
  secondary?: CtaAction;
  className?: string;
};

const ROUTE_PATH = 'M-20 300 C 140 300, 180 120, 330 130 S 520 250, 680 40';

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M3.5 8h9m0 0L8.5 4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * CtaBanner — appel à l'action AutoLoc (version premium)
 * Panneau forêt à profondeur (halos + grain), route champagne animée,
 * carte verre dépoli, boutons pilule avec flèche.
 * Typo : Fraunces (titre, max 600) + Inter (texte, boutons).
 */
export default function CtaBanner({
  eyebrow = 'AutoLoc · Sénégal',
  title = 'Prêt à prendre la route ?',
  description = "Trouvez le véhicule qu'il vous faut, ou mettez le vôtre en location.",
  highlights = ['Paiement Wave/Orange Money', 'Hôtes vérifiés', 'Réservation rapide'],
  primary = { label: 'Explorer les véhicules', href: '/vehicles' },
  secondary = { label: 'Créer une annonce', href: '/dashboard/vehicles/new' },
  className = '',
}: CtaBannerProps) {
  const router = useRouter();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { canProceed, missingSteps, userAge } = useHostGate();
  const [ownerGateOpen, setOwnerGateOpen] = useState(false);
  const routeFadeId = useId().replace(/:/g, '');

  const handleActionClick = (e: React.MouseEvent, action: CtaAction) => {
    if (action.onClick) {
      action.onClick(e);
      return;
    }

    if (action.href.includes('/dashboard/vehicles/new') || action.href.includes('/vehicules/nouveau')) {
      e.preventDefault();

      if (!isAuthenticated) {
        const isAllowed = IntentEngine.guardAction('ADD_VEHICLE', {
          redirectToUrl: '/dashboard/vehicles/new',
          reasonMessage: 'Veuillez vous connecter pour créer une annonce sur AutoLoc.',
        });
        if (!isAllowed) {
          router.push('/login');
        }
        return;
      }

      if (missingSteps.length > 0 && !canProceed) {
        setOwnerGateOpen(true);
      } else {
        router.push('/dashboard/vehicles/new');
      }
    }
  };

  const handleOwnerGateCompleted = () => {
    setOwnerGateOpen(false);
    router.push('/dashboard/vehicles/new');
  };

  return (
    <>
      <section className={`px-4 sm:px-6 ${className}`}>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#0A3D2E] shadow-[0_40px_80px_-30px_rgba(10,61,46,0.55),0_12px_24px_-12px_rgba(10,61,46,0.35)] ring-1 ring-inset ring-white/10 sm:rounded-[44px]">
          {/* Profondeur : halos de lumière */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 80% at 100% 0%, rgba(241,223,182,0.16) 0%, transparent 60%), radial-gradient(50% 70% at 0% 100%, rgba(22,120,88,0.45) 0%, transparent 65%), linear-gradient(135deg, #0D4A38 0%, #0A3D2E 45%, #072B20 100%)',
            }}
          />

          {/* Grain subtil */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Route en pointillés : élément signature */}
          <svg
            aria-hidden="true"
            viewBox="0 0 640 320"
            fill="none"
            preserveAspectRatio="xMaxYMid slice"
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-[95%] sm:w-[70%]"
          >
            <defs>
              <linearGradient id={routeFadeId} x1="0" y1="0" x2="640" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#F1DFB6" stopOpacity="0" />
                <stop offset="0.35" stopColor="#F1DFB6" stopOpacity="0.55" />
                <stop offset="1" stopColor="#F1DFB6" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            <path
              d="M-20 340 C 150 340, 200 160, 340 170 S 540 290, 680 90"
              stroke="#F1DFB6"
              strokeWidth="1"
              strokeOpacity="0.18"
            />
            <path
              d={ROUTE_PATH}
              stroke={`url(#${routeFadeId})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 16"
            />

            {/* Destination */}
            <g transform="translate(560 86)">
              <circle r="18" fill="#F1DFB6" fillOpacity="0.12" />
              <circle r="9" fill="#F1DFB6" fillOpacity="0.25" />
              <circle r="4.5" fill="#F1DFB6" />
            </g>

            {/* Point mobile sur la route (masqué si mouvement réduit) */}
            <g className="motion-reduce:hidden">
              <circle r="10" fill="#F1DFB6" fillOpacity="0.2">
                <animateMotion dur="9s" repeatCount="indefinite" path={ROUTE_PATH} />
              </circle>
              <circle r="4" fill="#FFFFFF">
                <animateMotion dur="9s" repeatCount="indefinite" path={ROUTE_PATH} />
              </circle>
            </g>
          </svg>

          <div className="relative grid items-center gap-12 px-6 py-14 sm:px-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Contenu */}
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F1DFB6]/20 bg-[#F1DFB6]/[0.07] px-3.5 py-1.5 font-[family-name:var(--font-inter)] text-[12px] font-medium tracking-[0.04em] text-[#F1DFB6]/90 backdrop-blur-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F1DFB6] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#F1DFB6]" />
                </span>
                {eyebrow}
              </span>

              <h2 className="mt-6 font-[family-name:var(--font-fraunces)] text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[#F6EBCB] sm:text-[3.5rem]">
                {title}
              </h2>

              <p className="mt-5 max-w-md font-[family-name:var(--font-inter)] text-base leading-relaxed text-[#F1DFB6]/70 sm:text-lg">
                {description}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={primary.href}
                  onClick={(e) => handleActionClick(e, primary)}
                  className="group inline-flex items-center justify-between gap-3 rounded-full bg-[#F1DFB6] py-2 pl-7 pr-2 font-[family-name:var(--font-inter)] text-[15px] font-semibold text-[#0A3D2E] shadow-[0_10px_30px_-8px_rgba(241,223,182,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FBF3DD] hover:shadow-[0_16px_40px_-8px_rgba(241,223,182,0.55),inset_0_1px_0_rgba(255,255,255,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:justify-center"
                >
                  {primary.label}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A3D2E] text-[#F1DFB6] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105">
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                </Link>

                <Link
                  href={secondary.href}
                  onClick={(e) => handleActionClick(e, secondary)}
                  className="inline-flex items-center justify-center rounded-full border border-[#F1DFB6]/25 bg-white/[0.04] px-7 py-[18px] font-[family-name:var(--font-inter)] text-[15px] font-semibold leading-none text-[#F1DFB6] backdrop-blur-md transition-all duration-300 hover:border-[#F1DFB6]/60 hover:bg-[#F1DFB6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E]"
                >
                  {secondary.label}
                </Link>
              </div>

              {highlights.length > 0 && (
                <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 font-[family-name:var(--font-inter)] text-[13px] text-[#F1DFB6]/65">
                  {highlights.map((item) => (
                    <li key={item} className="inline-flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F1DFB6]/12 text-[#F1DFB6]">
                        <CheckIcon />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Carte verre dépoli (desktop) */}
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="ml-auto w-full max-w-[300px] -rotate-2 rounded-[28px] border border-white/15 bg-white/[0.07] p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-inter)] text-[11px] font-medium uppercase tracking-[0.14em] text-[#F1DFB6]/60">
                    Votre trajet
                  </span>
                  <span className="rounded-full bg-[#F1DFB6] px-2.5 py-1 font-[family-name:var(--font-inter)] text-[11px] font-semibold text-[#0A3D2E]">
                    Confirmé
                  </span>
                </div>

                <div className="mt-6 flex items-stretch gap-4">
                  <div className="flex flex-col items-center py-1">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-[#F1DFB6]" />
                    <span className="my-1 w-px flex-1 border-l border-dashed border-[#F1DFB6]/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F1DFB6]" />
                  </div>
                  <div className="flex flex-col gap-5">
                    <div>
                      <p className="font-[family-name:var(--font-inter)] text-[11px] text-[#F1DFB6]/50">Départ</p>
                      <p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-[#F6EBCB]">Dakar</p>
                    </div>
                    <div>
                      <p className="font-[family-name:var(--font-inter)] text-[11px] text-[#F1DFB6]/50">Arrivée</p>
                      <p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-[#F6EBCB]">Saly</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <span className="font-[family-name:var(--font-inter)] text-[12px] text-[#F1DFB6]/60">Paiement</span>
                  <span className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-[#F1DFB6]">Wave</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modale Host Gate s'il manque des étapes au propriétaire */}
      <ReservationGateModal
        visible={ownerGateOpen}
        mode="OWNER"
        missingSteps={missingSteps}
        userAge={userAge}
        onClose={() => setOwnerGateOpen(false)}
        onAllCompleted={handleOwnerGateCompleted}
      />
    </>
  );
}