'use client';

import React from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  Globe,
  Mail,
  MessageSquare,
  Users,
} from 'lucide-react';
import type { BroadcastHistoryItem, BroadcastChannel } from '../../../../core/api/adminBroadcastApi';

interface AdminBroadcastHistoryTableProps {
  history: BroadcastHistoryItem[];
  isLoading?: boolean;
}

export function AdminBroadcastHistoryTable({
  history,
  isLoading = false,
}: AdminBroadcastHistoryTableProps) {
  const getChannelIcon = (ch: BroadcastChannel) => {
    switch (ch) {
      case 'PUSH_MOBILE':
        return (
          <span key={ch} title="Push Mobile (Expo)">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          </span>
        );
      case 'WEB_PUSH':
        return (
          <span key={ch} title="Web Push (VAPID)">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
          </span>
        );
      case 'EMAIL':
        return (
          <span key={ch} title="Email HTML">
            <Mail className="w-3.5 h-3.5 text-purple-600" />
          </span>
        );
      case 'WHATSAPP':
        return (
          <span key={ch} title="WhatsApp / SMS">
            <MessageSquare className="w-3.5 h-3.5 text-green-600" />
          </span>
        );
    }
  };

  const getAudienceLabel = (aud: string) => {
    switch (aud) {
      case 'TOUS':
        return 'Tous les membres';
      case 'HOTES':
        return 'Propriétaires (Hôtes)';
      case 'LOCATAIRES':
        return 'Locataires';
      case 'KYC_VALIDE':
        return 'KYC Vérifiés';
      default:
        return aud;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mt-8">
      {/* Table Title */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gray-100 text-gray-800">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Historique des Diffusions Broadcast
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Journal d’envoi multi-canal, taux de délivrabilité et suivi des campagnes
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-gray-100 px-3 py-1.5 rounded-full text-gray-600 font-semibold">
          {history.length} campagne(s) enregistrée(s)
        </span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-[#0A3D2E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Chargement de l'historique...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
          <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">Aucun broadcast envoyé pour le moment</p>
          <p className="text-xs text-gray-400 mt-1">
            Utilisez le Studio Composer ci-dessus pour planifier votre première diffusion.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Campagne & Message</th>
                <th className="py-3 px-4">Audience Cible</th>
                <th className="py-3 px-4">Canaux Utilisés</th>
                <th className="py-3 px-4 text-center">Destinataires</th>
                <th className="py-3 px-4 text-center">Taux de Remise</th>
                <th className="py-3 px-4">Envoyé Le</th>
                <th className="py-3 px-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {history.map((item) => {
                const deliveryRate =
                  item.totalRecipients > 0
                    ? Math.round((item.deliveredCount / item.totalRecipients) * 100)
                    : 100;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Title & Message */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-bold text-gray-900 truncate">{item.title}</div>
                      <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">
                        {item.message}
                      </p>
                    </td>

                    {/* Audience Target */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800">
                        <Users className="w-3 h-3 text-gray-500" />
                        {getAudienceLabel(item.targetAudience)}
                      </span>
                    </td>

                    {/* Channels */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200/60 w-fit">
                        {item.channels.map((ch) => getChannelIcon(ch))}
                      </div>
                    </td>

                    {/* Recipients Count */}
                    <td className="py-4 px-4 text-center font-bold text-gray-900 font-mono">
                      {item.totalRecipients.toLocaleString('fr-FR')}
                    </td>

                    {/* Delivery Rate Bar */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-bold text-emerald-800 font-mono">
                          {deliveryRate}% ({item.deliveredCount}/{item.totalRecipients})
                        </span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${deliveryRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Sent Date */}
                    <td className="py-4 px-4 text-gray-500 text-[11px]">
                      <div>{new Date(item.sentAt).toLocaleDateString('fr-FR')}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {new Date(item.sentAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-right">
                      {item.status === 'DELIVERED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Livré
                        </span>
                      ) : item.status === 'PARTIAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Partiel
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Échec
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
