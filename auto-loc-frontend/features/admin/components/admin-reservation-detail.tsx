'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car, 
  User, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  EN_ATTENTE_PAIEMENT: { label: 'Attente Paiement', color: 'text-amber-500 bg-amber-50', icon: Clock },
  PAYEE: { label: 'Payée', color: 'text-blue-600 bg-blue-50', icon: CheckCircle2 },
  CONFIRMEE: { label: 'Confirmée', color: 'text-indigo-600 bg-indigo-50', icon: CheckCircle2 },
  EN_COURS: { label: 'En cours', color: 'text-emerald-600 bg-emerald-50', icon: Car },
  TERMINEE: { label: 'Terminée', color: 'text-slate-400 bg-slate-50', icon: CheckCircle2 },
  ANNULEE: { label: 'Annulée', color: 'text-red-600 bg-red-50', icon: XCircle },
  LITIGE: { label: 'Litige', color: 'text-amber-700 bg-amber-100', icon: AlertTriangle },
  EXPIREE: { label: 'Expirée', color: 'text-slate-500 bg-slate-100', icon: Clock },
};

function formatPrice(n: string | number) {
  return new Intl.NumberFormat('fr-FR').format(Number(n));
}

interface AdminReservationDetailProps {
  reservation: any;
  accessToken: string;
}

