'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  MessageCircle,
  Mail,
  Clock,
  Headphones,
  BookOpen,
  AlertCircle,
  Car,
  Banknote,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── FAQ Item ────────────────────────────────────────────────────── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left"
    >
      <div className="flex items-center justify-between gap-4 py-4">
        <span className="text-[14px] font-semibold text-slate-800 leading-snug">{question}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </div>
      {open && (
        <div className="pb-4 -mt-2">
          <p className="text-[13px] text-slate-500 leading-relaxed">{answer}</p>
        </div>
      )}
    </button>
  );
}

/* ── Contact card ────────────────────────────────────────────────── */
function ContactCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  action,
  href,
  badge,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  action: string;
  href: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-200"
    >
      <span className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[14.5px] font-bold text-slate-800 leading-snug">{title}</p>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <span className="text-[12.5px] font-semibold text-emerald-600 group-hover:text-emerald-700 flex-shrink-0">
        {action} →
      </span>
    </a>
  );
}

/* ── FAQ data ────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    icon: Car,
    category: 'Véhicules',
    items: [
      {
        question: 'Comment ajouter un nouveau véhicule ?',
        answer:
          'Rendez-vous dans "Véhicules" depuis le menu, puis cliquez sur "Ajouter un véhicule". Remplissez les informations demandées (photos, description, prix par jour, disponibilités) et soumettez votre annonce. Elle sera visible après validation.',
      },
      {
        question: 'Comment bloquer des dates de disponibilité ?',
        answer:
          'Dans la fiche d\'un véhicule, accédez à l\'onglet "Réservations" et sélectionnez les dates auxquelles le véhicule est indisponible. Ces dates seront automatiquement bloquées pour les locataires.',
      },
      {
        question: 'Combien de véhicules puis-je ajouter ?',
        answer:
          'Il n\'y a pas de limite au nombre de véhicules que vous pouvez ajouter sur AutoLoc. Plus votre flotte est grande, plus vous avez de chances de générer des revenus.',
      },
    ],
  },
  {
    icon: Banknote,
    category: 'Paiements & Portefeuille',
    items: [
      {
        question: 'Quand est-ce que je reçois mon paiement ?',
        answer:
          'Le paiement est débloqué 24h après la confirmation de remise du véhicule par le locataire, ou automatiquement 48h après la fin de la location. Les fonds sont versés sur votre portefeuille AutoLoc.',
      },
      {
        question: 'Comment retirer mes gains ?',
        answer:
          'Dans la section "Portefeuille", cliquez sur "Retirer". Vous pouvez retirer via Wave ou Orange Money. Les retraits sont traités sous 24-48h ouvrables.',
      },
      {
        question: 'Quels sont les frais prélevés par AutoLoc ?',
        answer:
          'AutoLoc prélève une commission de service sur chaque location. Le détail des frais est visible avant toute confirmation de réservation.',
      },
    ],
  },
  {
    icon: FileText,
    category: 'Réservations',
    items: [
      {
        question: 'Que se passe-t-il si un locataire annule ?',
        answer:
          'En cas d\'annulation par le locataire, vous serez notifié immédiatement. Selon la politique d\'annulation, vous pourriez recevoir une compensation partielle ou totale selon le délai d\'annulation.',
      },
      {
        question: 'Comment refuser une réservation ?',
        answer:
          'Depuis la page "Réservations", ouvrez la demande en attente et cliquez sur "Refuser". Nous vous encourageons à répondre dans les 24h pour maintenir un bon taux de réponse.',
      },
    ],
  },
];

/* ── Page ───────────────────────────────────────────────────────── */
export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/dashboard/settings" className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <h1 className="text-[15px] font-bold text-slate-900">Aide & Support</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-7">

        {/* Page title (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-[26px] font-black tracking-tight text-slate-900">Aide & Support</h1>
          <p className="text-[13.5px] text-slate-400 mt-1">
            Notre équipe est disponible pour vous aider.
          </p>
        </div>

        {/* Availability banner */}
        <div className="flex items-center gap-4 px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/25">
            <Headphones className="w-5 h-5 text-white" strokeWidth={1.75} />
          </span>
          <div className="flex-1">
            <p className="text-[13.5px] font-bold text-emerald-800">Support disponible</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-emerald-500" strokeWidth={2} />
              <span className="text-[12px] text-emerald-600">Lun–Sam · 8h00 – 20h00 (WAT)</span>
            </div>
          </div>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11.5px] font-semibold text-emerald-600">En ligne</span>
          </span>
        </div>

        {/* Contact channels */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Nous contacter</h2>
          <ContactCard
            icon={MessageCircle}
            iconBg="bg-green-50"
            iconColor="text-green-500"
            title="WhatsApp"
            subtitle="Réponse rapide garantie en moins de 2h"
            action="Écrire"
            href="https://wa.me/221XXXXXXXXX?text=Bonjour%20AutoLoc%2C%20j'ai%20besoin%20d'aide."
            badge="Recommandé"
          />
          <ContactCard
            icon={Mail}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="Email"
            subtitle="support@autoloc.sn — réponse sous 24h"
            action="Envoyer"
            href="mailto:support@autoloc.sn?subject=Support%20AutoLoc"
          />
        </div>

        {/* FAQ by category */}
        {FAQ_ITEMS.map(({ icon: Icon, category, items }) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{category}</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 divide-y divide-slate-100">
              {items.map((item) => (
                <FaqItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}

        {/* Bottom help note */}
        <div className="flex items-start gap-3 px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <AlertCircle className="w-4.5 h-4.5 text-slate-300 flex-shrink-0 mt-0.5" strokeWidth={1.75} style={{ width: 18, height: 18 }} />
          <div>
            <p className="text-[13px] font-semibold text-slate-700">Vous ne trouvez pas votre réponse ?</p>
            <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
              Contactez-nous directement via WhatsApp ou email. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <a
              href="https://wa.me/221XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-[12.5px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Contacter le support →
            </a>
          </div>
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
}
