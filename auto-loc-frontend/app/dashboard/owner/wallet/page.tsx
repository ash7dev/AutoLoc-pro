import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchWallet, fetchPenalties } from "@/lib/nestjs/wallet";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { WalletOverview } from "@/features/wallet/components/wallet-overview";
import { PenaltiesSection } from "@/features/wallet/components/penalties-section";
import { CACHE_TAGS, getCacheKey, getOwnerCacheTags } from "@/lib/cache-config";

// ✅ OPTIMISATION: Cache wallet et penalties pour 30 secondes
const getCachedWallet = (token: string) => unstable_cache(
    async () => fetchWallet(token),
    getCacheKey(CACHE_TAGS.owner_wallet, token),
    { revalidate: 30, tags: getOwnerCacheTags(CACHE_TAGS.owner_wallet, token) }
)();

const getCachedPenalties = (token: string) => unstable_cache(
    async () => fetchPenalties(token),
    getCacheKey(CACHE_TAGS.owner_penalties, token),
    { revalidate: 30, tags: getOwnerCacheTags(CACHE_TAGS.owner_penalties, token) }
)();

export default async function OwnerWalletPage() {
    const nestToken = cookies().get("nest_access")?.value ?? null;
    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }
    if (!token) redirect("/login");

    let walletData;
    let penaltiesData;
    try {
        [walletData, penaltiesData] = await Promise.all([
            getCachedWallet(token),
            getCachedPenalties(token),
        ]);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
        walletData = null;
        penaltiesData = null;
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-6">
            <OwnerHeader
                title="Portefeuille"
                subtitle="Solde, transactions et retraits"
                ctaLabel="Retirer des fonds"
                ctaShortLabel="Retirer"
                ctaHref="#withdraw"
                ctaVariant="withdraw"
            />
            {penaltiesData && penaltiesData.totalDette > 0 && (
                <PenaltiesSection data={penaltiesData} />
            )}
            <WalletOverview data={walletData} />
        </div>
    );
}
