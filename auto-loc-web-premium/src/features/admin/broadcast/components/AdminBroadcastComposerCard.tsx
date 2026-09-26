'use client';

import React, { useId, useState } from 'react';
import {
  Send,
  Smartphone,
  Mail,
  MessageSquare,
  Globe,
  Image as ImageIcon,
  Link2,
  Check,
  Tag,
  Camera,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import type {
  TargetAudience,
  BroadcastChannel,
  SendBroadcastDto,
  AdminAudienceStats,
} from '../../../../core/api/adminBroadcastApi';

interface Payload {
  title: string;
  message: string;
  targetAudience: TargetAudience;
  channels: BroadcastChannel[];
  url: string;
  imageUrl: string;
}

interface AdminBroadcastComposerCardProps {
  stats?: AdminAudienceStats;
  isSending?: boolean;
  onSend: (dto: SendBroadcastDto) => Promise<boolean>;
  onPayloadChange?: (payload: Payload) => void;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

const TITLE_MAX = 60;
const MESSAGE_MAX = 160;

const fmt = (n: number) => n.toLocaleString('fr-FR');

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-brand-main focus:outline-none focus:ring-2 focus:ring-brand-main/25';

const AUDIENCES: { id: TargetAudience; label: string }[] = [
  { id: 'TOUS', label: 'Tous les membres' },
  { id: 'HOTES', label: 'Hôtes' },
  { id: 'LOCATAIRES', label: 'Locataires' },
  { id: 'KYC_VALIDE', label: 'KYC vérifiés' },
];

const CHANNELS: {
  id: BroadcastChannel;
  label: string;
  desc: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    { id: 'PUSH_MOBILE', label: 'Push mobile', desc: 'iOS et Android', short: 'push mobile', icon: Smartphone },
    { id: 'WEB_PUSH', label: 'Push web', desc: 'Navigateurs', short: 'push web', icon: Globe },
    { id: 'EMAIL', label: 'Email', desc: 'Message HTML', short: 'email', icon: Mail },
    { id: 'WHATSAPP', label: 'WhatsApp / SMS', desc: 'Message direct', short: 'WhatsApp / SMS', icon: MessageSquare },
  ];

const TEMPLATES: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  audience: TargetAudience;
}[] = [
    {
      label: 'Promo week-end 15 %',
      icon: Tag,
      title: '🌟 Offre Spéciale Week-end AutoLoc',
      message:
        'Profitez de 15% de réduction sur la réservation de SUV et Berlines ce week-end avec le code DAKAR15 !',
      audience: 'LOCATAIRES',
    },
    {
      label: 'Rappel photos check-in',
      icon: Camera,
      title: '🚨 Rappel Importation Photos Check-in',
      message:
        'Avis aux propriétaires : n’oubliez pas de charger les 4 photos obligatoires du véhicule avant de remettre les clés.',
      audience: 'HOTES',
    },
    {
      label: 'Relance permis',
      icon: ShieldCheck,
      title: '🔐 Validez votre Permis de Conduire',
      message:
        'Débloquez la réservation instantanée et la garantie assurance tous risques en complétant la vérification de votre permis.',
      audience: 'TOUS',
    },
  ];

function joinList(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span className={`text-xs tabular-nums ${over ? 'text-amber-700' : 'text-gray-400'}`}>
      {value}/{max}
    </span>
  );
}

