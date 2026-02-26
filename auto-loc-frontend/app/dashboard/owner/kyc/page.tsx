import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/nestjs/auth";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { KycSubmitForm } from "@/features/kyc/KycSubmitForm";

export default async function OwnerKycPage() {
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

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="border-b border-[hsl(var(--border))] bg-card px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">Vérification d’identité</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Finalisez votre KYC pour publier des annonces.
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <KycSubmitForm initialStatus={profile.kycStatus} />
      </div>
    </div>
  );
}
