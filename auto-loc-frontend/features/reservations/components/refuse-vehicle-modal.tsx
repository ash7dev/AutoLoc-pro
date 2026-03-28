"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Upload, X, Loader2, AlertTriangle, ShieldAlert,
    ImagePlus, Car, Info, Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { translateError } from "@/lib/utils/api-error-fr";

/* ═════════════════════════════════════════════════════════════════ */
interface RefuseVehicleModalProps {
    reservationId: string;
    open: boolean;
    onClose: () => void;
}

interface PhotoSlot {
    key: string;
    label: string;
    icon: React.ElementType;
    categorie: string;
}

interface UploadedPhoto {
    id: string;
    url: string;
    categorie: string;
}

const PHOTO_SLOTS: PhotoSlot[] = [
    { key: "preuve_1", label: "Preuve 1", icon: Car, categorie: "AVANT" },
    { key: "preuve_2", label: "Preuve 2", icon: Car, categorie: "ARRIERE" },
    { key: "preuve_3", label: "Preuve 3", icon: Car, categorie: "INTERIEUR" },
];

/* ═════════════════════════════════════════════════════════════════ */
export function RefuseVehicleModal({ reservationId, open, onClose }: RefuseVehicleModalProps) {
    const router = useRouter();
    const { authFetch } = useAuthFetch();
    const [photos, setPhotos] = useState<Record<string, UploadedPhoto>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [raison, setRaison] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const photoCount = Object.keys(photos).length;
    const isReady = photoCount > 0 && raison.trim().length >= 15;

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setPhotos({});
            setRaison("");
            setUploading(null);
            setError(null);
            setSuccess(false);
        }
    }, [open]);

    const handleUpload = useCallback(async (slot: PhotoSlot, file: File) => {
        setUploading(slot.key);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(
                `/api/nest/reservations/${reservationId}/photos-etat?type=CHECKIN&categorie=${slot.categorie}`,
                { method: "POST", body: formData, credentials: "include" }
            );
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message ?? "Upload échoué");
            }
            const photo = await res.json();
            setPhotos(prev => ({ ...prev, [slot.key]: photo }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
        } finally {
            setUploading(null);
        }
    }, [reservationId]);

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setError(null);
        try {
            await authFetch(`/reservations/${reservationId}/refus-checkin`, { 
                method: "POST",
                body: JSON.stringify({ raison: raison.trim() }),
            });
            setSuccess(true);
            setTimeout(() => { onClose(); router.refresh(); }, 2000);
        } catch (err) {
            setError(translateError(err));
        } finally {
            setSubmitting(false);
        }
    }, [reservationId, raison, authFetch, onClose, router]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !submitting && onClose()} />

            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-red-500/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 mx-4 sm:mx-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-white/8">
                    <div>
                        <h2 className="text-[16px] sm:text-[17px] font-black text-red-500 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                            Refuser le véhicule
                        </h2>
                        <p className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5 sm:mt-1">
                            Ouvrir un litige pour non-conformité
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center hover:bg-white/12 transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    </button>
                </div>

                <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6">
                    {/* Info */}
                    <div className="rounded-xl bg-red-500/8 border border-red-500/15 p-3 sm:p-4 space-y-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] sm:text-[13px] font-black text-white">Attention : Procédure d'Arbitrage</p>
                                <p className="text-[10px] sm:text-[11.5px] text-slate-400 leading-relaxed mt-1">
                                    Vous êtes sur le point de bloquer cette location et vos fonds jusqu'à la décision de notre équipe.
                                    <br className="hidden sm:block" /><br className="hidden sm:block" />
                                    <span className="text-white font-semibold">Conséquence si jugé abusif :</span> Conformément à nos{' '}
                                    <a href="/cgu" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-2 font-semibold">Conditions Générales</a>, 
                                    si ce litige est considéré comme un simple changement d'avis ou un caprice, <span className="text-white font-semibold">aucun remboursement ne sera accordé</span> (application de la politique d'annulation de dernière minute).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Motif Textarea */}
                    <div className="space-y-1.5 sm:space-y-2">
                         <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Motif du refus <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={raison}
                            onChange={(e) => setRaison(e.target.value)}
                            placeholder="Décrivez précisément ce qui ne va pas (ex: Véhicule très sale, clim en panne, marque différente...)"
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none transition-colors"
                            rows={3}
                        />
                        <div className="flex items-center justify-end text-[9px] sm:text-[10px] text-slate-500">
                            {raison.length < 15 ? <span>Min 15 caractères</span> : <span className="text-emerald-500">✓ Longueur correcte</span>}
                        </div>
                    </div>

                    {/* Photo grid */}
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 sm:mb-3">
                            Preuves photographiques obligatoires ({photoCount}/3) <span className="text-red-500">*</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {PHOTO_SLOTS.map(slot => {
                                const uploaded = photos[slot.key];
                                const isUploading = uploading === slot.key;
                                const Icon = slot.icon;
                                return (
                                    <label
                                        key={slot.key}
                                        className={cn(
                                            "relative aspect-[4/3] sm:aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden group",
                                            uploaded
                                                ? "border-emerald-500/40 bg-emerald-500/5"
                                                : "border-white/10 bg-white/3 hover:border-red-500/30 hover:bg-white/5",
                                            isUploading && "pointer-events-none",
                                        )}
                                    >
                                        {uploaded ? (
                                            <>
                                                <img src={uploaded.url} alt={slot.label} className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                                                </div>
                                                <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <ShieldAlert className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" strokeWidth={3} />
                                                </div>
                                            </>
                                        ) : isUploading ? (
                                            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 animate-spin" />
                                        ) : (
                                            <>
                                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mb-1 sm:mb-1.5 group-hover:text-red-400" strokeWidth={1.5} />
                                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 group-hover:text-red-400">{slot.label}</span>
                                                <ImagePlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600 mt-1" strokeWidth={2} />
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUpload(slot, file);
                                                e.target.value = "";
                                            }}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-[11px] sm:text-[12px] font-semibold text-red-500">
                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <span className="leading-tight break-words">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 sm:p-4 text-[12px] sm:text-[13px] font-bold text-amber-500 animate-in fade-in duration-300">
                            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                            <span className="text-center sm:text-left">Litige transmis. Réouverture de vos réservations...</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 bg-slate-900/95 backdrop-blur-md border-t border-white/8">
                    <button
                        onClick={() => !submitting && onClose()}
                        disabled={submitting}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-xl text-[12px] sm:text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-white/6 border border-white/8 transition-all flex-shrink-0"
                    >
                        Fermer
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || success || !isReady}
                        className={cn(
                            "flex-1 sm:flex-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all duration-200",
                            submitting || success || !isReady
                                ? "bg-red-500/10 text-red-500/40 cursor-not-allowed border border-red-500/10"
                                : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
                        )}
                    >
                        {submitting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />}
                        <span className="hidden sm:inline">Transmettre le litige</span>
                        <span className="sm:hidden">Envoyer</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
