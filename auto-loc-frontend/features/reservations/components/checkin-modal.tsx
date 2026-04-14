"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Upload, X, Loader2, CheckCircle2, AlertTriangle,
    ImagePlus, Fuel, Gauge, Car, Info, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { fetchPhotosUploadSignature, linkReservationPhoto, type PhotoEtatLieu } from "@/lib/nestjs/reservations";
import { uploadDocumentToCloudinary } from "@/lib/nestjs/vehicles";
import { translateError } from "@/lib/utils/api-error-fr";

/* ═════════════════════════════════════════════════════════════════ */
interface CheckinModalProps {
    reservationId: string;
    open: boolean;
    onClose: () => void;
    /** ISO string — pour avertir si trop tôt (avant J-1) */
    dateDebut?: string;
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
    { key: "avant",      label: "Avant",       icon: Car,   categorie: "AVANT" },
    { key: "arriere",    label: "Arrière",      icon: Car,   categorie: "ARRIERE" },
    { key: "cote_gauche",label: "Côté gauche",  icon: Car,   categorie: "COTE_GAUCHE" },
    { key: "cote_droit", label: "Côté droit",   icon: Car,   categorie: "COTE_DROIT" },
    { key: "compteur",   label: "Compteur km",  icon: Gauge, categorie: "COMPTEUR_KM" },
    { key: "carburant",  label: "Carburant",    icon: Fuel,  categorie: "CARBURANT" },
];

/** Même logique que le backend : check-in autorisé à partir de J-1 (24h avant dateDebut) */
function isTooEarlyForCheckin(dateDebut?: string): boolean {
    if (!dateDebut) return false;
    const debut = new Date(dateDebut);
    const oneDayBefore = new Date(debut.getTime() - 24 * 60 * 60 * 1000);
    return new Date() < oneDayBefore;
}

function formatDateFr(d: string): string {
    return new Date(d).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
}

/* ═════════════════════════════════════════════════════════════════ */
export function CheckinModal({ reservationId, open, onClose, dateDebut }: CheckinModalProps) {
    const router = useRouter();
    const { authFetch } = useAuthFetch();
    const [photos, setPhotos] = useState<Record<string, UploadedPhoto>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const photoCount = Object.keys(photos).length;
    const tooEarly = isTooEarlyForCheckin(dateDebut);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setPhotos({});
            setUploading(null);
            setError(null);
            setSuccess(false);
        }
    }, [open]);

    const handleUpload = useCallback(async (slot: PhotoSlot, file: File) => {
        setUploading(slot.key);
        setError(null);
        try {
            // 1. Fetch signature
            const sig = await fetchPhotosUploadSignature();

            // 2. Upload direct vers Cloudinary (compression gérée en interne)
            const uploadRes = await uploadDocumentToCloudinary(file, sig);

            // 3. Enregistrer le lien dans la DB
            const photo = await linkReservationPhoto(reservationId, {
                url: uploadRes.url,
                publicId: uploadRes.publicId,
                type: 'CHECKIN',
                categorie: slot.categorie,
            });

            setPhotos(prev => ({ ...prev, [slot.key]: photo as any }));
        } catch (err) {
            setError(translateError(err));
        } finally {
            setUploading(null);
        }
    }, [reservationId]);

    const handleSubmit = useCallback(async () => {
        if (submitting || success || photoCount === 0 || uploading !== null) return;
        setSubmitting(true);
        setError(null);
        try {
            await authFetch(`/reservations/${reservationId}/checkin?role=PROPRIETAIRE`, { method: "PATCH" });
            setSuccess(true);
            setTimeout(() => { onClose(); router.refresh(); }, 1500);
        } catch (err) {
            setError(translateError(err));
        } finally {
            setSubmitting(false);
        }
    }, [reservationId, authFetch, onClose, router, submitting, success, photoCount, uploading]);

    if (!open) return null;

    const canSubmit = !submitting && !success && photoCount > 0 && uploading === null && !tooEarly;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !submitting && onClose()} />

            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-white/8">
                    <div>
                        <h2 className="text-[17px] font-black text-white">Check-in</h2>
                        <p className="text-[12px] text-slate-400 mt-0.5">
                            Remise des clés au locataire
                        </p>
                    </div>
                    <button
                        onClick={() => !submitting && onClose()}
                        disabled={submitting}
                        className="w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center hover:bg-white/12 transition-colors disabled:opacity-40"
                    >
                        <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">

                    {/* Avertissement trop tôt */}
                    {tooEarly && dateDebut && (
                        <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <div>
                                <p className="text-[12.5px] font-black text-amber-300">Check-in pas encore disponible</p>
                                <p className="text-[11.5px] text-amber-400/80 mt-0.5 leading-relaxed">
                                    Le check-in sera débloqué la veille de la location, soit à partir du{" "}
                                    <span className="font-bold text-amber-300">
                                        {formatDateFr(new Date(new Date(dateDebut).getTime() - 24 * 60 * 60 * 1000).toISOString())}
                                    </span>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Info */}
                    <div className="rounded-xl bg-blue-500/8 border border-blue-500/15 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400 flex-shrink-0" strokeWidth={2} />
                            <p className="text-[13px] font-black text-white">Photos obligatoires — État des lieux de départ</p>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                            <li className="flex items-start gap-2 text-[11.5px] text-slate-400 leading-relaxed">
                                <span className="text-blue-400 mt-0.5">✓</span>
                                Prouve l&apos;état du véhicule <span className="text-white font-semibold">avant</span> la remise des clés
                            </li>
                            <li className="flex items-start gap-2 text-[11.5px] text-slate-400 leading-relaxed">
                                <span className="text-blue-400 mt-0.5">✓</span>
                                Conditionne le <span className="text-white font-semibold">déclenchement de votre paiement</span>
                            </li>
                            <li className="flex items-start gap-2 text-[11.5px] text-slate-400 leading-relaxed">
                                <span className="text-blue-400 mt-0.5">✓</span>
                                Permet la <span className="text-white font-semibold">validation automatique</span> au bout de 24h
                            </li>
                        </ul>
                        <p className="text-[10.5px] text-slate-500 border-t border-white/6 pt-2.5 font-medium">
                            Au moins 1 photo requise. Vous pouvez en ajouter jusqu&apos;à 6.
                        </p>
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
                                            (isUploading || submitting) && "pointer-events-none",
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
                        {/* Indicateur upload en cours */}
                        {uploading && (
                            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Upload en cours — attendez la fin avant de valider
                            </p>
                        )}
                    </div>

                    {/* Erreur */}
                    {error && (
                        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <p className="text-[12px] font-semibold text-red-400 leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Succès */}
                    {success && (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-[13px] font-bold text-emerald-400 animate-in fade-in duration-300">
                            <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                            Check-in confirmé ! Mise à jour en cours…
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center gap-3 px-6 py-4 bg-slate-900/95 backdrop-blur-md border-t border-white/8">
                    <button
                        onClick={() => !submitting && onClose()}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-white/6 border border-white/8 transition-all disabled:opacity-40"
                    >
                        Fermer
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200",
                            canSubmit
                                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-emerald-500/10 text-emerald-500/40 cursor-not-allowed border border-emerald-500/10",
                        )}
                    >
                        {submitting
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        }
                        {tooEarly
                            ? "Check-in pas encore disponible"
                            : uploading
                                ? "Upload en cours…"
                                : photoCount === 0
                                    ? "Ajoutez au moins 1 photo"
                                    : "Confirmer le check-in"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
