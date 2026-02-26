'use client';

import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUBJECTS = [
    'Question générale',
    'Problème de réservation',
    'Problème de paiement',
    'Suggestion / Amélioration',
    'Partenariat',
    'Autre',
];

export function ContactForm(): React.ReactElement {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;
        setSending(true);

        // Simulate sending (no backend endpoint yet)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setSending(false);
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
    }

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-2xl border border-emerald-100 bg-emerald-50/50">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                    <p className="text-[16px] font-bold text-black">Message envoyé !</p>
                    <p className="mt-1 text-[13px] text-black/40 max-w-xs mx-auto">
                        Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-2 text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 underline decoration-dotted"
                >
                    Envoyer un autre message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Nom complet" value={name} onChange={setName} placeholder="Votre nom" required />
                <FormField label="Email" value={email} onChange={setEmail} placeholder="votre@email.com" type="email" required />
            </div>

            <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1.5">
                    Sujet
                </label>
                <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all appearance-none"
                >
                    {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1.5">
                    Message
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre question ou problème..."
                    rows={5}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-medium text-black placeholder:text-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={sending || !name.trim() || !email.trim() || !message.trim()}
                className={cn(
                    'w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-3.5',
                    'text-[14px] font-bold transition-all duration-200',
                    'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
                    'hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-px active:translate-y-0',
                    'disabled:bg-slate-100 disabled:text-black/30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
                )}
            >
                {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Send className="w-4 h-4" strokeWidth={2} />
                )}
                {sending ? 'Envoi en cours…' : 'Envoyer le message'}
            </button>
        </form>
    );
}

function FormField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = false,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1.5">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-medium text-black placeholder:text-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
            />
        </div>
    );
}
