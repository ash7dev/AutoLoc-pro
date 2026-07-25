'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehiclesPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

export function VehiclesPagination({ currentPage, totalPages, total }: VehiclesPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // Calculer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Nombre maximum de boutons visibles

    if (totalPages <= maxVisible) {
      // Afficher toutes les pages si <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Pages autour de la page courante
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Toujours afficher la dernière page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm">
      {/* Stats */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="text-[16px] font-black text-slate-900 tabular-nums">{total}</span>
        <span className="font-medium">véhicule{total > 1 ? 's' : ''} au total</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="hidden sm:inline text-slate-400 text-xs">Page {currentPage} sur {totalPages}</span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all border',
            currentPage === 1
              ? 'text-slate-300 bg-slate-50 border-slate-200 cursor-not-allowed'
              : 'text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 border-slate-200 active:scale-95'
          )}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Numéros de pages */}
        <div className="hidden md:flex items-center gap-1.5">
          {pageNumbers.map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400 font-bold">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page as number)}
                className={cn(
                  'min-w-[40px] px-3 py-2.5 text-[13px] font-black rounded-xl transition-all border',
                  currentPage === page
                    ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-lg shadow-slate-900/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
                )}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Indicateur mobile */}
        <div className="md:hidden px-4 py-2 rounded-xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 tabular-nums">
          {currentPage} / {totalPages}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all border',
            currentPage === totalPages
              ? 'text-slate-300 bg-slate-50 border-slate-200 cursor-not-allowed'
              : 'text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 border-slate-200 active:scale-95'
          )}
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
