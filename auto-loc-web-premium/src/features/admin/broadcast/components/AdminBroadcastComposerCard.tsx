'use client';

import React, { useState } from 'react';
import {
  Send,
  Users,
  Smartphone,
  Mail,
  MessageSquare,
  Globe,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type {
  TargetAudience,
  BroadcastChannel,
  SendBroadcastDto,
  AdminAudienceStats,
} from '../../../../core/api/adminBroadcastApi';

interface AdminBroadcastComposerCardProps {
  stats?: AdminAudienceStats;
  isSending?: boolean;
  onSend: (dto: SendBroadcastDto) => Promise<boolean>;
  onPayloadChange?: (payload: {
    title: string;
    message: string;
    targetAudience: TargetAudience;
    channels: BroadcastChannel[];
    url: string;
    imageUrl: string;
  }) => void;
}

export function AdminBroadcastComposerCard({
  stats,
  isSending = false,
  onSend,
  onPayloadChange,
}: AdminBroadcastComposerCardProps) {
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('TOUS');
  const [channels, setChannels] = useState<BroadcastChannel[]>([
    'PUSH_MOBILE',
    'EMAIL',
  ]);
  const [title, setTitle] = useState<string>('🌟 Offre Spéciale AutoLoc Dakar');
  const [message, setMessage] = useState<string>(
    'Profitez de 15% de réduction sur la réservation de SUV et Berlines d’exception ce week-end à Dakar !'
  );
  const [url, setUrl] = useState<string>('/dashboard');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Notify live preview parent whenever inputs change
  const handleUpdate = (updates: {
    title?: string;
    message?: string;
    targetAudience?: TargetAudience;
    channels?: BroadcastChannel[];
    url?: string;
    imageUrl?: string;
  }) => {
    const nextTitle = updates.title !== undefined ? updates.title : title;
    const nextMessage = updates.message !== undefined ? updates.message : message;
    const nextAudience = updates.targetAudience !== undefined ? updates.targetAudience : targetAudience;
    const nextChannels = updates.channels !== undefined ? updates.channels : channels;
    const nextUrl = updates.url !== undefined ? updates.url : url;
    const nextImageUrl = updates.imageUrl !== undefined ? updates.imageUrl : imageUrl;

    if (updates.title !== undefined) setTitle(updates.title);
    if (updates.message !== undefined) setMessage(updates.message);
    if (updates.targetAudience !== undefined) setTargetAudience(updates.targetAudience);
    if (updates.channels !== undefined) setChannels(updates.channels);
    if (updates.url !== undefined) setUrl(updates.url);
    if (updates.imageUrl !== undefined) setImageUrl(updates.imageUrl);

    if (onPayloadChange) {
      onPayloadChange({
        title: nextTitle,
        message: nextMessage,
        targetAudience: nextAudience,
        channels: nextChannels,
        url: nextUrl,
        imageUrl: nextImageUrl,
      });
    }
  };

  const toggleChannel = (channel: BroadcastChannel) => {
    const next = channels.includes(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel];
    handleUpdate({ channels: next });
  };

  const applyTemplate = (tmplTitle: string, tmplMsg: string, tmplAud: TargetAudience) => {
    handleUpdate({
      title: tmplTitle,
      message: tmplMsg,
      targetAudience: tmplAud,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSend({
      title,
      message,
      targetAudience,
      channels,
      url: url.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  // Recipient estimation logic
  let estimatedRecipients = stats?.totalUsers ?? 0;
  if (targetAudience === 'HOTES') estimatedRecipients = stats?.totalHotes ?? 0;
  if (targetAudience === 'LOCATAIRES') estimatedRecipients = stats?.totalLocataires ?? 0;
  if (targetAudience === 'KYC_VALIDE') estimatedRecipients = stats?.totalKycVerifies ?? 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col justify-between">
      <div>
        {/* Studio Title */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold text-[#0A3D2E] tracking-wider uppercase bg-[#0A3D2E]/10 px-3 py-1 rounded-full">
              Studio Composer
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Créer une nouvelle diffusion broadcast
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Destinataires estimés : </span>
            <span className="font-bold text-[#0A3D2E]">
              {estimatedRecipients.toLocaleString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Templates Quick Bar */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Modèles de message rapides :
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                applyTemplate(
                  '🌟 Offre Spéciale Week-end AutoLoc',
                  'Profitez de 15% de réduction sur la réservation de SUV et Berlines ce week-end avec le code DAKAR15 !',
                  'LOCATAIRES'
                )
              }
              className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-[#0A3D2E] hover:border-emerald-300 border border-gray-200 font-medium transition-all"
            >
              🎉 Promo 15% Week-end
            </button>
            <button
              type="button"
              onClick={() =>
                applyTemplate(
                  '🚨 Rappel Importation Photos Check-in',
                  'Avis aux propriétaires : n’oubliez pas de charger les 4 photos obligatoires du véhicule avant de remettre les clés.',
                  'HOTES'
                )
              }
              className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-[#0A3D2E] hover:border-emerald-300 border border-gray-200 font-medium transition-all"
            >
              📸 Rappel Check-in Hôtes
            </button>
            <button
              type="button"
              onClick={() =>
                applyTemplate(
                  '🔐 Validez votre Permis de Conduire',
                  'Débloquez la réservation instantanée et la garantie assurance tous risques en complétant la vérification de votre permis.',
                  'TOUS'
                )
              }
              className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-[#0A3D2E] hover:border-emerald-300 border border-gray-200 font-medium transition-all"
            >
              🪪 Relance KYC Permis
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Audience Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              1. Sélectionner l'Audience Cible
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'TOUS', label: 'Tous les membres', count: stats?.totalUsers },
                { id: 'HOTES', label: 'Propriétaires (Hôtes)', count: stats?.totalHotes },
                { id: 'LOCATAIRES', label: 'Locataires', count: stats?.totalLocataires },
                { id: 'KYC_VALIDE', label: 'KYC Vérifiés', count: stats?.totalKycVerifies },
              ].map((item) => {
                const isSelected = targetAudience === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleUpdate({ targetAudience: item.id as TargetAudience })}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#0A3D2E] bg-[#0A3D2E]/5 ring-2 ring-[#0A3D2E]'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900">{item.label}</div>
                    <div className="text-[11px] text-gray-500 mt-1 font-mono">
                      {item.count !== undefined ? `${item.count} pers.` : '...'}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#0A3D2E] absolute top-3 right-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Broadcast Channels Multi-select */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              2. Canaux de Diffusion (Multi-Canal)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'PUSH_MOBILE',
                  label: 'Push Mobile (Expo)',
                  desc: 'iOS & Android',
                  icon: Smartphone,
                },
                {
                  id: 'WEB_PUSH',
                  label: 'Web Push (VAPID)',
                  desc: 'Navigateurs Web',
                  icon: Globe,
                },
                {
                  id: 'EMAIL',
                  label: 'Email HTML Luxe',
                  desc: 'Resend API',
                  icon: Mail,
                },
                {
                  id: 'WHATSAPP',
                  label: 'WhatsApp / SMS',
                  desc: 'Twilio Direct',
                  icon: MessageSquare,
                },
              ].map((ch) => {
                const isChecked = channels.includes(ch.id as BroadcastChannel);
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id as BroadcastChannel)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      isChecked
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600'
                        : 'border-gray-200 bg-white hover:border-gray-300 opacity-60'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        isChecked ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{ch.label}</div>
                      <div className="text-[10px] text-gray-500">{ch.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Title Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              3. Titre de la Notification
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="Ex: 🌟 Offre Spéciale Week-end AutoLoc"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A3D2E] text-sm font-semibold text-gray-900"
            />
          </div>

          {/* Notification Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              4. Contenu du Message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => handleUpdate({ message: e.target.value })}
              placeholder="Saisissez le texte clair du message envoyé sur les canaux sélectionnés..."
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A3D2E] text-sm text-gray-800 leading-relaxed"
            />
          </div>

          {/* Optional Action URL & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                Lien de Redirection (URL Cible)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => handleUpdate({ url: e.target.value })}
                placeholder="/dashboard/reservations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A3D2E] text-xs font-mono text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                Image Header (URL Optionnelle)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleUpdate({ imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A3D2E] text-xs font-mono text-gray-700"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="w-4 h-4 text-[#F1DFB6]" />
              <span>Envoi instantané sécurisé à {estimatedRecipients} utilisateurs</span>
            </div>

            <button
              type="submit"
              disabled={isSending || channels.length === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#0A3D2E] hover:bg-[#0D4B39] text-white font-bold text-sm shadow-xl hover:shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Lancer le Broadcast Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
