"use client";

import { useRef } from "react";
import {
    ArrowLeft, ArrowRight, FileCheck2, FileUp, ShieldCheck, X, Camera, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore } from "../store";

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export function StepDocuments({ onNext, onBack }: Props) {
    const { carteGrise, assurance, setDocument } = useAddVehicleStore();

    const handleFile = (type: "carteGrise" | "assurance", files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
            setDocument(type, file);
        }
    };

    const isFormValid = !!carteGrise && !!assurance;

    return (
        <div className="space-y-7">

            {/* ━━━ Section Card ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                    <span className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                    </span>
                    <div>
                        <p className="text-[14px] font-bold text-slate-900 tracking-tight">Documents obligatoires</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                            Carte grise et attestation d&apos;assurance requis
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <DocumentZone
                            title="Carte Grise"
                            description="Certificat d'immatriculation"
                            icon={<FileCheck2 className="w-5 h-5" strokeWidth={1.75} />}
                            file={carteGrise}
                            onFileSelect={(files) => handleFile("carteGrise", files)}
                            onClear={() => setDocument("carteGrise", null)}
                        />

                        <DocumentZone
                            title="Attestation d'assurance"
                            description="En cours de validité"
                            icon={<ShieldCheck className="w-5 h-5" strokeWidth={1.75} />}
                            file={assurance}
                            onFileSelect={(files) => handleFile("assurance", files)}
                            onClear={() => setDocument("assurance", null)}
                        />
                    </div>
                </div>
            </div>

            {/* ━━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={onBack}
                    className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200">
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                    Retour
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!isFormValid}
                    className={cn(
                        "group flex items-center gap-2.5 text-[13px] font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all duration-200",
                        isFormValid
                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                            : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed",
                    )}
                >
                    Suivant — Confirmation
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

/* ── Document upload zone ───────────────────────────────────────── */
function DocumentZone({
    title,
    description,
    icon,
    file,
    onFileSelect,
    onClear,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    file: File | null;
    onFileSelect: (files: FileList | null) => void;
    onClear: () => void;
}) {
    const cameraRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onFileSelect(e.dataTransfer.files);
    };

    return (
        <div className="space-y-2.5">
            <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                    {icon}
                </span>
                <div>
                    <p className="text-[13px] font-bold text-slate-800">{title}</p>
                    <p className="text-[10px] font-medium text-slate-400">{description}</p>
                </div>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center p-5 gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors text-center"
                >
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => cameraRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                        >
                            <Camera className="h-3 w-3" strokeWidth={2.5} />
                            Photo
                        </button>
                        <button
                            type="button"
                            onClick={() => galleryRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-[11px] font-bold hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <FileUp className="h-3 w-3" strokeWidth={2.5} />
                            Parcourir
                        </button>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">ou glisser-déposer · Image / PDF</span>
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFileSelect(e.target.files)} />
                    <input ref={galleryRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFileSelect(e.target.files)} />
                </div>
            ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                    <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-emerald-800 truncate">{file.name}</p>
                        <p className="text-[10px] font-medium text-emerald-600 mt-0.5">Prêt à être envoyé</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClear}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex-shrink-0"
                    >
                        <X className="w-3 h-3" strokeWidth={2.5} />
                        Changer
                    </button>
                </div>
            )}
        </div>
    );
}
