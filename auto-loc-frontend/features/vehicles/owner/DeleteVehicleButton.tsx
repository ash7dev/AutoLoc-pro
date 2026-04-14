'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { VEHICLE_PATHS } from '@/lib/nestjs/vehicles';
import { toast } from 'sonner';

interface Props {
  vehicleId: string;
  statut: string;
}

export function DeleteVehicleButton({ vehicleId, statut }: Props) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const isDeletable = statut === 'ARCHIVE' || statut === 'BROUILLON';

  if (!isDeletable) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await authFetch(VEHICLE_PATHS.purgeDraft(vehicleId), {
        method: 'DELETE',
      });
      toast.success('Le véhicule a été définitivement supprimé.');
      router.push('/dashboard/owner/vehicles');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-100 bg-red-50 text-[12px] font-bold text-red-600 hover:bg-red-100 hover:border-red-200 transition-all shadow-sm shadow-red-500/5 group"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          )}
          Supprimer définitivement
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white border-slate-200 max-w-md rounded-3xl">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <AlertDialogTitle className="text-[20px] font-black tracking-tight text-slate-900">
            Action irréversible
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] text-slate-500 leading-relaxed pt-2">
            Êtes-vous sûr de vouloir supprimer définitivement ce véhicule ? 
            <br /><br />
            Toutes les photos, les documents et les données liées seront effacés à jamais de la plateforme AutoLoc.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mt-2">
            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-[12px] text-slate-500 font-medium">
                Cette action ne peut pas être annulée. Les statistiques de revenus liées à ce véhicule pourraient être impactées.
            </p>
        </div>
        <AlertDialogFooter className="gap-2 pt-4">
          <AlertDialogCancel className="rounded-xl border-slate-200 font-semibold text-slate-600">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="rounded-xl bg-red-500 text-white font-black hover:bg-red-600 shadow-lg shadow-red-500/20"
          >
            Confirmer la suppression
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
