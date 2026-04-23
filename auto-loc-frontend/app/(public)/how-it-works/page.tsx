import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Search, CalendarCheck, CreditCard, CarFront,
    Shield, HeadphonesIcon, ArrowRight,
    UserCheck, CheckCircle2, MapPin, TrendingUp,
} from 'lucide-react';
import { Footer } from '@/features/landing/Footer';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const metadata: Metadata = {
    title: 'Comment ça marche — AutoLoc',
    description: 'Découvrez comment louer un véhicule sur AutoLoc en quelques étapes simples : recherchez, réservez, payez, conduisez.',
};

// ── Components ────────────────────────────────────────────────────────────────

function SectionBadge({ text }: { text: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                {text}
            </span>
        </div>
    );
}

// ── Steps data ────────────────────────────────────────────────────────────────

const TENANT_STEPS = [
    {
        icon: Search,
        title: 'Recherchez',
        description: 'Parcourez notre catalogue de véhicules vérifiés. Filtrez par ville, type, prix et disponibilité.',
        tag: 'Filtres intelligents',
    },
    {
        icon: CalendarCheck,
        title: 'Réservez',
        description: 'Choisissez vos dates, visualisez le tarif dynamique et acceptez les conditions de location.',
        tag: 'Confirmation instantanée',
    },
    {
        icon: CreditCard,
        title: 'Payez',
        description: 'Payez en toute sécurité via Wave ou Orange Money. Le propriétaire confirme ensuite la réservation.',
        tag: '100% sécurisé',
    },
    {
        icon: CarFront,
        title: 'Conduisez',
        description: 'Récupérez le véhicule au point convenu. Le contrat est généré automatiquement pour votre sécurité.',
        tag: 'Liberté totale',
    },
];

const OWNER_STEPS = [
    {
        icon: UserCheck,
        title: 'Vérification KYC',
        description: 'Créez votre compte propriétaire et complétez votre vérification KYC en quelques minutes.',
    },
    {
        icon: CarFront,
        title: 'Mise en ligne',
        description: 'Publiez vos véhicules avec photos et tarifs. Notre équipe les vérifie sous 24h.',
    },
    {
        icon: CalendarCheck,
        title: 'Gestion fluide',
        description: 'Les locataires réservent et paient. Vous confirmez depuis votre tableau de bord.',
    },
    {
        icon: TrendingUp,
        title: 'Revenus directs',
        description: 'Recevez vos paiements sur votre compte mobile. Commission fixe de 15%.',
    },
];

