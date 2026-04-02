'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Calendar, 
  Car, 
  User, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminReservation, fetchAdminReservations } from '../../../lib/nestjs/admin';

const STATUS_TABS = [
  { id: 'ALL', label: 'Toutes', color: 'bg-slate-100 text-slate-600' },
  { id: 'PAYEE', label: 'Payées', color: 'bg-blue-50 text-blue-600' },
  { id: 'CONFIRMEE', label: 'Confirmées', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'EN_COURS', label: 'En cours', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'TERMINEE', label: 'Terminées', color: 'bg-slate-50 text-slate-400' },
  { id: 'ANNULEE', label: 'Annulées', color: 'bg-red-50 text-red-600' },
  { id: 'LITIGE', label: 'Litiges', color: 'bg-amber-50 text-amber-600' },
];

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

interface AdminReservationsListProps {
  accessToken: string;
  initialData?: { data: AdminReservation[]; total: number; page: number; limit: number };
}

export function AdminReservationsList({ accessToken, initialData }: AdminReservationsListProps) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<AdminReservation[]>(initialData?.data || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [page, setPage] = useState(initialData?.page || 1);
  const [isLoading, setIsLoading] = useState(false);

  async function loadData(targetPage: number, status: string) {
    setIsLoading(true);
    try {
      const res = await fetchAdminReservations(
        accessToken, 
        status === 'ALL' ? undefined : status, 
        targetPage
      );
      setData(res.data);
      setTotal(res.total);
      setPage(res.page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab !== 'ALL' || page !== 1) {
      loadData(page, activeTab);
    }
  }, [activeTab, page]);

  const filtered = data.filter(r => {
    const s = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(s) ||
      r.locataire.prenom.toLowerCase().includes(s) ||
      r.locataire.nom.toLowerCase().includes(s) ||
      r.vehicule.marque.toLowerCase().includes(s) ||
      r.vehicule.modele.toLowerCase().includes(s) ||
      r.vehicule.immatriculation.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une réservation, locataire, véhicule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] 
              focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="p-1.5 rounded-lg hover:bg-white hover:text-black disabled:opacity-30 transition-all shadow-sm border border-transparent hover:border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-black">{page} / {totalPages || 1}</span>
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg hover:bg-white hover:text-black disabled:opacity-30 transition-all shadow-sm border border-transparent hover:border-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all border",
                activeTab === tab.id 
                  ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-[1.02]" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-[14px] font-bold text-slate-400">Chargement des réservations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
            <Calendar className="w-8 h-8 text-slate-200" strokeWidth={1.5} />
          </div>
          <h3 className="text-[16px] font-black text-black mb-1">Aucune réservation</h3>
          <p className="text-[13px] font-medium text-slate-400 max-w-[280px]">
            {search ? "Aucune réservation ne correspond à votre recherche actuelle." : "Il n'y a pas encore de réservations dans cette catégorie."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((r) => {
            const status = STATUS_MAP[r.statut] || { label: r.statut, color: 'text-slate-500 bg-slate-100', icon: Clock };
            const StatusIcon = status.icon;

            return (
              <Link
                key={r.id}
                href={`/dashboard/admin/reservations/${r.id}`}
                className="group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                {/* ID & Date */}
                <div className="flex flex-col gap-1 md:w-32">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{r.id.split('-')[0]}</span>
                  <span className="text-[13px] font-bold text-black">{new Date(r.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  <span className="text-[11px] font-medium text-slate-400">{new Date(r.creeLe).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Parties */}
                <div className="flex flex-1 items-center gap-6">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                      <User className="w-2.5 h-2.5" /> Locataire
                    </div>
                    <p className="text-[14px] font-black text-black truncate">{r.locataire.prenom} {r.locataire.nom}</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">{r.locataire.email}</p>
                  </div>

                  <div className="hidden sm:flex items-center text-slate-200">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                      <User className="w-2.5 h-2.5" /> Propriétaire
                    </div>
                    <p className="text-[14px] font-black text-black truncate">{r.proprietaire.prenom} {r.proprietaire.nom}</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">{r.proprietaire.email}</p>
                  </div>
                </div>

                {/* Vehicule */}
                <div className="flex flex-col gap-1 md:w-48">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                    <Car className="w-2.5 h-2.5" /> Véhicule
                  </div>
                  <p className="text-[14px] font-black text-black truncate">{r.vehicule.marque} {r.vehicule.modele}</p>
                  <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">{r.vehicule.immatriculation}</p>
                </div>

                {/* Status & Price */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:w-40 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-transparent transition-all",
                    status.color
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  <p className="text-[16px] font-black text-black">
                    {formatPrice(r.totalLocataire)} <span className="text-[10px] text-slate-400">FCFA</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
