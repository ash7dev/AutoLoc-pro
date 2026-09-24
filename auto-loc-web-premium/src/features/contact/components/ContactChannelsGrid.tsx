'use client';

import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';

const CHANNELS = [
  {
    icon: Phone,
    title: 'Téléphone',
    description: 'Appelez-nous directement pour une assistance immédiate.',
    value: '+221 78 663 77 05',
    href: 'tel:+221786637705',
    actionLabel: 'Appeler maintenant',
    availability: '7j/7 — 8h à 22h (GMT)',
    accentColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconBg: 'bg-[#0A3D2E]',
    iconColor: 'text-[#F1DFB6]',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Envoyez-nous un message pour une réponse rapide et un suivi écrit.',
    value: '+221 78 663 77 05',
    href: 'https://wa.me/221786637705?text=Bonjour%20AutoLoc%2C%20j%27ai%20une%20question%20concernant%20la%20location%20de%20v%C3%A9hicule.',
    actionLabel: 'Ouvrir WhatsApp',
    availability: 'Temps de réponse moyen : 15 min',
    accentColor: 'bg-green-50 text-green-600 border-green-100',
    iconBg: 'bg-green-600',
    iconColor: 'text-white',
  },
  {
    icon: Mail,
    title: 'E-mail',
    description: 'Pour les demandes détaillées, réclamations ou partenariats commerciaux.',
    value: 'support@autoloc.sn',
    href: 'mailto:support@autoloc.sn',
    actionLabel: 'Envoyer un e-mail',
    availability: 'Réponse sous 24h ouvrées',
    accentColor: 'bg-blue-50 text-blue-600 border-blue-100',
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
  },
];

export const ContactChannelsGrid: React.FC = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-fraunces text-2xl font-normal text-[#041912] sm:text-3xl">
          Contactez-nous
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">
          Choisissez le canal qui vous convient le mieux.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <div
              key={channel.title}
              className="group relative rounded-3xl border border-[#041912]/8 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${channel.iconBg} shadow-sm`}>
                <Icon className={`h-5 w-5 ${channel.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="mt-4 font-fraunces text-lg text-[#041912]">{channel.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{channel.description}</p>

              {/* Value */}
              <p className="mt-3 text-[14px] font-semibold text-[#041912]">{channel.value}</p>

              {/* Availability badge */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-400">{channel.availability}</span>
              </div>

              {/* Action */}
              <a
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#041912] px-4 py-2.5 text-[12.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E] cursor-pointer shadow-sm"
              >
                {channel.actionLabel}
                {channel.href.startsWith('http') && <ExternalLink className="h-3 w-3" />}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};
