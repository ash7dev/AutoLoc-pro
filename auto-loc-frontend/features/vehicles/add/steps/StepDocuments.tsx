"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileCheck2, FileUp, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddVehicleStore } from "../store";

interface Props {
    nextStep?: () => void;
    previousStep?: () => void;
}

export function StepDocuments({ nextStep, previousStep }: Props) {
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
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold">Documents obligatoires</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Pour valider votre véhicule, nous avons besoin d&apos;une copie de votre carte grise et de l&apos;attestation d&apos;assurance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CARTE GRISE */}
                <DocumentZone
                    title="Carte Grise"
                    description="Certificat d'immatriculation"
                    icon={<FileCheck2 className="w-6 h-6" />}
                    file={carteGrise}
                    onFileSelect={(files) => handleFile("carteGrise", files)}
                    onClear={() => setDocument("carteGrise", null)}
                />

                {/* ASSURANCE */}
                <DocumentZone
                    title="Attestation d'assurance"
                    description="En cours de validité"
                    icon={<ShieldCheck className="w-6 h-6" />}
                    file={assurance}
                    onFileSelect={(files) => handleFile("assurance", files)}
                    onClear={() => setDocument("assurance", null)}
                />
            </div>

            <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" onClick={previousStep} className="gap-2 h-10">
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>
                <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isFormValid}
                    className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 h-10 disabled:opacity-50"
                >
                    Suivant — Confirmation
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

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
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onFileSelect(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-colors h-40 text-center"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">Cliquez ou glissez-déposez</p>
                        <p className="text-xs text-slate-500 mt-0.5">Image ou PDF (max 10 Mo)</p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => onFileSelect(e.target.files)}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50 h-40">
                    <div className="flex flex-col items-center justify-center w-full gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            {icon}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-emerald-800 line-clamp-1 break-all max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Prêt à être envoyé</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/50 mt-1"
                        >
                            <X className="w-4 h-4 mr-1.5" />
                            Remplacer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
