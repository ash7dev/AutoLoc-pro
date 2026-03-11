'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ── Supported currencies ────────────────────────────────────────────────────

export const CURRENCIES = [
    { code: 'XOF', label: 'Franc CFA', short: 'CFA', symbol: 'FCFA', flag: '🇸🇳', rate: 1 },
    { code: 'EUR', label: 'Euro', short: 'EUR', symbol: '€', flag: '🇪🇺', rate: 0.00152 },
    { code: 'USD', label: 'Dollar US', short: 'USD', symbol: '$', flag: '🇺🇸', rate: 0.00166 },
    { code: 'GBP', label: 'Livre Sterling', short: 'GBP', symbol: '£', flag: '🇬🇧', rate: 0.00131 },
    { code: 'CAD', label: 'Dollar Canadien', short: 'CAD', symbol: 'CA$', flag: '🇨🇦', rate: 0.00228 },
    { code: 'CHF', label: 'Franc Suisse', short: 'CHF', symbol: 'CHF', flag: '🇨🇭', rate: 0.00146 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

const STORAGE_KEY = 'autoloc_currency';

// ── Context ─────────────────────────────────────────────────────────────────

interface CurrencyContextValue {
    /** Currently selected currency code */
    currency: CurrencyCode;
    /** Switch to a different currency */
    setCurrency: (code: CurrencyCode) => void;
    /** Convert a CFA amount to the selected currency */
    convert: (amountCFA: number) => number;
    /** Format a CFA amount in the selected currency (e.g. "15 €" or "12 000 FCFA") */
    formatPrice: (amountCFA: number) => string;
    /** Get the currency info for the current selection */
    info: (typeof CURRENCIES)[number];
    /** Whether the current currency is the default (CFA) */
    isCFA: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────

export function CurrencyProvider({
    children,
    initialRates = {},
}: {
    children: React.ReactNode;
    /** Live rates from server (keyed by currency code, base XOF). Falls back to static rates. */
    initialRates?: Record<string, number>;
}) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('XOF');

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && CURRENCIES.some(c => c.code === stored)) {
                setCurrencyState(stored as CurrencyCode);
            }
        } catch { /* SSR or no localStorage */ }
    }, []);

    const setCurrency = useCallback((code: CurrencyCode) => {
        setCurrencyState(code);
        try { localStorage.setItem(STORAGE_KEY, code); } catch { /* noop */ }
    }, []);

    const info = useMemo(
        () => CURRENCIES.find(c => c.code === currency)!,
        [currency],
    );

    // Live rate takes priority over static fallback
    const getRate = useCallback(
        (code: CurrencyCode): number => {
            if (code === 'XOF') return 1;
            return initialRates[code] ?? CURRENCIES.find(c => c.code === code)!.rate;
        },
        [initialRates],
    );

    const convert = useCallback(
        (amountCFA: number) => {
            if (currency === 'XOF') return amountCFA;
            return amountCFA * getRate(currency);
        },
        [currency, getRate],
    );

    const formatPrice = useCallback(
        (amountCFA: number) => {
            if (currency === 'XOF') {
                return new Intl.NumberFormat('fr-FR').format(Math.round(amountCFA)) + ' FCFA';
            }
            const converted = amountCFA * getRate(currency);
            const formatted = converted >= 1
                ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(converted)
                : converted.toFixed(4);
            return `${formatted} ${info.symbol}`;
        },
        [currency, getRate, info.symbol],
    );

    const value = useMemo<CurrencyContextValue>(
        () => ({ currency, setCurrency, convert, formatPrice, info, isCFA: currency === 'XOF' }),
        [currency, setCurrency, convert, formatPrice, info],
    );

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within <CurrencyProvider>');
    return ctx;
}
