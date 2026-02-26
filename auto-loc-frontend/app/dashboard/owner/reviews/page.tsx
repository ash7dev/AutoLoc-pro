import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMe } from "@/lib/nestjs/auth";
import { fetchUserReviews } from "@/lib/nestjs/reviews";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { ReviewsList } from "@/features/reviews/components/reviews-list";

export default async function OwnerReviewsPage() {
    const nestToken = cookies().get("nest_access")?.value ?? null;
    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }
    if (!token) redirect("/login");

    let profile;
    try {
        profile = await fetchMe(token);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
        throw err;
    }

    let reviewsData;
    try {
        reviewsData = await fetchUserReviews(token, profile.id);
    } catch {
        reviewsData = null;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <OwnerHeader
                title="Avis reçus"
                subtitle={reviewsData
                    ? `${reviewsData.stats.total} avis · Note moyenne ${reviewsData.stats.average.toFixed(1)}/5`
                    : "Vos avis de locataires"
                }
            />
            <ReviewsList data={reviewsData} />
        </div>
    );
}