export function AdminBroadcastComposerCard({
  stats,
  isSending = false,
  onSend,
  onPayloadChange,
}: AdminBroadcastComposerCardProps) {
  const uid = useId();
  const [payload, setPayload] = useState<Payload>({
    targetAudience: 'TOUS',
    channels: ['PUSH_MOBILE', 'EMAIL'],
    title: '🌟 Offre Spéciale AutoLoc Dakar',
    message:
      'Profitez de 15% de réduction sur la réservation de SUV et Berlines d’exception ce week-end à Dakar !',
    url: '/dashboard',
    imageUrl: '',
  });
  const [confirming, setConfirming] = useState(false);

  const { title, message, targetAudience, channels, url, imageUrl } = payload;

  // Toute modification annule une confirmation en attente et prévient l'aperçu live
  const update = (partial: Partial<Payload>) => {
    const next = { ...payload, ...partial };
    setPayload(next);
    setConfirming(false);
    onPayloadChange?.(next);
  };

  const toggleChannel = (channel: BroadcastChannel) => {
    update({
      channels: channels.includes(channel)
        ? channels.filter((c) => c !== channel)
        : [...channels, channel],
    });
  };

  const counts: Partial<Record<TargetAudience, number>> = {
    TOUS: stats?.totalUsers,
    HOTES: stats?.totalHotes,
    LOCATAIRES: stats?.totalLocataires,
    KYC_VALIDE: stats?.totalKycVerifies,
  };
  const countVal = counts[targetAudience];
  const audienceObj = AUDIENCES.find((a) => a.id === targetAudience);
  const targetLabelName = audienceObj?.label ? audienceObj.label.toLowerCase() : 'membres';

  const recipientsLabel =
    countVal !== undefined
      ? `${fmt(countVal)} ${countVal > 1 ? 'personnes' : 'personne'}`
      : `les ${targetLabelName}`;
  const estimatedRecipients = countVal ?? 0;

  const channelSummary = joinList(
    CHANNELS.filter((c) => channels.includes(c.id)).map((c) => c.short)
  );

  const isComplete = title.trim().length > 0 && message.trim().length > 0;
  const canSend = !isSending && channels.length > 0 && isComplete;

  const send = async () => {
    await onSend({
      title,
      message,
      targetAudience,
      channels,
      url: url.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
    setConfirming(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await send();
  };

  let helper = '';
  if (channels.length === 0) helper = 'Choisissez au moins un canal.';
  else if (!isComplete) helper = 'Renseignez un titre et un message.';

  return (
    <section
      aria-label="Composer une diffusion"
      className="rounded-[28px] border border-brand-main/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,61,46,0.35)] sm:p-8"
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 style={DISPLAY_FONT} className="text-2xl leading-tight text-brand-main sm:text-3xl">
            Nouvelle diffusion
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Rédigez le message, choisissez qui le reçoit et par quels canaux.
          </p>
        </div>
        <div className="shrink-0 text-right" aria-live="polite">
          <div
            style={DISPLAY_FONT}
            className="text-3xl leading-none text-brand-main tabular-nums sm:text-4xl"
          >
            {stats ? fmt(estimatedRecipients) : '–'}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {estimatedRecipients > 1 ? 'destinataires' : 'destinataire'}
          </div>
        </div>
      </div>

      {/* Modèles */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-gray-500">Partir d'un modèle</span>
        {TEMPLATES.map(({ label, icon: Icon, title: t, message: m, audience }) => (
          <button
            key={label}
            type="button"
            onClick={() => update({ title: t, message: m, targetAudience: audience })}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 transition hover:border-brand-main/40 hover:bg-brand-main/[0.04] hover:text-brand-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Destinataires */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">Destinataires</legend>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AUDIENCES.map((a) => {
              const selected = targetAudience === a.id;
              const count = counts[a.id];
              return (
                <label key={a.id} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name={`${uid}-audience`}
                    checked={selected}
                    onChange={() => update({ targetAudience: a.id })}
                    className="peer sr-only"
                  />
                  <div
                    className={`rounded-2xl border px-4 py-3 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-main peer-focus-visible:ring-offset-2 ${selected
                        ? 'border-brand-main bg-brand-main text-champagne'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-brand-main/40'
                      }`}
                  >
                    <div className="text-sm font-medium">{a.label}</div>
                    <div className="mt-0.5 text-xs tabular-nums opacity-70">
                      {count !== undefined ? fmt(count) : '–'}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Canaux */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">Canaux</legend>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHANNELS.map((ch) => {
              const checked = channels.includes(ch.id);
              const Icon = ch.icon;
              return (
                <label key={ch.id} className="relative block cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChannel(ch.id)}
                    className="peer sr-only"
                  />
                  <div
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-main peer-focus-visible:ring-offset-2 ${checked
                        ? 'border-brand-main bg-brand-main/[0.05]'
                        : 'border-gray-200 bg-white hover:border-brand-main/40'
                      }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${checked ? 'bg-brand-main text-champagne' : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900">
                        {ch.label}
                      </span>
                      <span className="block truncate text-xs text-gray-500">{ch.desc}</span>
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${checked
                          ? 'border-brand-main bg-brand-main text-champagne'
                          : 'border-gray-300 text-transparent'
                        }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Contenu */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label htmlFor={`${uid}-title`} className="text-sm font-semibold text-gray-900">
                Titre
              </label>
              <Counter value={title.length} max={TITLE_MAX} />
            </div>
            <input
              id={`${uid}-title`}
              type="text"
              value={title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Ex : Offre spéciale ce week-end"
              required
              className={`${inputCls} font-medium`}
            />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label htmlFor={`${uid}-message`} className="text-sm font-semibold text-gray-900">
                Message
              </label>
              <Counter value={message.length} max={MESSAGE_MAX} />
            </div>
            <textarea
              id={`${uid}-message`}
              rows={4}
              value={message}
              onChange={(e) => update({ message: e.target.value })}
              placeholder="Le texte reçu par vos utilisateurs sur chaque canal"
              required
              className={`${inputCls} leading-relaxed`}
            />
            {(title.length > TITLE_MAX || message.length > MESSAGE_MAX) && (
              <p className="mt-2 text-xs text-amber-700">
                Au-delà de ces longueurs, certains appareils coupent le texte des notifications.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${uid}-url`}
                className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"
              >
                <Link2 className="h-4 w-4 text-gray-400" />
                Lien à l'ouverture
              </label>
              <input
                id={`${uid}-url`}
                type="text"
                value={url}
                onChange={(e) => update({ url: e.target.value })}
                placeholder="/dashboard/reservations"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
            <div>
              <label
                htmlFor={`${uid}-image`}
                className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"
              >
                <ImageIcon className="h-4 w-4 text-gray-400" />
                Image d'en-tête
                <span className="font-normal text-gray-400">(optionnelle)</span>
              </label>
              <input
                id={`${uid}-image`}
                type="url"
                value={imageUrl}
                onChange={(e) => update({ imageUrl: e.target.value })}
                placeholder="https://…"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
          </div>
        </div>

        {/* Envoi */}
        <div className="border-t border-gray-100 pt-6">
          {confirming ? (
            <div
              role="alertdialog"
              aria-label="Confirmer l'envoi"
              className="rounded-2xl border border-champagne bg-champagne/30 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6"
            >
              <p className="text-sm text-brand-main">
                Vous allez envoyer ce message {countVal !== undefined ? <>à <strong className="font-semibold">{recipientsLabel}</strong></> : <>aux <strong className="font-semibold">{targetLabelName}</strong></>} par {channelSummary}.
                L'envoi est immédiat et ne peut pas être annulé.
              </p>
              <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={isSending}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-brand-main transition hover:bg-brand-main/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main disabled:opacity-50"
                >
                  Modifier
                </button>
                <button
                  type="submit"
                  disabled={!canSend}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-main px-5 py-2.5 text-sm font-semibold text-champagne transition hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Confirmer l'envoi
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {helper ? (
                  helper
                ) : (
                  <>
                    Envoi {countVal !== undefined ? <>à <span className="font-medium text-gray-900">{recipientsLabel}</span></> : <>aux <span className="font-medium text-gray-900">{targetLabelName}</span></>} par{' '}
                    {channelSummary}.
                  </>
                )}
              </p>
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-main px-7 py-3.5 text-sm font-semibold text-champagne shadow-lg shadow-brand-main/20 transition hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
              >
                <Send className="h-4 w-4" />
                Envoyer la diffusion
              </button>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}