'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lock, Database, Users, Eye, Trash2, Share2,
  Shield, Bell, Mail, ChevronRight, FileText, Globe,
} from 'lucide-react';

import { PrivacyHeroSection } from '@/src/features/legal/components/PrivacyHeroSection';
import { PrivacyTrustBar } from '@/src/features/legal/components/PrivacyTrustBar';
import { CguTableOfContents, CguTocItem } from '@/src/features/legal/components/CguTableOfContents';
import { CguArticleCard } from '@/src/features/legal/components/CguArticleCard';

/* ════════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════════ */
const TOC: CguTocItem[] = [
  { id: 'responsable', num: '01', title: 'Responsable du traitement' },
  { id: 'donnees-collectees', num: '02', title: 'Données collectées' },
  { id: 'finalites', num: '03', title: 'Finalités du traitement' },
  { id: 'base-legale', num: '04', title: 'Base légale' },
  { id: 'conservation', num: '05', title: 'Durée de conservation' },
  { id: 'partage', num: '06', title: 'Partage des données' },
  { id: 'droits', num: '07', title: 'Vos droits' },
  { id: 'cookies', num: '08', title: 'Cookies et traceurs' },
  { id: 'securite', num: '09', title: 'Sécurité des données' },
  { id: 'modifications', num: '10', title: 'Modifications' },
  { id: 'contact-dpo', num: '11', title: 'Contact et réclamations' },
];

