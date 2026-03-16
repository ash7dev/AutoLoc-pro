import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Shield, Users, Car, FileText, AlertTriangle,
  Scale, Lock, Ban, Gavel, ChevronRight, ArrowLeft,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — AutoLoc',
  description: 'Consultez les conditions générales d\'utilisation de la plateforme AutoLoc, régissant la location de véhicules entre particuliers au Sénégal.',
};

/* ════════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════════ */
const ARTICLES = [
  {
    id: 'preambule',
    num: null,
    title: 'Préambule',
    icon: FileText,
    content: (
      <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
        <p>
          Auto Loc est une plateforme numérique d&apos;intermédiation technologique opérant au Sénégal,
          qui met en relation des propriétaires de véhicules souhaitant louer leurs véhicules avec des
          personnes recherchant un véhicule à louer. <strong className="text-slate-800">Auto Loc agit exclusivement en qualité
          d&apos;intermédiaire technologique et ne possède aucun véhicule en propre.</strong>
        </p>
        <p>
          Le Propriétaire souhaite louer son véhicule et le Locataire souhaite louer un véhicule via
          la Plateforme Auto Loc. Les Parties reconnaissent avoir pris connaissance et accepter les
          présentes Conditions Générales d&apos;Utilisation, la Politique de Confidentialité et les
          Conditions d&apos;Annulation d&apos;Auto Loc, disponibles sur la Plateforme.
        </p>
      </div>
    ),
  },
  {
    id: 'article-1',
    num: '01',
    title: 'Définitions',
    icon: FileText,
    content: (
      <div className="text-[14px] text-slate-600 leading-relaxed">
        <p>
          Les termes employés dans les présentes Conditions Générales d&apos;Utilisation ont les
          significations suivantes :
        </p>
        <ul className="mt-3 space-y-2 list-none">
          {[
            ['Plateforme', 'Le site web et l\'application mobile AutoLoc disponibles sur autoloc.sn'],
            ['Propriétaire', 'Toute personne physique ou morale proposant un véhicule à la location via la Plateforme'],
            ['Locataire', 'Toute personne physique souhaitant louer un véhicule via la Plateforme'],
            ['Utilisateur', 'Toute personne utilisant la Plateforme, qu\'elle soit Propriétaire ou Locataire'],
            ['Réservation', 'L\'accord contractuel entre un Propriétaire et un Locataire facilité par Auto Loc'],
          ].map(([term, def]) => (
            <li key={term} className="flex gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-[7px]" />
              <span><strong className="text-slate-800">{term} :</strong> {def}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'article-2',
    num: '02',
    title: 'Objet du contrat',
    icon: FileText,
    content: (
      <p className="text-[14px] text-slate-600 leading-relaxed">
        Le présent contrat a pour objet de définir les termes et conditions de la location du
        véhicule désigné, conclue entre le Propriétaire et le Locataire par l&apos;intermédiaire
        de la Plateforme Auto Loc, ainsi que les obligations et responsabilités de chacune des
        Parties.
      </p>
    ),
  },
  {
    id: 'article-3',
    num: '03',
    title: 'Obligations du propriétaire',
    icon: Car,
    content: (
      <div className="text-[14px] text-slate-600 leading-relaxed">
        <p className="mb-3">Le Propriétaire s&apos;engage à :</p>
        <ul className="space-y-2.5">
          {[
            'Mettre à disposition du Locataire le véhicule décrit, en parfait état de fonctionnement, propre et avec le niveau de carburant convenu, à la date et heure de début de la location.',
            'S\'assurer que le véhicule est couvert par une assurance automobile valide incluant la location à des tiers, et fournir une attestation d\'assurance sur demande.',
            'S\'assurer que le contrôle technique du véhicule est à jour, si applicable.',
            'Fournir au Locataire tous les documents nécessaires à la circulation du véhicule (carte grise, attestation d\'assurance, etc.).',
            'Respecter les conditions d\'annulation définies dans la Politique d\'annulation.',
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mt-0.5">
                <span className="text-[9px] font-black text-emerald-600">{i + 1}</span>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'article-4',
    num: '04',
    title: 'Obligations du locataire',
    icon: Users,
    content: (
      <div className="text-[14px] text-slate-600 leading-relaxed">
        <p className="mb-3">Le Locataire s&apos;engage à :</p>
        <ul className="space-y-2.5">
          {[
            'Utiliser le véhicule en bon père de famille, conformément à sa destination et dans le respect du Code de la route et de toutes les réglementations en vigueur au Sénégal.',
            'Restituer le véhicule à la date et heure de fin de la location, dans le même état que celui dans lequel il l\'a reçu, propre et avec le niveau de carburant convenu.',
            'Ne pas sous-louer le véhicule à un tiers.',
            'Signaler immédiatement à Auto Loc et au Propriétaire tout accident, panne ou dommage survenant pendant la période de location.',
            'Payer toutes les contraventions, amendes et frais de stationnement reçus pendant la période de location.',
            'Ne pas utiliser le véhicule à des fins illicites ou prohibées par la loi.',
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mt-0.5">
                <span className="text-[9px] font-black text-emerald-600">{i + 1}</span>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'article-5',
    num: '05',
    title: 'Rôle et responsabilités de la plateforme',
    icon: Shield,
    content: (
      <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
        <div>
          <p className="font-semibold text-slate-800 mb-1">Intermédiation</p>
          <p>Auto Loc agit exclusivement en tant qu&apos;intermédiaire technologique pour faciliter la mise en relation entre le Propriétaire et le Locataire. Auto Loc n&apos;est pas partie au contrat de location et ne saurait être tenu responsable de l&apos;inexécution ou de la mauvaise exécution de celui-ci.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">Services</p>
          <p>Auto Loc fournit les services d&apos;intermédiation décrits dans ses CGU, notamment la mise en relation, la gestion des réservations, le traitement sécurisé des paiements et la vérification d&apos;identité.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">Limitation de responsabilité</p>
          <p>Auto Loc ne saurait être tenu responsable de l&apos;état, de la conformité ou de la sécurité des véhicules proposés, des dommages causés par ou subis par le véhicule pendant la location, des accidents, vols, ou tout autre incident survenant pendant la location, ni des comportements, déclarations ou omissions des Utilisateurs.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'article-6',
    num: '06',
    title: 'Assurance',
    icon: Shield,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>Le véhicule doit être couvert par une assurance automobile valide incluant la location à des tiers. Le Propriétaire est responsable de la souscription et du maintien de cette assurance.</p>
        <p>Le Locataire est invité à vérifier l&apos;étendue de sa couverture d&apos;assurance personnelle avant toute location et à souscrire une assurance complémentaire si nécessaire.</p>
      </div>
    ),
  },
  {
    id: 'article-7',
    num: '07',
    title: 'Annulation et pénalités',
    icon: AlertTriangle,
    content: (
      <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
        <p>Les conditions d&apos;annulation et les pénalités applicables sont celles définies dans les Conditions d&apos;Annulation d&apos;Auto-Loc.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-700 mb-2.5">Annulation par le locataire</p>
            <ul className="space-y-2 text-[13px]">
              <li><strong className="text-slate-700">+5 jours avant :</strong> remboursement intégral moins les frais de service.</li>
              <li><strong className="text-slate-700">2 à 5 jours avant :</strong> remboursement à 75 %. Les 25 % restants sont retenus.</li>
              <li><strong className="text-slate-700">-24 heures :</strong> aucun remboursement accordé.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-700 mb-2.5">Annulation par le propriétaire</p>
            <ul className="space-y-2 text-[13px]">
              <li><strong className="text-slate-700">+7 jours avant :</strong> remboursement intégral, sans pénalité.</li>
              <li><strong className="text-slate-700">3 à 7 jours avant :</strong> remboursement intégral + pénalité de 20 %.</li>
              <li><strong className="text-slate-700">-3 jours :</strong> remboursement intégral + pénalité de 40 %.</li>
            </ul>
          </div>
        </div>
        <p className="text-[13px] bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <strong className="text-emerald-700">Annulations justifiées sans pénalité :</strong> panne mécanique majeure, accident grave, décès, cas de force majeure — sous réserve de présentation de justificatifs.
        </p>
      </div>
    ),
  },
  {
    id: 'article-8',
    num: '08',
    title: 'État des lieux',
    icon: FileText,
    content: (
      <p className="text-[14px] text-slate-600 leading-relaxed">
        Un état des lieux détaillé du véhicule sera établi contradictoirement entre le Propriétaire
        et le Locataire au début et à la fin de la période de location. Cet état des lieux,
        accompagné de photos et vidéos, fera foi de l&apos;état du véhicule et des éventuels
        dommages constatés.
      </p>
    ),
  },
  {
    id: 'article-9',
    num: '09',
    title: 'Accidents et dommages',
    icon: AlertTriangle,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>En cas d&apos;accident, de vol ou de dommages subis par le véhicule pendant la période de location, le Locataire s&apos;engage à en informer immédiatement le Propriétaire et Auto Loc.</p>
        <p>Un constat amiable ou une déclaration de sinistre devra être rempli et transmis aux assurances concernées.</p>
        <p>Le Locataire sera responsable des dommages causés au véhicule, sous réserve des franchises d&apos;assurance applicables.</p>
      </div>
    ),
  },
  {
    id: 'article-10',
    num: '10',
    title: 'Protection des données personnelles',
    icon: Lock,
    content: (
      <p className="text-[14px] text-slate-600 leading-relaxed">
        Auto Loc collecte et traite les données personnelles des Utilisateurs (Propriétaire et
        Locataire) conformément au Règlement Général sur la Protection des Données (RGPD) et à
        la législation sénégalaise en vigueur. Les finalités de cette collecte et les droits des
        Utilisateurs sont détaillés dans la{' '}
        <Link href="/legal/privacy" className="text-emerald-600 underline decoration-dotted hover:text-emerald-700">
          Politique de Confidentialité d&apos;Auto-Loc
        </Link>.
      </p>
    ),
  },
  {
    id: 'article-11',
    num: '11',
    title: 'Sanctions et suspension',
    icon: Ban,
    content: (
      <div className="text-[14px] text-slate-600 leading-relaxed">
        <p className="mb-3">En cas de violation des présentes, des CGU, de comportement frauduleux, d&apos;avis négatifs répétés ou de non-respect des obligations légales, Auto Loc se réserve le droit de :</p>
        <ul className="space-y-2">
          {[
            'Adresser un avertissement à l\'Utilisateur concerné',
            'Suspendre temporairement ou définitivement le compte de l\'Utilisateur',
            'Supprimer les annonces ou avis non conformes',
            'Entreprendre toute action légale appropriée',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-[7px]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'article-12',
    num: '12',
    title: 'Droit applicable et juridiction',
    icon: Gavel,
    content: (
      <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
        <p>Le présent contrat est régi par le droit sénégalais.</p>
        <p>En cas de litige, les Parties s&apos;engagent à rechercher une solution amiable. À défaut d&apos;accord amiable dans un délai de 10 jours, le litige sera soumis à la compétence exclusive des tribunaux du Sénégal.</p>
      </div>
    ),
  },
  {
    id: 'article-13',
    num: '13',
    title: 'Dispositions générales',
    icon: Scale,
    content: (
      <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
        <div>
          <p className="font-semibold text-slate-800 mb-1">Indépendance des Parties</p>
          <p>Les Parties sont et demeureront des entrepreneurs indépendants. Le présent contrat ne crée aucune relation de subordination, d&apos;agence, de coentreprise ou de franchise entre elles, sauf pour le rôle d&apos;intermédiaire technologique d&apos;Auto Loc.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">Divisibilité</p>
          <p>Si une ou plusieurs stipulations du présent contrat sont tenues pour non valides ou déclarées telles en application d&apos;une loi, d&apos;un règlement ou à la suite d&apos;une décision définitive d&apos;une juridiction compétente, les autres stipulations garderont toute leur force et leur portée.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">Intégralité de l&apos;accord</p>
          <p>Le présent contrat, complété par la Politique de Confidentialité et les Conditions d&apos;Annulation d&apos;Auto Loc, constitue l&apos;intégralité de l&apos;accord entre les Parties concernant son objet et annule et remplace toutes les communications, propositions et accords antérieurs, qu&apos;ils soient écrits ou oraux.</p>
        </div>
      </div>
    ),
  },
];

const TOC = ARTICLES.map(a => ({ id: a.id, num: a.num, title: a.title }));

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function CguPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-slate-950 pt-16 pb-14">
        {/* Ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 65%)' }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 65%)' }} />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-emerald-400 transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            Retour à l&apos;accueil
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-4 py-1.5 mb-5">
            <Scale className="h-3 w-3 text-emerald-400" strokeWidth={2} />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Document légal</span>
          </div>

          <h1 className="text-[38px] sm:text-[52px] font-black tracking-tight text-white leading-[1.0] mb-4">
            Conditions <span className="text-emerald-400">Générales</span><br className="hidden sm:block" /> d&apos;Utilisation
          </h1>
          <p className="text-[15px] text-white/45 font-medium max-w-xl leading-relaxed mb-6">
            Ces conditions régissent l&apos;utilisation de la plateforme AutoLoc et la relation entre propriétaires et locataires de véhicules au Sénégal.
          </p>
          <p className="text-[12px] text-white/25 font-medium">
            Dernière mise à jour : 16 mars 2026 · Applicable dès acceptation
          </p>
        </div>
      </div>

      {/* ── Key protections ── */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Shield, label: 'Locataire protégé' },
              { icon: Car, label: 'Véhicule assuré obligatoire' },
              { icon: Scale, label: 'Médiation incluse' },
              { icon: Gavel, label: 'Droit sénégalais applicable' },
              { icon: Lock, label: 'Données RGPD-conformes' },
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

          {/* Sidebar TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-3 px-2">
                Table des matières
              </p>
              {TOC.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors group"
                >
                  {item.num && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {item.num}
                    </span>
                  )}
                  <span className="leading-tight">{item.title}</span>
                  <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </aside>

          {/* Articles */}
          <main className="space-y-2">
            {ARTICLES.map((article, idx) => {
              const Icon = article.icon;
              return (
                <article
                  key={article.id}
                  id={article.id}
                  className="scroll-mt-8 rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200"
                >
                  {/* Article header */}
                  <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mt-0.5">
                      <Icon className="h-4.5 w-4.5 text-emerald-500" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {article.num ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">
                            Article {article.num}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Introduction
                          </span>
                        )}
                      </div>
                      <h2 className="text-[16px] sm:text-[17px] font-black text-slate-800 leading-tight">
                        {article.title}
                      </h2>
                    </div>
                  </div>

                  {/* Article content */}
                  <div className="px-6 py-5">
                    {article.content}
                  </div>
                </article>
              );
            })}

            {/* Bottom CTA */}
            <div className="mt-8 rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
              <div className="px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300/70 mb-1">Des questions ?</p>
                  <h3 className="text-[20px] font-black text-white leading-tight">Contactez notre équipe</h3>
                  <p className="text-[13px] text-white/50 mt-1">Nous répondons sous 24h ouvrées.</p>
                </div>
                <Link
                  href="/contact"
                  className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-[13px] font-black text-black hover:bg-emerald-300 transition-all shadow-lg shadow-black/20"
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
