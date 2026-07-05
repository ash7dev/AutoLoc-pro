'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Camera, Upload, X, Check, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatarUrl?: string | null;
    onUpload: (file: File) => Promise<void>;
    uploading: boolean;
}

export function AvatarUploadModal({
    isOpen,
    onClose,
    currentAvatarUrl,
    onUpload,
    uploading,
}: AvatarUploadModalProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setPreview(null);
        setSelectedFile(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    }, []);

    const handleClose = useCallback(() => {
        if (!uploading) {
            resetState();
            onClose();
        }
    }, [uploading, onClose, resetState]);

    const validateFile = (file: File): string | null => {
        // Vérifier le type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return 'Format non supporté. Utilisez JPG, PNG ou WebP.';
        }

        // Vérifier la taille (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return 'La photo est trop volumineuse. Maximum 5 MB.';
        }

        return null;
    };

    const handleFileSelect = (file: File) => {
        setError('');

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);

        // Créer un aperçu
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            await onUpload(selectedFile);
            resetState();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-md p-0 gap-0 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200/60 shadow-2xl"
                onPointerDownOutside={(e) => uploading && e.preventDefault()}
                onEscapeKeyDown={(e) => uploading && e.preventDefault()}
            >
                {/* Header */}
                <div className="relative px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-[17px] font-black text-slate-900 tracking-tight">
                                Photo de profil
                            </h2>
                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                                Ajoutez ou modifiez votre photo
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={uploading}
                            className="w-8 h-8 rounded-lg bg-white/60 hover:bg-white border border-slate-200/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Preview or Current Avatar */}
                    {(preview || currentAvatarUrl) && (
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                                    <img
                                        src={preview || currentAvatarUrl || ''}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {preview && (
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Upload Options */}
                    {!preview && (
                        <>
                            {/* Drag & Drop Zone */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={cn(
                                    'relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer group',
                                    dragActive
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-slate-300 bg-slate-50/50 hover:border-purple-400 hover:bg-purple-50/50'
                                )}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className={cn(
                                        'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
                                        dragActive
                                            ? 'bg-purple-500 scale-110'
                                            : 'bg-slate-200 group-hover:bg-purple-500 group-hover:scale-110'
                                    )}>
                                        <Upload className={cn(
                                            'w-7 h-7 transition-colors',
                                            dragActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                                        )} strokeWidth={2} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[14px] font-bold text-slate-900">
                                            {dragActive ? 'Déposez votre photo ici' : 'Glissez-déposez votre photo'}
                                        </p>
                                        <p className="text-[12px] text-slate-500 mt-1">
                                            ou cliquez pour parcourir
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                            JPG, PNG ou WebP • Max 5 MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Gallery */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-purple-500 flex items-center justify-center transition-all">
                                        <ImageIcon className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" strokeWidth={2} />
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700 group-hover:text-purple-700">
                                        Galerie
                                    </span>
                                </button>

                                {/* Camera (mobile only) */}
                                <button
                                    type="button"
                                    onClick={() => cameraInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-500 flex items-center justify-center transition-all">
                                        <Camera className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" strokeWidth={2} />
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700 group-hover:text-indigo-700">
                                        Caméra
                                    </span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                            <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <p className="text-[12px] font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {preview && (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={resetState}
                                disabled={uploading}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[13px] font-bold hover:from-purple-600 hover:to-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                                        Upload en cours...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" strokeWidth={2.5} />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="user"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </DialogContent>
        </Dialog>
    );
}
