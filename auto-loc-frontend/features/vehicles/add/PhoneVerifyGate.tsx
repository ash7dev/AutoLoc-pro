"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, Loader2, ArrowRight, ChevronDown, Search } from "lucide-react";
import { ApiError } from "@/lib/nestjs/api-client";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTRY LIST  (Sénégal en premier, puis ordre alphabétique)
───────────────────────────────────────────────────────────────────────────── */
const COUNTRY_CODES = [
  // ── Défaut ──
  { iso: "SN", code: "+221", country: "Sénégal",                   flag: "🇸🇳" },
  // ── Afrique ──
  { iso: "DZ", code: "+213", country: "Algérie",                    flag: "🇩🇿" },
  { iso: "AO", code: "+244", country: "Angola",                     flag: "🇦🇴" },
  { iso: "BJ", code: "+229", country: "Bénin",                      flag: "🇧🇯" },
  { iso: "BW", code: "+267", country: "Botswana",                   flag: "🇧🇼" },
  { iso: "BF", code: "+226", country: "Burkina Faso",               flag: "🇧🇫" },
  { iso: "BI", code: "+257", country: "Burundi",                    flag: "🇧🇮" },
  { iso: "CV", code: "+238", country: "Cap-Vert",                   flag: "🇨🇻" },
  { iso: "CF", code: "+236", country: "Centrafrique",               flag: "🇨🇫" },
  { iso: "KM", code: "+269", country: "Comores",                    flag: "🇰🇲" },
  { iso: "CG", code: "+242", country: "Congo",                      flag: "🇨🇬" },
  { iso: "CD", code: "+243", country: "Congo (RDC)",                flag: "🇨🇩" },
  { iso: "CI", code: "+225", country: "Côte d'Ivoire",              flag: "🇨🇮" },
  { iso: "DJ", code: "+253", country: "Djibouti",                   flag: "🇩🇯" },
  { iso: "EG", code: "+20",  country: "Égypte",                     flag: "🇪🇬" },
  { iso: "GQ", code: "+240", country: "Guinée équatoriale",         flag: "🇬🇶" },
  { iso: "ER", code: "+291", country: "Érythrée",                   flag: "🇪🇷" },
  { iso: "SZ", code: "+268", country: "Eswatini",                   flag: "🇸🇿" },
  { iso: "ET", code: "+251", country: "Éthiopie",                   flag: "🇪🇹" },
  { iso: "GA", code: "+241", country: "Gabon",                      flag: "🇬🇦" },
  { iso: "GM", code: "+220", country: "Gambie",                     flag: "🇬🇲" },
  { iso: "GH", code: "+233", country: "Ghana",                      flag: "🇬🇭" },
  { iso: "GN", code: "+224", country: "Guinée",                     flag: "🇬🇳" },
  { iso: "GW", code: "+245", country: "Guinée-Bissau",              flag: "🇬🇼" },
  { iso: "KE", code: "+254", country: "Kenya",                      flag: "🇰🇪" },
  { iso: "LS", code: "+266", country: "Lesotho",                    flag: "🇱🇸" },
  { iso: "LR", code: "+231", country: "Libéria",                    flag: "🇱🇷" },
  { iso: "LY", code: "+218", country: "Libye",                      flag: "🇱🇾" },
  { iso: "MG", code: "+261", country: "Madagascar",                 flag: "🇲🇬" },
  { iso: "MW", code: "+265", country: "Malawi",                     flag: "🇲🇼" },
  { iso: "ML", code: "+223", country: "Mali",                       flag: "🇲🇱" },
  { iso: "MA", code: "+212", country: "Maroc",                      flag: "🇲🇦" },
  { iso: "MR", code: "+222", country: "Mauritanie",                 flag: "🇲🇷" },
  { iso: "MU", code: "+230", country: "Maurice",                    flag: "🇲🇺" },
  { iso: "MZ", code: "+258", country: "Mozambique",                 flag: "🇲🇿" },
  { iso: "NA", code: "+264", country: "Namibie",                    flag: "🇳🇦" },
  { iso: "NE", code: "+227", country: "Niger",                      flag: "🇳🇪" },
  { iso: "NG", code: "+234", country: "Nigeria",                    flag: "🇳🇬" },
  { iso: "UG", code: "+256", country: "Ouganda",                    flag: "🇺🇬" },
  { iso: "RW", code: "+250", country: "Rwanda",                     flag: "🇷🇼" },
  { iso: "ST", code: "+239", country: "São Tomé-et-Príncipe",       flag: "🇸🇹" },
  { iso: "SL", code: "+232", country: "Sierra Leone",               flag: "🇸🇱" },
  { iso: "SO", code: "+252", country: "Somalie",                    flag: "🇸🇴" },
  { iso: "SD", code: "+249", country: "Soudan",                     flag: "🇸🇩" },
  { iso: "SS", code: "+211", country: "Soudan du Sud",              flag: "🇸🇸" },
  { iso: "TZ", code: "+255", country: "Tanzanie",                   flag: "🇹🇿" },
  { iso: "TG", code: "+228", country: "Togo",                       flag: "🇹🇬" },
  { iso: "TN", code: "+216", country: "Tunisie",                    flag: "🇹🇳" },
  { iso: "CM", code: "+237", country: "Cameroun",                   flag: "🇨🇲" },
  { iso: "ZM", code: "+260", country: "Zambie",                     flag: "🇿🇲" },
  { iso: "ZW", code: "+263", country: "Zimbabwe",                   flag: "🇿🇼" },
  // ── Europe ──
  { iso: "DE", code: "+49",  country: "Allemagne",                  flag: "🇩🇪" },
  { iso: "AT", code: "+43",  country: "Autriche",                   flag: "🇦🇹" },
  { iso: "BE", code: "+32",  country: "Belgique",                   flag: "🇧🇪" },
  { iso: "BG", code: "+359", country: "Bulgarie",                   flag: "🇧🇬" },
  { iso: "HR", code: "+385", country: "Croatie",                    flag: "🇭🇷" },
  { iso: "CY", code: "+357", country: "Chypre",                     flag: "🇨🇾" },
  { iso: "DK", code: "+45",  country: "Danemark",                   flag: "🇩🇰" },
  { iso: "ES", code: "+34",  country: "Espagne",                    flag: "🇪🇸" },
  { iso: "EE", code: "+372", country: "Estonie",                    flag: "🇪🇪" },
  { iso: "FI", code: "+358", country: "Finlande",                   flag: "🇫🇮" },
  { iso: "FR", code: "+33",  country: "France",                     flag: "🇫🇷" },
  { iso: "GR", code: "+30",  country: "Grèce",                      flag: "🇬🇷" },
  { iso: "HU", code: "+36",  country: "Hongrie",                    flag: "🇭🇺" },
  { iso: "IE", code: "+353", country: "Irlande",                    flag: "🇮🇪" },
  { iso: "IT", code: "+39",  country: "Italie",                     flag: "🇮🇹" },
  { iso: "LV", code: "+371", country: "Lettonie",                   flag: "🇱🇻" },
  { iso: "LT", code: "+370", country: "Lituanie",                   flag: "🇱🇹" },
  { iso: "LU", code: "+352", country: "Luxembourg",                 flag: "🇱🇺" },
  { iso: "MT", code: "+356", country: "Malte",                      flag: "🇲🇹" },
  { iso: "NO", code: "+47",  country: "Norvège",                    flag: "🇳🇴" },
  { iso: "NL", code: "+31",  country: "Pays-Bas",                   flag: "🇳🇱" },
  { iso: "PL", code: "+48",  country: "Pologne",                    flag: "🇵🇱" },
  { iso: "PT", code: "+351", country: "Portugal",                   flag: "🇵🇹" },
  { iso: "RO", code: "+40",  country: "Roumanie",                   flag: "🇷🇴" },
  { iso: "GB", code: "+44",  country: "Royaume-Uni",                flag: "🇬🇧" },
  { iso: "RU", code: "+7",   country: "Russie",                     flag: "🇷🇺" },
  { iso: "RS", code: "+381", country: "Serbie",                     flag: "🇷🇸" },
  { iso: "SK", code: "+421", country: "Slovaquie",                  flag: "🇸🇰" },
  { iso: "SI", code: "+386", country: "Slovénie",                   flag: "🇸🇮" },
  { iso: "SE", code: "+46",  country: "Suède",                      flag: "🇸🇪" },
  { iso: "CH", code: "+41",  country: "Suisse",                     flag: "🇨🇭" },
  { iso: "CZ", code: "+420", country: "Tchéquie",                   flag: "🇨🇿" },
  { iso: "TR", code: "+90",  country: "Turquie",                    flag: "🇹🇷" },
  { iso: "UA", code: "+380", country: "Ukraine",                    flag: "🇺🇦" },
  // ── Amériques ──
  { iso: "AR", code: "+54",  country: "Argentine",                  flag: "🇦🇷" },
  { iso: "BO", code: "+591", country: "Bolivie",                    flag: "🇧🇴" },
  { iso: "BR", code: "+55",  country: "Brésil",                     flag: "🇧🇷" },
  { iso: "CA", code: "+1",   country: "Canada",                     flag: "🇨🇦" },
  { iso: "CL", code: "+56",  country: "Chili",                      flag: "🇨🇱" },
  { iso: "CO", code: "+57",  country: "Colombie",                   flag: "🇨🇴" },
  { iso: "CR", code: "+506", country: "Costa Rica",                 flag: "🇨🇷" },
  { iso: "CU", code: "+53",  country: "Cuba",                       flag: "🇨🇺" },
  { iso: "EC", code: "+593", country: "Équateur",                   flag: "🇪🇨" },
  { iso: "SV", code: "+503", country: "El Salvador",                flag: "🇸🇻" },
  { iso: "US", code: "+1",   country: "États-Unis",                 flag: "🇺🇸" },
  { iso: "GT", code: "+502", country: "Guatemala",                  flag: "🇬🇹" },
  { iso: "HT", code: "+509", country: "Haïti",                      flag: "🇭🇹" },
  { iso: "HN", code: "+504", country: "Honduras",                   flag: "🇭🇳" },
  { iso: "MX", code: "+52",  country: "Mexique",                    flag: "🇲🇽" },
  { iso: "NI", code: "+505", country: "Nicaragua",                  flag: "🇳🇮" },
  { iso: "PA", code: "+507", country: "Panama",                     flag: "🇵🇦" },
  { iso: "PY", code: "+595", country: "Paraguay",                   flag: "🇵🇾" },
  { iso: "PE", code: "+51",  country: "Pérou",                      flag: "🇵🇪" },
  { iso: "DO", code: "+1",   country: "République dominicaine",     flag: "🇩🇴" },
  { iso: "UY", code: "+598", country: "Uruguay",                    flag: "🇺🇾" },
  { iso: "VE", code: "+58",  country: "Venezuela",                  flag: "🇻🇪" },
  // ── Moyen-Orient ──
  { iso: "SA", code: "+966", country: "Arabie Saoudite",            flag: "🇸🇦" },
  { iso: "AE", code: "+971", country: "Émirats Arabes Unis",        flag: "🇦🇪" },
  { iso: "IQ", code: "+964", country: "Irak",                       flag: "🇮🇶" },
  { iso: "IR", code: "+98",  country: "Iran",                       flag: "🇮🇷" },
  { iso: "IL", code: "+972", country: "Israël",                     flag: "🇮🇱" },
  { iso: "JO", code: "+962", country: "Jordanie",                   flag: "🇯🇴" },
  { iso: "KW", code: "+965", country: "Koweït",                     flag: "🇰🇼" },
  { iso: "LB", code: "+961", country: "Liban",                      flag: "🇱🇧" },
  { iso: "OM", code: "+968", country: "Oman",                       flag: "🇴🇲" },
  { iso: "QA", code: "+974", country: "Qatar",                      flag: "🇶🇦" },
  { iso: "SY", code: "+963", country: "Syrie",                      flag: "🇸🇾" },
  { iso: "YE", code: "+967", country: "Yémen",                      flag: "🇾🇪" },
  // ── Asie ──
  { iso: "AF", code: "+93",  country: "Afghanistan",                flag: "🇦🇫" },
  { iso: "BD", code: "+880", country: "Bangladesh",                 flag: "🇧🇩" },
  { iso: "KH", code: "+855", country: "Cambodge",                   flag: "🇰🇭" },
  { iso: "CN", code: "+86",  country: "Chine",                      flag: "🇨🇳" },
  { iso: "KP", code: "+850", country: "Corée du Nord",              flag: "🇰🇵" },
  { iso: "KR", code: "+82",  country: "Corée du Sud",               flag: "🇰🇷" },
  { iso: "PH", code: "+63",  country: "Philippines",                flag: "🇵🇭" },
  { iso: "IN", code: "+91",  country: "Inde",                       flag: "🇮🇳" },
  { iso: "ID", code: "+62",  country: "Indonésie",                  flag: "🇮🇩" },
  { iso: "JP", code: "+81",  country: "Japon",                      flag: "🇯🇵" },
  { iso: "MY", code: "+60",  country: "Malaisie",                   flag: "🇲🇾" },
  { iso: "MV", code: "+960", country: "Maldives",                   flag: "🇲🇻" },
  { iso: "MN", code: "+976", country: "Mongolie",                   flag: "🇲🇳" },
  { iso: "MM", code: "+95",  country: "Myanmar",                    flag: "🇲🇲" },
  { iso: "NP", code: "+977", country: "Népal",                      flag: "🇳🇵" },
  { iso: "PK", code: "+92",  country: "Pakistan",                   flag: "🇵🇰" },
  { iso: "SG", code: "+65",  country: "Singapour",                  flag: "🇸🇬" },
  { iso: "LK", code: "+94",  country: "Sri Lanka",                  flag: "🇱🇰" },
  { iso: "TW", code: "+886", country: "Taïwan",                     flag: "🇹🇼" },
  { iso: "TH", code: "+66",  country: "Thaïlande",                  flag: "🇹🇭" },
  { iso: "VN", code: "+84",  country: "Vietnam",                    flag: "🇻🇳" },
  // ── Océanie ──
  { iso: "AU", code: "+61",  country: "Australie",                  flag: "🇦🇺" },
  { iso: "FJ", code: "+679", country: "Fidji",                      flag: "🇫🇯" },
  { iso: "NZ", code: "+64",  country: "Nouvelle-Zélande",           flag: "🇳🇿" },
  { iso: "PG", code: "+675", country: "Papouasie-Nouvelle-Guinée",  flag: "🇵🇬" },
  { iso: "WS", code: "+685", country: "Samoa",                      flag: "🇼🇸" },
] as const;

