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
        variant: 'white',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp',
        value: '+221 77 123 45 67',
        href: 'https://wa.me/221771234567',
        description: 'Réponse rapide 7j/7',
        variant: 'black',
    },
];

const INFO_ITEMS = [
    {
        icon: Building2,
        label: 'Siège social',
        value: 'Dakar, Sénégal\nAlmadies, Zone B',
    },
    {
        icon: Clock,
        label: 'Horaires',
        value: 'Lundi – Samedi\n08h00 – 20h00',
    },
];

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-white border-b border-slate-200 px-4 py-20 lg:py-28">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/5 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/5 blur-[100px] pointer-events-none" />

                <div className="relative mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 mb-6">
                        <HeadphonesIcon className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                            Support client
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
                        On reste en <span className="text-emerald-500 italic">contact</span> ?
                    </h1>
                    <p className="mt-6 text-[17px] font-medium leading-relaxed text-slate-500 max-w-xl mx-auto">
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
                                        isBlack ? "bg-black text-emerald-400" : "bg-white border border-b-0 border-slate-200 text-slate-400 group-hover:text-emerald-500"
                                    )}>
                                        {isBlack ? 'Prioritaire' : `Canal 0${i + 1}`}
                                    </div>
                                </div>

                                <div 
                                    className={cn(
                                        "relative overflow-hidden p-6 transition-all duration-500",
                                        isBlack 
                                            ? "bg-black text-white rounded-2xl rounded-tl-none shadow-2xl group-hover:shadow-emerald-500/20" 
                                            : "bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-lg group-hover:border-emerald-400/30",
                                        isBlack && "clip-path-particular" // Custom shape via inline style below
                                    )}
                                    style={isBlack ? { clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' } : {}}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                                        isBlack ? "bg-emerald-400 text-black" : "bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white"
                                    )}>
                                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                                    </div>
                                    <h3 className={cn("text-[14px] font-bold", isBlack ? "text-white" : "text-slate-900")}>
                                        {channel.title}
                                    </h3>
                                    <p className="text-[16px] font-black text-emerald-500 mt-1 tracking-tight">{channel.value}</p>
                                    <p className={cn("text-[11px] font-medium mt-1", isBlack ? "text-white/40" : "text-slate-400")}>
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

                    {/* Info Side (Particular Black Shape) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div 
                            className="p-10 bg-black text-white relative overflow-hidden"
                            style={{ clipPath: 'polygon(40px 0, 100% 0, 100% 100%, 0 100%, 0 40px)' }}
                        >
                            {/* Decorative background circle */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />
                            
                            <h3 className="text-[22px] font-black mb-10 tracking-tight">Informations utiles</h3>
                            
                            <div className="space-y-10">
                                {INFO_ITEMS.map((item) => (
                                    <div key={item.label} className="flex gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">{item.label}</p>
                                            <p className="text-[16px] font-bold text-white whitespace-pre-line leading-relaxed">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mobile-optimized visual anchor */}
                            <div 
                                className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-emerald-400 hover:text-black transition-all duration-500"
                                onClick={() => window.open('https://maps.google.com', '_blank')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center group-hover:bg-black/20">
                                        <MapPin className="w-5 h-5 text-emerald-400 group-hover:text-black" />
                                    </div>
                                    <p className="text-[14px] font-black uppercase tracking-widest">Voir sur la carte</p>
                                </div>
                                <Globe className="w-4 h-4 opacity-40" />
                            </div>
                        </div>

                        {/* Social Link (Airy) */}
                        <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-white flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm">
                            <div>
                                <h4 className="text-[15px] font-black text-slate-900">Suivez notre aventure</h4>
                                <p className="text-[13px] font-medium text-slate-400">@autoloc_sn sur Instagram</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Globe className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
