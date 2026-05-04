'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  CheckCircle2, Loader2, ArrowRight, RotateCcw,
  ChevronLeft, X, Search, ChevronDown, UserX, AlertCircle,
} from 'lucide-react';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { ApiError } from '@/lib/nestjs/api-client';
import { cn } from '@/lib/utils';

// ── Pays ──────────────────────────────────────────────────────────────────────
interface Country { flag: string; name: string; dial: string; code: string }

const FEATURED: Country[] = [
  { flag: '🇸🇳', name: 'Sénégal',           dial: '+221', code: 'SN' },
  { flag: '🇫🇷', name: 'France',             dial: '+33',  code: 'FR' },
  { flag: '🇧🇪', name: 'Belgique',           dial: '+32',  code: 'BE' },
  { flag: '🇨🇭', name: 'Suisse',             dial: '+41',  code: 'CH' },
  { flag: '🇨🇦', name: 'Canada',             dial: '+1',   code: 'CA' },
  { flag: '🇺🇸', name: 'États-Unis',         dial: '+1',   code: 'US' },
];

const ALL_COUNTRIES: Country[] = [
  ...FEATURED,
  { flag: '🇩🇿', name: 'Algérie',            dial: '+213', code: 'DZ' },
  { flag: '🇩🇪', name: 'Allemagne',          dial: '+49',  code: 'DE' },
  { flag: '🇦🇴', name: 'Angola',             dial: '+244', code: 'AO' },
  { flag: '🇸🇦', name: 'Arabie Saoudite',    dial: '+966', code: 'SA' },
  { flag: '🇦🇷', name: 'Argentine',          dial: '+54',  code: 'AR' },
  { flag: '🇧🇯', name: 'Bénin',              dial: '+229', code: 'BJ' },
  { flag: '🇧🇷', name: 'Brésil',             dial: '+55',  code: 'BR' },
  { flag: '🇧🇫', name: 'Burkina Faso',       dial: '+226', code: 'BF' },
  { flag: '🇨🇲', name: 'Cameroun',           dial: '+237', code: 'CM' },
  { flag: '🇨🇻', name: 'Cap-Vert',           dial: '+238', code: 'CV' },
  { flag: '🇨🇳', name: 'Chine',              dial: '+86',  code: 'CN' },
  { flag: '🇨🇩', name: 'Congo (RDC)',        dial: '+243', code: 'CD' },
  { flag: '🇨🇬', name: 'Congo',              dial: '+242', code: 'CG' },
  { flag: '🇨🇮', name: "Côte d'Ivoire",      dial: '+225', code: 'CI' },
  { flag: '🇩🇰', name: 'Danemark',           dial: '+45',  code: 'DK' },
  { flag: '🇦🇪', name: 'Émirats Arabes Unis',dial: '+971', code: 'AE' },
  { flag: '🇪🇸', name: 'Espagne',            dial: '+34',  code: 'ES' },
  { flag: '🇪🇹', name: 'Éthiopie',           dial: '+251', code: 'ET' },
  { flag: '🇫🇮', name: 'Finlande',           dial: '+358', code: 'FI' },
  { flag: '🇬🇦', name: 'Gabon',              dial: '+241', code: 'GA' },
  { flag: '🇬🇲', name: 'Gambie',             dial: '+220', code: 'GM' },
  { flag: '🇬🇭', name: 'Ghana',              dial: '+233', code: 'GH' },
  { flag: '🇬🇳', name: 'Guinée',             dial: '+224', code: 'GN' },
  { flag: '🇬🇼', name: 'Guinée-Bissau',      dial: '+245', code: 'GW' },
  { flag: '🇮🇳', name: 'Inde',               dial: '+91',  code: 'IN' },
  { flag: '🇮🇹', name: 'Italie',             dial: '+39',  code: 'IT' },
  { flag: '🇯🇵', name: 'Japon',              dial: '+81',  code: 'JP' },
  { flag: '🇰🇪', name: 'Kenya',              dial: '+254', code: 'KE' },
  { flag: '🇱🇷', name: 'Libéria',            dial: '+231', code: 'LR' },
  { flag: '🇲🇱', name: 'Mali',               dial: '+223', code: 'ML' },
  { flag: '🇲🇦', name: 'Maroc',              dial: '+212', code: 'MA' },
  { flag: '🇲🇷', name: 'Mauritanie',         dial: '+222', code: 'MR' },
  { flag: '🇲🇽', name: 'Mexique',            dial: '+52',  code: 'MX' },
  { flag: '🇳🇱', name: 'Pays-Bas',           dial: '+31',  code: 'NL' },
  { flag: '🇳🇬', name: 'Nigeria',            dial: '+234', code: 'NG' },
  { flag: '🇳🇪', name: 'Niger',              dial: '+227', code: 'NE' },
  { flag: '🇳🇴', name: 'Norvège',            dial: '+47',  code: 'NO' },
  { flag: '🇵🇹', name: 'Portugal',           dial: '+351', code: 'PT' },
  { flag: '🇨🇬', name: 'République du Congo',dial: '+242', code: 'RC' },
  { flag: '🇬🇧', name: 'Royaume-Uni',        dial: '+44',  code: 'GB' },
  { flag: '🇸🇱', name: 'Sierra Leone',       dial: '+232', code: 'SL' },
  { flag: '🇸🇪', name: 'Suède',              dial: '+46',  code: 'SE' },
  { flag: '🇹🇿', name: 'Tanzanie',           dial: '+255', code: 'TZ' },
  { flag: '🇹🇬', name: 'Togo',               dial: '+228', code: 'TG' },
  { flag: '🇹🇳', name: 'Tunisie',            dial: '+216', code: 'TN' },
  { flag: '🇹🇷', name: 'Turquie',            dial: '+90',  code: 'TR' },
  { flag: '🇿🇦', name: 'Afrique du Sud',     dial: '+27',  code: 'ZA' },
];

