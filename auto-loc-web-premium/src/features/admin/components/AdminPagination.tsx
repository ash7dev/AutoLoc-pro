'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  itemNoun?: {
    singular: string;
    plural: string;
  };
}

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main dark:focus-visible:outline-champagne';

export function getPaginationRange(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
  isLoading = false,
  itemNoun = { singular: 'élément', plural: 'éléments' },
}) => {
  if (totalItems === 0 || totalPages <= 0) {
    return null;
  }

  const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = getPaginationRange(currentPage, totalPages);

  const handlePageClick = (page: number) => {
    if (page === currentPage || isLoading || page < 1 || page > totalPages) return;
    onPageChange(page);
    // Smooth scroll to top of window or container
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[13px] font-sans">
      {/* Item count range summary */}
      <div className="text-slate-600 dark:text-slate-400 tabular-nums">
        Affichage de <span className="font-semibold text-slate-900 dark:text-white">{from}</span> à{' '}
        <span className="font-semibold text-slate-900 dark:text-white">{to}</span> sur{' '}
        <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span>{' '}
        {totalItems > 1 ? itemNoun.plural : itemNoun.singular}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav aria-label="Pagination de la liste" className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Page précédente"
            className={`inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium text-[13px] shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${FOCUS}`}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            <span className="hidden xs:inline">Précédent</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-9 flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium select-none text-[13px]"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === currentPage;

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageClick(p)}
                  disabled={isLoading}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Page ${p}`}
                  className={`min-w-[36px] h-9 px-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${FOCUS} ${
                    isCurrent
                      ? 'shadow-xs text-champagne'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  style={
                    isCurrent
                      ? { backgroundColor: FOREST, color: CHAMPAGNE }
                      : undefined
                  }
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Page suivante"
            className={`inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium text-[13px] shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${FOCUS}`}
          >
            <span className="hidden xs:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </nav>
      )}
    </div>
  );
};
