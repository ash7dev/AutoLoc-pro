'use client';

import React, { useState } from 'react';
import { Send, Loader2, Check, AlertCircle, User, Mail, MessageSquareText, Tag } from 'lucide-react';

const SUBJECTS = [
  { value: 'reservation', label: 'Question sur une réservation' },
  { value: 'account', label: 'Mon compte / Vérification KYC' },
  { value: 'payment', label: 'Paiement / Remboursement' },
  { value: 'insurance', label: 'Assurance & Couverture' },
  { value: 'host', label: 'Devenir hôte propriétaire' },
  { value: 'partnership', label: 'Partenariat commercial' },
  { value: 'bug', label: 'Signaler un problème technique' },
  { value: 'other', label: 'Autre demande' },
];

export const ContactForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    if (!fullName.trim() || !email.trim() || !subject || !message.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulating API call — in production this would POST to /api/contact
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSubmitStatus('success');
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="font-fraunces text-2xl font-normal text-[#041912] sm:text-3xl">
          Envoyez-nous un message
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">
          Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
        </p>
      </div>

      {/* Success State */}
      {submitStatus === 'success' && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#0A3D2E]/15 bg-[#0A3D2E]/5 p-4 text-[#0A3D2E]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E] text-[#F1DFB6]">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Message envoyé avec succès !</p>
            <p className="mt-0.5 text-xs text-[#0A3D2E]/70">
              Notre équipe à Dakar vous répondra sous 24h ouvrées. Vérifiez vos e-mails pour notre réponse.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {submitStatus === 'error' && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-[12.5px] font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Une erreur est survenue. Veuillez réessayer ou nous contacter directement par téléphone.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row: Name & Email */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
              <User className="h-3 w-3" />
              Nom complet <span className="text-rose-400">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex : Ousmane Diallo"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-medium text-[#041912] placeholder:text-slate-300 focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
              <Mail className="h-3 w-3" />
              Adresse e-mail <span className="text-rose-400">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@domaine.com"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-medium text-[#041912] placeholder:text-slate-300 focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10 transition-colors"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="contact-subject" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
            <Tag className="h-3 w-3" />
            Sujet de votre demande <span className="text-rose-400">*</span>
          </label>
          <select
            id="contact-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-medium text-[#041912] focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10 transition-colors bg-white"
          >
            <option value="" disabled>Sélectionnez un sujet…</option>
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="contact-message" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
            <MessageSquareText className="h-3 w-3" />
            Votre message <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez votre demande en détail (numéro de réservation, problème rencontré, etc.)…"
            required
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-medium text-[#041912] placeholder:text-slate-300 focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10 transition-colors leading-relaxed"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{message.length} / 2000 caractères</p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting || !fullName.trim() || !email.trim() || !subject || !message.trim()}
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#041912] px-6 py-3 text-[13px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#4ADE80]" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? 'Envoi en cours…' : 'Envoyer le message'}
          </button>
        </div>
      </form>
    </section>
  );
};
