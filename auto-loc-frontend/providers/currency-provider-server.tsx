import { fetchExchangeRates } from '@/lib/exchange-rates';
import { CurrencyProvider } from './currency-provider';

/**
 * Server component wrapper — fetches live rates once per hour (Next.js cache),
 * then passes them down to the client CurrencyProvider.
 */
export async function CurrencyProviderServer({
    children,
}: {
    children: React.ReactNode;
}) {
    const liveRates = await fetchExchangeRates();

    return (
        <CurrencyProvider initialRates={liveRates}>
            {children}
        </CurrencyProvider>
    );
}
