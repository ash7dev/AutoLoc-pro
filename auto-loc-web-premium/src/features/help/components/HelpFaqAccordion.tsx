'use client';

import React, { useId, useMemo, useState } from 'react';
import { ChevronDown, Search, SearchX, X, type LucideIcon } from 'lucide-react';

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

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

/** Minuscules sans accents, pour une recherche tolérante */
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/* ══ Question unique ══ */
function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  buttonId,
  panelId,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  buttonId: string;
  panelId: string;
}) {
  return (
    <div className="relative">
      {isOpen && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brand-main" />
      )}

      <h4>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`group flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-main ${isOpen ? 'bg-brand-main/[0.03]' : 'hover:bg-brand-main/[0.02]'
            }`}
        >
          <span className="text-[15px] font-semibold leading-snug text-brand-dark">
            {item.question}
          </span>
          <span
            aria-hidden
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 motion-reduce:transition-none ${isOpen
                ? 'rotate-180 bg-brand-main text-champagne'
                : 'bg-slate-100 text-slate-500 group-hover:bg-brand-main/10 group-hover:text-brand-main'
              }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </h4>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
      >
        <div
          className={`overflow-hidden transition-[visibility] duration-0 ${isOpen ? 'visible' : 'invisible delay-300'
            }`}
        >
          <p className="max-w-prose px-6 pb-6 pr-16 text-[14px] leading-relaxed text-slate-600">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══ Accordéon complet ══ */
export const HelpFaqAccordion: React.FC<HelpFaqAccordionProps> = ({ categories }) => {
  const uid = useId();
  const [query, setQuery] = useState('');
  // Question ouverte par catégorie (clé : texte de la question, stable même quand la recherche filtre la liste)
  const [openMap, setOpenMap] = useState<Record<string, string | null>>({});

  const toggle = (categoryId: string, question: string) => {
    setOpenMap((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === question ? null : question,
    }));
  };

  const filtered = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items
          .map((item, idx) => ({ item, idx }))
          .filter(({ item }) => {
            if (tokens.length === 0) return true;
            const haystack = normalize(`${item.question} ${item.answer}`);
            return tokens.every((t) => haystack.includes(t));
          }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, query]);

  const totalMatches = filtered.reduce((sum, cat) => sum + cat.items.length, 0);
  const isSearching = query.trim().length > 0;

  return (
    <div>
      {/* Titre et recherche */}
      <div className="mb-8">
        <h2
          style={DISPLAY_FONT}
          className="text-2xl font-normal text-brand-dark sm:text-3xl"
        >
          Questions fréquentes
        </h2>

        <div className="relative mt-4">
          <label htmlFor={`${uid}-search`} className="sr-only">
            Rechercher dans les questions fréquentes
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id={`${uid}-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une question"
            className="w-full rounded-full border border-brand-dark/10 bg-white py-3 pl-11 pr-11 text-sm text-brand-dark placeholder:text-slate-400 transition focus:border-brand-main focus:outline-none focus:ring-2 focus:ring-brand-main/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-2 min-h-[1.25rem] px-1 text-xs text-slate-500" aria-live="polite">
          {isSearching
            ? totalMatches > 0
              ? `${totalMatches} question${totalMatches > 1 ? 's' : ''} trouvée${totalMatches > 1 ? 's' : ''}`
              : 'Aucun résultat'
            : ''}
        </p>
      </div>

      {/* Catégories */}
      {filtered.length > 0 ? (
        <div className="space-y-8">
          {filtered.map((cat) => {
            const Icon = cat.icon;
            return (
              <section
                key={cat.id}
                id={cat.id}
                aria-labelledby={`${uid}-${cat.id}-title`}
                className="scroll-mt-32"
              >
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-main text-champagne">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <h3
                      id={`${uid}-${cat.id}-title`}
                      style={DISPLAY_FONT}
                      className="text-xl font-normal text-brand-dark"
                    >
                      {cat.title}
                    </h3>
                  </div>
                  <span className="text-xs tabular-nums text-slate-400">
                    {cat.items.length} question{cat.items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 overflow-hidden rounded-[28px] border border-brand-dark/[0.08] bg-white shadow-[0_20px_50px_-36px_rgba(10,61,46,0.35)]">
                  {cat.items.map(({ item, idx }) => (
                    <FaqAccordionItem
                      key={item.question}
                      item={item}
                      isOpen={openMap[cat.id] === item.question}
                      onToggle={() => toggle(cat.id, item.question)}
                      buttonId={`${uid}-${cat.id}-${idx}-button`}
                      panelId={`${uid}-${cat.id}-${idx}-panel`}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-[28px] border border-brand-dark/[0.08] bg-white px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-main text-champagne">
            <SearchX className="h-6 w-6" />
          </span>
          <p style={DISPLAY_FONT} className="mt-5 text-xl text-brand-main">
            Aucun résultat
          </p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Essayez d’autres mots-clés, ou contactez notre équipe : nous répondons volontiers.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-5 rounded-full border border-brand-main/25 px-4 py-2 text-sm font-medium text-brand-main transition hover:bg-brand-main hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
          >
            Effacer la recherche
          </button>
        </div>
      )}
    </div>
  );
};