type CountryIso = typeof COUNTRY_CODES[number]["iso"];
type Stage = "intro" | "success";

/* ─────────────────────────────────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────────────────────────────────── */
function normalizePhone(dialCode: string, raw: string): string {
  const digits = raw.trim().replace(/[\s\-()]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+")) return digits;
  const cleaned = digits.startsWith("0") ? digits.slice(1) : digits;
  return `${dialCode}${cleaned}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTRY PICKER
───────────────────────────────────────────────────────────────────────────── */
function CountryPicker({
  value,
  onChange,
  hasError,
}: {
  value: CountryIso;
  onChange: (iso: CountryIso) => void;
  hasError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_CODES.find(c => c.iso === value) ?? COUNTRY_CODES[0];

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(c =>
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.iso.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRY_CODES;

  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => open ? setOpen(false) : handleOpen()}
        className={cn(
          "h-12 flex items-center gap-2 px-3.5 rounded-xl border bg-white transition-all",
          open
            ? "border-emerald-400 ring-2 ring-emerald-400/15"
            : hasError
              ? "border-red-300"
              : "border-slate-200 hover:border-slate-300",
        )}
      >
        <span className="text-xl leading-none select-none">{selected.flag}</span>
        <span className="text-[13px] font-bold text-slate-700 min-w-[36px]">{selected.code}</span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
          open && "rotate-180",
        )} strokeWidth={2.5} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search bar */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-emerald-300 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un pays…"
                className="flex-1 bg-transparent text-[12.5px] text-slate-700 placeholder-slate-400 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-300 hover:text-slate-500 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Country list */}
          <div className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-5 text-[12px] text-slate-400 text-center">
                Aucun résultat pour « {search} »
              </p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => { onChange(c.iso as CountryIso); setOpen(false); setSearch(""); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                    value === c.iso
                      ? "bg-emerald-50 hover:bg-emerald-50"
                      : "hover:bg-slate-50",
                  )}
                >
                  <span className="text-lg flex-shrink-0 leading-none">{c.flag}</span>
                  <span className="flex-1 text-[12.5px] font-medium text-slate-700 truncate">
                    {c.country}
                  </span>
                  <span className={cn(
                    "text-[11.5px] font-semibold flex-shrink-0",
                    value === c.iso ? "text-emerald-600" : "text-slate-400",
                  )}>
                    {c.code}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FIELD WRAPPER
───────────────────────────────────────────────────────────────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLS = (hasError: boolean) => cn(
  "w-full h-12 rounded-xl border bg-white px-4 text-[13.5px] text-slate-800 outline-none transition-all",
  "placeholder:text-slate-400",
  "focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400",
  hasError ? "border-red-300" : "border-slate-200 hover:border-slate-300",
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export function PhoneVerifyGate({
  profile,
  onVerified,
}: {
  profile: ProfileResponse;
  onVerified: () => void;
}) {
  const [stage, setStage] = useState<Stage>("intro");
  const [selectedIso, setSelectedIso] = useState<CountryIso>("SN");
  const [phoneInput, setPhone] = useState(profile.phone?.replace(/^\+\d{1,3}/, "") ?? "");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuthFetch();

  const selectedCountry = COUNTRY_CODES.find(c => c.iso === selectedIso) ?? COUNTRY_CODES[0];
  const needsProfile = !profile.hasUtilisateur;
  const canSubmit = phoneInput.trim().length > 0
    && (!needsProfile || (prenom.trim() && nom.trim() && dateNaissance));

  const handleConfirm = async () => {
    const normalized = normalizePhone(selectedCountry.code, phoneInput);
    if (!normalized || normalized.length < 8) {
      setError("Entrez un numéro valide.");
      return;
    }
    if (needsProfile && (!prenom.trim() || !nom.trim() || !dateNaissance)) {
      setError("Tous les champs sont requis.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (needsProfile) {
        await authFetch("/auth/complete-profile", {
          method: "POST",
          body: { prenom: prenom.trim(), nom: nom.trim(), telephone: normalized, dateNaissance },
        });
      } else {
        await authFetch("/auth/phone/update", {
          method: "POST",
          body: { telephone: normalized },
        });
      }
      setStage("success");
      setTimeout(onVerified, 1200);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? "Numéro invalide ou déjà utilisé par un autre compte."
          : "Service indisponible. Réessayez.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Success ── */
  if (stage === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[15px] font-black text-slate-900">Téléphone enregistré</p>
          <p className="text-[12.5px] text-slate-400 mt-1">Redirection en cours…</p>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="space-y-4">

      {/* Nom / Prénom — uniquement si profil non créé */}
      {needsProfile && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Prénom" required>
            <input
              type="text"
              value={prenom}
              onChange={e => { setPrenom(e.target.value); setError(null); }}
              placeholder="Moussa"
              className={INPUT_CLS(Boolean(error && !prenom.trim()))}
            />
          </Field>
          <Field label="Nom" required>
            <input
              type="text"
              value={nom}
              onChange={e => { setNom(e.target.value); setError(null); }}
              placeholder="Diallo"
              className={INPUT_CLS(Boolean(error && !nom.trim()))}
            />
          </Field>
        </div>
      )}

      {/* Date de naissance */}
      {needsProfile && (
        <Field label="Date de naissance" required>
          <input
            type="date"
            value={dateNaissance}
            onChange={e => { setDateNaissance(e.target.value); setError(null); }}
            className={INPUT_CLS(Boolean(error && !dateNaissance))}
          />
        </Field>
      )}

      {/* Téléphone */}
      <Field label="Numéro de téléphone" required>
        <div className="flex gap-2">
          <CountryPicker
            value={selectedIso}
            onChange={iso => { setSelectedIso(iso); setError(null); }}
            hasError={Boolean(error)}
          />
          <input
            type="tel"
            value={phoneInput}
            onChange={e => { setPhone(e.target.value); setError(null); }}
            onKeyDown={e => { if (e.key === "Enter" && canSubmit) handleConfirm(); }}
            placeholder={selectedIso === "SN" ? "77 000 00 00" : "Numéro local"}
            className={cn(INPUT_CLS(Boolean(error)), "flex-1")}
            autoFocus={!needsProfile}
          />
        </div>
        <p className="text-[11.5px] text-slate-400 mt-1.5">
          {selectedCountry.flag} {selectedCountry.country} · indicatif {selectedCountry.code}
        </p>
      </Field>

      {/* Error */}
      {error && (
        <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
          <p className="text-[12px] font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading || !canSubmit}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[13.5px] font-bold transition-all duration-200",
          canSubmit && !loading
            ? "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px active:translate-y-0"
            : "bg-slate-100 text-slate-400 cursor-not-allowed",
        )}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        }
        Confirmer
      </button>
    </div>
  );
}
