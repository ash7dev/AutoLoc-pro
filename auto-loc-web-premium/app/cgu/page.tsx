'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield, Users, Car, FileText, AlertTriangle,
  Scale, Lock, Ban, Gavel, ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { CguHeroSection } from '@/src/features/legal/components/CguHeroSection';
import { CguGuaranteesBar } from '@/src/features/legal/components/CguGuaranteesBar';
import { CguTableOfContents, CguTocItem } from '@/src/features/legal/components/CguTableOfContents';
import { CguArticleCard } from '@/src/features/legal/components/CguArticleCard';

/* ════════════════════════════════════════════════════════════════
   DATA — Contenu identique au frontend, adapté au design premium
════════════════════════════════════════════════════════════════ */

interface ArticleData {
  id: string;
  num: string | null;
  title: string;
  icon: LucideIcon;
}

const ARTICLES: ArticleData[] = [
  { id: 'preambule', num: null, title: 'Préambule', icon: FileText },
  { id: 'article-1', num: '01', title: 'Définitions', icon: FileText },
  { id: 'article-2', num: '02', title: 'Objet du contrat', icon: FileText },
  { id: 'article-3', num: '03', title: 'Obligations du propriétaire', icon: Car },
  { id: 'article-4', num: '04', title: 'Obligations du locataire', icon: Users },
  { id: 'article-5', num: '05', title: "R\u00f4le et responsabilit\u00e9s de la plateforme", icon: Shield },
  { id: 'article-6', num: '06', title: 'Assurance', icon: Shield },
  { id: 'article-7', num: '07', title: "Annulation et p\u00e9nalit\u00e9s", icon: AlertTriangle },
  { id: 'article-8', num: '08', title: "\u00c9tat des lieux", icon: FileText },
  { id: 'article-9', num: '09', title: 'Accidents et dommages', icon: AlertTriangle },
  { id: 'article-10', num: '10', title: 'Protection des données personnelles', icon: Lock },
  { id: 'article-11', num: '11', title: 'Sanctions et suspension', icon: Ban },
  { id: 'article-12', num: '12', title: 'Droit applicable et juridiction', icon: Gavel },
  { id: 'article-13', num: '13', title: 'Dispositions générales', icon: Scale },
];

const TOC: CguTocItem[] = ARTICLES.map((a) => ({ id: a.id, num: a.num, title: a.title }));

