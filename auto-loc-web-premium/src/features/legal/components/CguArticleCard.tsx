'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CguArticleCardProps {
  id: string;
  num: string | null;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const CguArticleCard: React.FC<CguArticleCardProps> = ({
  id,
  num,
  title,
  icon: Icon,
  children,
}) => {
  return (
    <article
      id={id}
      className="scroll-mt-32 rounded-3xl border border-[#041912]/8 bg-white overflow-hidden shadow-xs transition-shadow hover:shadow-md hover:shadow-slate-200/60"
    >
      {/* Header */}
      <div className="flex items-start gap-4 px-6 py-5 sm:px-8 border-b border-slate-100">
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#0A3D2E]/8 flex items-center justify-center mt-0.5">
          <Icon className="h-5 w-5 text-[#0A3D2E]" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {num ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A3D2E]/60">
                Article {num}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Introduction
              </span>
            )}
          </div>
          <h2
            className="font-fraunces text-lg text-[#041912] sm:text-xl font-normal"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 sm:px-8">
        {children}
      </div>
    </article>
  );
};
