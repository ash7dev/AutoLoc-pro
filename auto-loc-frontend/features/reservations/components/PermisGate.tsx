"use client";

import { useState, useRef } from "react";
import { FileUp, Loader2, CheckCircle2, ShieldCheck, FileCheck2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";

interface PermisGateProps {
    onSubmitted: () => void;
    onProceed?: () => void;
}

export function PermisGate({ onSubmitted, onProceed }: PermisGateProps) {
    const { authFetch } = useAuthFetch();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.type.startsWith("image/")) {
            setFile(dropped);
        }
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type.startsWith("image/")) {
            setFile(selected);
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

            onSubmitted();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 text-sm text-blue-800">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                <p>
                    Pour finaliser votre réservation, nous avons besoin d'une photo de votre
                    <b> permis de conduire</b> en cours de validité.
                </p>
            </div>

            <div className="space-y-4">
                {!file ? (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-8 gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <FileUp className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-slate-700">Sélectionnez une image</p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG ou WebP (max 10 Mo)</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center">
                                <FileCheck2 className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-emerald-600">Fichier prêt</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFile(null)}
                            className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-200/50"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Retirer
                        </Button>
                    </div>
                )}

                {error && (
                    <p className="text-[13px] font-medium text-red-500 text-center">{error}</p>
                )}

                <input
                    type="file"
                    ref={inputRef}
                    accept="image/*,capture=camera"
                    className="hidden"
                    onChange={handleSelect}
                />
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <Button
                    className="w-full gap-2"
                    onClick={handleSubmit}
                    disabled={!file || loading}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4" />
                    )}
                    {loading ? "Envoi en cours..." : "Valider mon permis"}
                </Button>
                {onProceed && (
                    <Button
                        variant="ghost"
                        className="w-full text-slate-500"
                        onClick={onProceed}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                )}
            </div>
        </div>
    );
}
