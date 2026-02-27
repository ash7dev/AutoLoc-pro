"use client";

import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileWalletCardProps {
  available: string;
  pending: string;
  loading?: boolean;
}

export function MobileWalletCard({ 
  available, 
  pending, 
  loading = false 
}: MobileWalletCardProps) {
  return (
    <div className="lg:hidden bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-black/40" />
        <span className="text-[11px] font-medium text-black/40 uppercase tracking-wider">
          Portefeuille
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-black/40">Disponible</span>
          </div>
          {loading ? (
            <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-semibold text-black">{available}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] text-black/40">En attente</span>
          </div>
          {loading ? (
            <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-semibold text-black">{pending}</span>
          )}
        </div>
      </div>
    </div>
  );
}
