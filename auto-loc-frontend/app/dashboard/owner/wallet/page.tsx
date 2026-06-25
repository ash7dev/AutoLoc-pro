import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchWallet, fetchPenalties } from "@/lib/nestjs/wallet";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { WalletOverview } from "@/features/wallet/components/wallet-overview";
import { PenaltiesSection } from "@/features/wallet/components/penalties-section";

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
            fetchWallet(token),
            fetchPenalties(token),
        ]);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
        walletData = null;
        penaltiesData = null;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
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
