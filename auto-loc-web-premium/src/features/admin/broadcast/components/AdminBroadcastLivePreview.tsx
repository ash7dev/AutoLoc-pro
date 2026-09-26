'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Smartphone,
  Mail,
  MessageCircle,
  ExternalLink,
  Flashlight,
  Camera,
  CheckCheck,
} from 'lucide-react';
import type { TargetAudience, BroadcastChannel } from '../../../../core/api/adminBroadcastApi';

interface AdminBroadcastLivePreviewProps {
  payload: {
    title: string;
    message: string;
    targetAudience: TargetAudience;
    channels: BroadcastChannel[];
    url: string;
    imageUrl: string;
  };
}

type TabId = 'PUSH' | 'EMAIL' | 'WHATSAPP';

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

const TABS: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  channels: BroadcastChannel[];
}[] = [
    { id: 'PUSH', label: 'Push', icon: Smartphone, channels: ['PUSH_MOBILE', 'WEB_PUSH'] },
    { id: 'EMAIL', label: 'Email', icon: Mail, channels: ['EMAIL'] },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle, channels: ['WHATSAPP'] },
  ];

const AUDIENCE_LABELS: Partial<Record<TargetAudience, string>> = {
  TOUS: 'Tous les membres',
  HOTES: 'Hôtes',
  LOCATAIRES: 'Locataires',
  KYC_VALIDE: 'KYC vérifiés',
};

const CHANNEL_LABELS: Partial<Record<BroadcastChannel, string>> = {
  PUSH_MOBILE: 'Push mobile',
  WEB_PUSH: 'Push web',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp / SMS',
};