/* ══ Styles réutilisés ══ */
const textBase = "text-[14px] text-slate-600 leading-relaxed";
const textStrong = "text-slate-800 font-semibold";

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function PrivacyPage() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:pt-8 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 1. Hero */}
        <PrivacyHeroSection />

        {/* 2. Trust bar */}
        <PrivacyTrustBar />

        {/* 3. Two-column layout */}
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">

          {/* Sidebar */}
          <CguTableOfContents items={TOC} />

          {/* Sections */}
          <main className="space-y-4">

            {/* ── 01 — Responsable du traitement ── */}
            <CguArticleCard id="responsable" num="01" title="Responsable du traitement" icon={Shield}>
              <div className={`space-y-3 ${textBase}`}>
                <p>
                  Le responsable du traitement de vos données personnelles est la société <strong className={textStrong}>AutoLoc</strong>,
                  plateforme numérique d&apos;intermédiation pour la location de véhicules entre particuliers,
                  opérant au Sénégal.
                </p>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Société</p>
                    <p className={textStrong}>AutoLoc SN</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Email DPO</p>
                    <p className={textStrong}>privacy@autoloc.sn</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Adresse</p>
                    <p className={textStrong}>Dakar, Sénégal</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Téléphone</p>
                    <p className={textStrong}>+221 78 663 77 05</p>
                  </div>
                </div>
              </div>
            </CguArticleCard>

            {/* ── 02 — Données collectées ── */}
            <CguArticleCard id="donnees-collectees" num="02" title="Données que nous collectons" icon={Database}>
              <div className={`space-y-4 ${textBase}`}>
                <p>Nous collectons uniquement les données nécessaires au bon fonctionnement de la plateforme :</p>
                <div className="space-y-3">
                  {[
                    {
                      cat: "Données d\u2019identité",
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
                      items: ["Pièce d\u2019identité (vérification unique)", 'Permis de conduire (pour les locataires)'],
                    },
                  ].map(({ cat, items }) => (
                    <div key={cat} className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2.5">{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-[12px] text-slate-700 font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CguArticleCard>

            {/* ── 03 — Finalités ── */}
            <CguArticleCard id="finalites" num="03" title="Pourquoi nous utilisons vos données" icon={Eye}>
              <div className={textBase}>
                <p className="mb-4">Vos données sont utilisées exclusivement pour les finalités suivantes :</p>
                <div className="space-y-2.5">
                  {[
                    ['Gestion des comptes', "Création, authentification et gestion de votre espace personnel sur la plateforme."],
                    ['Mise en relation', "Faciliter le contact entre propriétaires et locataires lors d\u2019une réservation."],
                    ['Traitement des paiements', "Sécuriser et tracer les transactions financières entre les parties."],
                    ['Contrats de location', "Générer et archiver les contrats de location horodatés."],
                    ['Service client', "Répondre à vos demandes d\u2019assistance et résoudre les litiges."],
                    ['Amélioration du service', "Analyser les usages anonymisés pour améliorer l\u2019expérience utilisateur."],
                    ['Obligations légales', "Se conformer aux obligations légales et réglementaires applicables au Sénégal."],
                  ].map(([title, desc], i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0A3D2E]/10 border border-[#0A3D2E]/15 flex items-center justify-center mt-0.5">
                        <span className="text-[9px] font-bold text-[#0A3D2E]">{i + 1}</span>
                      </span>
                      <div>
                        <span className={textStrong}>{title} : </span>
                        <span>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CguArticleCard>

            {/* ── 04 — Base légale ── */}
            <CguArticleCard id="base-legale" num="04" title="Base légale du traitement" icon={FileText}>
              <div className={`space-y-3 ${textBase}`}>
                <p>Conformément au RGPD et à la loi sénégalaise sur les données personnelles, nos traitements reposent sur les bases légales suivantes :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { base: "Exécution du contrat", desc: "Pour tout ce qui est nécessaire à la fourniture de notre service de mise en relation." },
                    { base: 'Consentement', desc: "Pour l\u2019envoi de communications marketing et l\u2019utilisation de cookies non essentiels." },
                    { base: 'Obligation légale', desc: "Pour la conservation des données de facturation et de vérification d\u2019identité." },
                    { base: 'Intérêt légitime', desc: "Pour la prévention de la fraude, la sécurité de la plateforme et l\u2019amélioration du service." },
                  ].map(({ base, desc }) => (
                    <div key={base} className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                      <p className={`${textStrong} text-[13px] mb-1`}>{base}</p>
                      <p className="text-[12.5px] text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CguArticleCard>

            {/* ── 05 — Durée de conservation ── */}
            <CguArticleCard id="conservation" num="05" title="Durée de conservation" icon={Trash2}>
              <div className={textBase}>
                <p className="mb-4">Nous conservons vos données uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées :</p>
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Type de donnée</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        ["Données de compte actif", "Durée de l\u2019inscription + 3 ans après suppression"],
                        ['Contrats de location', '10 ans (obligation légale)'],
                        ['Données de facturation', '10 ans (obligation fiscale)'],
                        ["Données de vérification d\u2019identité", "5 ans après la dernière transaction"],
                        ['Données de navigation / cookies', '13 mois maximum'],
                        ['Messages de support', '3 ans après clôture du dossier'],
                      ].map(([type, duree], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-5 py-3 font-medium text-slate-700">{type}</td>
                          <td className="px-5 py-3 text-slate-500">{duree}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CguArticleCard>

            {/* ── 06 — Partage ── */}
            <CguArticleCard id="partage" num="06" title="Partage de vos données" icon={Share2}>
              <div className={`space-y-4 ${textBase}`}>
                <p>Nous ne vendons jamais vos données. Elles peuvent être partagées dans les cas suivants :</p>
                <div className="space-y-3">
                  {[
                    {
                      who: 'Entre propriétaires et locataires',
                      detail: "Les coordonnées (nom, téléphone) sont échangées uniquement après confirmation d\u2019une réservation, dans le cadre du contrat de location.",
                    },
                    {
                      who: 'Prestataires techniques',
                      detail: "Hébergement, traitement des paiements (Wave, Orange Money), envoi d\u2019e-mails — liés par des accords de confidentialité stricts.",
                    },
                    {
                      who: 'Autorités compétentes',
                      detail: "Uniquement sur réquisition judiciaire ou obligation légale applicable au Sénégal.",
                    },
                  ].map(({ who, detail }) => (
                    <div key={who} className="flex gap-3 rounded-2xl border border-slate-100 p-5 bg-white">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-[#4ADE80]" />
                      <div>
                        <p className={`${textStrong} text-[13px] mb-0.5`}>{who}</p>
                        <p className="text-[12.5px] text-slate-500">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[13px] bg-[#0A3D2E]/5 border border-[#0A3D2E]/10 rounded-2xl p-4">
                  <strong className="text-[#0A3D2E]">Transferts internationaux :</strong> Vos données de profil et de réservation sont stockées sur des serveurs sécurisés situés en Europe (Irlande), dans le cadre de services cloud bénéficiant de mesures de sécurité renforcées. Tout transfert hors du Sénégal fait l&apos;objet d&apos;une demande d&apos;autorisation auprès de la CDP.
                </p>
              </div>
            </CguArticleCard>

            {/* ── 07 — Vos droits ── */}
            <CguArticleCard id="droits" num="07" title="Vos droits" icon={Users}>
              <div className={`space-y-4 ${textBase}`}>
                <p>Conformément au RGPD et à la loi sénégalaise, vous disposez des droits suivants sur vos données :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { right: "Droit d\u2019accès", desc: "Obtenir une copie de toutes vos données personnelles que nous détenons." },
                    { right: 'Droit de rectification', desc: "Corriger des données inexactes ou incomplètes vous concernant." },
                    { right: "Droit à l\u2019effacement", desc: "Demander la suppression de vos données, sous réserve des obligations légales." },
                    { right: 'Droit à la portabilité', desc: "Recevoir vos données dans un format structuré et lisible par machine." },
                    { right: "Droit d\u2019opposition", desc: "Vous opposer au traitement de vos données à des fins de marketing." },
                    { right: 'Droit à la limitation', desc: "Demander la suspension du traitement de vos données dans certains cas." },
                  ].map(({ right, desc }) => (
                    <div key={right} className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                      <p className={`${textStrong} text-[13px] mb-1`}>{right}</p>
                      <p className="text-[12.5px] text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[#0A3D2E]/5 border border-[#0A3D2E]/10 p-5">
                  <p className="font-semibold text-[#0A3D2E] text-[13px] mb-1">Exercer vos droits</p>
                  <p className="text-[13px] text-[#0A3D2E]/80">
                    Adressez votre demande à <strong>privacy@autoloc.sn</strong> en indiquant votre nom, prénom et l&apos;objet de votre demande. Nous répondons sous <strong>30 jours ouvrés</strong>.
                  </p>
                </div>
              </div>
            </CguArticleCard>

            {/* ── 08 — Cookies ── */}
            <CguArticleCard id="cookies" num="08" title="Cookies et traceurs" icon={Globe}>
              <div className={`space-y-3 ${textBase}`}>
                <p>
                  Nous utilisons des cookies pour assurer le fonctionnement de la plateforme et améliorer votre expérience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: 'Essentiels', desc: "Authentification, sécurité, session. Ne peuvent pas être désactivés.", color: 'emerald' as const },
                    { type: 'Analytiques', desc: "Mesure d\u2019audience anonymisée pour améliorer le service.", color: 'amber' as const },
                    { type: 'Marketing', desc: "Publicités ciblées. Activés uniquement avec votre consentement.", color: 'slate' as const },
                  ].map(({ type, desc, color }) => (
                    <div key={type} className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2.5 text-[10px] font-bold uppercase tracking-wide ${
                        color === 'emerald' ? 'bg-[#0A3D2E]/10 text-[#0A3D2E]' :
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
            </CguArticleCard>

            {/* ── 09 — Sécurité ── */}
            <CguArticleCard id="securite" num="09" title="Sécurité des données" icon={Lock}>
              <div className={`space-y-3 ${textBase}`}>
                <p>
                  Nous mettons en \u0153uvre des mesures techniques et organisationnelles appropriées pour protéger vos données
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
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#0A3D2E]/10 border border-[#0A3D2E]/15 flex items-center justify-center mt-0.5">
                        <span className="text-[8px] font-bold text-[#0A3D2E]">✓</span>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CguArticleCard>

            {/* ── 10 — Modifications ── */}
            <CguArticleCard id="modifications" num="10" title="Modifications de cette politique" icon={Bell}>
              <div className={`space-y-3 ${textBase}`}>
                <p>
                  AutoLoc se réserve le droit de modifier la présente politique à tout moment, notamment pour
                  se conformer aux évolutions législatives ou réglementaires.
                </p>
                <p>
                  En cas de modification substantielle, vous serez informé par e-mail ou par notification
                  sur la plateforme au moins <strong className={textStrong}>15 jours avant l&apos;entrée en vigueur</strong> des
                  nouvelles dispositions. La date de dernière mise à jour figure en haut de cette page.
                </p>
                <p>
                  La poursuite de l&apos;utilisation de la plateforme après notification vaut acceptation des
                  modifications apportées.
                </p>
              </div>
            </CguArticleCard>

            {/* ── 11 — Contact ── */}
            <CguArticleCard id="contact-dpo" num="11" title="Contact et réclamations" icon={Mail}>
              <div className={`space-y-3 ${textBase}`}>
                <p>
                  Pour toute question relative à cette politique ou pour exercer vos droits, contactez notre
                  Délégué à la Protection des Données :
                </p>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-2 text-[13px]">
                  <p><strong className="text-slate-700">E-mail :</strong> privacy@autoloc.sn</p>
                  <p><strong className="text-slate-700">Courrier :</strong> AutoLoc — DPO, Dakar, Sénégal</p>
                </div>
                <p>
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation
                  auprès de la <strong className={textStrong}>Commission de Protection des Données Personnelles (CDP)</strong> du Sénégal.
                </p>
              </div>
            </CguArticleCard>

            {/* ── Bottom CTA ── */}
            <div className="mt-6 rounded-3xl overflow-hidden bg-[#041912] shadow-xl">
              <div className="relative px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4ADE80]/8 blur-3xl" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F1DFB6]/60 mb-1">Une question sur vos données ?</p>
                  <h3
                    className="font-fraunces text-xl text-white font-normal"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    Contactez notre équipe
                  </h3>
                  <p className="text-[13px] text-white/40 mt-1">privacy@autoloc.sn — Réponse sous 30 jours.</p>
                </div>
                <Link
                  href="/contact"
                  className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#F1DFB6] px-6 py-3 text-[13px] font-bold text-[#041912] hover:bg-white transition-all shadow-lg shadow-black/20 cursor-pointer"
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
