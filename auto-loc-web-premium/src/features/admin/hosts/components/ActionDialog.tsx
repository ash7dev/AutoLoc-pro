'use client';

import React, { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useModalBehavior } from '../hooks/useModalBehavior';

interface ActionDialogProps {
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    /** danger = action destructive (rouille), neutral = action standard (forêt) */
    tone?: 'danger' | 'neutral';
    /** Si fourni, un motif est demandé et obligatoire */
    reasonLabel?: string;
    onConfirm: (reason: string) => Promise<void> | void;
    onClose: () => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export const ActionDialog: React.FC<ActionDialogProps> = ({
    title,
    description,
    confirmLabel,
    tone = 'neutral',
    reasonLabel,
    onConfirm,
    onClose,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [reason, setReason] = useState('');
    const [touched, setTouched] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uid = useId();
    const titleId = `${uid}-title`;
    const descId = `${uid}-desc`;
    const reasonId = `${uid}-reason`;
    const errorId = `${uid}-error`;

    const danger = tone === 'danger';
    const reasonMissing = Boolean(reasonLabel) && !reason.trim();

    // Pas de fermeture pendant l'envoi : évite un double clic ou un état incohérent
    const close = () => {
        if (!submitting) onClose();
    };
    useModalBehavior(ref, close);

    const submit = async () => {
        if (submitting) return;
        if (reasonMissing) {
            setTouched(true);
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onConfirm(reason.trim());
            onClose();
        } catch {
            setError("L'action n'a pas abouti. Vérifiez votre connexion puis réessayez.");
            setSubmitting(false);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-[#041912]/60 backdrop-blur-[2px]" onMouseDown={close} aria-hidden="true" />

            <div
                ref={ref}
                role={danger ? 'alertdialog' : 'dialog'}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
                tabIndex={-1}
                className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl outline-none p-6 font-sans"
            >
                <div className="flex items-start gap-4">
                    {danger && (
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: 'rgba(161, 61, 61, 0.10)' }}
                        >
                            <AlertTriangle className="w-5 h-5 text-[#a13d3d] dark:text-[#e59a9a]" strokeWidth={1.75} />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h2 id={titleId} style={fontStyle} className="text-lg leading-snug text-[#041912] dark:text-white">
                            {title}
                        </h2>
                        <p id={descId} className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                {reasonLabel && (
                    <div className="mt-5">
                        <label htmlFor={reasonId} className="block text-[13px] font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                            {reasonLabel}
                        </label>
                        <textarea
                            id={reasonId}
                            data-autofocus
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            onBlur={() => setTouched(true)}
                            onKeyDown={(e) => {
                                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
                            }}
                            disabled={submitting}
                            aria-invalid={touched && reasonMissing}
                            aria-describedby={touched && reasonMissing ? errorId : undefined}
                            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-base sm:text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-colors focus:border-[#0A3D2E] focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#0A3D2E]/10 aria-[invalid=true]:border-[#a13d3d]"
                            placeholder="Décrivez la raison de cette décision"
                        />
                        {touched && reasonMissing && (
                            <p id={errorId} className="mt-1.5 text-[12px] font-medium text-[#a13d3d] dark:text-[#e59a9a]">
                                Le motif est obligatoire.
                            </p>
                        )}
                    </div>
                )}

                {error && (
                    <p role="alert" className="mt-4 text-[13px] font-medium text-[#a13d3d] dark:text-[#e59a9a]">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button
                        type="button"
                        onClick={close}
                        disabled={submitting}
                        // Action destructive sans motif : le focus initial est sur « Annuler »
                        data-autofocus={reasonLabel ? undefined : true}
                        className="h-10 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E] dark:focus-visible:outline-[#F1DFB6]"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={submitting}
                        className={`h-10 px-5 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E] dark:focus-visible:outline-[#F1DFB6] ${danger ? 'bg-[#a13d3d] text-white hover:brightness-110' : 'bg-[#0A3D2E] text-[#F1DFB6] hover:brightness-125'
                            }`}
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};