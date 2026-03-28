'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Scale, CheckCircle2, XCircle, User, Car, 
  Banknote, Calendar, Loader2, AlertTriangle, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

export function AdminDisputeDetailView({ data }: { data: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isActive = data.statut === 'EN_ATTENTE';
  const isResolved = data.statut === 'FONDE';
  const isDismissed = data.statut === 'NON_FONDE';

  async function handleResolve(decision: 'FONDE' | 'NON_FONDE') {
    if (!confirm(`Confirmez-vous le classement de ce litige comme ${decision === 'FONDE' ? 'FONDÉ' : 'NON FONDÉ'} ? Cette action est définitive et entraînera des conséquences financières.`)) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.updateDisputeStatus(data.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) throw new Error('Erreur de mise à jour');
      router.refresh();
    } catch (e) {
      alert("Une erreur s'est produite.");
    } finally {
      setIsLoading(false);
    }
  }

  const { reservation } = data;
  const { locataire, proprietaire, vehicule, photosCheckin = [] } = reservation;

  const locatairePhotos = photosCheckin.filter((p: any) => p.categorie === 'LOCATAIRE' || p.uploaderId === locataire?.id);
  const proprietairePhotos = photosCheckin.filter((p: any) => p.categorie === 'PROPRIETAIRE' || p.uploaderId === proprietaire?.id);
  const genericPhotos = photosCheckin.filter((p: any) => !locatairePhotos.includes(p) && !proprietairePhotos.includes(p));

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/admin/disputes" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-black/40 hover:text-black/70 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à la liste
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl flex-shrink-0",
              isActive ? "bg-amber-100/50 text-amber-600" :
              isResolved ? "bg-emerald-100/50 text-emerald-600" : "bg-slate-100 text-slate-500"
            )}>
              <Scale className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-black">
                Détail du Litige
              </h1>
              <p className="text-[13px] font-medium text-black/50 tracking-tight">
                Créé le {new Date(data.openedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {isActive && (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[12px] font-bold text-amber-600 border border-amber-200/50">
                 <AlertTriangle className="w-3.5 h-3.5" /> En attente de résolution
               </span>
             )}
             {isResolved && (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[12px] font-bold text-emerald-600 border border-emerald-200/50">
                 <CheckCircle2 className="w-3.5 h-3.5" /> Fondé
               </span>
             )}
             {isDismissed && (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold text-slate-600 border border-slate-200/50">
                 <XCircle className="w-3.5 h-3.5" /> Non Fondé
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
             <h2 className="text-[15px] font-bold text-black border-b border-black/5 pb-4 mb-4">
               Description du problème
             </h2>
             <div className="bg-slate-50 rounded-2xl p-5 mb-5 border border-slate-100">
               <p className="text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                 {data.description}
               </p>
               {data.amount && (
                 <div className="mt-4 flex items-center gap-2">
                   <Banknote className="w-4 h-4 text-emerald-500" />
                   <span className="text-[13px] font-bold text-black/70">Coût estimé : {data.amount.toLocaleString('fr-FR')} FCFA</span>
                 </div>
               )}
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-center gap-2 mb-2 text-[12px] font-bold text-black/40 uppercase tracking-widest">
                    <User className="w-3.5 h-3.5" /> Locataire
                  </div>
                  <p className="text-[14px] font-semibold text-black">{locataire?.prenom} {locataire?.nom}</p>
                  <p className="text-[12px] font-medium text-black/50">{locataire?.email}</p>
                  <p className="text-[12px] font-medium text-black/50">{locataire?.telephone}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-center gap-2 mb-2 text-[12px] font-bold text-black/40 uppercase tracking-widest">
                    <User className="w-3.5 h-3.5 text-black/30" /> Propriétaire
                  </div>
                  <p className="text-[14px] font-semibold text-black">{proprietaire?.prenom} {proprietaire?.nom}</p>
                  <p className="text-[12px] font-medium text-black/50">{proprietaire?.email}</p>
                  <p className="text-[12px] font-medium text-black/50">{proprietaire?.telephone}</p>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-[15px] font-bold text-black border-b border-black/5 pb-4 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-black/40" />
              Preuves photographiques (Check-in)
            </h2>
            
            {photosCheckin.length === 0 ? (
               <div className="py-8 text-center text-[13px] font-medium text-black/40 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                 Aucune photo disponible pour l'état des lieux.
               </div>
            ) : (
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {photosCheckin.map((p: any, i: number) => (
                   <a 
                     key={i} 
                     href={p.url} 
                     target="_blank" 
                     rel="noreferrer"
                     className="block group relative aspect-square rounded-2xl overflow-hidden bg-slate-100"
                   >
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                       src={p.url} 
                       alt="Preuve" 
                       className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-110" 
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                   </a>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Right Col - Arbitrage */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
             <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
               <Scale className="w-4 h-4 text-emerald-400" />
               Arbitrage Admin
             </h3>
             
             {!isActive ? (
               <div className="text-[13px] font-medium text-white/70 leading-relaxed bg-white/5 rounded-2xl p-4 border border-white/10">
                 Ce litige a été résolu. Aucune action supplémentaire n'est requise.
               </div>
             ) : (
               <div className="space-y-4">
                 <p className="text-[12px] font-medium text-white/60 mb-6 leading-relaxed">
                   En cas de litige fondé (locataire dans son bon droit), le locataire sera remboursé à 100%. En cas de litige non fondé, une pénalité sera appliquée au locataire et le propriétaire recevra sa part de la location.
                 </p>
                 <button
                   onClick={() => handleResolve('FONDE')}
                   disabled={isLoading}
                   className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[13px] py-3 transition-colors disabled:opacity-50"
                 >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={3} />}
                   Classer Fondé (Rembourser Locataire)
                 </button>
                 <button
                   onClick={() => handleResolve('NON_FONDE')}
                   disabled={isLoading}
                   className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-[13px] py-3 transition-colors disabled:opacity-50"
                 >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" strokeWidth={2.5} />}
                   Classer Non Fondé (Pénalité Locataire)
                 </button>
               </div>
             )}
          </div>

          {/* Reservation infos supplementaires */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-[13px] font-bold text-black border-b border-black/5 pb-3 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-black/40" /> Infos Réservation
            </h3>
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-black/50 font-medium">Véhicule</span>
                <span className="font-bold text-black">{vehicule?.marque} {vehicule?.modele}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black/50 font-medium">Immatriculation</span>
                <span className="font-bold text-black text-[12px] tracking-widest">{vehicule?.immatriculation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black/50 font-medium">Statut Reservation</span>
                <span className="font-bold text-black px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">{reservation?.statut}</span>
              </div>
              <div className="w-full h-px bg-black/5 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-black/50 font-medium">Payé (Locataire)</span>
                <span className="font-bold text-black">{reservation?.totalLocataire} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black/50 font-medium">Net (Propriétaire)</span>
                <span className="font-bold text-black">{reservation?.netProprietaire} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
