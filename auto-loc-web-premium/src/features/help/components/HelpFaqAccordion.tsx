'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';

/* ══ Types ══ */
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  icon: LucideIcon;
  title: string;
  items: FaqItem[];
}

interface HelpFaqAccordionProps {
  categories: FaqCategory[];
}

/* ══ Single item ══ */
function FaqAccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4.5 text-left cursor-pointer group px-6"
      >
        <h4 className="text-[14px] font-semibold text-[#041912] group-hover:text-[#0A3D2E] transition-colors leading-snug">
          {item.question}
        </h4>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${isOpen ? 'bg-[#0A3D2E] text-[#F1DFB6]' : 'bg-slate-100 text-slate-500'}`}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="pb-5 px-6 -mt-1">
          <p className="text-[13px] leading-relaxed text-slate-500 pr-10">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══ Category block ══ */
export const HelpFaqAccordion: React.FC<HelpFaqAccordionProps> = ({ categories }) => {
  const [openMap, setOpenMap] = useState<Record<string, number | null>>({});

  const toggle = (categoryId: string, index: number) => {
    setOpenMap((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === index ? null : index,
    }));
  };

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <section key={cat.id} id={cat.id} className="scroll-mt-32">
            {/* Category header */}
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A3D2E]/8 text-[#0A3D2E]">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <h3
                className="font-fraunces text-lg text-[#041912] font-normal"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
              >
                {cat.title}
              </h3>
            </div>

            {/* Items card */}
            <div className="rounded-3xl border border-[#041912]/8 bg-white shadow-xs overflow-hidden">
              {cat.items.map((item, idx) => (
                <FaqAccordionItem
                  key={idx}
                  item={item}
                  isOpen={openMap[cat.id] === idx}
                  onToggle={() => toggle(cat.id, idx)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
