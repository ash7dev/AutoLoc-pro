import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contrat de Réservation — AutoLoc',
    description: 'Consultez les termes du contrat de réservation AutoLoc avant de finaliser votre location.',
};

const CLAUSES = [
    {
        num: '01',
        title: 'Objet de la réservation',
        text: 'La réservation constitue un accord ferme entre le Locataire et le Propriétaire, facilité par la plateforme AutoLoc, pour la location du véhicule aux dates et conditions définies lors de la réservation.',
    },
    {
        num: '02',
        title: 'Obligations du locataire',
        items: [
            'Utiliser le véhicule en bon père de famille, conformément au Code de la route en vigueur au Sénégal.',
            'Restituer le véhicule à la date, heure et lieu convenus, dans l\'état initial. Tout retard sera facturé au tarif journalier majoré de 50 %.',
            'Ne pas sous-louer le véhicule à un tiers ni l\'utiliser à des fins illicites.',
            'Signaler immédiatement tout accident, panne ou dommage au Propriétaire et à AutoLoc.',
            'Payer toutes les contraventions et amendes reçues pendant la période de location.',
        ],
    },
    {
        num: '03',
        title: 'Obligations du propriétaire',
        items: [
            'Mettre à disposition le véhicule en parfait état de fonctionnement, propre et avec le carburant convenu.',
            'Garantir une assurance automobile valide incluant la location à des tiers.',
            'Fournir tous les documents de circulation nécessaires (carte grise, attestation d\'assurance).',
            'Respecter les conditions d\'annulation définies dans la Politique d\'annulation AutoLoc.',
        ],
    },
    {
        num: '04',
        title: 'Politique d\'annulation',
        subsections: [
            {
                label: 'Annulation par le locataire',
                items: [
                    'Plus de 5 jours avant le début : remboursement intégral (hors frais AutoLoc).',
                    'Entre 2 et 5 jours avant : remboursement à 75 % du montant total.',
                    'Moins de 24 heures avant : aucun remboursement.',
                ],
            },
            {
                label: 'Annulation par le propriétaire',
                items: [
                    'Plus de 7 jours avant : remboursement intégral du locataire, sans pénalité.',
                    'Entre 3 et 7 jours avant : remboursement intégral + pénalité de 20 % au propriétaire.',
                    'Moins de 3 jours avant : remboursement intégral + pénalité de 40 % au propriétaire.',
                ],
            },
        ],
    },
    {
        num: '05',
        title: 'État des lieux',
        text: 'Un état des lieux contradictoire est établi entre le Propriétaire et le Locataire au début et à la fin de la location, accompagné de photos et vidéos. Cet état des lieux fait foi en cas de litige.',
    },
    {
        num: '06',
        title: 'Accidents et dommages',
        text: 'En cas d\'accident, de vol ou de dommages survenus pendant la location, le Locataire est tenu d\'informer immédiatement le Propriétaire et AutoLoc, et de remplir un constat amiable. Le Locataire est responsable des dommages causés au véhicule, sous réserve des franchises d\'assurance applicables.',
    },
    {
        num: '07',
        title: 'Rôle d\'AutoLoc',
        text: 'AutoLoc agit exclusivement en tant qu\'intermédiaire technologique. AutoLoc ne saurait être tenu responsable des dommages causés par ou subis par le véhicule, ni des comportements des parties pendant la location.',
    },
    {
        num: '08',
        title: 'Droit applicable',
        text: 'Le présent contrat est régi par le droit sénégalais. Tout litige est soumis à la médiation AutoLoc avant toute action judiciaire, les tribunaux compétents étant ceux du Sénégal.',
    },
];

export default function ContratReservationPage() {
    return (
        <div className="min-h-screen bg-white">

            {/* ── Hero ── */}
            <div className="relative overflow-hidden bg-slate-950 pt-14 pb-12">
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #34d399, transparent 65%)' }} />

                <div className="relative z-10 mx-auto max-w-3xl px-6">
                    <Link href="javascript:history.back()"
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/35 hover:text-emerald-400 transition-colors mb-7">
                        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Retour
                    </Link>

                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-4 py-1.5 mb-4">
                        <FileText className="h-3 w-3 text-emerald-400" strokeWidth={2} />
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Document contractuel</span>
                    </div>

                    <h1 className="text-[32px] sm:text-[44px] font-black tracking-tight text-white leading-[1.05] mb-3">
                        Contrat de <span className="text-emerald-400">Réservation</span>
                    </h1>
                    <p className="text-[14px] text-white/40 max-w-lg leading-relaxed">
                        Ce document décrit les droits et obligations des deux parties lors d&apos;une location de véhicule via AutoLoc.
                    </p>
                </div>
            </div>

            {/* ── Key points ── */}
            <div className="bg-emerald-50 border-b border-emerald-100">
                <div className="mx-auto max-w-3xl px-6 py-4">
                    <div className="flex flex-wrap gap-2.5">
                        {[
                            'Locataire protégé',
                            'Propriétaire responsable',
                            'Médiation AutoLoc',
                            'Droit sénégalais',
                        ].map(label => (
                            <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-emerald-200 px-3 py-1.5 shadow-sm">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                                <span className="text-[11.5px] font-semibold text-slate-700">{label}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Clauses ── */}
            <div className="mx-auto max-w-3xl px-6 py-10 space-y-3">
                {CLAUSES.map((clause) => (
                    <div key={clause.num}
                        className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200">

                        {/* Header */}
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <span className="text-[10px] font-black text-emerald-600">{clause.num}</span>
                            </div>
                            <h2 className="text-[15px] font-black text-slate-800">{clause.title}</h2>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4">
                            {'text' in clause && clause.text && (
                                <p className="text-[13.5px] text-slate-600 leading-relaxed">{clause.text}</p>
                            )}
                            {'items' in clause && clause.items && (
                                <ul className="space-y-2">
                                    {clause.items.map((item, i) => (
                                        <li key={i} className="flex gap-2.5 text-[13.5px] text-slate-600 leading-relaxed">
                                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mt-0.5">
                                                <span className="text-[8px] font-black text-emerald-600">{i + 1}</span>
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {'subsections' in clause && clause.subsections && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {clause.subsections.map((sub) => (
                                        <div key={sub.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500 mb-2">{sub.label}</p>
                                            <ul className="space-y-1.5">
                                                {sub.items.map((item, i) => (
                                                    <li key={i} className="text-[12.5px] text-slate-600 leading-relaxed">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Bottom */}
                <div className="rounded-2xl overflow-hidden mt-6"
                    style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
                    <div className="px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300/70 mb-1">Conditions complètes</p>
                            <p className="text-[18px] font-black text-white">Consultez nos CGU</p>
                            <p className="text-[12px] text-white/45 mt-0.5">Pour l&apos;intégralité des conditions d&apos;utilisation.</p>
                        </div>
                        <Link href="/cgu"
                            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-[13px] font-black text-black hover:bg-emerald-300 transition-all">
                            Voir les CGU
                            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[11px] text-slate-300 pt-2">
                    AutoLoc · Dakar, Sénégal · Dernière mise à jour : 16 mars 2026
                </p>
            </div>
        </div>
    );
}
