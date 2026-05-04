"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Shield, Loader2, AlertCircle, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/features/shared/ModalShell";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";

interface TenantDocsViewerProps {
    reservationId: string;
    compact?: boolean;
}

interface LocataireDocs {
    prenom: string;
    nom: string;
    kycStatus?: string;
    kycDocumentUrl?: string;
    kycSelfieUrl?: string;
    permisUrl?: string;
}

// ── KYC status config ─────────────────────────────────────────
const KYC_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string; dot: string }> = {
    VERIFIE:    { label: "Vérifié",     icon: ShieldCheck, bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    EN_ATTENTE: { label: "En attente",  icon: ShieldAlert, bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
    REJETE:     { label: "Rejeté",      icon: ShieldX,     bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
    NON_SOUMIS: { label: "Non soumis",  icon: Shield,      bg: "bg-slate-50",    text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-300"   },
};

function kycCfg(status?: string) {
    return KYC_CONFIG[status ?? "NON_SOUMIS"] ?? KYC_CONFIG.NON_SOUMIS;
}

// ── DocCard : image ou placeholder avec bouton "Ouvrir" toujours visible ──
function DocCard({ url, label }: { url?: string; label: string }) {
    if (!url) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1.5 py-7">
                <AlertCircle className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                <p className="text-[12px] text-slate-400 font-medium">Non fourni</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative">
            <img
                src={url}
                alt={label}
                className="w-full object-cover aspect-[4/3]"
            />
            {/* Bouton "Ouvrir" toujours visible — fonctionne sur touch ET desktop */}
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg hover:bg-black/85 transition-colors"
            >
                <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
                Ouvrir
            </a>
        </div>
    );
}

// ── Section header ─────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-2.5">
            {children}
        </p>
    );
}

export function TenantDocsViewer({ reservationId, compact }: TenantDocsViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [docs, setDocs] = useState<LocataireDocs | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { authFetch } = useAuthFetch();

    const handleOpen = async () => {
        setIsOpen(true);
        if (docs) return;

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
            {compact ? (
                <button
                    onClick={handleOpen}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-95"
                >
                    <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                    Voir KYC
                </button>
            ) : (
                <Button
                    onClick={handleOpen}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs font-semibold h-8 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Voir KYC
                </Button>
            )}

            {isOpen && (
                <ModalShell
                    title="Documents du locataire"
                    subtitle="Identité et permis de conduire du locataire."
                    tag="Auto Loc · Vérification"
                    onClose={() => setIsOpen(false)}
                    contentClassName="px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-6 overflow-y-auto"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-14">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                            <p className="text-sm text-slate-500">Chargement des documents…</p>
                        </div>

                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-red-50 rounded-2xl border border-red-100 px-4 gap-3">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                            <p className="text-sm font-semibold text-red-700">{error}</p>
                            <button
                                onClick={handleOpen}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                Réessayer
                            </button>
                        </div>

                    ) : docs ? (
                        <div className="space-y-5">

                            {/* ── Identité du locataire + statut KYC ── */}
                            {(() => {
                                const cfg = kycCfg(docs.kycStatus);
                                const KycIcon = cfg.icon;
                                return (
                                    <div className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-slate-500" strokeWidth={1.75} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13.5px] font-black text-slate-900 leading-tight truncate">
                                                {docs.prenom} {docs.nom}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Locataire</p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${cfg.bg} border ${cfg.border} flex-shrink-0`}>
                                            <KycIcon className={`w-3.5 h-3.5 ${cfg.text}`} strokeWidth={2.5} />
                                            <span className={`text-[11px] font-black ${cfg.text}`}>{cfg.label}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── Pièce d'identité + Selfie ── */}
                            <div>
                                <SectionLabel>Identité (KYC)</SectionLabel>
                                {/* Mobile : côte à côte en 2 colonnes — images plus compactes */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Pièce d'identité</p>
                                        <DocCard url={docs.kycDocumentUrl} label="Pièce d'identité" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Selfie</p>
                                        <DocCard url={docs.kycSelfieUrl} label="Selfie" />
                                    </div>
                                </div>
                            </div>

                            {/* ── Permis de conduire ── */}
                            <div className="border-t border-slate-100 pt-4">
                                <SectionLabel>Permis de conduire</SectionLabel>
                                <DocCard url={docs.permisUrl} label="Permis de conduire" />
                            </div>

                            {/* ── Fermer — pleine largeur sur mobile ── */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    ) : null}
                </ModalShell>
            )}
        </>
    );
}
