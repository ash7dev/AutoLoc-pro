'use client';

import { Printer } from 'lucide-react';

/**
 * PrintButton — Calls GET /api/nest/reservations/:id/contrat via the Next.js proxy.
 * The proxy injects the httpOnly auth cookie → backend generates a signed Cloudinary URL
 * (valid 5 min) → 302 redirect → browser opens the PDF.
 * The raw Cloudinary URL is never exposed in the browser.
 */
export function PrintButton({
    reservationId,
    variant = 'small',
}: {
    reservationId?: string | null;
    variant?: 'small' | 'large';
}) {
    const pdfHref = reservationId
        ? `/api/nest/reservations/${reservationId}/contrat`
        : null;

    if (variant === 'large') {
        if (pdfHref) {
            return (
                <a
                    href={pdfHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[13px] font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
                >
                    <Printer className="w-4 h-4" strokeWidth={2} />
                    Télécharger le PDF
                </a>
            );
        }
        return (
            <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[13px] font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
            >
                <Printer className="w-4 h-4" strokeWidth={2} />
                Imprimer cette page
            </button>
        );
    }

    // Small variant (header)
    if (pdfHref) {
        return (
            <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[12px] font-bold text-blue-600 hover:bg-blue-100 transition-colors"
            >
                <Printer className="w-3.5 h-3.5" strokeWidth={2.5} />
                Version imprimable
            </a>
        );
    }

    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[12px] font-bold text-blue-600 hover:bg-blue-100 transition-colors"
        >
            <Printer className="w-3.5 h-3.5" strokeWidth={2.5} />
            Imprimer
        </button>
    );
}
