import React from 'react';
import type { Metadata } from 'next';
import {
    Mail, Phone, MapPin, MessageCircle,
    Clock, Send, Building2, Globe, HeadphonesIcon,
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
        color: 'from-blue-500 to-blue-600',
        bgLight: 'bg-blue-50',
    },
    {
        icon: Phone,
        title: 'Téléphone',
        value: '+221 77 123 45 67',
        href: 'tel:+221771234567',
        description: 'Lun – Sam, 8h – 20h',
        color: 'from-emerald-500 to-emerald-600',
        bgLight: 'bg-emerald-50',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp',
        value: '+221 77 123 45 67',
        href: 'https://wa.me/221771234567',
        description: 'Réponse rapide 7j/7',
        color: 'from-green-500 to-green-600',
        bgLight: 'bg-green-50',
    },
];

const INFO_ITEMS = [
    {
        icon: Building2,
        label: 'Adresse',
        value: 'Dakar, Sénégal\nZone B, Almadies',
    },
    {
        icon: Clock,
        label: 'Horaires',
        value: 'Lundi – Samedi\n8h00 – 20h00',
    },
    {
        icon: Globe,
        label: 'Site web',
        value: 'www.autoloc.sn',
    },
];

const FAQ_ITEMS = [
    {
        q: 'Combien de temps pour recevoir une réponse ?',
        a: 'Nous répondons généralement sous 2 heures pendant nos horaires d\'ouverture, et sous 24h par email.',
    },
    {
        q: 'Comment signaler un problème avec une réservation ?',
        a: 'Contactez-nous par WhatsApp ou email avec votre numéro de réservation. Notre équipe traitera votre demande en priorité.',
    },
    {
        q: 'Je suis propriétaire, comment commencer ?',
        a: 'Créez votre compte, complétez votre KYC, puis ajoutez vos véhicules. Notre équipe les vérifiera sous 24h.',
    },
    {
        q: 'Comment fonctionne le paiement ?',
        a: 'Les paiements se font via Wave ou Orange Money. Le locataire paie lors de la réservation, et le propriétaire reçoit son paiement après le check-out.',
    },
];

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-20 lg:py-28 rounded-b-3xl">
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />

                <div className="relative mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-6">
                        <HeadphonesIcon className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                            Support disponible
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                        Contactez-<span className="text-emerald-400">nous</span>
                    </h1>
                    <p className="mt-5 text-[16px] font-medium leading-relaxed text-white/40 max-w-xl mx-auto">
                        Une question, un problème ou une suggestion ? Notre équipe est là pour vous aider.
                    </p>
                </div>
            </section>

            {/* Contact channels */}
            <section className="px-4 -mt-10 relative z-10">
                <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {CONTACT_CHANNELS.map((channel) => (
                        <a
                            key={channel.title}
                            href={channel.href}
                            target={channel.href.startsWith('http') ? '_blank' : undefined}
                            rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={cn(
                                'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-4',
                                channel.color,
                            )}>
                                <channel.icon className="w-6 h-6 text-white" strokeWidth={1.75} />
                            </div>
                            <h3 className="text-[15px] font-bold text-black">{channel.title}</h3>
                            <p className="text-[14px] font-semibold text-emerald-600 mt-1">{channel.value}</p>
                            <p className="text-[11px] font-medium text-black/30 mt-1">{channel.description}</p>
                        </a>
                    ))}
                </div>
            </section>

            {/* Form + Info */}
            <section className="px-4 py-16 lg:py-24">
                <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Form */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-black tracking-tight text-black mb-2">
                            Envoyez-nous un message
                        </h2>
                        <p className="text-[14px] font-medium text-black/40 mb-8">
                            Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                        </p>
                        <ContactForm />
                    </div>

                    {/* Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black tracking-tight text-black mb-2">
                            Informations
                        </h2>

                        {INFO_ITEMS.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-white"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-black/30" strokeWidth={1.75} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{item.label}</p>
                                    <p className="text-[14px] font-semibold text-black mt-0.5 whitespace-pre-line">{item.value}</p>
                                </div>
                            </div>
                        ))}

                        {/* Map placeholder */}
                        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 h-52 flex items-center justify-center">
                            <div className="text-center">
                                <MapPin className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                                <p className="mt-2 text-[12px] font-medium text-black/30">Dakar, Sénégal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-4 py-16 lg:py-24 bg-slate-50/60">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-12">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-black/30">
                            Questions fréquentes
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-black mt-2">
                            FAQ <span className="text-emerald-500">rapide</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {FAQ_ITEMS.map((item) => (
                            <div
                                key={item.q}
                                className="p-5 rounded-2xl border border-slate-100 bg-white"
                            >
                                <h3 className="text-[14px] font-bold text-black">{item.q}</h3>
                                <p className="mt-2 text-[13px] font-medium text-black/40 leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
