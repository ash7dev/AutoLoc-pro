'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Bell,
  Mail,
  Smartphone,
  CalendarCheck2,
  Star,
  Megaphone,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Toggle ─────────────────────────────────────────────────────── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50',
        enabled ? 'bg-emerald-500' : 'bg-slate-200',
      )}
    >
      <span
        className={cn(
          'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md transition-transform duration-200',
          enabled ? 'translate-x-6' : 'translate-x-1',
        )}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

/* ── NotifRow ────────────────────────────────────────────────────── */
function NotifRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className={cn('w-4.5 h-4.5', iconColor)} strokeWidth={1.75} style={{ width: 18, height: 18 }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-slate-800 leading-snug">{title}</p>
        <p className="text-[12px] text-slate-400 mt-0.5 leading-snug">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</h2>
      </div>
      <div className="px-5 divide-y divide-slate-100">
        {children}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
const INITIAL = {
  reservationEmail: true,
  reservationPush: true,
  annulationEmail: true,
  annulationPush: false,
  rappelEmail: true,
  rappelPush: true,
  avisEmail: true,
  avisPush: false,
  newsEmail: false,
  newsPush: false,
};

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState(INITIAL);

  function toggle(key: keyof typeof INITIAL) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/dashboard/settings" className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <h1 className="text-[15px] font-bold text-slate-900">Notifications</h1>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-6">

        {/* Page title (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-[26px] font-black tracking-tight text-slate-900">Notifications</h1>
          <p className="text-[13.5px] text-slate-400 mt-1">
            Choisissez comment et quand vous souhaitez être notifié.
          </p>
        </div>

        {/* Réservations */}
        <Section title="Réservations">
          <NotifRow
            icon={Mail}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
            title="Nouvelle réservation — Email"
            description="Recevez un email à chaque nouvelle demande."
            enabled={prefs.reservationEmail}
            onToggle={() => toggle('reservationEmail')}
          />
          <NotifRow
            icon={Smartphone}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
            title="Nouvelle réservation — Push"
            description="Notification instantanée sur votre téléphone."
            enabled={prefs.reservationPush}
            onToggle={() => toggle('reservationPush')}
          />
        </Section>

        {/* Annulations */}
        <Section title="Annulations">
          <NotifRow
            icon={XCircle}
            iconBg="bg-red-50"
            iconColor="text-red-400"
            title="Annulation — Email"
            description="Soyez averti si un locataire annule."
            enabled={prefs.annulationEmail}
            onToggle={() => toggle('annulationEmail')}
          />
          <NotifRow
            icon={Smartphone}
            iconBg="bg-red-50"
            iconColor="text-red-400"
            title="Annulation — Push"
            description="Alerte push en cas d'annulation."
            enabled={prefs.annulationPush}
            onToggle={() => toggle('annulationPush')}
          />
        </Section>

        {/* Rappels */}
        <Section title="Rappels de check-in / check-out">
          <NotifRow
            icon={CalendarCheck2}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="Rappel — Email"
            description="48h avant chaque début ou fin de location."
            enabled={prefs.rappelEmail}
            onToggle={() => toggle('rappelEmail')}
          />
          <NotifRow
            icon={Smartphone}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="Rappel — Push"
            description="Rappel push avant votre prochain rendez-vous."
            enabled={prefs.rappelPush}
            onToggle={() => toggle('rappelPush')}
          />
        </Section>

        {/* Avis */}
        <Section title="Avis & évaluations">
          <NotifRow
            icon={Star}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            title="Nouvel avis — Email"
            description="Un locataire a laissé un avis sur votre véhicule."
            enabled={prefs.avisEmail}
            onToggle={() => toggle('avisEmail')}
          />
          <NotifRow
            icon={Smartphone}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            title="Nouvel avis — Push"
            description="Notification immédiate pour chaque évaluation."
            enabled={prefs.avisPush}
            onToggle={() => toggle('avisPush')}
          />
        </Section>

        {/* Actualités */}
        <Section title="Actualités AutoLoc">
          <NotifRow
            icon={Megaphone}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
            title="Actualités — Email"
            description="Nouvelles fonctionnalités, offres et mises à jour."
            enabled={prefs.newsEmail}
            onToggle={() => toggle('newsEmail')}
          />
          <NotifRow
            icon={Smartphone}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
            title="Actualités — Push"
            description="Restez informé des dernières nouvelles AutoLoc."
            enabled={prefs.newsPush}
            onToggle={() => toggle('newsPush')}
          />
        </Section>

        <p className="text-center text-[11.5px] text-slate-300 pb-2">
          La gestion fine des notifications sera synchronisée prochainement.
        </p>
      </div>
    </div>
  );
}
