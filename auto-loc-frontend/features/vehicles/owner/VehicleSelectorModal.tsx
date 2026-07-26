'use client';

import React from 'react';
import Image from 'next/image';
import { X, Sparkles, Car, ChevronRight, MapPin, Gauge } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { mainPhoto, formatPrice, StatusChip } from './vehicle-helpers';

interface VehicleSelectorModalProps {
  vehicles: Vehicle[];
  open: boolean;
  onClose: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleSelectorModal({
  vehicles,
  open,
  onClose,
  onSelectVehicle,
}: VehicleSelectorModalProps) {
  // Only display verified or active vehicles for sharing
  const sharableVehicles = vehicles.filter((v) => v.statut === 'VERIFIE' || v.statut === 'EN_ATTENTE_VALIDATION');
  const displayVehicles = sharableVehicles.length > 0 ? sharableVehicles : vehicles;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md w-[92vw] max-h-[85vh] overflow-hidden rounded-3xl p-0 border border-slate-800 bg-slate-950 text-white shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-white tracking-tight">
                Choisissez un véhicule
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-medium">
                Quel véhicule souhaitez-vous partager en Story ?
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* List of Vehicles */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 scrollbar-thin">
          {displayVehicles.map((vehicle) => {
            const photo = mainPhoto(vehicle);
            const price = formatPrice(vehicle.prixParJour);

            return (
              <button
                key={vehicle.id}
                onClick={() => {
                  onClose();
                  onSelectVehicle(vehicle);
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-slate-800/90 bg-slate-900/60 hover:bg-slate-800/80 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-14 w-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={`${vehicle.marque} ${vehicle.modele}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Car className="h-5 w-5 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-white truncate group-hover:text-emerald-400 transition-colors">
                      {vehicle.marque} {vehicle.modele}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{vehicle.annee}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10.5px] text-slate-400 font-medium truncate">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {vehicle.ville}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] font-black text-emerald-400 tabular-nums">
                      {price} FCFA<span className="text-[9px] font-normal text-slate-400">/j</span>
                    </span>
                  </div>
                </div>

                {/* Select Arrow */}
                <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center shrink-0 text-slate-400 transition-all">
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>
            );
          })}
        </div>

      </DialogContent>
    </Dialog>
  );
}