interface PreviewProps {
  title: string;
  message: string;
  url: string;
  image?: string;
  onImageError: () => void;
  time: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/* Push : écran verrouillé                                             */
/* ------------------------------------------------------------------ */
function PushPreview({ title, message, url, image, onImageError, time, date }: PreviewProps) {
  return (
    <div className="w-full max-w-[290px] rounded-[46px] border border-white/10 bg-[#0C1512] p-2.5 shadow-[0_40px_70px_-25px_rgba(0,0,0,0.7)]">
      <div className="relative flex min-h-[500px] flex-col overflow-hidden rounded-[37px] bg-gradient-to-b from-[#1D5D47] via-[#0F4535] to-[#052519] px-4 pb-4 pt-3 text-white">
        <div className="mx-auto h-6 w-24 rounded-full bg-black" />

        <div className="mt-6 text-center">
          <div className="min-h-[1.25rem] text-[13px] font-medium text-white/70">{date}</div>
          <div className="text-[64px] font-light leading-none tracking-tight tabular-nums">
            {time}
          </div>
        </div>

        {/* Bannière de notification */}
        <div className="al-banner mt-7 rounded-3xl bg-white/[0.14] p-3.5 shadow-lg ring-1 ring-white/15 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                style={DISPLAY_FONT}
                className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-brand-main text-sm text-champagne ring-1 ring-champagne/30"
              >
                A
              </span>
              <span className="text-xs font-semibold text-white/90">AutoLoc</span>
            </div>
            <span className="text-[11px] text-white/60">maintenant</span>
          </div>

          <h4 className="line-clamp-1 text-[13px] font-semibold text-white">{title}</h4>
          <p className="mt-0.5 line-clamp-3 text-[12.5px] leading-snug text-white/85">{message}</p>

          {image && (
            <div className="mt-2.5 overflow-hidden rounded-xl ring-1 ring-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Image de la notification"
                onError={onImageError}
                className="h-28 w-full object-cover"
              />
            </div>
          )}

          {url && (
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-white/15 pt-2 text-[11px] text-champagne">
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">Ouvre {url}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center justify-between px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/10">
              <Flashlight className="h-4 w-4 text-white/85" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/10">
              <Camera className="h-4 w-4 text-white/85" />
            </span>
          </div>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Email                                                               */
/* ------------------------------------------------------------------ */
function EmailPreview({ title, message, url, image, onImageError }: PreviewProps) {
  return (
    <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_40px_70px_-25px_rgba(0,0,0,0.6)]">
      {/* En-tête du client mail */}
      <div className="space-y-1 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs">
        <div className="flex gap-3">
          <span className="w-10 shrink-0 text-gray-400">De</span>
          <span className="text-gray-800">AutoLoc</span>
        </div>
        <div className="flex gap-3">
          <span className="w-10 shrink-0 text-gray-400">Objet</span>
          <span className="truncate font-medium text-gray-900">{title}</span>
        </div>
      </div>

      {/* Bandeau de marque */}
      <div className="bg-brand-main px-6 py-7 text-center">
        <div style={DISPLAY_FONT} className="text-3xl leading-none text-champagne">
          AutoLoc
        </div>
        <p className="mt-2 text-xs text-emerald-100/70">Location de véhicules au Sénégal</p>
      </div>

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt="Image d'en-tête de l'email"
          onError={onImageError}
          className="h-36 w-full object-cover"
        />
      )}

      <div className="space-y-4 px-6 py-6">
        <h4 style={DISPLAY_FONT} className="text-xl leading-snug text-brand-main">
          {title}
        </h4>
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-600">{message}</p>
        <div className="pt-1">
          <a
            href={url || '#'}
            onClick={(e) => e.preventDefault()}
            className="inline-block rounded-xl bg-brand-main px-5 py-2.5 text-xs font-semibold text-champagne shadow-md shadow-brand-main/25"
          >
            Ouvrir AutoLoc
          </a>
        </div>
      </div>

      <div className="space-y-1 border-t border-gray-100 bg-gray-50 px-6 py-4 text-center text-[10px] text-gray-400">
        <p>© {new Date().getFullYear()} AutoLoc Sénégal. Tous droits réservés.</p>
        <p>Dakar, Corniche Ouest, Sénégal | support@autoloc.sn</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WhatsApp / SMS                                                      */
/* ------------------------------------------------------------------ */
function WhatsAppPreview({ title, message, url, image, onImageError, time }: PreviewProps) {
  return (
    <div className="w-full max-w-[340px] overflow-hidden rounded-3xl bg-[#EFEAE0] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3 bg-brand-main px-4 py-3 text-white">
        <span
          style={DISPLAY_FONT}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne text-lg text-brand-main"
        >
          A
        </span>
        <span className="text-sm font-semibold">AutoLoc</span>
      </div>

      <div className="min-h-[380px] p-4">
        <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 shadow-sm">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt="Image du message"
              onError={onImageError}
              className="mb-2 h-32 w-full rounded-lg object-cover"
            />
          )}
          <p className="text-[13px] font-semibold text-gray-900">{title}</p>
          <p className="mt-1 whitespace-pre-line text-[13px] leading-snug text-gray-700">
            {message}
          </p>
          {url && <p className="mt-1.5 break-all text-[13px] text-sky-700 underline">{url}</p>}
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-400">
            <span className="tabular-nums">{time}</span>
            <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export function AdminBroadcastLivePreview({ payload }: AdminBroadcastLivePreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('PUSH');
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [now, setNow] = useState({ time: '09:41', date: '' });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Heure et date réelles, définies après le montage pour éviter tout décalage SSR
  useEffect(() => {
    const d = new Date();
    const date = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    setNow({
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: date.charAt(0).toUpperCase() + date.slice(1),
    });
  }, []);

  const { title, message, url, imageUrl, targetAudience, channels } = payload;
  const displayTitle = title.trim() || 'Titre de la notification';
  const displayMessage =
    message.trim() ||
    'Le contenu de votre message s’affichera ici en temps réel au fur et à mesure de votre saisie.';

  const image = imageUrl && failedImage !== imageUrl ? imageUrl : undefined;
  const imageBroken = !!imageUrl && failedImage === imageUrl;

  const previewProps: PreviewProps = {
    title: displayTitle,
    message: displayMessage,
    url: url.trim(),
    image,
    onImageError: () => setFailedImage(imageUrl),
    time: now.time,
    date: now.date,
  };

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === activeTab);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    if (next === -1) return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  const selectedChannels = channels
    .map((c) => CHANNEL_LABELS[c] ?? c)
    .join(', ');

  return (
    <section
      aria-label="Aperçu de la diffusion"
      className="flex h-full flex-col rounded-[28px] border border-brand-main/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,61,46,0.35)]"
    >
      <style>{`
        @keyframes al-banner-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        .al-banner { animation: al-banner-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        @media (prefers-reduced-motion: reduce) { .al-banner { animation: none; } }
      `}</style>

      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <div>
          <h3 style={DISPLAY_FONT} className="text-2xl leading-tight text-brand-main">
            Aperçu en direct
          </h3>
          <p className="mt-1 text-sm text-gray-500">Tel que vos utilisateurs le recevront.</p>
        </div>

        <div
          role="tablist"
          aria-label="Canal à prévisualiser"
          onKeyDown={onTabKeyDown}
          className="flex items-center rounded-full bg-brand-main/[0.06] p-1"
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            const enabled = tab.channels.some((c) => channels.includes(c));
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={`preview-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls="preview-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main ${selected
                    ? 'bg-brand-main text-champagne shadow'
                    : 'text-gray-600 hover:text-brand-main'
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-400' : selected ? 'bg-white/30' : 'bg-gray-300'
                    }`}
                />
                <span className="sr-only">{enabled ? '(canal actif)' : '(canal non sélectionné)'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scène */}
      <div
        role="tabpanel"
        id="preview-panel"
        aria-labelledby={`preview-tab-${activeTab}`}
        className="flex min-h-[560px] flex-1 items-center justify-center rounded-3xl bg-[#082E23] p-5 ring-1 ring-inset ring-champagne/10"
      >
        <div key={activeTab} className="flex w-full justify-center">
          {activeTab === 'PUSH' && <PushPreview {...previewProps} />}
          {activeTab === 'EMAIL' && <EmailPreview {...previewProps} />}
          {activeTab === 'WHATSAPP' && <WhatsAppPreview {...previewProps} />}
        </div>
      </div>

      {imageBroken && (
        <p className="mt-3 text-xs text-amber-700">
          L'image n'a pas pu être chargée. Vérifiez l'URL avant l'envoi.
        </p>
      )}

      {/* Résumé */}
      <dl className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex items-baseline gap-2">
          <dt className="text-gray-500">Audience</dt>
          <dd className="font-medium text-gray-900">
            {AUDIENCE_LABELS[targetAudience] ?? targetAudience}
          </dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="text-gray-500">Canaux</dt>
          <dd className={channels.length ? 'font-medium text-gray-900' : 'text-amber-700'}>
            {channels.length ? selectedChannels : 'Aucun canal sélectionné'}
          </dd>
        </div>
      </dl>
    </section>
  );
}