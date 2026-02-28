"use client";

import { useState } from "react";
import { FileSearch, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/features/shared/ModalShell";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";

interface TenantDocsViewerProps {
    reservationId: string;
}

interface LocataireDocs {
    prenom: string;
    nom: string;
    kycStatus?: string;
    kycDocumentUrl?: string;
    kycSelfieUrl?: string;
    permisUrl?: string;
}

export function TenantDocsViewer({ reservationId }: TenantDocsViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [docs, setDocs] = useState<LocataireDocs | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { authFetch } = useAuthFetch();

    const handleOpen = async () => {
        setIsOpen(true);
        if (docs) return; // already loaded

        setLoading(true);
        setError(null);
        try {
            const data = await authFetch<LocataireDocs>(`/reservations/${reservationId}/locataire-docs`);
            setDocs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des documents.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-semibold h-8"
            >
                <FileSearch className="w-3.5 h-3.5 text-slate-500" />
                Voir infos locataire
            </Button>

            {isOpen && (
                <ModalShell
                    title="Documents du locataire"
                    subtitle="Vérifiez l'identité et le permis de votre locataire."
                    tag="Auto Loc · Vérification"
                    onClose={() => setIsOpen(false)}
                    contentClassName="p-6 overflow-y-auto max-h-[80vh]"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
                            <p className="text-sm">Chargement des documents...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-red-50 rounded-xl border border-red-100 px-4">
                            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                            <p className="text-sm font-semibold text-red-700">{error}</p>
                            <Button onClick={handleOpen} variant="outline" size="sm" className="mt-4">
                                Réessayer
                            </Button>
                        </div>
                    ) : docs ? (
                        <div className="space-y-8">
                            {/* KYC Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                        Identité (KYC : {docs.kycStatus || "NON DÉFINI"})
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-semibold text-slate-700">Pièce d'identité</p>
                                        {docs.kycDocumentUrl ? (
                                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[4/3] group">
                                                <img
                                                    src={docs.kycDocumentUrl}
                                                    alt="Pièce d'identité"
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <a
                                                    href={docs.kycDocumentUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                        Agrandir
                                                    </span>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center aspect-[4/3] text-sm text-slate-400">
                                                Non fournie
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-xs font-semibold text-slate-700">Selfie</p>
                                        {docs.kycSelfieUrl ? (
                                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[4/3] group">
                                                <img
                                                    src={docs.kycSelfieUrl}
                                                    alt="Selfie"
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <a
                                                    href={docs.kycSelfieUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                        Agrandir
                                                    </span>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center aspect-[4/3] text-sm text-slate-400">
                                                Non fourni
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Permis Section */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                    Permis de conduire
                                </h3>

                                <div className="max-w-md">
                                    {docs.permisUrl ? (
                                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[4/3] group">
                                            <img
                                                src={docs.permisUrl}
                                                alt="Permis de conduire"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <a
                                                href={docs.permisUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                    Agrandir
                                                </span>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-red-200 bg-red-50 flex flex-col gap-2 items-center justify-center aspect-[4/3] text-sm text-red-500">
                                            <AlertCircle className="w-6 h-6" />
                                            <p className="font-medium">Permis non fourni</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={() => setIsOpen(false)} variant="outline">
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </ModalShell>
            )}
        </>
    );
}
