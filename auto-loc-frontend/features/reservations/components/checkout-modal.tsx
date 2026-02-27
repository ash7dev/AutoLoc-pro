"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Camera, Upload, X, Loader2, CheckCircle2, AlertTriangle,
    ImagePlus, Fuel, Gauge, Car, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";

/* ═════════════════════════════════════════════════════════════════ */
interface CheckoutModalProps {
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
    { key: "avant", label: "Avant", icon: Car, categorie: "AVANT" },
    { key: "arriere", label: "Arrière", icon: Car, categorie: "ARRIERE" },
    { key: "cote_gauche", label: "Côté gauche", icon: Car, categorie: "COTE_GAUCHE" },
    { key: "cote_droit", label: "Côté droit", icon: Car, categorie: "COTE_DROIT" },
    { key: "compteur", label: "Compteur km", icon: Gauge, categorie: "COMPTEUR_KM" },
    { key: "carburant", label: "Carburant", icon: Fuel, categorie: "CARBURANT" },
];

/* ═════════════════════════════════════════════════════════════════ */
export function CheckoutModal({ reservationId, open, onClose }: CheckoutModalProps) {
    const router = useRouter();
    const { authFetch } = useAuthFetch();
    const [photos, setPhotos] = useState<Record<string, UploadedPhoto>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const photoCount = Object.keys(photos).length;

    const handleUpload = useCallback(async (slot: PhotoSlot, file: File) => {
        setUploading(slot.key);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(
                `/api/nest/reservations/${reservationId}/photos-etat?type=CHECKOUT&categorie=${slot.categorie}`,
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
            await authFetch(`/reservations/${reservationId}/checkout`, { method: "PATCH" });
            setSuccess(true);
            setTimeout(() => { onClose(); router.refresh(); }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du check-out");
        } finally {
            setSubmitting(false);
        }
    }, [reservationId, authFetch, onClose, router]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-white/8">
                    <div>
                        <h2 className="text-[17px] font-black text-white">Check-out</h2>
                        <p className="text-[12px] text-slate-400 mt-0.5">
                            Restitution du véhicule
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center hover:bg-white/12 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Info */}
                    <div className="flex items-start gap-3 rounded-xl bg-blue-500/8 border border-blue-500/15 p-4">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                        <div className="space-y-1">
                            <p className="text-[13px] font-bold text-white">
                                Photos comparatives recommandées
                            </p>
                            <p className="text-[11.5px] text-slate-400 leading-relaxed">
                                Comparez l&apos;état du véhicule avec les photos du check-in.
                                En cas de dommages, ces photos seront essentielles pour le litige.
                                Les photos sont <span className="text-blue-400 font-semibold">optionnelles</span>.
                            </p>
                        </div>
                    </div>

                    {/* Photo grid */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                            Photos du véhicule ({photoCount}/6)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PHOTO_SLOTS.map(slot => {
                                const uploaded = photos[slot.key];
                                const isUploading = uploading === slot.key;
                                const Icon = slot.icon;
                                return (
                                    <label
                                        key={slot.key}
                                        className={cn(
                                            "relative aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden group",
                                            uploaded
                                                ? "border-emerald-500/40 bg-emerald-500/5"
                                                : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5",
                                            isUploading && "pointer-events-none",
                                        )}
                                    >
                                        {uploaded ? (
                                            <>
                                                <img src={uploaded.url} alt={slot.label} className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Upload className="w-5 h-5 text-white" strokeWidth={2} />
                                                </div>
                                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                            </>
                                        ) : isUploading ? (
                                            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                                        ) : (
                                            <>
                                                <Icon className="w-5 h-5 text-slate-500 mb-1.5" strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold text-slate-500">{slot.label}</span>
                                                <ImagePlus className="w-3 h-3 text-slate-600 mt-1" strokeWidth={2} />
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
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
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />{error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-[13px] font-bold text-emerald-400 animate-in fade-in duration-300">
                            <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                            Check-out effectué ! Redirection…
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center gap-3 px-6 py-4 bg-slate-900/95 backdrop-blur-md border-t border-white/8">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-white/6 border border-white/8 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || success}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200",
                            submitting || success
                                ? "bg-blue-500/30 text-blue-400/60 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20",
                        )}
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />}
                        Valider le check-out
                    </button>
                </div>
            </div>
        </div>
    );
}
