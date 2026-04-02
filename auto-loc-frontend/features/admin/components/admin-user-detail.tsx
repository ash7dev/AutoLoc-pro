'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, ShieldOff, Shield, Loader2,
  Phone, Mail, Car, Calendar, ExternalLink, Clock, User,
  CreditCard, MapPin, Search, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

// Re-using the same simple helpers or definitions as needed.
const ROLE_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  LOCATAIRE:    { label: 'Locataire',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200/60'   },
  PROPRIETAIRE: { label: 'Propriétaire', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200/60' },
  ADMIN:        { label: 'Admin',        bg: 'bg-black',      text: 'text-emerald-400', border: 'border-transparent'   },
  SUPPORT:      { label: 'Support',      bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200/60'  },
};

const KYC_LABELS: Record<string, { label: string; dot: string; text: string }> = {
  NON_VERIFIE: { label: 'Non vérifié', dot: 'bg-slate-300',   text: 'text-black/35'  },
  EN_ATTENTE:  { label: 'En attente',  dot: 'bg-amber-400',   text: 'text-amber-700' },
  VERIFIE:     { label: 'Vérifié',     dot: 'bg-emerald-400', text: 'text-emerald-700'},
  REJETE:      { label: 'Rejeté',      dot: 'bg-red-400',     text: 'text-red-600'   },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  EN_ATTENTE_VALIDATION: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-300/50' },
  VERIFIE: { label: 'Vérifié', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-300/50' },
  SUSPENDU: { label: 'Suspendu', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', border: 'border-red-300/50' },
  BROUILLON: { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
  ARCHIVE: { label: 'Archivé', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-300', border: 'border-slate-200' },
};

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }
function getInitials(p: string, n: string) { return (p?.[0] || '') + (n?.[0] || ''); }

export function AdminUserDetail({ user }: { user: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VEHICLES' | 'RESERVATIONS'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const name = user.utilisateur ? `${user.utilisateur.prenom} ${user.utilisateur.nom}` : user.email;
  const role = ROLE_LABELS[user.role] ?? ROLE_LABELS['LOCATAIRE'];
  const kyc = KYC_LABELS[user.kycStatus] ?? KYC_LABELS['NON_VERIFIE'];

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleApproveKyc() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.approveKyc(user.id)}`, { method: 'PATCH' });
      if (!res.ok) throw new Error("Erreur KYC");
      showToast('success', 'KYC approuvé');
      router.refresh();
    } catch {
      showToast('error', "Impossible d'approuver le KYC");
    } finally { setIsLoading(false); }
  }

  async function handleBanToggle() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.banUser(user.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: user.isBanned }),
      });
      if (!res.ok) throw new Error("Erreur Ban");
      showToast('success', user.isBanned ? 'Compte débanni' : 'Compte banni');
      router.refresh();
    } catch {
      showToast('error', "Impossible de changer l'état du compte");
    } finally { setIsLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Messages */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-bold shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-black text-emerald-400' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header with Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/users"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-black/50 hover:text-black hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-black text-black tracking-tight flex items-center gap-2">
            Profil Utilisateur
            {user.isBanned && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[11px] uppercase tracking-wider font-bold">
                Banni
              </span>
            )}
          </h1>
          <p className="text-[13px] font-medium text-black/40">{user.id}</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-black text-white p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 text-emerald-400 text-2xl font-black shrink-0 overflow-hidden border border-white/5">
              {user.utilisateur?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.utilisateur.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(user.utilisateur?.prenom, user.utilisateur?.nom)
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight tracking-tight mb-1">{name}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn('px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border', role.bg.replace('bg-','bg-opacity-10 bg-'), role.text, role.border.replace('border-','border-opacity-20 border-'))}>
                  {role.label}
                </span>
                <span className="text-[13px] font-medium text-white/50">{user.email}</span>
                {user.utilisateur?.telephone && (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-white/50 border-l border-white/10 pl-3">
                    <Phone className="w-3.5 h-3.5" />
                    {user.utilisateur.telephone}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {user.kycStatus === 'EN_ATTENTE' && (
              <button onClick={handleApproveKyc} disabled={isLoading}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 text-black font-bold text-[13px] hover:bg-emerald-300 transition-colors disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Valider le KYC
              </button>
            )}
            {user.role !== 'ADMIN' && (
              <button onClick={handleBanToggle} disabled={isLoading}
                className={cn("flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] border transition-colors disabled:opacity-50",
                  user.isBanned 
                  ? "bg-white/10 text-white hover:bg-white border-transparent hover:text-black"
                  : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                )}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (user.isBanned ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />)}
                {user.isBanned ? 'Débannir' : 'Bannir'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        {[
          { id: 'OVERVIEW', label: 'Vue générale' },
          { id: 'VEHICLES', label: `Flotte (${user._count?.vehicles || 0})` },
          { id: 'RESERVATIONS', label: 'Historique de réservation' }
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
                <h3 className="text-[12px] font-black uppercase tracking-widest text-black/30 mb-4">Informations d'identité</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[13px] font-medium text-black/50">Statut KYC</span>
                    <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-bold', kyc.text)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', kyc.dot)} />
                      {kyc.label}
                    </span>
                  </div>
                  {user.kycRejectionReason && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">Raison du rejet KYC</span>
                      <p className="text-[13px] font-medium text-red-700 mt-1">{user.kycRejectionReason}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[13px] font-medium text-black/50">Permis de conduire</span>
                    <span className={cn('text-[12.5px] font-bold', user.kyc?.permisUrl ? 'text-emerald-500' : 'text-black/30')}>
                      {user.kyc?.permisUrl ? 'Fourni' : 'Non fourni'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[13px] font-medium text-black/50">Inscrit le</span>
                    <span className="text-[13px] font-bold text-black">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Stats Block */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                 <h3 className="text-[12px] font-black uppercase tracking-widest text-black/30 mb-4">Activité</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 rounded-xl p-4">
                     <p className="text-[24px] font-black leading-none">{user._count?.reservationsLocataire || 0}</p>
                     <p className="text-[11px] font-bold text-black/40 mt-1 uppercase tracking-wide">Locations (Renter)</p>
                   </div>
                   <div className="bg-slate-50 rounded-xl p-4">
                     <p className="text-[24px] font-black leading-none">{user._count?.reservationsProprietaire || 0}</p>
                     <p className="text-[11px] font-bold text-black/40 mt-1 uppercase tracking-wide">Locations (Owner)</p>
                   </div>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-black/30 mb-4">Documents Attachés</h3>
                {user.kyc ? (
                  <div className="space-y-3">
                    {user.kyc.documentUrl && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[13px] font-semibold flex items-center gap-2"><User className="w-4 h-4 text-black/40"/> Pièce d'identité</span>
                        <a href={user.kyc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 text-[12px] font-bold flex items-center gap-1">Voir <ExternalLink className="w-3 h-3"/></a>
                      </div>
                    )}
                    {user.kyc.selfieUrl && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[13px] font-semibold flex items-center gap-2"><User className="w-4 h-4 text-black/40"/> Selfie KYC</span>
                        <a href={user.kyc.selfieUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 text-[12px] font-bold flex items-center gap-1">Voir <ExternalLink className="w-3 h-3"/></a>
                      </div>
                    )}
                    {user.kyc.permisUrl && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[13px] font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-black/40"/> Permis de conduire</span>
                        <a href={user.kyc.permisUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 text-[12px] font-bold flex items-center gap-1">Voir <ExternalLink className="w-3 h-3"/></a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[13px] text-black/40 italic">Aucun document soumis</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'VEHICLES' && (
          <div className="space-y-4">
            {(!user.vehicles || user.vehicles.length === 0) ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Car className="mx-auto w-8 h-8 text-black/20 mb-3" />
                <p className="text-[14px] font-bold text-black/40">Ce propriétaire n'a aucun véhicule</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.vehicles.map((v: any) => {
                  const status = STATUS_CONFIG[v.statut] || STATUS_CONFIG['BROUILLON'];
                  const mainPhoto = v.photos?.find((p: any) => p.estPrincipale) || v.photos?.[0];
                  return (
                    <Link href={`/dashboard/admin/vehicles/${v.id}`} key={v.id} 
                      className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="h-40 bg-slate-100 relative overflow-hidden">
                        {mainPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mainPhoto.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><Car className="w-8 h-8 text-black/10" /></div>
                        )}
                        <span className={cn('absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm', status.bg, status.text)}>{status.label}</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[15px] font-black text-black leading-tight mb-1">{v.marque} <span className="text-emerald-500">{v.modele}</span></h4>
                          <p className="text-[12px] font-medium text-black/40 flex items-center gap-1.5 mb-3"><MapPin className="w-3 h-3"/> {v.ville}</p>
                        </div>
                        <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                           <span className="text-[15px] font-black text-black">{formatPrice(v.prixParJour)} <span className="text-[10px] text-black/40">FCFA/j</span></span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'RESERVATIONS' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-[14px] font-black mb-4 flex items-center gap-2">En tant que Locataire</h3>
              {(!user.reservationsLocataire || user.reservationsLocataire.length === 0) ? (
                <p className="text-[13px] text-black/40 italic">Aucune réservation</p>
              ) : (
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-[10px] font-bold text-black/30 tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Véhicule</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {user.reservationsLocataire.map((r: any) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3 text-[13px] font-medium text-black/60">{new Date(r.creeLe).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-[13px] font-black">{r.vehicule}</td>
                          <td className="px-4 py-3 text-[12px] font-bold text-emerald-500">{r.statut}</td>
                          <td className="px-4 py-3 text-[13px] font-black text-right text-emerald-600">{formatPrice(Number(r.totalLocataire || r.prixTotal || 0))} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {user.role === 'PROPRIETAIRE' && (
              <div>
                <h3 className="text-[14px] font-black mb-4 flex items-center gap-2">En tant que Propriétaire</h3>
                {(!user.reservationsProprietaire || user.reservationsProprietaire.length === 0) ? (
                  <p className="text-[13px] text-black/40 italic">Aucune réservation reçue</p>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 uppercase text-[10px] font-bold text-black/30 tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Locataire</th>
                          <th className="px-4 py-3">Véhicule</th>
                          <th className="px-4 py-3">Statut</th>
                          <th className="px-4 py-3 text-right">Gains nets</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {user.reservationsProprietaire.map((r: any) => (
                          <tr key={r.id}>
                            <td className="px-4 py-3 text-[13px] font-medium text-black/60">{new Date(r.creeLe).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-[13px] font-medium">{r.locataire}</td>
                            <td className="px-4 py-3 text-[13px] font-black">{r.vehicule}</td>
                            <td className="px-4 py-3 text-[12px] font-bold text-emerald-500">{r.statut}</td>
                            <td className="px-4 py-3 text-[13px] font-black text-right text-black">{formatPrice(Number(r.netProprietaire || r.montantProprietaire || 0))} FCFA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
