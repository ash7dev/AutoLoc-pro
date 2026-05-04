'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Données pays ──────────────────────────────────────────────────────────────
export interface Country { flag: string; name: string; dial: string; code: string }

export const FEATURED_COUNTRIES: Country[] = [
  { flag: '🇸🇳', name: 'Sénégal',            dial: '+221', code: 'SN' },
  { flag: '🇫🇷', name: 'France',              dial: '+33',  code: 'FR' },
  { flag: '🇧🇪', name: 'Belgique',            dial: '+32',  code: 'BE' },
  { flag: '🇨🇭', name: 'Suisse',              dial: '+41',  code: 'CH' },
  { flag: '🇨🇦', name: 'Canada',              dial: '+1',   code: 'CA' },
  { flag: '🇺🇸', name: 'États-Unis',          dial: '+1',   code: 'US' },
];

export const ALL_COUNTRIES: Country[] = [
  ...FEATURED_COUNTRIES,
  { flag: '🇩🇿', name: 'Algérie',             dial: '+213', code: 'DZ' },
  { flag: '🇩🇪', name: 'Allemagne',           dial: '+49',  code: 'DE' },
  { flag: '🇦🇴', name: 'Angola',              dial: '+244', code: 'AO' },
  { flag: '🇸🇦', name: 'Arabie Saoudite',     dial: '+966', code: 'SA' },
  { flag: '🇦🇷', name: 'Argentine',           dial: '+54',  code: 'AR' },
  { flag: '🇧🇯', name: 'Bénin',               dial: '+229', code: 'BJ' },
  { flag: '🇧🇷', name: 'Brésil',              dial: '+55',  code: 'BR' },
  { flag: '🇧🇫', name: 'Burkina Faso',        dial: '+226', code: 'BF' },
  { flag: '🇨🇲', name: 'Cameroun',            dial: '+237', code: 'CM' },
  { flag: '🇨🇻', name: 'Cap-Vert',            dial: '+238', code: 'CV' },
  { flag: '🇨🇳', name: 'Chine',               dial: '+86',  code: 'CN' },
  { flag: '🇨🇩', name: 'Congo (RDC)',         dial: '+243', code: 'CD' },
  { flag: '🇨🇬', name: 'Congo',               dial: '+242', code: 'CG' },
  { flag: '🇨🇮', name: "Côte d'Ivoire",       dial: '+225', code: 'CI' },
  { flag: '🇩🇰', name: 'Danemark',            dial: '+45',  code: 'DK' },
  { flag: '🇦🇪', name: 'Émirats Arabes Unis', dial: '+971', code: 'AE' },
  { flag: '🇪🇸', name: 'Espagne',             dial: '+34',  code: 'ES' },
  { flag: '🇪🇹', name: 'Éthiopie',            dial: '+251', code: 'ET' },
  { flag: '🇫🇮', name: 'Finlande',            dial: '+358', code: 'FI' },
  { flag: '🇬🇦', name: 'Gabon',               dial: '+241', code: 'GA' },
  { flag: '🇬🇲', name: 'Gambie',              dial: '+220', code: 'GM' },
  { flag: '🇬🇭', name: 'Ghana',               dial: '+233', code: 'GH' },
  { flag: '🇬🇳', name: 'Guinée',              dial: '+224', code: 'GN' },
  { flag: '🇬🇼', name: 'Guinée-Bissau',       dial: '+245', code: 'GW' },
  { flag: '🇮🇳', name: 'Inde',                dial: '+91',  code: 'IN' },
  { flag: '🇮🇹', name: 'Italie',              dial: '+39',  code: 'IT' },
  { flag: '🇯🇵', name: 'Japon',               dial: '+81',  code: 'JP' },
  { flag: '🇰🇪', name: 'Kenya',               dial: '+254', code: 'KE' },
  { flag: '🇱🇷', name: 'Libéria',             dial: '+231', code: 'LR' },
  { flag: '🇲🇱', name: 'Mali',                dial: '+223', code: 'ML' },
  { flag: '🇲🇦', name: 'Maroc',               dial: '+212', code: 'MA' },
  { flag: '🇲🇷', name: 'Mauritanie',          dial: '+222', code: 'MR' },
  { flag: '🇲🇽', name: 'Mexique',             dial: '+52',  code: 'MX' },
  { flag: '🇳🇱', name: 'Pays-Bas',            dial: '+31',  code: 'NL' },
  { flag: '🇳🇬', name: 'Nigeria',             dial: '+234', code: 'NG' },
  { flag: '🇳🇪', name: 'Niger',               dial: '+227', code: 'NE' },
  { flag: '🇳🇴', name: 'Norvège',             dial: '+47',  code: 'NO' },
  { flag: '🇵🇹', name: 'Portugal',            dial: '+351', code: 'PT' },
  { flag: '🇬🇧', name: 'Royaume-Uni',         dial: '+44',  code: 'GB' },
  { flag: '🇸🇱', name: 'Sierra Leone',        dial: '+232', code: 'SL' },
  { flag: '🇸🇪', name: 'Suède',               dial: '+46',  code: 'SE' },
  { flag: '🇹🇿', name: 'Tanzanie',            dial: '+255', code: 'TZ' },
  { flag: '🇹🇬', name: 'Togo',                dial: '+228', code: 'TG' },
  { flag: '🇹🇳', name: 'Tunisie',             dial: '+216', code: 'TN' },
  { flag: '🇹🇷', name: 'Turquie',             dial: '+90',  code: 'TR' },
  { flag: '🇿🇦', name: 'Afrique du Sud',      dial: '+27',  code: 'ZA' },
].filter((c, i, arr) => arr.findIndex(x => x.code === c.code) === i);

