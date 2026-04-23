import React from 'react';
import type { Metadata } from 'next';
import {
    Mail, Phone, MapPin, MessageCircle,
    Clock, Globe, HeadphonesIcon, Building2,
} from 'lucide-react';
import { Footer } from '@/features/landing/Footer';
import { ContactForm } from '@/features/contact/ContactForm';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Contact — AutoLoc',
    description: 'Contactez l\'équipe AutoLoc par email, téléphone ou WhatsApp. Nous sommes disponibles 7j/7 pour répondre à vos questions.',
};

const CONTACT_CHANNELS = [
    {
        icon: Mail,
        title: 'Email',
        value: 'contact@autoloc.sn',
        href: 'mailto:contact@autoloc.sn',
        description: 'Réponse sous 24h',
        variant: 'white',
    },
    {
        icon: Phone,
        title: 'Téléphone',
        value: '+221 77 123 45 67',
        href: 'tel:+221771234567',
        description: 'Lun – Sam, 8h – 20h',
        variant: 'black',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp',
        value: '+221 77 123 45 67',
        href: 'https://wa.me/221771234567',
        description: 'Réponse rapide 7j/7',
        variant: 'white',
    },
];

const INFO_ITEMS = [
    {
        icon: Building2,
        label: 'Siège social',
        value: 'Dakar, Sénégal\nAlmadies, Zone B',
        variant: 'black',
    },
    {
        icon: Clock,
        label: 'Horaires',
        value: 'Lundi – Samedi\n08h00 – 20h00',
        variant: 'white',
    },
];

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            {/* ── Hero (Black Section) ── */}
            <section className="relative overflow-hidden bg-black px-4 py-20 lg:py-32 rounded-b-[4rem] lg:rounded-b-[8rem]">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-emerald-400/5 blur-[120px] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 mb-6">
                        <HeadphonesIcon className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                            Support client
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-7xl font-black tracking-tight text-white leading-tight">
                        On reste en <span className="text-emerald-400 italic">contact</span> ?
                    </h1>
                    <p className="mt-6 text-[17px] font-medium leading-relaxed text-white/40 max-w-xl mx-auto">
                        Besoin d&apos;aide pour une réservation ou envie de devenir partenaire ? Notre équipe est à votre écoute.
                    </p>
                </div>
            </section>

            {/* ── Contact Channels ── */}
            <section className="px-4 -mt-10 relative z-10">
                <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {CONTACT_CHANNELS.map((channel, i) => {
                        const Icon = channel.icon;
                        const isBlack = channel.variant === 'black';

                        return (
                            <a
                                key={channel.title}
                                href={channel.href}
                                target={channel.href.startsWith('http') ? '_blank' : undefined}
                                rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="group flex flex-col"
                            >
                                <div className={cn(
                                    "flex items-end h-8 ml-4 transition-all duration-300",
                                    isBlack ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                                )}>
                                    <div className={cn(
                                        "px-4 py-1 rounded-t-xl text-[10px] font-black uppercase tracking-widest",
                                        isBlack ? "bg-black text-emerald-400" : "bg-white text-emerald-500 shadow-sm"
                                    )}>
                                        {isBlack ? 'Urgent' : `Canal 0${i + 1}`}
                                    </div>
                                </div>

                                <div 
                                    className={cn(
                                        "relative overflow-hidden p-6 transition-all duration-500",
                                        isBlack 
                                            ? "bg-black text-white rounded-2xl rounded-tl-none shadow-2xl group-hover:shadow-emerald-500/20" 
                                            : "bg-white rounded-2xl rounded-tl-none shadow-lg group-hover:shadow-emerald-500/10",
                                    )}
                                    style={isBlack ? { clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' } : {}}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                                        isBlack ? "bg-emerald-400 text-black" : "bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white"
                                    )}>
                                        <Icon className="w-5 h-5" strokeWidth={2} />
                                    </div>
                                    <h3 className={cn("text-[14px] font-bold", isBlack ? "text-white" : "text-slate-900")}>
                                        {channel.title}
                                    </h3>
                                    <p className="text-[16px] font-black text-emerald-500 mt-1 tracking-tight">{channel.value}</p>
                                    <p className={cn("text-[11px] font-medium mt-1", isBlack ? "text-white/70" : "text-slate-600")}>
                                        {channel.description}
                                    </p>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </section>

            {/* ── Form & Info ── */}
            <section className="px-4 py-20 lg:py-32">
                <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Contact Form */}
                    <div 
                        className="lg:col-span-7 relative bg-white p-8 lg:p-12 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.04)] border border-slate-100 rounded-[3rem]"
                    >
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                                Envoyez un message
                            </h2>
                            <p className="text-[15px] font-medium text-slate-400 mb-10">
                                Dites-nous tout, on vous répond généralement en moins de 2h.
                            </p>
                            <ContactForm />
                        </div>
                    </div>

                    {/* Info Side (Mixed Cards) */}
                    <div className="lg:col-span-5 space-y-6">
                        {INFO_ITEMS.map((item, i) => {
                            const isBlack = item.variant === 'black';
                            return (
                                <div 
                                    key={item.label}
                                    className={cn(
                                        "p-10 relative overflow-hidden transition-all duration-500",
                                        isBlack ? "bg-black text-white shadow-2xl" : "bg-white text-slate-900 shadow-xl"
                                    )}
                                    style={{ clipPath: isBlack ? 'polygon(40px 0, 100% 0, 100% 100%, 0 100%, 0 40px)' : 'none', borderRadius: isBlack ? '0' : '3rem' }}
                                >
                                    <div className="flex gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                                            isBlack ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-100"
                                        )}>
                                            <item.icon className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className={cn("text-[11px] font-bold uppercase tracking-[0.2em] mb-2", isBlack ? "text-white/30" : "text-slate-400")}>{item.label}</p>
                                            <p className={cn("text-[16px] font-bold whitespace-pre-line leading-relaxed", isBlack ? "text-white/70" : "text-slate-600")}>{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Map Link (Black) */}
                        <a 
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-6 rounded-3xl bg-black text-white border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-emerald-400 hover:text-black transition-all duration-500 shadow-2xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center group-hover:bg-black/20">
                                    <MapPin className="w-5 h-5 text-emerald-400 group-hover:text-black" />
                                </div>
                                <p className="text-[14px] font-black uppercase tracking-widest">Voir sur la carte</p>
                            </div>
                            <Globe className="w-4 h-4 opacity-40" />
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
