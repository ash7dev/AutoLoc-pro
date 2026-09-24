'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface CguTocItem {
  id: string;
  num: string | null;
  title: string;
}

interface CguTableOfContentsProps {
  items: CguTocItem[];
}

export const CguTableOfContents: React.FC<CguTableOfContentsProps> = ({ items }) => {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-32 rounded-3xl border border-[#041912]/8 bg-white p-5 shadow-xs">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-4 px-2">
          Table des matières
        </p>
        <nav className="space-y-0.5">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-medium text-slate-500 hover:bg-[#0A3D2E]/5 hover:text-[#0A3D2E] transition-colors group"
            >
              {item.num && (
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-[#0A3D2E]/10 flex items-center justify-center text-[9px] font-bold text-slate-400 group-hover:text-[#0A3D2E] transition-colors">
                  {item.num}
                </span>
              )}
              <span className="leading-tight flex-1">{item.title}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#0A3D2E]" strokeWidth={2.5} />
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};