/* ══ Texte stylé ══ */
const textBase = "text-[14px] text-slate-600 leading-relaxed";
const textStrong = "text-slate-800 font-semibold";

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function CguPage() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-6 sm:pt-8 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 1. Hero */}
        <CguHeroSection />

        {/* 2. Guarantees bar */}
        <CguGuaranteesBar />

        {/* 3. Two-column: TOC + Articles */}
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">

          {/* Sidebar */}
          <CguTableOfContents items={TOC} />

          {/* Articles */}
          <main className="space-y-4">

            {/* ── Préambule ── */}
            <CguArticleCard id="preambule" num={null} title="Préambule" icon={FileText}>
              <div className={`space-y-4 ${textBase}`}>
                <p>
                  Auto Loc est une plateforme numérique d&apos;intermédiation technologique opérant au Sénégal,
                  qui met en relation des propriétaires de véhicules souhaitant louer leurs véhicules avec des
                  personnes recherchant un véhicule à louer. <strong className={textStrong}>Auto Loc agit exclusivement en qualité
                  d&apos;intermédiaire technologique et ne possède aucun véhicule en propre.</strong>
                </p>
                <p>
                  Le Propriétaire souhaite louer son véhicule et le Locataire souhaite louer un véhicule via
                  la Plateforme Auto Loc. Les Parties reconnaissent avoir pris connaissance et accepter les
                  présentes Conditions Générales d&apos;Utilisation, la Politique de Confidentialité et les
                  Conditions d&apos;Annulation d&apos;Auto Loc, disponibles sur la Plateforme.
                </p>
              </div>
            </CguArticleCard>

            {/* ── Article 1 — Définitions ── */}
            <CguArticleCard id="article-1" num="01" title="Définitions" icon={FileText}>
              <div className={textBase}>
                <p>
                  Les termes employés dans les présentes Conditions Générales d&apos;Utilisation ont les
                  significations suivantes :
                </p>
                <ul className="mt-3 space-y-2 list-none">
                  {[
                    ['Plateforme', "Le site web et l\u2019application mobile AutoLoc disponibles sur autoloc.sn"],
                    ['Propriétaire', "Toute personne physique ou morale proposant un véhicule à la location via la Plateforme"],
                    ['Locataire', "Toute personne physique souhaitant louer un véhicule via la Plateforme"],
                    ['Utilisateur', "Toute personne utilisant la Plateforme, qu\u2019elle soit Propriétaire ou Locataire"],
                    ['Réservation', "L\u2019accord contractuel entre un Propriétaire et un Locataire facilité par Auto Loc"],
                  ].map(([term, def]) => (
                    <li key={term} className="flex gap-2.5">
                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#4ADE80] flex-shrink-0" />
                      <span><strong className={textStrong}>{term} :</strong> {def}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CguArticleCard>

            {/* ── Article 2 — Objet du contrat ── */}
            <CguArticleCard id="article-2" num="02" title="Objet du contrat" icon={FileText}>
              <p className={textBase}>
                Le présent contrat a pour objet de définir les termes et conditions de la location du
                véhicule désigné, conclue entre le Propriétaire et le Locataire par l&apos;intermédiaire
                de la Plateforme Auto Loc, ainsi que les obligations et responsabilités de chacune des
                Parties.
              </p>
            </CguArticleCard>

            {/* ── Article 3 — Obligations du propriétaire ── */}
            <CguArticleCard id="article-3" num="03" title="Obligations du propriétaire" icon={Car}>
              <div className={textBase}>
                <p className="mb-3">Le Propriétaire s&apos;engage à :</p>
                <ul className="space-y-2.5">
                  {[
                    "Mettre à disposition du Locataire le véhicule décrit, en parfait état de fonctionnement, propre et avec le niveau de carburant convenu, à la date et heure de début de la location.",
                    "S\u2019assurer que le véhicule est couvert par une assurance automobile valide incluant la location à des tiers, et fournir une attestation d\u2019assurance sur demande.",
                    "S\u2019assurer que le contrôle technique du véhicule est à jour, si applicable.",
                    "Fournir au Locataire tous les documents nécessaires à la circulation du véhicule (carte grise, attestation d\u2019assurance, etc.).",
                    "Respecter les conditions d\u2019annulation définies dans la Politique d\u2019annulation.",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0A3D2E]/10 border border-[#0A3D2E]/15 flex items-center justify-center mt-0.5">
                        <span className="text-[9px] font-bold text-[#0A3D2E]">{i + 1}</span>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CguArticleCard>

            {/* ── Article 4 — Obligations du locataire ── */}
            <CguArticleCard id="article-4" num="04" title="Obligations du locataire" icon={Users}>
              <div className={textBase}>
                <p className="mb-3">Le Locataire s&apos;engage à :</p>
                <ul className="space-y-2.5">
                  {[
                    "Utiliser le véhicule en bon père de famille, conformément à sa destination et dans le respect du Code de la route et de toutes les réglementations en vigueur au Sénégal.",
                    "Restituer le véhicule à la date et heure de fin de la location, dans le même état que celui dans lequel il l\u2019a reçu, propre et avec le niveau de carburant convenu.",
                    "Ne pas sous-louer le véhicule à un tiers.",
                    "Signaler immédiatement à Auto Loc et au Propriétaire tout accident, panne ou dommage survenant pendant la période de location.",
                    "Payer toutes les contraventions, amendes et frais de stationnement reçus pendant la période de location.",
                    "Ne pas utiliser le véhicule à des fins illicites ou prohibées par la loi.",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0A3D2E]/10 border border-[#0A3D2E]/15 flex items-center justify-center mt-0.5">
                        <span className="text-[9px] font-bold text-[#0A3D2E]">{i + 1}</span>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CguArticleCard>

            {/* ── Article 5 — Rôle de la plateforme ── */}
            <CguArticleCard id="article-5" num="05" title="Rôle et responsabilités de la plateforme" icon={Shield}>
              <div className={`space-y-4 ${textBase}`}>
                <div>
                  <p className={`${textStrong} mb-1`}>Intermédiation</p>
                  <p>Auto Loc agit exclusivement en tant qu&apos;intermédiaire technologique pour faciliter la mise en relation entre le Propriétaire et le Locataire. Auto Loc n&apos;est pas partie au contrat de location et ne saurait être tenu responsable de l&apos;inexécution ou de la mauvaise exécution de celui-ci.</p>
                </div>
                <div>
                  <p className={`${textStrong} mb-1`}>Services</p>
                  <p>Auto Loc fournit les services d&apos;intermédiation décrits dans ses CGU, notamment la mise en relation, la gestion des réservations, le traitement sécurisé des paiements et la vérification d&apos;identité.</p>
                </div>
                <div>
                  <p className={`${textStrong} mb-1`}>Limitation de responsabilité</p>
                  <p>Auto Loc ne saurait être tenu responsable de l&apos;état, de la conformité ou de la sécurité des véhicules proposés, des dommages causés par ou subis par le véhicule pendant la location, des accidents, vols, ou tout autre incident survenant pendant la location, ni des comportements, déclarations ou omissions des Utilisateurs.</p>
                </div>
              </div>
            </CguArticleCard>

            {/* ── Article 6 — Assurance ── */}
            <CguArticleCard id="article-6" num="06" title="Assurance" icon={Shield}>
              <div className={`space-y-3 ${textBase}`}>
                <p>Le véhicule doit être couvert par une assurance automobile valide incluant la location à des tiers. Le Propriétaire est responsable de la souscription et du maintien de cette assurance.</p>
                <p>Le Locataire est invité à vérifier l&apos;étendue de sa couverture d&apos;assurance personnelle avant toute location et à souscrire une assurance complémentaire si nécessaire.</p>
              </div>
            </CguArticleCard>

            {/* ── Article 7 — Annulation et pénalités ── */}
            <CguArticleCard id="article-7" num="07" title="Annulation et pénalités" icon={AlertTriangle}>
              <div className={`space-y-4 ${textBase}`}>
                <p>Les conditions d&apos;annulation et les pénalités applicables sont celles définies dans les Conditions d&apos;Annulation d&apos;Auto-Loc.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#041912] mb-3">Annulation par le locataire</p>
                    <ul className="space-y-2 text-[13px]">
                      <li><strong className="text-slate-700">+5 jours avant :</strong> remboursement intégral moins les frais de service.</li>
                      <li><strong className="text-slate-700">2 à 5 jours avant :</strong> remboursement à 75 %. Les 25 % restants sont retenus.</li>
                      <li><strong className="text-slate-700">-24 heures :</strong> aucun remboursement accordé.</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#041912] mb-3">Annulation par le propriétaire</p>
                    <ul className="space-y-2 text-[13px]">
                      <li><strong className="text-slate-700">+7 jours avant :</strong> remboursement intégral, sans pénalité.</li>
                      <li><strong className="text-slate-700">3 à 7 jours avant :</strong> remboursement intégral + pénalité de 20 %.</li>
                      <li><strong className="text-slate-700">-3 jours :</strong> remboursement intégral + pénalité de 40 %.</li>
                    </ul>
                  </div>
                </div>

                <p className="text-[13px] bg-[#0A3D2E]/5 border border-[#0A3D2E]/10 rounded-2xl p-4">
                  <strong className="text-[#0A3D2E]">Annulations justifiées sans pénalité :</strong> panne mécanique majeure, accident grave, décès, cas de force majeure — sous réserve de présentation de justificatifs.
                </p>
              </div>
            </CguArticleCard>

            {/* ── Article 8 — État des lieux ── */}
            <CguArticleCard id="article-8" num="08" title="État des lieux" icon={FileText}>
              <p className={textBase}>
                Un état des lieux détaillé du véhicule sera établi contradictoirement entre le Propriétaire
                et le Locataire au début et à la fin de la période de location. Cet état des lieux,
                accompagné de photos et vidéos, fera foi de l&apos;état du véhicule et des éventuels
                dommages constatés.
              </p>
            </CguArticleCard>

            {/* ── Article 9 — Accidents et dommages ── */}
            <CguArticleCard id="article-9" num="09" title="Accidents et dommages" icon={AlertTriangle}>
              <div className={`space-y-3 ${textBase}`}>
                <p>En cas d&apos;accident, de vol ou de dommages subis par le véhicule pendant la période de location, le Locataire s&apos;engage à en informer immédiatement le Propriétaire et Auto Loc.</p>
                <p>Un constat amiable ou une déclaration de sinistre devra être rempli et transmis aux assurances concernées.</p>
                <p>Le Locataire sera responsable des dommages causés au véhicule, sous réserve des franchises d&apos;assurance applicables.</p>
              </div>
            </CguArticleCard>

            {/* ── Article 10 — Protection des données ── */}
            <CguArticleCard id="article-10" num="10" title="Protection des données personnelles" icon={Lock}>
              <p className={textBase}>
                Auto Loc collecte et traite les données personnelles des Utilisateurs (Propriétaire et
                Locataire) conformément au Règlement Général sur la Protection des Données (RGPD) et à
                la législation sénégalaise en vigueur. Les finalités de cette collecte et les droits des
                Utilisateurs sont détaillés dans la{' '}
                <Link href="/privacy" className="text-[#0A3D2E] underline decoration-dotted hover:text-[#041912] font-semibold transition-colors">
                  Politique de Confidentialité d&apos;Auto-Loc
                </Link>.
              </p>
            </CguArticleCard>

            {/* ── Article 11 — Sanctions et suspension ── */}
            <CguArticleCard id="article-11" num="11" title="Sanctions et suspension" icon={Ban}>
              <div className={textBase}>
                <p className="mb-3">En cas de violation des présentes, des CGU, de comportement frauduleux, d&apos;avis négatifs répétés ou de non-respect des obligations légales, Auto Loc se réserve le droit de :</p>
                <ul className="space-y-2">
                  {[
                    "Adresser un avertissement à l\u2019Utilisateur concerné",
                    "Suspendre temporairement ou définitivement le compte de l\u2019Utilisateur",
                    "Supprimer les annonces ou avis non conformes",
                    "Entreprendre toute action légale appropriée",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CguArticleCard>

            {/* ── Article 12 — Droit applicable ── */}
            <CguArticleCard id="article-12" num="12" title="Droit applicable et juridiction" icon={Gavel}>
              <div className={`space-y-3 ${textBase}`}>
                <p>Le présent contrat est régi par le droit sénégalais.</p>
                <p>En cas de litige, les Parties s&apos;engagent à rechercher une solution amiable. À défaut d&apos;accord amiable dans un délai de 10 jours, le litige sera soumis à la compétence exclusive des tribunaux du Sénégal.</p>
              </div>
            </CguArticleCard>

            {/* ── Article 13 — Dispositions générales ── */}
            <CguArticleCard id="article-13" num="13" title="Dispositions générales" icon={Scale}>
              <div className={`space-y-4 ${textBase}`}>
                <div>
                  <p className={`${textStrong} mb-1`}>Indépendance des Parties</p>
                  <p>Les Parties sont et demeureront des entrepreneurs indépendants. Le présent contrat ne crée aucune relation de subordination, d&apos;agence, de coentreprise ou de franchise entre elles, sauf pour le rôle d&apos;intermédiaire technologique d&apos;Auto Loc.</p>
                </div>
                <div>
                  <p className={`${textStrong} mb-1`}>Divisibilité</p>
                  <p>Si une ou plusieurs stipulations du présent contrat sont tenues pour non valides ou déclarées telles en application d&apos;une loi, d&apos;un règlement ou à la suite d&apos;une décision définitive d&apos;une juridiction compétente, les autres stipulations garderont toute leur force et leur portée.</p>
                </div>
                <div>
                  <p className={`${textStrong} mb-1`}>Intégralité de l&apos;accord</p>
                  <p>Le présent contrat, complété par la Politique de Confidentialité et les Conditions d&apos;Annulation d&apos;Auto Loc, constitue l&apos;intégralité de l&apos;accord entre les Parties concernant son objet et annule et remplace toutes les communications, propositions et accords antérieurs, qu&apos;ils soient écrits ou oraux.</p>
                </div>
              </div>
            </CguArticleCard>

            {/* ── Bottom CTA ── */}
            <div className="mt-6 rounded-3xl overflow-hidden bg-[#041912] shadow-xl">
              <div className="relative px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4ADE80]/8 blur-3xl" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F1DFB6]/60 mb-1">Des questions ?</p>
                  <h3
                    className="font-fraunces text-xl text-white font-normal"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    Contactez notre équipe
                  </h3>
                  <p className="text-[13px] text-white/40 mt-1">Nous répondons sous 24h ouvrées.</p>
                </div>
                <Link
                  href="/contact"
                  className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#F1DFB6] px-6 py-3 text-[13px] font-bold text-[#041912] hover:bg-white transition-all shadow-lg shadow-black/20 cursor-pointer"
                >
                  Nous contacter
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
