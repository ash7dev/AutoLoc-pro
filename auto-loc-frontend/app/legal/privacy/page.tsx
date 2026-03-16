import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Lock, Database, Users, Eye, Trash2, Share2,
  Shield, Bell, Mail, ChevronRight, ArrowLeft, FileText, Globe,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — AutoLoc',
  description: 'Découvrez comment AutoLoc collecte, utilise et protège vos données personnelles conformément au RGPD et à la législation sénégalaise.',
};

/* ════════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════════ */
const SECTIONS = [
  {
    id: 'responsable',
    num: '01',
    title: 'Responsable du traitement',
    icon: Shield,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>
          Le responsable du traitement de vos données personnelles est la société <strong className="text-slate-800">AutoLoc</strong>,
          plateforme numérique d&apos;intermédiation pour la location de véhicules entre particuliers,
          opérant au Sénégal.
        </p>
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Société</p>
            <p className="font-semibold text-slate-800">AutoLoc SN</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Email DPO</p>
            <p className="font-semibold text-slate-800">privacy@autoloc.sn</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Adresse</p>
            <p className="font-semibold text-slate-800">Dakar, Sénégal</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Téléphone</p>
            <p className="font-semibold text-slate-800">+221 33 800 12 34</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'donnees-collectees',
    num: '02',
    title: 'Données que nous collectons',
    icon: Database,
    content: (
      <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
        <p>Nous collectons uniquement les données nécessaires au bon fonctionnement de la plateforme :</p>
        <div className="space-y-3">
          {[
            {
              cat: 'Données d\'identité',
              items: ['Nom et prénom', 'Adresse e-mail', 'Numéro de téléphone', 'Photo de profil (optionnelle)'],
            },
            {
              cat: 'Données de réservation',
              items: ['Dates de location', 'Véhicule réservé', 'Historique des transactions', 'Coordonnées des parties'],
            },
            {
              cat: 'Données de navigation',
              items: ['Adresse IP', 'Type de navigateur', 'Pages consultées', 'Durée des sessions (cookies analytiques)'],
            },
            {
              cat: 'Données de vérification',
              items: ['Pièce d\'identité (vérification unique)', 'Permis de conduire (pour les locataires)'],
            },
          ].map(({ cat, items }) => (
            <div key={cat} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <span key={item} className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'finalites',
    num: '03',
    title: 'Pourquoi nous utilisons vos données',
    icon: Eye,
    content: (
      <div className="text-[14px] text-slate-600 leading-relaxed">
        <p className="mb-4">Vos données sont utilisées exclusivement pour les finalités suivantes :</p>
        <div className="space-y-2.5">
          {[
            ['Gestion des comptes', 'Création, authentification et gestion de votre espace personnel sur la plateforme.'],
            ['Mise en relation', 'Faciliter le contact entre propriétaires et locataires lors d\'une réservation.'],
            ['Traitement des paiements', 'Sécuriser et tracer les transactions financières entre les parties.'],
            ['Contrats de location', 'Générer et archiver les contrats de location horodatés.'],
            ['Service client', 'Répondre à vos demandes d\'assistance et résoudre les litiges.'],
            ['Amélioration du service', 'Analyser les usages anonymisés pour améliorer l\'expérience utilisateur.'],
            ['Obligations légales', 'Se conformer aux obligations légales et réglementaires applicables au Sénégal.'],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mt-0.5">
                <span className="text-[9px] font-black text-emerald-600">{i + 1}</span>
              </span>
              <div>
                <span className="font-semibold text-slate-800">{title} : </span>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'base-legale',
    num: '04',
    title: 'Base légale du traitement',
    icon: FileText,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>Conformément au RGPD et à la loi sénégalaise sur les données personnelles, nos traitements reposent sur les bases légales suivantes :</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { base: 'Exécution du contrat', desc: 'Pour tout ce qui est nécessaire à la fourniture de notre service de mise en relation.' },
            { base: 'Consentement', desc: 'Pour l\'envoi de communications marketing et l\'utilisation de cookies non essentiels.' },
            { base: 'Obligation légale', desc: 'Pour la conservation des données de facturation et de vérification d\'identité.' },
            { base: 'Intérêt légitime', desc: 'Pour la prévention de la fraude, la sécurité de la plateforme et l\'amélioration du service.' },
          ].map(({ base, desc }) => (
            <div key={base} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="font-semibold text-slate-800 text-[13px] mb-1">{base}</p>
              <p className="text-[12.5px] text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'conservation',
    num: '05',
    title: 'Durée de conservation',
    icon: Trash2,
    content: (
      <div className="text-[14px] text-slate-600 leading-relaxed">
        <p className="mb-4">Nous conservons vos données uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées :</p>
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">Type de donnée</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                ['Données de compte actif', 'Durée de l\'inscription + 3 ans après suppression'],
                ['Contrats de location', '10 ans (obligation légale)'],
                ['Données de facturation', '10 ans (obligation fiscale)'],
                ['Données de vérification d\'identité', '5 ans après la dernière transaction'],
                ['Données de navigation / cookies', '13 mois maximum'],
                ['Messages de support', '3 ans après clôture du dossier'],
              ].map(([type, duree], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-4 py-3 font-medium text-slate-700">{type}</td>
                  <td className="px-4 py-3 text-slate-500">{duree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: 'partage',
    num: '06',
    title: 'Partage de vos données',
    icon: Share2,
    content: (
      <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
        <p>Nous ne vendons jamais vos données. Elles peuvent être partagées dans les cas suivants :</p>
        <div className="space-y-3">
          {[
            {
              who: 'Entre propriétaires et locataires',
              detail: 'Les coordonnées (nom, téléphone) sont échangées uniquement après confirmation d\'une réservation, dans le cadre du contrat de location.',
              safe: true,
            },
            {
              who: 'Prestataires techniques',
              detail: 'Hébergement, traitement des paiements (Wave, Orange Money), envoi d\'e-mails — liés par des accords de confidentialité stricts.',
              safe: true,
            },
            {
              who: 'Autorités compétentes',
              detail: 'Uniquement sur réquisition judiciaire ou obligation légale applicable au Sénégal.',
              safe: true,
            },
          ].map(({ who, detail, safe }) => (
            <div key={who} className="flex gap-3 rounded-xl border border-slate-100 p-4 bg-white">
              <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${safe ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <div>
                <p className="font-semibold text-slate-800 text-[13px] mb-0.5">{who}</p>
                <p className="text-[12.5px] text-slate-500">{detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[13px] bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <strong className="text-emerald-700">Transferts internationaux :</strong> Vos données sont hébergées au Sénégal. Tout transfert hors du pays est soumis aux garanties appropriées conformément à la réglementation en vigueur.
        </p>
      </div>
    ),
  },
  {
    id: 'droits',
    num: '07',
    title: 'Vos droits',
    icon: Users,
    content: (
      <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
        <p>Conformément au RGPD et à la loi sénégalaise, vous disposez des droits suivants sur vos données :</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { right: 'Droit d\'accès', desc: 'Obtenir une copie de toutes vos données personnelles que nous détenons.' },
            { right: 'Droit de rectification', desc: 'Corriger des données inexactes ou incomplètes vous concernant.' },
            { right: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données, sous réserve des obligations légales.' },
            { right: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format structuré et lisible par machine.' },
            { right: 'Droit d\'opposition', desc: 'Vous opposer au traitement de vos données à des fins de marketing.' },
            { right: 'Droit à la limitation', desc: 'Demander la suspension du traitement de vos données dans certains cas.' },
          ].map(({ right, desc }) => (
            <div key={right} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="font-semibold text-slate-800 text-[13px] mb-1">{right}</p>
              <p className="text-[12.5px] text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="font-semibold text-emerald-800 text-[13px] mb-1">Exercer vos droits</p>
          <p className="text-[13px] text-emerald-700">
            Adressez votre demande à <strong>privacy@autoloc.sn</strong> en indiquant votre nom, prénom et l&apos;objet de votre demande. Nous répondons sous <strong>30 jours ouvrés</strong>.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'cookies',
    num: '08',
    title: 'Cookies et traceurs',
    icon: Globe,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>
          Nous utilisons des cookies pour assurer le fonctionnement de la plateforme et améliorer votre expérience.
          Consultez notre{' '}
          <Link href="/legal/cookies" className="text-emerald-600 underline decoration-dotted hover:text-emerald-700">
            Politique de cookies
          </Link>{' '}
          pour le détail complet.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { type: 'Essentiels', desc: 'Authentification, sécurité, session. Ne peuvent pas être désactivés.', color: 'emerald' },
            { type: 'Analytiques', desc: 'Mesure d\'audience anonymisée pour améliorer le service.', color: 'amber' },
            { type: 'Marketing', desc: 'Publicités ciblées. Activés uniquement avec votre consentement.', color: 'slate' },
          ].map(({ type, desc, color }) => (
            <div key={type} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2 text-[10px] font-black uppercase tracking-wide ${
                color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                color === 'amber' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-200 text-slate-600'
              }`}>
                {type}
              </div>
              <p className="text-[12.5px] text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'securite',
    num: '09',
    title: 'Sécurité des données',
    icon: Lock,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
          contre tout accès non autorisé, perte, destruction ou divulgation :
        </p>
        <ul className="space-y-2">
          {[
            'Chiffrement des données sensibles en transit (HTTPS/TLS) et au repos',
            'Accès aux données limité aux seuls collaborateurs habilités',
            'Authentification sécurisée avec tokens à durée de vie limitée',
            'Journalisation des accès et audits de sécurité réguliers',
            'Procédure de notification en cas de violation de données (72h)',
          ].map((item, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mt-0.5">
                <span className="text-[8px] font-black text-emerald-600">✓</span>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'modifications',
    num: '10',
    title: 'Modifications de cette politique',
    icon: Bell,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>
          AutoLoc se réserve le droit de modifier la présente politique à tout moment, notamment pour
          se conformer aux évolutions législatives ou réglementaires.
        </p>
        <p>
          En cas de modification substantielle, vous serez informé par e-mail ou par notification
          sur la plateforme au moins <strong className="text-slate-800">15 jours avant l&apos;entrée en vigueur</strong> des
          nouvelles dispositions. La date de dernière mise à jour figure en haut de cette page.
        </p>
        <p>
          La poursuite de l&apos;utilisation de la plateforme après notification vaut acceptation des
          modifications apportées.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    num: '11',
    title: 'Contact et réclamations',
    icon: Mail,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>
          Pour toute question relative à cette politique ou pour exercer vos droits, contactez notre
          Délégué à la Protection des Données :
        </p>
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-[13px]">
          <p><strong className="text-slate-700">E-mail :</strong> privacy@autoloc.sn</p>
          <p><strong className="text-slate-700">Courrier :</strong> AutoLoc — DPO, Dakar, Sénégal</p>
        </div>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation
          auprès de la <strong className="text-slate-800">Commission de Protection des Données Personnelles (CDP)</strong> du Sénégal.
        </p>
      </div>
    ),
  },
];

const TOC = SECTIONS.map(s => ({ id: s.id, num: s.num, title: s.title }));

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-slate-950 pt-16 pb-14">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.10] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 65%)' }} />
        <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 65%)' }} />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-emerald-400 transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            Retour à l&apos;accueil
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-4 py-1.5 mb-5">
            <Lock className="h-3 w-3 text-emerald-400" strokeWidth={2} />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Protection des données</span>
          </div>

          <h1 className="text-[38px] sm:text-[52px] font-black tracking-tight text-white leading-[1.0] mb-4">
            Politique de <span className="text-emerald-400">Confidentialité</span>
          </h1>
          <p className="text-[15px] text-white/45 font-medium max-w-xl leading-relaxed mb-6">
            Nous respectons votre vie privée. Cette page explique quelles données nous collectons, pourquoi, et comment vous gardez le contrôle.
          </p>
          <p className="text-[12px] text-white/25 font-medium">
            Dernière mise à jour : 16 mars 2026 · Conforme RGPD & législation sénégalaise
          </p>
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Lock,    label: 'Données chiffrées' },
              { icon: Shield,  label: 'Conforme RGPD' },
              { icon: Eye,     label: 'Aucune revente' },
              { icon: Users,   label: 'Droits garantis' },
              { icon: Trash2,  label: 'Effacement sur demande' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-emerald-200 px-3 py-1.5 shadow-sm">
                <Icon className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                <span className="text-[11.5px] font-semibold text-slate-700">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">

          {/* Sidebar TOC — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-3 px-2">
                Sommaire
              </p>
              {TOC.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors group"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors">
                    {item.num}
                  </span>
                  <span className="leading-tight">{item.title}</span>
                  <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </a>
              ))}

              <div className="mt-6 pt-5 border-t border-slate-100 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-3 px-2">Autres documents</p>
                <Link href="/cgu" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                  CGU
                </Link>
                <Link href="/legal/cookies" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                  <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Cookies
                </Link>
              </div>
            </div>
          </aside>

          {/* Sections */}
          <main className="space-y-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200"
                >
                  <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mt-0.5">
                      <Icon className="h-4.5 w-4.5 text-emerald-500" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">
                        Section {section.num}
                      </span>
                      <h2 className="text-[16px] sm:text-[17px] font-black text-slate-800 leading-tight">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    {section.content}
                  </div>
                </article>
              );
            })}

            {/* Bottom CTA */}
            <div className="mt-8 rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
              <div className="px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300/70 mb-1">Une question sur vos données ?</p>
                  <h3 className="text-[20px] font-black text-white leading-tight">Contactez notre équipe</h3>
                  <p className="text-[13px] text-white/50 mt-1">privacy@autoloc.sn — Réponse sous 30 jours.</p>
                </div>
                <Link
                  href="/contact"
                  className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-[13px] font-black text-black hover:bg-emerald-300 transition-all shadow-lg shadow-black/20"
                >
                  Nous écrire
                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

    </div>
  );
}
