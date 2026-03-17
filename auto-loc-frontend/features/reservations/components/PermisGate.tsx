"use client";

import { useState, useRef } from "react";
import { FileUp, Loader2, CheckCircle2, ShieldCheck, FileCheck2, X, ArrowRight } from "lucide-react";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { cn } from "@/lib/utils";

interface PermisGateProps {
    onSubmitted: () => void;
    onProceed?: () => void;
}

export function PermisGate({ onSubmitted, onProceed }: PermisGateProps) {
    const { authFetch } = useAuthFetch();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.type.startsWith("image/")) {
            setFile(dropped);
            setError(null);
        }
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type.startsWith("image/")) {
            setFile(selected);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            await authFetch("/auth/permis/upload", {
                method: "POST",
                body: formData as unknown as Record<string, unknown>,
            });
            setDone(true);
            setTimeout(onSubmitted, 1200);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Succès ── */
    if (done) {
        return (
            <div className="flex flex-col items-center gap-4 py-14 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.75} />
                </div>
                <div>
                    <p className="text-[15px] font-black text-slate-900">Permis envoyé</p>
                    <p className="text-[12.5px] text-slate-400 mt-1">Redirection en cours…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* Info */}
            <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
                <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0 text-emerald-600 mt-0.5" strokeWidth={1.75} />
                <p className="text-[12.5px] text-emerald-800 leading-relaxed">
                    Une photo recto-verso de votre <span className="font-bold">permis de conduire</span> en cours de validité est requise pour continuer.
                </p>
            </div>

            {/* Upload zone */}
            <input
                type="file"
                ref={inputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleSelect}
            />

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 text-center",
                        dragging
                            ? "border-emerald-400 bg-emerald-50/80 scale-[0.99]"
                            : "border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/40",
                    )}
                >
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                        dragging ? "bg-emerald-100" : "bg-slate-100",
                    )}>
                        <FileUp className={cn("w-6 h-6 transition-colors", dragging ? "text-emerald-600" : "text-slate-400")} strokeWidth={1.75} />
                    </div>
                    <div>
                        <p className="text-[13.5px] font-bold text-slate-800">
                            {dragging ? "Déposez l'image ici" : "Sélectionner une image"}
                        </p>
                        <p className="text-[11.5px] text-slate-400 mt-1">PNG, JPG, WebP · max 10 Mo</p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-2">ou appuyez pour prendre en photo</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <FileCheck2 className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 truncate">{file.name}</p>
                            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Prêt à envoyer</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                </div>
            )}

            {/* Erreur */}
            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-[12px] font-semibold text-red-600">{error}</p>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!file || loading}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[13.5px] font-bold transition-all duration-200",
                        file && !loading
                            ? "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px active:translate-y-0"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed",
                    )}
                >
                    {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    }
                    {loading ? "Envoi en cours…" : "Valider mon permis"}
                </button>

                {onProceed && (
                    <button
                        type="button"
                        onClick={onProceed}
                        disabled={loading}
                        className="w-full h-10 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </div>
    );
}