const GUARANTEES = [
    {
        icon: Shield,
        label: 'Véhicules vérifiés',
        description: 'Inspection et validation par notre équipe.',
    },
    {
        icon: CreditCard,
        label: 'Paiement sécurisé',
        description: 'Transactions via Wave et Orange Money.',
    },
    {
        icon: HeadphonesIcon,
        label: 'Support 24/7',
        description: 'Disponible par WhatsApp et téléphone.',
    },
    {
        icon: CheckCircle2,
        label: 'Contrat automatique',
        description: 'Généré pour chaque réservation.',
    },
    {
        icon: MapPin,
        label: 'Couverture nationale',
        description: 'Disponible dans tout le Sénégal.',
    },
    {
        icon: UserCheck,
        label: 'Propriétaires vérifiés',
        description: 'KYC obligatoire pour tous.',
    },
];

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-black">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32 px-4">
                {/* Background Pattern & Glows */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #34d399 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none bg-emerald-500/30" />

                <div className="relative mx-auto max-w-4xl text-center">
                    <SectionBadge text="Simple et transparent" />
                    <h1 className="text-4xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                        Découvrez la nouvelle façon de{' '}
                        <span className="text-emerald-400">louer</span>
                    </h1>
                    <p className="mt-6 text-[18px] font-medium leading-relaxed text-white/40 max-w-2xl mx-auto">
                        Une plateforme pensée pour votre sécurité, que vous cherchiez un véhicule ou que vous souhaitiez rentabiliser le vôtre.
                    </p>
                </div>
            </section>

            {/* ── Tenant Steps (The section to improve) ── */}
            <section className="px-4 py-16 lg:py-28 relative">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <SectionBadge text="Pour les locataires" />
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mt-2">
                            Prendre la route en <span className="text-emerald-400">4 étapes</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TENANT_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isOdd = i % 2 !== 0;

                            return (
                                <div key={step.title} className="group relative">
                                    {/* Number Watermark */}
                                    <span className="absolute -top-6 -left-2 text-[80px] font-black text-white/[0.03] leading-none select-none pointer-events-none group-hover:text-emerald-400/[0.05] transition-colors duration-500">
                                        0{i + 1}
                                    </span>

                                    {/* Card with Asymmetric Shape */}
                                    <div 
                                        className={cn(
                                            "relative overflow-hidden bg-white/[0.02] border border-white/5 p-8 h-full flex flex-col transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-emerald-400/20 group-hover:-translate-y-2",
                                            isOdd ? "rounded-tr-[4rem] rounded-bl-[4rem]" : "rounded-tl-[4rem] rounded-br-[4rem]"
                                        )}
                                    >
                                        <div className="mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-400 group-hover:text-black transition-all duration-500">
                                                <Icon className="w-6 h-6 text-emerald-400 group-hover:text-inherit" strokeWidth={1.5} />
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-400/50 mb-3">
                                                {step.tag}
                                            </span>
                                            <h3 className="text-[22px] font-black text-white mb-3 tracking-tight">
                                                {step.title}
                                            </h3>
                                            <p className="text-[14px] font-medium leading-relaxed text-white/40">
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Corner Accent */}
                                        <div className={cn(
                                            "absolute w-12 h-12 bg-emerald-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                            isOdd ? "top-0 right-0" : "top-0 left-0"
                                        )} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Owner Steps (Business Folder Style) ── */}
            <section className="px-4 py-20 lg:py-32 bg-white/[0.01] border-y border-white/5">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <SectionBadge text="Pour les propriétaires" />
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mt-2">
                            Rentabilisez votre <span className="text-emerald-400">patrimoine</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {OWNER_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.title} className="group relative">
                                    {/* Folder Tab Header */}
                                    <div className="flex items-end h-10">
                                        <div className="flex items-center gap-3 px-6 py-2 rounded-t-2xl bg-white/5 border border-b-0 border-white/10 group-hover:bg-emerald-400 group-hover:border-emerald-400 transition-all duration-500">
                                            <span className="text-[12px] font-black text-emerald-400 group-hover:text-black">0{i + 1}</span>
                                            <div className="w-[1px] h-3 bg-white/20 group-hover:bg-black/20" />
                                            <Icon className="w-4 h-4 text-white/40 group-hover:text-black" strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 border-b border-white/10 group-hover:border-emerald-400/50 transition-colors duration-500" />
                                    </div>

                                    {/* Card Body */}
                                    <div className="relative overflow-hidden p-8 bg-white/[0.02] border border-t-0 border-white/10 rounded-b-[2rem] rounded-tr-[2rem] group-hover:bg-white/[0.05] group-hover:border-emerald-400/20 transition-all duration-500">
                                        {/* Background Watermark Icon */}
                                        <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-white/[0.02] group-hover:text-emerald-400/[0.04] transition-colors duration-700" strokeWidth={1} />
                                        
                                        <h3 className="text-[20px] font-black text-white mb-3 tracking-tight group-hover:text-emerald-400 transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-[14px] lg:text-[15px] font-medium text-white/30 leading-relaxed relative z-10">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Guarantees ── */}
            <section className="px-4 py-20 lg:py-32">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <SectionBadge text="Sécurité maximale" />
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mt-2">
                            Pourquoi nous <span className="text-emerald-400">faire confiance</span> ?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {GUARANTEES.map((item) => (
                            <div
                                key={item.label}
                                className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-emerald-400/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center group-hover:bg-emerald-400 group-hover:text-black transition-all">
                                    <item.icon className="w-5 h-5 text-emerald-400 group-hover:text-inherit" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-black text-white mb-2">{item.label}</h3>
                                    <p className="text-[14px] font-medium text-white/30 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div 
                        className="relative overflow-hidden px-8 py-16 lg:py-24 rounded-[4rem] bg-gradient-to-br from-emerald-500 to-emerald-700 text-center"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 60px), calc(100% - 60px) 100%, 0 100%)' }}
                    >
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-black mb-6">
                            Prêt à prendre la route ?
                        </h2>
                        <p className="text-[16px] font-bold text-black/60 max-w-md mx-auto mb-10">
                            Que vous soyez locataire ou propriétaire, AutoLoc vous accompagne à chaque étape.
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link
                                href="/explorer"
                                className="inline-flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-[15px] font-bold text-white shadow-2xl hover:scale-105 transition-all"
                            >
                                Explorer les véhicules
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-black/10 bg-black/5 px-8 py-4 text-[15px] font-bold text-black hover:bg-black/10 transition-all"
                            >
                                Créer un compte
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
