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

export const metadata: Metadata = {
    title: 'Comment ça marche — AutoLoc',
    description: 'Découvrez comment louer un véhicule sur AutoLoc en quelques étapes simples : recherchez, réservez, payez, conduisez.',
};

// ── Components ────────────────────────────────────────────────────────────────

function SectionBadge({ text, isDark = false }: { text: string, isDark?: boolean }) {
    return (
        <div className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-6",
            isDark 
                ? "border-emerald-400/30 bg-emerald-400/10" 
                : "border-emerald-500/20 bg-emerald-50"
        )}>
            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isDark ? "bg-emerald-400" : "bg-emerald-500")} />
            <span className={cn("text-[11px] font-bold uppercase tracking-widest", isDark ? "text-emerald-400" : "text-emerald-600")}>
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
        <main className="min-h-screen bg-[#F8FAFC]">
            {/* ── Hero (Black with Bottom Radius) ── */}
            <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-48 px-4 bg-black rounded-b-[4rem] lg:rounded-b-[8rem]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none bg-emerald-500/30" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative mx-auto max-w-4xl text-center">
                    <SectionBadge text="Simple et transparent" isDark />
                    <h1 className="text-4xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                        Découvrez la nouvelle façon de{' '}
                        <span className="text-emerald-400 italic">louer</span>
                    </h1>
                    <p className="mt-6 text-[18px] font-medium leading-relaxed text-white/40 max-w-2xl mx-auto">
                        Une plateforme pensée pour votre sécurité, que vous cherchiez un véhicule ou que vous souhaitiez rentabiliser le vôtre.
                    </p>
                </div>
            </section>

            {/* ── Tenant Steps (Alternating Mix) ── */}
            <section className="px-4 py-16 lg:py-28 relative">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <SectionBadge text="Pour les locataires" />
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 mt-2">
                            Prendre la route en <span className="text-emerald-500">4 étapes</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TENANT_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isOdd = i % 2 !== 0;

                            return (
                                <div key={step.title} className="group relative">
                                    <span className={cn(
                                        "absolute -top-6 -left-2 text-[80px] font-black leading-none select-none pointer-events-none transition-colors duration-500",
                                        isOdd ? "text-emerald-400/30" : "text-emerald-500/20"
                                    )}>
                                        0{i + 1}
                                    </span>

                                    <div 
                                        className={cn(
                                            "relative overflow-hidden p-8 h-full flex flex-col transition-all duration-500 group-hover:-translate-y-2",
                                            isOdd 
                                                ? "bg-black text-white rounded-tr-[4rem] rounded-bl-[4rem] shadow-2xl" 
                                                : "bg-white border border-slate-200 text-slate-900 rounded-tl-[4rem] rounded-br-[4rem] shadow-sm group-hover:border-emerald-500/20",
                                        )}
                                        style={isOdd ? { clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' } : {}}
                                    >
                                        <div className="mb-8">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                isOdd 
                                                    ? "bg-emerald-400 text-black" 
                                                    : "bg-slate-50 border border-slate-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
                                            )}>
                                                <Icon className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <span className={cn(
                                                "inline-block text-[10px] font-bold uppercase tracking-widest mb-3",
                                                isOdd ? "text-emerald-400/50" : "text-emerald-600/50"
                                            )}>
                                                {step.tag}
                                            </span>
                                            <h3 className={cn(
                                                "text-[22px] font-black mb-3 tracking-tight",
                                                isOdd ? "text-white" : "text-slate-900"
                                            )}>
                                                {step.title}
                                            </h3>
                                            <p className={cn(
                                                "text-[14px] font-medium leading-relaxed",
                                                isOdd ? "text-white/40" : "text-black"
                                            )}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Owner Steps (Mixed Style) ── */}
            <section className="px-4 py-20 lg:py-32 relative overflow-hidden">
                <div className="mx-auto max-w-5xl">
                    <div 
                        className="bg-black text-white p-12 lg:p-16 mb-16 relative overflow-hidden"
                        style={{ clipPath: 'polygon(60px 0, 100% 0, 100% 100%, 0 100%, 0 60px)' }}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[80px] pointer-events-none" />
                        <div className="relative z-10 text-center lg:text-left">
                            <SectionBadge text="Pour les propriétaires" isDark />
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mt-2">
                                Rentabilisez votre <span className="text-emerald-400">patrimoine</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {OWNER_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isEven = i % 2 === 0;

                            return (
                                <div key={step.title} className="group relative">
                                    <div className="flex items-end h-10">
                                        <div className={cn(
                                            "flex items-center gap-3 px-6 py-2 rounded-t-2xl transition-all duration-500",
                                            isEven ? "bg-black group-hover:bg-emerald-400" : "bg-white group-hover:bg-emerald-500"
                                        )}>
                                            <span className={cn("text-[12px] font-black", isEven ? "text-emerald-400 group-hover:text-black" : "text-emerald-500 group-hover:text-white")}>0{i + 1}</span>
                                            <div className={cn("w-[1px] h-3", isEven ? "bg-white/20 group-hover:bg-black/20" : "bg-slate-200 group-hover:bg-white/20")} />
                                            <Icon className={cn("w-4 h-4", isEven ? "text-emerald-400 group-hover:text-black" : "text-emerald-500 group-hover:text-white")} strokeWidth={2.5} />
                                        </div>
                                        <div className={cn("flex-1 border-b transition-colors duration-500", isEven ? "border-white/10 group-hover:border-emerald-400/50" : "border-slate-200 group-hover:border-emerald-500/50")} />
                                    </div>

                                    <div className={cn(
                                        "relative p-8 rounded-b-[2rem] rounded-tr-[2rem] shadow-2xl transition-all duration-500",
                                        isEven ? "bg-black border border-t-0 border-white/10 group-hover:border-emerald-400/20" : "bg-white border border-t-0 border-slate-100 group-hover:border-emerald-500/20"
                                    )}>
                                        <h3 className="text-[20px] font-black text-emerald-400 mb-3 tracking-tight">
                                            {step.title}
                                        </h3>
                                        <p className={cn("text-[14px] lg:text-[15px] font-medium leading-relaxed", isEven ? "text-white/40" : "text-black")}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Guarantees (Mixed Cards) ── */}
            <section className="px-4 py-20 lg:py-32 bg-white">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <SectionBadge text="Sécurité maximale" />
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 mt-2">
                            Pourquoi nous <span className="text-emerald-500">faire confiance</span> ?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GUARANTEES.map((item, i) => {
                            const isBlack = i % 2 === 0;
                            return (
                                <div
                                    key={item.label}
                                    className={cn(
                                        "flex flex-col gap-4 p-8 rounded-[2.5rem] transition-all group shadow-xl",
                                        isBlack ? "bg-black border border-white/5 hover:border-emerald-400/20" : "bg-slate-50 border border-slate-100 hover:border-emerald-500/20"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        isBlack ? "bg-white/5 group-hover:bg-emerald-400 group-hover:text-black" : "bg-white group-hover:bg-emerald-500 group-hover:text-white shadow-md"
                                    )}>
                                        <item.icon className={cn("w-5 h-5", isBlack ? "text-emerald-400 group-hover:text-inherit" : "text-emerald-500 group-hover:text-inherit")} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-[16px] font-black text-emerald-400 mb-2">{item.label}</h3>
                                        <p className={cn("text-[14px] font-medium leading-relaxed", isBlack ? "text-white/40" : "text-black")}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="px-4 py-20 mb-10">
                <div className="mx-auto max-w-7xl">
                    <div 
                        className="relative overflow-hidden px-8 py-16 lg:py-24 rounded-[4rem] bg-black text-center shadow-2xl"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 60px), calc(100% - 60px) 100%, 0 100%)' }}
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />
                        
                        <h2 className="text-3xl lg:text-6xl font-black tracking-tight text-white mb-6 relative z-10">
                            Prêt à prendre la <span className="text-emerald-400">route</span> ?
                        </h2>
                        <div className="flex items-center justify-center gap-4 flex-wrap relative z-10">
                            <Link
                                href="/explorer"
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-[15px] font-bold text-black shadow-2xl hover:bg-emerald-400 transition-all"
                            >
                                Explorer les véhicules
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
