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
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">{total}</span>
        <span>véhicule{total > 1 ? 's' : ''} au total</span>
        <span className="text-slate-400">•</span>
        <span>Page {currentPage} sur {totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-100'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Numéros de pages */}
        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page as number)}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all',
                  currentPage === page
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-100'
          )}
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
