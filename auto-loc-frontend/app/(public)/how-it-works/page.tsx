import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Search, CalendarCheck, CreditCard, CarFront,
    Shield, HeadphonesIcon, ArrowRight,
    UserCheck, CheckCircle2, MapPin,
} from 'lucide-react';
import { Footer } from '@/features/landing/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Comment ça marche — AutoLoc',
    description: 'Découvrez comment louer un véhicule sur AutoLoc en quelques étapes simples : recherchez, réservez, payez, conduisez.',
};

// ── Steps data ────────────────────────────────────────────────────────────────

const TENANT_STEPS = [
    {
        icon: Search,
        title: 'Recherchez',
        description: 'Parcourez notre catalogue de véhicules vérifiés. Filtrez par ville, type, prix et disponibilité.',
        color: 'from-blue-500 to-blue-600',
        bgLight: 'bg-blue-50',
        textColor: 'text-blue-600',
    },
    {
        icon: CalendarCheck,
        title: 'Réservez',
        description: 'Choisissez vos dates, visualisez le tarif dynamique et acceptez les conditions de location.',
        color: 'from-emerald-500 to-emerald-600',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-600',
    },
    {
        icon: CreditCard,
        title: 'Payez',
        description: 'Payez en toute sécurité via Wave ou Orange Money. Le propriétaire confirme ensuite la réservation.',
        color: 'from-violet-500 to-violet-600',
        bgLight: 'bg-violet-50',
        textColor: 'text-violet-600',
    },
    {
        icon: CarFront,
        title: 'Conduisez',
        description: 'Récupérez le véhicule au point convenu. Le contrat est généré automatiquement pour votre sécurité.',
        color: 'from-amber-500 to-amber-600',
        bgLight: 'bg-amber-50',
        textColor: 'text-amber-600',
    },
];

const OWNER_STEPS = [
    {
        icon: UserCheck,
        title: 'Inscrivez-vous',
        description: 'Créez votre compte propriétaire et complétez votre vérification KYC en quelques minutes.',
    },
    {
        icon: CarFront,
        title: 'Ajoutez vos véhicules',
        description: 'Publiez vos véhicules avec photos, tarifs et tarifs dégressifs. Notre équipe les vérifie rapidement.',
    },
    {
        icon: CalendarCheck,
        title: 'Recevez des réservations',
        description: 'Les locataires réservent et paient en ligne. Vous confirmez chaque réservation depuis votre tableau de bord.',
    },
    {
        icon: CreditCard,
        title: 'Soyez payé',
        description: 'Recevez vos paiements directement sur votre compte mobile. Commission transparente de 15%.',
    },
];

const GUARANTEES = [
    {
        icon: Shield,
        label: 'Véhicules vérifiés',
        description: 'Chaque véhicule est inspecté et validé par notre équipe avant publication.',
    },
    {
        icon: CreditCard,
        label: 'Paiement sécurisé',
        description: 'Transactions via Wave et Orange Money. Vous ne payez qu\'après confirmation du propriétaire.',
    },
    {
        icon: HeadphonesIcon,
        label: 'Support 24/7',
        description: 'Notre équipe de support est disponible par WhatsApp, email et téléphone.',
    },
    {
        icon: CheckCircle2,
        label: 'Contrat automatique',
        description: 'Un contrat de location est généré automatiquement pour chaque réservation.',
    },
    {
        icon: MapPin,
        label: 'Couverture nationale',
        description: 'Disponible à Dakar, Thiès, Saint-Louis et dans toutes les villes du Sénégal.',
    },
    {
        icon: UserCheck,
        label: 'KYC propriétaires',
        description: 'Tous les propriétaires sont vérifiés avec des documents d\'identité officiels.',
    },
];

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-20 lg:py-28 rounded-b-3xl">
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />

                <div className="relative mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-6">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                            Simple et sécurisé
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                        Comment ça{' '}
                        <span className="text-emerald-400">marche</span> ?
                    </h1>
                    <p className="mt-5 text-[16px] font-medium leading-relaxed text-white/40 max-w-xl mx-auto">
                        Louez un véhicule vérifié en quelques minutes, ou proposez le vôtre
                        à la location et gagnez de l&apos;argent facilement.
                    </p>
                </div>
            </section>

            {/* Tenant steps */}
            <section className="px-4 py-16 lg:py-24">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-14">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-black/30">
                            Pour les locataires
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-black mt-2">
                            Louez en <span className="text-emerald-500">4 étapes</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TENANT_STEPS.map((step, i) => (
                            <div key={step.title} className="relative group">
                                {/* Connector line */}
                                {i < TENANT_STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-0" />
                                )}
                                <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className={cn(
                                        'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-5',
                                        step.color,
                                    )}>
                                        <step.icon className="w-7 h-7 text-white" strokeWidth={1.75} />
                                    </div>
                                    <span className={cn(
                                        'text-[11px] font-black uppercase tracking-widest mb-2',
                                        step.textColor,
                                    )}>
                                        Étape {i + 1}
                                    </span>
                                    <h3 className="text-[18px] font-black text-black">{step.title}</h3>
                                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-black/40">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Owner steps */}
            <section className="px-4 py-16 lg:py-24 bg-slate-50/60">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-black/30">
                            Pour les propriétaires
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-black mt-2">
                            Proposez votre véhicule en <span className="text-emerald-500">4 étapes</span>
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {OWNER_STEPS.map((step, i) => (
                            <div
                                key={step.title}
                                className="flex items-start gap-5 p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                                    <span className="text-[16px] font-black text-emerald-400">{i + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[16px] font-black text-black">{step.title}</h3>
                                    <p className="mt-1 text-[13px] font-medium text-black/40 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                                <step.icon className="w-6 h-6 text-black/15 flex-shrink-0 hidden sm:block" strokeWidth={1.5} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Guarantees */}
            <section className="px-4 py-16 lg:py-24">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-14">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-black/30">
                            Nos garanties
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-black mt-2">
                            Pourquoi choisir <span className="text-emerald-500">AutoLoc</span> ?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {GUARANTEES.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-black">{item.label}</h3>
                                    <p className="mt-1 text-[12px] font-medium text-black/40 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-16 lg:py-20 mx-4 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
                        Prêt à{' '}
                        <span className="text-emerald-400">commencer</span> ?
                    </h2>
                    <p className="mt-4 text-[14px] font-medium text-white/40 max-w-md mx-auto">
                        Que vous soyez locataire ou propriétaire, AutoLoc vous accompagne à chaque étape.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                        <Link
                            href="/explorer"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
                        >
                            Explorer les véhicules
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-[14px] font-bold text-white hover:bg-white/10 transition-all"
                        >
                            Créer un compte
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
