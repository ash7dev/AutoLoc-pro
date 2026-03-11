/**
 * Fetch live exchange rates from XOF base.
 * Uses Next.js fetch cache — revalidates every hour server-side.
 * Falls back silently to an empty object on error (static rates kick in).
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/XOF', {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return {};
        const data = await res.json();
        if (data.result !== 'success' || !data.rates) return {};
        return data.rates as Record<string, number>;
    } catch {
        return {};
    }
}