// Dédupliquer par code pays
const COUNTRIES = ALL_COUNTRIES.filter(
  (c, i, arr) => arr.findIndex(x => x.code === c.code) === i
);

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
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.dial.includes(q)
    );
  }, [query]);

  const featured = filtered.filter(c => FEATURED.some(f => f.code === c.code));
  const others   = filtered.filter(c => !FEATURED.some(f => f.code === c.code));

  return (
    <div className="flex flex-col" style={{ maxHeight: 340 }}>
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
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

      {/* List */}
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
          <p className="px-3 py-6 text-center text-[13px] text-slate-400">Aucun résultat</p>
        )}
      </div>
    </div>
  );
}

// ── PhoneField ────────────────────────────────────────────────────────────────
function PhoneField({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (full: string) => void;
  disabled: boolean;
  error: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [country, setCountry] = useState<Country>(FEATURED[0]);
  const [number, setNumber] = useState(() => {
    // Extrait le numéro local depuis une valeur déjà formatée
    for (const c of COUNTRIES) {
      if (value.startsWith(c.dial)) return value.slice(c.dial.length).replace(/^0/, '');
    }
    return value.replace(/^\+\d{1,4}/, '').replace(/^0/, '');
  });

  useEffect(() => {
    const local = number.replace(/[^0-9]/g, '');
    onChange(local ? `${country.dial}${local}` : '');
  }, [country, number]);

  const handleNumberChange = (v: string) => {
    const clean = v.replace(/[^0-9\s]/g, '');
    setNumber(clean);
  };

  return (
    <div className="space-y-2">
      {/* Champ principal */}
      <div className={cn(
        'flex items-stretch rounded-2xl border-2 overflow-hidden bg-white transition-all',
        error ? 'border-red-300' : pickerOpen ? 'border-emerald-400 ring-4 ring-emerald-400/10' : 'border-slate-200',
        disabled && 'opacity-50',
      )}>
        {/* Bouton pays */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPickerOpen(o => !o)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-3.5 border-r border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors flex-shrink-0',
            pickerOpen && 'bg-slate-100',
          )}
        >
          <span className="text-[22px] leading-none">{country.flag}</span>
          <span className="text-[13px] font-black text-slate-700 tracking-tight">{country.dial}</span>
          <ChevronDown className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform',
            pickerOpen && 'rotate-180',
          )} strokeWidth={2.5} />
        </button>

        {/* Numéro */}
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={e => handleNumberChange(e.target.value)}
          disabled={disabled}
          placeholder="77 000 00 00"
          className="flex-1 px-3.5 py-3.5 text-[15px] font-bold text-slate-800 placeholder-slate-300 outline-none bg-transparent tracking-wide"
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

