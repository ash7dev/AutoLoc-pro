'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, FileText, User, Users, Shield, Calendar, MapPin, Loader2, Info, Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  EN_ATTENTE_VALIDATION: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-300/50' },
  VERIFIE: { label: 'Vérifié', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-300/50' },
  SUSPENDU: { label: 'Suspendu', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', border: 'border-red-300/50' },
  BROUILLON: { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
  ARCHIVE: { label: 'Archivé', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-300', border: 'border-slate-200' },
};

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }
function getInitials(p: string, n: string) { return (p?.[0] || '') + (n?.[0] || ''); }

export function AdminVehicleDetail({ vehicle }: { vehicle: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PHOTOS' | 'RESERVATIONS'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const status = STATUS_CONFIG[vehicle.statut] || STATUS_CONFIG['BROUILLON'];
  const ownerName = vehicle.proprietaire ? `${vehicle.proprietaire.prenom || ''} ${vehicle.proprietaire.nom || ''}`.trim() : 'Inconnu';
  const mainPhotoUrl = vehicle.photos?.find((p: any) => p.estPrincipale)?.url || vehicle.photos?.[0]?.url;

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAction(action: 'validate' | 'suspend') {
    setIsLoading(true);
    try {
      const url = action === 'validate' 
        ? ADMIN_PATHS.validateVehicle(vehicle.id)
        : ADMIN_PATHS.suspendVehicle(vehicle.id);
        
      const res = await fetch(`/api/nest${url}`, {
        method: 'PATCH',
        headers: action === 'suspend' ? { 'Content-Type': 'application/json' } : undefined,
        body: action === 'suspend' ? JSON.stringify({ raison: "Raison de test ou détaillée dans un vrai dialogue" }) : undefined,
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Erreur action");
      showToast('success', action === 'validate' ? 'Véhicule validé' : 'Véhicule suspendu');
      router.refresh();
    } catch {
      showToast('error', "Action impossible");
    } finally { setIsLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-bold shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-black text-emerald-400' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header with Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/vehicles"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-black/50 hover:text-black hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-black text-black tracking-tight flex items-center gap-2">
            Fiche Véhicule
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border', status.bg, status.text, status.border)}>
               <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />{status.label}
            </span>
          </h1>
          <p className="text-[13px] font-medium text-black/40">{vehicle.id}</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-black text-white shadow-2xl flex flex-col md:flex-row">
        {/* BG decorative */}
        <div className="absolute inset-0 z-0 opacity-40">
           {mainPhotoUrl && <img src={mainPhotoUrl} alt="" className="w-full h-full object-cover blur-2xl" />}
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/90 to-black/50" />

        <div className="p-8 relative z-10 flex-1 flex flex-col justify-center">
           <h2 className="text-3xl font-black mb-1">{vehicle.marque} <span className="text-emerald-400">{vehicle.modele}</span></h2>
           <p className="text-white/60 mb-6 font-medium">{vehicle.annee} • {vehicle.immatriculation}</p>
           
           <div className="flex items-center gap-4">
              <div className="bg-white/10 rounded-xl px-4 py-2 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-0.5">Prix par jour</p>
                <p className="text-xl font-black text-white">{formatPrice(vehicle.prixParJour)} <span className="text-[11px] text-white/40">FCFA</span></p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-0.5">Note Générale</p>
                <p className="text-xl font-black text-emerald-400">{Number(vehicle.note).toFixed(1)} <span className="text-[11px] text-emerald-400/50">/ 5</span></p>
              </div>
           </div>
        </div>

        <div className="p-6 relative z-10 flex flex-col justify-center gap-3 w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10 bg-black/40">
           <Link href={`/dashboard/admin/users/${vehicle.proprietaire?.id}`}
             className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-black flex-shrink-0">
                {vehicle.proprietaire?.avatarUrl ? <img src={vehicle.proprietaire.avatarUrl} alt="" className="w-full h-full object-cover rounded-lg"/> : getInitials(vehicle.proprietaire?.prenom, vehicle.proprietaire?.nom)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">Propriétaire</p>
                <p className="text-[13px] font-bold truncate text-white">{ownerName}</p>
              </div>
           </Link>

           {(vehicle.statut === 'EN_ATTENTE_VALIDATION' || vehicle.statut === 'SUSPENDU') && (
             <button onClick={() => handleAction('validate')} disabled={isLoading} className="w-full py-3 rounded-xl bg-emerald-400 text-black font-black text-[13px] hover:bg-emerald-300 transition-colors  flex items-center justify-center gap-2 disabled:opacity-50">
               {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
               Approuver
             </button>
           )}
           {(vehicle.statut === 'VERIFIE' || vehicle.statut === 'EN_ATTENTE_VALIDATION') && (
             <button onClick={() => handleAction('suspend')} disabled={isLoading} className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-black text-[13px] hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
               {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
               Suspendre
             </button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        {[
          { id: 'OVERVIEW', label: 'Vue générale' },
          { id: 'PHOTOS', label: `Photos (${vehicle.photos?.length || 0})` },
          { id: 'RESERVATIONS', label: `Historique des locations (${vehicle._count?.reservations || 0})` }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={cn("pb-3 text-[14px] font-bold transition-colors relative", 
              activeTab === t.id ? "text-black" : "text-black/40 hover:text-black/70"
            )}>
            {t.label}
            {activeTab === t.id && (
              <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-black rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-black/30 mb-4">Caractéristiques</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                   <div><p className="text-[11px] text-black/40 font-bold mb-1">Type</p><p className="text-[13px] font-semibold">{vehicle.type}</p></div>
                   <div><p className="text-[11px] text-black/40 font-bold mb-1">Transmission</p><p className="text-[13px] font-semibold">{vehicle.transmission || 'N/A'}</p></div>
                   <div><p className="text-[11px] text-black/40 font-bold mb-1">Carburant</p><p className="text-[13px] font-semibold">{vehicle.carburant || 'N/A'}</p></div>
                   <div><p className="text-[11px] text-black/40 font-bold mb-1">Places</p><p className="text-[13px] font-semibold">{vehicle.nombrePlaces || 'N/A'}</p></div>
                   <div><p className="text-[11px] text-black/40 font-bold mb-1">Localisation</p><p className="text-[13px] font-semibold flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {vehicle.ville}</p></div>
                   <div><p className="text-[11px] text-black/40 font-bold mb-1">Âge minimum</p><p className="text-[13px] font-semibold">{vehicle.ageMinimum ? `${vehicle.ageMinimum} ans` : 'N/A'}</p></div>
                </div>
              </div>

              {vehicle.equipements && vehicle.equipements.length > 0 && (
                <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-black/30 mb-4">Équipements</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.equipements.map((eq: string) => (
                      <span key={eq} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-bold text-black/70">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-black/30 mb-4">Documents Attachés</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-3">
                    {vehicle.carteGriseUrl && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[13px] font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-black/40"/> Carte Grise</span>
                        <a href={vehicle.carteGriseUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 text-[12px] font-bold flex items-center gap-1">Voir</a>
                      </div>
                    )}
                    {vehicle.assuranceDocUrl && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[13px] font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-black/40"/> Assurance</span>
                        <a href={vehicle.assuranceDocUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 text-[12px] font-bold flex items-center gap-1">Voir</a>
                      </div>
                    )}
                    {!vehicle.carteGriseUrl && !vehicle.assuranceDocUrl && (
                      <div className="p-4 bg-red-50 text-red-500 rounded-xl text-[12px] font-bold text-center border border-red-100">
                        Documents manquants
                      </div>
                    )}
                  </div>
                </div>
              </div>

               <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-black/30 mb-4">Règles & Conditions</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><p className="text-[11px] text-black/40 font-bold mb-1">Durée min.</p><p className="text-[13px] font-semibold">{vehicle.joursMinimum} jours</p></div>
                  <div><p className="text-[11px] text-black/40 font-bold mb-1">Assurance</p><p className="text-[13px] font-semibold">{vehicle.assurance}</p></div>
                </div>
                {vehicle.reglesSpecifiques && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[13px] font-medium text-black/70 italic whitespace-pre-wrap">{vehicle.reglesSpecifiques}</p>
                  </div>
                )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'PHOTOS' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vehicle.photos?.map((p: any) => (
              <div key={p.id} className="aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative group">
                <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {p.estPrincipale && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded-lg backdrop-blur-md">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Principale</p>
                  </div>
                )}
              </div>
            ))}
            {(!vehicle.photos || vehicle.photos.length === 0) && (
              <div className="col-span-full py-12 text-center text-black/40">Aucune photo fournie</div>
            )}
          </div>
        )}

        {activeTab === 'RESERVATIONS' && (
          <div>
            {(!vehicle.reservations || vehicle.reservations.length === 0) ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="mx-auto w-8 h-8 text-black/20 mb-3" />
                <p className="text-[14px] font-bold text-black/40">Aucune réservation pour ce véhicule</p>
              </div>
            ) : (
               <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-[10px] font-bold text-black/30 tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Locataire</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Gains net (Estimé)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vehicle.reservations.map((r: any) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3 text-[13px] font-medium text-black/60">{new Date(r.creeLe).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-[13px] font-black">{r.locataire?.prenom} {r.locataire?.nom}</td>
                          <td className="px-4 py-3 text-[12px] font-bold text-emerald-500">{r.statut}</td>
                          <td className="px-4 py-3 text-[13px] font-black text-right text-emerald-600">{formatPrice(r.totalLocataire ? r.totalLocataire * 0.8 : 0)} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
