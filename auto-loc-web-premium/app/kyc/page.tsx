'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  Clock,
  FileText,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { GateStepKycIdentity } from '@/src/features/reservations/components/gates/GateStepKycIdentity';
import { useUserStore } from '@/src/core/store/useUserStore';

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';

type TimelineState = 'done' | 'current' | 'todo';

function TimelineStep({
  label,
  hint,
  state,
  last = false,
}: {
  label: string;
  hint: string;
  state: TimelineState;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className={`absolute left-[15px] top-8 bottom-0 w-px ${state === 'done' ? 'bg-emerald-300' : 'bg-slate-200'
            }`}
        />
      )}
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${state === 'done'
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : state === 'current'
              ? 'border-amber-400 bg-amber-50 text-amber-700 ring-4 ring-amber-100'
              : 'border-slate-200 bg-white text-slate-400'
          }`}
      >
        {state === 'done' ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : state === 'current' ? (
          <Clock className="h-4 w-4" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        )}
      </span>
      <div className="pt-0.5">
        <p
          className={`text-sm font-semibold ${state === 'todo' ? 'text-slate-400' : 'text-slate-900'
            }`}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p>
      </div>
    </li>
  );
}

export default function KycPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [submitted, setSubmitted] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  const isVerified =
    (user?.statutKyc as string) === 'VALIDE' || user?.statutKyc === 'VERIFIE';
  const isPending =
    !resubmitting && (user?.statutKyc === 'EN_ATTENTE' || submitted);

  const handleSuccess = () => {
    setSubmitted(true);
    setResubmitting(false);
  };

  const handleResubmit = () => {
    setSubmitted(false);
    setResubmitting(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF4] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Retour */}
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-xs transition-colors hover:border-emerald-300 hover:text-[#0A3D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-700" />
          Retour au profil
        </Link>

        {/* ───────── Vérifié ───────── */}
        {isVerified ? (
          <section
            className="relative overflow-hidden rounded-[28px] px-6 py-12 text-center sm:px-12 sm:py-16"
            style={{ backgroundColor: FOREST }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.07]"
              style={{ backgroundColor: CHAMPAGNE }}
            />
            <div
              className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: CHAMPAGNE }}
            >
              <BadgeCheck className="h-10 w-10" style={{ color: FOREST }} />
            </div>
            <h1
              className="relative mt-6 font-fraunces text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ color: CHAMPAGNE }}
            >
              Identité vérifiée
            </h1>
            <p className="relative mx-auto mt-3 max-w-sm text-sm leading-relaxed text-emerald-50/80">
              Vous pouvez réserver instantanément et vous êtes couvert par l'assurance
              AutoLoc.
            </p>
            <Link
              href="/dashboard/profile"
              className="relative mt-8 inline-flex items-center rounded-full px-7 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E]"
              style={{ backgroundColor: CHAMPAGNE, color: FOREST }}
            >
              Voir mon profil
            </Link>
          </section>
        ) : isPending ? (
          /* ───────── En cours d'examen ───────── */
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-amber-100 bg-amber-50/60 px-6 py-8 text-center sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-white">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h1 className="mt-4 font-fraunces text-2xl font-semibold tracking-tight text-[#0A3D2E] sm:text-3xl">
                Dossier en cours d'examen
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                Vos documents ont bien été transmis. Vous recevrez une notification et un
                email dès que la vérification sera terminée.
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10">
              <ol>
                <TimelineStep
                  state="done"
                  label="Documents reçus"
                  hint="Pièce d'identité et selfie enregistrés."
                />
                <TimelineStep
                  state="current"
                  label="Vérification par notre équipe"
                  hint="Nous comparons votre pièce et votre selfie."
                />
                <TimelineStep
                  state="todo"
                  label="Réservation instantanée débloquée"
                  hint="Vous serez notifié dès la validation."
                  last
                />
              </ol>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:px-10">
              <p className="text-xs text-slate-500">Un document illisible ou erroné ?</p>
              <button
                type="button"
                onClick={handleResubmit}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#0A3D2E] hover:text-[#0A3D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Envoyer de nouvelles pièces
              </button>
            </div>
          </section>
        ) : (
          /* ───────── Formulaire ───────── */
          <>
            <section
              className="relative overflow-hidden rounded-[28px] px-6 py-9 sm:px-10 sm:py-12"
              style={{ backgroundColor: FOREST }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-[0.07]"
                style={{ backgroundColor: CHAMPAGNE }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <h1
                  className="max-w-md font-fraunces text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
                  style={{ color: CHAMPAGNE }}
                >
                  Vérifiez votre identité pour réserver en un clic
                </h1>
                <span
                  className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full sm:flex"
                  style={{ backgroundColor: 'rgba(241,223,182,0.12)' }}
                >
                  <ShieldCheck className="h-6 w-6" style={{ color: CHAMPAGNE }} />
                </span>
              </div>

              <ul className="relative mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: FileText,
                    title: "Pièce d'identité",
                    text: 'CNI ou passeport, lisible et en cours de validité.',
                  },
                  {
                    icon: Camera,
                    title: 'Selfie',
                    text: 'Visage dégagé, en pleine lumière.',
                  },
                  {
                    icon: BadgeCheck,
                    title: 'Validation',
                    text: 'Notre équipe vérifie votre dossier.',
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: 'rgba(241,223,182,0.18)',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: CHAMPAGNE }} />
                    <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-50/70">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <GateStepKycIdentity onSuccess={handleSuccess} />
            </section>

            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-emerald-700" />
              Vos documents ne sont consultés que par l'équipe sécurité AutoLoc.
            </p>
          </>
        )}
      </div>
    </div>
  );
}