// ── CountryPicker ─────────────────────────────────────────────────────────────
function CountryPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: Country;
  onSelect: (c: Country) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.dial.includes(q),
    );
  }, [query]);

  const featured = filtered.filter(c => FEATURED_COUNTRIES.some(f => f.code === c.code));
  const others   = filtered.filter(c => !FEATURED_COUNTRIES.some(f => f.code === c.code));

  return (
    <div className="flex flex-col" style={{ maxHeight: 300 }}>
      {/* Recherche */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2.5} />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un pays ou un indicatif…"
          className="flex-1 text-[13px] font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')}>
            <X className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="overflow-y-auto overscroll-contain">
        {!query && (
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Fréquents
          </p>
        )}
        {(query ? filtered : [...featured, ...others]).map(c => (
          <button
            key={c.code}
            type="button"
            onClick={() => { onSelect(c); onClose(); }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100',
              selected.code === c.code && 'bg-emerald-50',
            )}
          >
            <span className="text-[20px] leading-none flex-shrink-0">{c.flag}</span>
            <span className="flex-1 text-[13px] font-medium text-slate-800 truncate">{c.name}</span>
            <span className={cn(
              'text-[12px] font-bold flex-shrink-0',
              selected.code === c.code ? 'text-emerald-600' : 'text-slate-400',
            )}>
              {c.dial}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-5 text-center text-[13px] text-slate-400">Aucun résultat</p>
        )}
      </div>
    </div>
  );
}

// ── PhoneField ─────────────────────────────────────────────────────────────────
export interface PhoneFieldProps {
  value: string;
  onChange: (fullNumber: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export function PhoneField({
  value,
  onChange,
  disabled = false,
  error = false,
  placeholder = '77 000 00 00',
}: PhoneFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [country, setCountry] = useState<Country>(() => {
    if (!value) return FEATURED_COUNTRIES[0];
    for (const c of ALL_COUNTRIES) {
      if (value.startsWith(c.dial)) return c;
    }
    return FEATURED_COUNTRIES[0];
  });

  const [number, setNumber] = useState(() => {
    if (!value) return '';
    for (const c of ALL_COUNTRIES) {
      if (value.startsWith(c.dial)) return value.slice(c.dial.length).replace(/^0/, '');
    }
    return value.replace(/^\+\d{1,4}/, '').replace(/^0/, '');
  });

  useEffect(() => {
    const local = number.replace(/[^0-9]/g, '');
    onChange(local ? `${country.dial}${local}` : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, number]);

  return (
    <div className="space-y-2">
      {/* Input row */}
      <div className={cn(
        'flex items-stretch rounded-2xl border-2 overflow-hidden bg-white transition-all',
        error       ? 'border-red-300' :
        pickerOpen  ? 'border-emerald-400 ring-4 ring-emerald-400/10' :
                      'border-slate-200 focus-within:border-slate-300',
        disabled && 'opacity-50 pointer-events-none',
      )}>
        {/* Sélecteur pays */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPickerOpen(o => !o)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-3.5 border-r border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors flex-shrink-0',
            pickerOpen && 'bg-slate-100',
          )}
        >
          <span className="text-[22px] leading-none select-none">{country.flag}</span>
          <span className="text-[13px] font-black text-slate-700 tracking-tight">{country.dial}</span>
          <ChevronDown className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-150',
            pickerOpen && 'rotate-180',
          )} strokeWidth={2.5} />
        </button>

        {/* Numéro */}
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={e => setNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-3.5 text-[15px] font-bold text-slate-800 placeholder-slate-300 outline-none bg-transparent tracking-wide min-w-0"
        />
      </div>

      {/* Dropdown pays */}
      {pickerOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <CountryPicker
            selected={country}
            onSelect={c => setCountry(c)}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