export function AdminReservationDetail({ reservation, accessToken }: AdminReservationDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<'CANCEL' | 'COMPLETE' | null>(null);

  const status = STATUS_MAP[reservation.statut] || { label: reservation.statut, color: 'text-slate-500 bg-slate-100', icon: Clock };
  const StatusIcon = status.icon;

  async function handleForceCancel() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.forceCancelReservation(reservation.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erreur lors de l\'annulation forcée');
      router.refresh();
      setShowConfirm(null);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'annulation forcée.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForceComplete() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.forceCompleteReservation(reservation.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erreur lors de la confirmation forcée');
      router.refresh();
      setShowConfirm(null);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la confirmation forcée.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/reservations" 
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-black hover:bg-slate-50 transition-all shadow-sm">
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-0.5">
            <span className="text-[11px] font-black uppercase tracking-widest leading-none">Dossier Réservation</span>
            <span className="text-slate-200">/</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{reservation.id.split('-')[0]}</span>
          </div>
          <h1 className="text-[28px] font-black text-black tracking-tight leading-none">
            {reservation.locataire.prenom} {reservation.locataire.nom}
          </h1>
        </div>

        <div className="ml-auto">
          <span className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold border border-transparent shadow-sm",
            status.color
          )}>
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Actions & Core Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl bg-black text-white p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-emerald-400 mb-2">Période de location</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[22px] font-black">{new Date(reservation.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</span>
                      <span className="text-[13px] font-medium text-white/50">{new Date(reservation.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20" />
                    <div className="flex flex-col">
                      <span className="text-[22px] font-black">{new Date(reservation.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</span>
                      <span className="text-[13px] font-medium text-white/50">{new Date(reservation.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                   <p className="text-[12px] font-black uppercase tracking-widest text-emerald-400 mb-2">Total Locataire</p>
                   <p className="text-[32px] font-black">{formatPrice(reservation.totalLocataire)} <span className="text-[14px] text-white/40">FCFA</span></p>
                </div>
              </div>

              {/* Admin Actions Section */}
              <div className="pt-8 border-t border-white/10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-black mb-1">Actions Administrateur "Blindées"</h4>
                      <p className="text-[12px] font-medium text-white/50 leading-relaxed max-w-md">
                        Ces outils sont à utiliser en dernier recours pour débloquer des situations critiques (fraudre, erreur technique grave, blocage physique).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Force Cancel */}
                    {reservation.statut !== 'ANNULEE' && (
                       <button 
                        onClick={() => setShowConfirm('CANCEL')}
                        className="flex items-center justify-center gap-2.5 h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-[14px] transition-all shadow-lg shadow-red-500/20 active:scale-95"
                       >
                         <XCircle className="w-5 h-5" />
                         Annulation Forcée
                       </button>
                    )}

                    {/* Force Complete */}
                    {(reservation.statut !== 'TERMINEE' && reservation.statut !== 'ANNULEE') && (
                       <button 
                        onClick={() => setShowConfirm('COMPLETE')}
                        className="flex items-center justify-center gap-2.5 h-14 rounded-2xl bg-white text-black hover:bg-slate-100 font-black text-[14px] transition-all shadow-lg shadow-white/10 active:scale-95"
                       >
                         <CheckCircle2 className="w-5 h-5" />
                         Forcer la Fin
                       </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-6">
              <div>
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-2">
                  <Car className="w-3.5 h-3.5" /> Véhicule concerné
                </h4>
                <Link href={`/dashboard/admin/vehicles/${reservation.vehicule.id}`} className="group block">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                       {reservation.vehicule.photos?.[0] ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={reservation.vehicule.photos[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       ) : (
                         <Car className="w-6 h-6 text-slate-200" />
                       )}
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-black leading-tight flex items-center gap-1.5 group-hover:text-emerald-500 transition-colors">
                        {reservation.vehicule.marque} {reservation.vehicule.modele}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-[12px] font-bold text-slate-400 mt-0.5">{reservation.vehicule.immatriculation}</p>
                      <p className="text-[12px] font-medium text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {reservation.vehicule.ville}</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Litiges associés
                </h4>
                {reservation.litige ? (
                  <Link href={`/dashboard/admin/disputes/${reservation.litige.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100 group">
                    <div>
                      <p className="text-[14px] font-black text-amber-700">Litige actif détecté</p>
                      <p className="text-[11px] font-medium text-amber-600/70 truncate max-w-[200px]">{reservation.litige.motif}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <p className="text-[13px] font-medium text-slate-400 italic">Aucun litige déclaré sur cette réservation.</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-6">
              <div>
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Parties impliquées
                </h4>
                <div className="space-y-4">
                  <Link href={`/dashboard/admin/users/${reservation.locataire.id}`} className="group flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[13px] font-black text-slate-400 group-hover:text-emerald-500 transition-colors">L</div>
                      <div>
                        <p className="text-[13px] font-black text-black group-hover:text-emerald-500 transition-colors leading-none mb-1">{reservation.locataire.prenom} {reservation.locataire.nom}</p>
                        <p className="text-[11px] font-medium text-slate-400 tracking-tight">{reservation.locataire.email}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                  </Link>
                  <Link href={`/dashboard/admin/users/${reservation.proprietaire.id}`} className="group flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[13px] font-black text-slate-400 group-hover:text-emerald-500 transition-colors">P</div>
                      <div>
                        <p className="text-[13px] font-black text-black group-hover:text-emerald-500 transition-colors leading-none mb-1">{reservation.proprietaire.prenom} {reservation.proprietaire.nom}</p>
                        <p className="text-[11px] font-medium text-slate-400 tracking-tight">{reservation.proprietaire.email}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                  </Link>
                </div>
              </div>

               <div className="pt-6 border-t border-slate-50">
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Statut Transactionnel
                </h4>
                {reservation.paiement ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-slate-400">Paiement {reservation.paiement.fournisseur}</span>
                      <span className={cn(
                        "px-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        reservation.paiement.statut === 'CONFIRME' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {reservation.paiement.statut}
                      </span>
                    </div>
                    {reservation.paiement.transactionId && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[10px] text-slate-500 break-all leading-tight">
                        REF: {reservation.paiement.transactionId}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[13px] font-medium text-slate-400 italic">Aucune information de paiement disponible.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline / History */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-6">
            <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Historique de vie
            </h4>
            
            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
               <div className="relative pl-8">
                 <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-black text-emerald-400 flex items-center justify-center z-10 p-1 border-4 border-white shadow-sm">
                   <CheckCircle2 className="w-full h-full" />
                 </div>
                 <p className="text-[13px] font-black text-black leading-none mb-1">Réservation crée</p>
                 <p className="text-[11px] font-medium text-slate-400">{new Date(reservation.creeLe).toLocaleString('fr-FR')}</p>
               </div>

               {reservation.paiement && (
                 <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center z-10 p-1 border-4 border-white shadow-sm">
                      <Clock className="w-full h-full" />
                    </div>
                    <p className="text-[13px] font-bold text-black leading-none mb-1">Paiement initialisé</p>
                    <p className="text-[11px] font-medium text-slate-400">{new Date(reservation.paiement.creeLe).toLocaleString('fr-FR')}</p>
                 </div>
               )}

               {reservation.confirmeeLe && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center z-10 p-1 border-4 border-white shadow-sm">
                      <CheckCircle2 className="w-full h-full" />
                    </div>
                    <p className="text-[13px] font-black text-black leading-none mb-1">Confirmée propriétaire</p>
                    <p className="text-[11px] font-medium text-slate-400">{new Date(reservation.confirmeeLe).toLocaleString('fr-FR')}</p>
                  </div>
               )}

               {reservation.statut === 'ANNULEE' && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center z-10 p-1 border-4 border-white shadow-sm">
                      <XCircle className="w-full h-full" />
                    </div>
                    <p className="text-[13px] font-black text-red-600 leading-none mb-1">Annulée</p>
                    <p className="text-[11px] font-medium text-slate-400">Le dossier est clos.</p>
                  </div>
               )}

               {reservation.statut === 'TERMINEE' && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center z-10 p-1 border-4 border-white shadow-sm">
                      <CheckCircle2 className="w-full h-full" />
                    </div>
                    <p className="text-[13px] font-black text-indigo-600 leading-none mb-1">Terminée (Checkout)</p>
                    <p className="text-[11px] font-medium text-slate-400">Tous les fonds sont libérés.</p>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Overlays */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="p-8 text-center space-y-6">
              <div className={cn(
                "w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg",
                showConfirm === 'CANCEL' ? "bg-red-50 text-red-500" : "bg-black text-emerald-400 shadow-emerald-500/20"
              )}>
                {showConfirm === 'CANCEL' ? <ShieldAlert className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-[20px] font-black text-black leading-tight">
                  {showConfirm === 'CANCEL' ? "Annulation Forcée Irréversible" : "Confirmation Forcée Finale"}
                </h3>
                <p className="text-[14px] font-medium text-slate-400 leading-relaxed">
                  {showConfirm === 'CANCEL' 
                    ? "Attention ! Cette action annulera instantanément la réservation sans aucune pénalité. Le locataire sera intégralement remboursé si éligible." 
                    : "Attention ! Cette action marquera la location comme terminée. Les fonds seront libérés au propriétaire comme si le checkout QR Code avait été scanné."
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="h-14 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  disabled={isLoading}
                  onClick={showConfirm === 'CANCEL' ? handleForceCancel : handleForceComplete}
                  className={cn(
                    "h-14 rounded-2xl text-white font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50",
                    showConfirm === 'CANCEL' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-black hover:bg-slate-900 shadow-black/20"
                  )}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