// ── OTP boxes ─────────────────────────────────────────────────────────────────
function OtpBoxes({
  values, onChange, onKeyDown, onPaste, inputRefs, error, disabled,
}: {
  values: string[];
  onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  error: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      {values.map((val, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          onPaste={onPaste}
          autoFocus={i === 0}
          className={cn(
            'w-full aspect-square text-center text-[22px] font-black rounded-2xl border-2 outline-none transition-all',
            disabled && 'opacity-50',
            error
              ? 'border-red-300 bg-red-50 text-red-600'
              : val
                ? 'border-emerald-400 bg-emerald-50/40 text-emerald-700 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
                : 'border-slate-150 bg-slate-50 text-slate-900 focus:border-slate-300 focus:bg-white',
          )}
        />
      ))}
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────
const RESEND_DELAY = 60;
type Stage = 'phone' | 'otp' | 'success';

export function PhoneEditModal({
  currentPhone,
  onClose,
  onSuccess,
}: {
  currentPhone: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { authFetch } = useAuthFetch();

  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState(currentPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneTaken, setPhoneTaken] = useState(false);

  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startResendTimer() {
    setResendCountdown(RESEND_DELAY);
    timerRef.current = setInterval(() => {
      setResendCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSendOtp() {
    const normalized = phone.replace(/\s/g, '');
    if (!normalized || normalized.length < 8) {
      setError('Saisissez un numéro valide.');
      return;
    }
    setLoading(true); setError(null); setPhoneTaken(false);
    try {
      await authFetch('/auth/phone/update', { method: 'POST', body: { telephone: normalized } });
      setStage('otp');
      startResendTimer();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '';
      if (msg.toLowerCase().includes('déjà utilisé') || msg.toLowerCase().includes('already')) {
        setPhoneTaken(true);
      } else {
        setError(msg || "Impossible d'envoyer le code. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCountdown > 0) return;
    setLoading(true); setError(null);
    try {
      await authFetch('/auth/phone/send-otp', { method: 'POST' });
      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      startResendTimer();
    } catch (err) {
      setError(err instanceof ApiError ? err.message || 'Erreur.' : 'Connexion impossible.');
    } finally { setLoading(false); }
  }

  async function handleVerifyOtp(code: string) {
    if (code.length !== 6) return;
    setLoading(true); setError(null);
    try {
      await authFetch('/auth/phone/verify-otp', { method: 'POST', body: { code } });
      setStage('success');
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err instanceof ApiError ? (err.message || 'Code incorrect ou expiré.') : 'Connexion impossible.');
      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const next = Array(6).fill('');
      for (let i = 0; i < digits.length; i++) next[i] = digits[i];
      setOtpValues(next);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
      if (digits.length === 6) handleVerifyOtp(digits);
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const next = [...otpValues];
    next[index] = value.slice(-1);
    setOtpValues(next); setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    const full = next.join('');
    if (full.length === 6 && !next.some(v => v === '')) handleVerifyOtp(full);
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const next = Array(6).fill('');
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setOtpValues(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
    if (digits.length === 6) handleVerifyOtp(digits);
  }

  const isFilled = otpValues.every(v => v !== '');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => !loading && onClose()} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">
              Auto Loc · Sécurité
            </p>
            <h2 className="text-[17px] font-black text-slate-900 leading-tight">
              {stage === 'otp' ? 'Vérifier le numéro' : 'Modifier le numéro'}
            </h2>
            <p className="text-[12px] text-slate-400 mt-0.5 font-medium">
              {stage === 'otp'
                ? `Code envoyé au ${phone}`
                : 'Choisissez votre indicatif et entrez votre numéro.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 flex-shrink-0 ml-3 mt-0.5"
          >
            <X className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-5 space-y-4">

          {/* ── Success ── */}
          {stage === 'success' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[15px] font-black text-slate-900">Numéro vérifié !</p>
                <p className="text-[12px] text-slate-400 mt-0.5">Votre nouveau numéro est actif.</p>
              </div>
            </div>
          )}

          {/* ── Stage phone ── */}
          {stage === 'phone' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Nouveau numéro
                </label>
                <PhoneField
                  value={phone}
                  onChange={v => { setPhone(v); setError(null); setPhoneTaken(false); }}
                  disabled={loading}
                  error={Boolean(error) || phoneTaken}
                />
              </div>

              {/* Numéro déjà pris — erreur bien distincte */}
              {phoneTaken && (
                <div className="flex items-start gap-3 px-3.5 py-3.5 rounded-2xl bg-red-50 border border-red-200">
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <UserX className="w-4 h-4 text-red-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-black text-red-700 leading-tight">Numéro déjà utilisé</p>
                    <p className="text-[11.5px] text-red-600/80 font-medium mt-0.5 leading-relaxed">
                      Ce numéro est déjà associé à un autre compte AutoLoc. Choisissez un numéro différent ou contactez le support.
                    </p>
                  </div>
                </div>
              )}

              {/* Autres erreurs */}
              {error && !phoneTaken && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2.5} />
                  <p className="text-[12px] font-semibold text-red-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || phone.replace(/\s/g, '').length < 8}
                className={cn(
                  'w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-[13.5px] font-bold transition-all duration-200',
                  !loading && phone.replace(/\s/g, '').length >= 8
                    ? 'bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                )}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                }
                {loading ? 'Envoi en cours…' : 'Envoyer le code'}
              </button>
            </>
          )}

          {/* ── Stage OTP ── */}
          {stage === 'otp' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Code à 6 chiffres
                </label>
                <OtpBoxes
                  values={otpValues}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onPaste={handleOtpPaste}
                  inputRefs={inputRefs}
                  error={Boolean(error)}
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-[12px] font-semibold text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => handleVerifyOtp(otpValues.join(''))}
                disabled={loading || !isFilled}
                className={cn(
                  'w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-[13.5px] font-bold transition-all duration-200',
                  isFilled && !loading
                    ? 'bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                )}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                }
                {loading ? 'Vérification…' : 'Vérifier le code'}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setStage('phone'); setOtpValues(Array(6).fill('')); setError(null); }}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Modifier le numéro
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || loading}
                  className={cn(
                    'flex items-center gap-1.5 text-[12px] font-semibold transition-colors',
                    resendCountdown > 0 || loading
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-emerald-600 hover:text-emerald-700',
                  )}
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {resendCountdown > 0 ? `Renvoyer (${resendCountdown}s)` : 'Renvoyer le code'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
